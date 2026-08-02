import { JWT } from "google-auth-library";

/* Google Sheets, Drive and Docs access for the submission pipeline.
 *
 * Uses google-auth-library plus fetch against the REST APIs rather than the full
 * `googleapis` client, which is around 100MB installed and slows serverless cold
 * starts badly for what amounts to four calls.
 *
 * The Sheet and both Drive folders are created in the programme's Google account
 * and shared with the service account as Editor, so a person owns the data and
 * the robot only writes to it. Revoking access is a sharing change, not a
 * redeploy.
 *
 * TWO IDENTITIES, AND WHY.
 *
 * The Sheet is written by the service account, directly. Appending a row does
 * not create a file, so nobody has to own anything and the call just works.
 *
 * Docs and CVs go through an Apps Script web app instead — see
 * scripts/apps-script/Code.gs. Creating a file DOES need an owner, an owner
 * needs storage quota, and a service account has none: every direct attempt
 * returned 403 "Service Accounts do not have storage quota" even though the
 * folders were shared with it correctly. The usual fixes are a Shared Drive or
 * OAuth delegation, both Google Workspace features, and the programme runs on a
 * consumer Gmail account. The Apps Script runs AS the owning account, so the
 * files are owned by a person with quota.
 *
 * Deliberately not OAuth: a refresh token on an app in "Testing" publishing
 * status expires after seven days, and would have died mid-window without
 * making a sound. The service account key and the Apps Script deployment both
 * keep working indefinitely.
 */

// Sheets only. Drive and Docs scopes were dropped when file creation moved to
// the Apps Script — the service account no longer touches either API, so
// holding those scopes would be permission it never exercises. Add them back if
// something here ever calls Drive directly again.
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

export type GoogleConfig = {
  clientEmail: string;
  privateKey: string;
  sheetId: string;
  applicationsFolderId: string;
  cvsFolderId: string;
  appsScriptUrl: string;
  appsScriptSecret: string;
};

/**
 * Reads configuration from the environment.
 *
 * Returns null rather than throwing when unset, so the site runs locally and in
 * preview without credentials. The route treats "not configured" as a logged
 * failure of the storage step, never as a failure of the submission.
 */
export function getGoogleConfig(): GoogleConfig | null {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  const sheetId = process.env.SHEET_ID;
  const applicationsFolderId = process.env.DRIVE_APPLICATIONS_FOLDER_ID;
  const cvsFolderId = process.env.DRIVE_CVS_FOLDER_ID;

  if (!clientEmail || !rawKey || !sheetId) return null;

  return {
    clientEmail,
    // Vercel stores the key with literal \n sequences rather than newlines.
    privateKey: rawKey.replace(/\\n/g, "\n"),
    sheetId,
    applicationsFolderId: applicationsFolderId ?? "",
    cvsFolderId: cvsFolderId ?? "",
    // Absent is survivable and must stay that way: the Sheet write is what makes
    // an application safe, and it does not need these. A missing Apps Script
    // costs the Doc and the CV, which the route logs and continues past.
    appsScriptUrl: process.env.APPS_SCRIPT_URL ?? "",
    appsScriptSecret: process.env.APPS_SCRIPT_SECRET ?? "",
  };
}

let cachedClient: JWT | null = null;

function getClient(config: GoogleConfig): JWT {
  cachedClient ??= new JWT({
    email: config.clientEmail,
    key: config.privateKey,
    scopes: SCOPES,
  });
  return cachedClient;
}

async function authedFetch(
  config: GoogleConfig,
  url: string,
  init: RequestInit = {},
): Promise<Response> {
  const client = getClient(config);
  const token = await client.getAccessToken();

  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token.token}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google API ${res.status} on ${url}: ${body.slice(0, 400)}`);
  }

  return res;
}

/** Appends one row to a named tab. Creates nothing: tabs are set up by hand. */
export async function appendRow(
  config: GoogleConfig,
  tab: string,
  values: (string | number)[],
): Promise<void> {
  const range = encodeURIComponent(`${tab}!A:A`);
  await authedFetch(
    config,
    `https://sheets.googleapis.com/v4/spreadsheets/${config.sheetId}/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      body: JSON.stringify({ values: [values] }),
    },
  );
}

/**
 * Posts one job to the Apps Script web app and returns the resulting file URL.
 *
 * The status line is not the answer here. A web app replies 200 whether the
 * script succeeded, rejected the secret, or threw — and when it throws, or when
 * the deployment is misconfigured, the body is an HTML error page rather than
 * JSON. So the body is parsed and its `ok` flag is the only thing trusted, and
 * a non-JSON body is reported with its opening characters, which is usually
 * enough to recognise a login page or a stack trace at a glance.
 */
async function callAppsScript(
  config: GoogleConfig,
  payload: Record<string, unknown>,
): Promise<string> {
  if (!config.appsScriptUrl || !config.appsScriptSecret) {
    throw new Error("APPS_SCRIPT_URL or APPS_SCRIPT_SECRET is not set");
  }

  const res = await fetch(config.appsScriptUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret: config.appsScriptSecret, ...payload }),
    // Apps Script answers with a 302 to script.googleusercontent.com and serves
    // the real response from there.
    redirect: "follow",
  });

  const text = await res.text();

  let parsed: { ok?: boolean; url?: string; error?: string };
  try {
    parsed = JSON.parse(text) as typeof parsed;
  } catch {
    throw new Error(
      `Apps Script returned non-JSON (${res.status}): ${text.slice(0, 200)}`,
    );
  }

  if (!parsed.ok || !parsed.url) {
    throw new Error(`Apps Script: ${parsed.error ?? "unknown error"}`);
  }

  return parsed.url;
}

/**
 * Creates a Google Doc holding the formatted application, in the applications
 * folder, and returns its URL.
 *
 * This exists because a spreadsheet is a fine place to SCORE an application and
 * a miserable place to READ one: the community form has fourteen long-form
 * answers, and a 30-column row is unusable for a panel working through them.
 */
export async function createDoc(
  config: GoogleConfig,
  name: string,
  body: string,
): Promise<string> {
  if (!config.applicationsFolderId) {
    throw new Error("DRIVE_APPLICATIONS_FOLDER_ID is not set");
  }

  return callAppsScript(config, {
    action: "doc",
    folderId: config.applicationsFolderId,
    name,
    body,
  });
}

/** Uploads a CV into the CVs folder and returns its URL. */
export async function uploadFile(
  config: GoogleConfig,
  name: string,
  mimeType: string,
  bytes: ArrayBuffer,
): Promise<string> {
  if (!config.cvsFolderId) throw new Error("DRIVE_CVS_FOLDER_ID is not set");

  return callAppsScript(config, {
    action: "file",
    folderId: config.cvsFolderId,
    name,
    mimeType,
    // JSON cannot carry bytes. Base64 inflates a 4MB CV to about 5.4MB, which
    // is comfortably inside the Apps Script request limit.
    dataBase64: Buffer.from(bytes).toString("base64"),
  });
}
