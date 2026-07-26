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
 */

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/documents",
];

export type GoogleConfig = {
  clientEmail: string;
  privateKey: string;
  sheetId: string;
  applicationsFolderId: string;
  cvsFolderId: string;
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

  // Multipart upload creates the file inside the folder in one call. Creating
  // via the Docs API then moving it takes two, and can strand a file at the
  // Drive root if the second fails.
  const boundary = "ctl-boundary-" + Math.random().toString(36).slice(2);
  const metadata = {
    name,
    parents: [config.applicationsFolderId],
    mimeType: "application/vnd.google-apps.document",
  };

  const multipart =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: text/plain; charset=UTF-8\r\n\r\n` +
    `${body}\r\n` +
    `--${boundary}--`;

  const res = await authedFetch(
    config,
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink",
    {
      method: "POST",
      headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
      body: multipart,
    },
  );

  const json = (await res.json()) as { id: string; webViewLink?: string };
  return json.webViewLink ?? `https://docs.google.com/document/d/${json.id}/edit`;
}

/** Uploads a CV into the CVs folder and returns its URL. */
export async function uploadFile(
  config: GoogleConfig,
  name: string,
  mimeType: string,
  bytes: ArrayBuffer,
): Promise<string> {
  if (!config.cvsFolderId) throw new Error("DRIVE_CVS_FOLDER_ID is not set");

  const boundary = "ctl-file-" + Math.random().toString(36).slice(2);
  const metadata = { name, parents: [config.cvsFolderId] };

  const encoder = new TextEncoder();
  const head = encoder.encode(
    `--${boundary}\r\n` +
      `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
      `${JSON.stringify(metadata)}\r\n` +
      `--${boundary}\r\n` +
      `Content-Type: ${mimeType}\r\n\r\n`,
  );
  const tail = encoder.encode(`\r\n--${boundary}--`);

  const payload = new Uint8Array(head.length + bytes.byteLength + tail.length);
  payload.set(head, 0);
  payload.set(new Uint8Array(bytes), head.length);
  payload.set(tail, head.length + bytes.byteLength);

  const res = await authedFetch(
    config,
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink",
    {
      method: "POST",
      headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
      body: payload,
    },
  );

  const json = (await res.json()) as { id: string; webViewLink?: string };
  return json.webViewLink ?? `https://drive.google.com/file/d/${json.id}/view`;
}
