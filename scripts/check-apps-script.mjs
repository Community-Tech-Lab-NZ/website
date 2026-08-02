/**
 * Verifies the Apps Script Drive writer end to end, without going near the form.
 *
 * Worth having as its own step: a failed submission has half a dozen possible
 * causes, and this narrows it to one. If this passes, Drive is fine and any
 * remaining problem is in the route. If it fails, the message says which of the
 * setup steps was missed.
 *
 *   node scripts/check-apps-script.mjs
 *
 * Creates one Doc and one text file in the real folders. Both are named
 * obviously and printed at the end — delete them afterwards.
 */
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")];
    }),
);

const { APPS_SCRIPT_URL: url, APPS_SCRIPT_SECRET: secret } = env;

if (!url || !secret) {
  console.error(
    "APPS_SCRIPT_URL or APPS_SCRIPT_SECRET is empty in .env.\n" +
      "Deploy scripts/apps-script/Code.gs first — setup steps are in its header.",
  );
  process.exit(1);
}

async function call(payload) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret, ...payload }),
    redirect: "follow",
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    // Nearly always one of two things, and the opening characters tell them
    // apart: an HTML login page means the deployment is not set to "Anyone",
    // and a stack trace means the script itself threw.
    return { ok: false, error: `non-JSON (${res.status}): ${text.slice(0, 300)}` };
  }
}

let failed = false;

function report(label, result) {
  if (result.ok) {
    console.log(`  PASS  ${label}\n        ${result.url ?? ""}`);
  } else {
    failed = true;
    console.log(`  FAIL  ${label}\n        ${result.error}`);
  }
}

console.log(`\nApps Script: ${url}\n`);

// 1. Alive at all?
const health = await fetch(url, { redirect: "follow" })
  .then(async (r) => JSON.parse(await r.text()))
  .catch((e) => ({ ok: false, error: String(e) }));
report("endpoint responds", health);

// 2. Does the secret actually gate anything? A deployment with SHARED_SECRET
//    unset would accept everything, which is worth catching now rather than
//    discovering later.
const bad = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ secret: "definitely-not-the-secret", action: "doc" }),
  redirect: "follow",
})
  .then(async (r) => JSON.parse(await r.text()))
  .catch((e) => ({ ok: false, error: String(e) }));
report(
  "wrong secret is rejected",
  bad.ok === false && /unauthorised|SHARED_SECRET/.test(bad.error ?? "")
    ? { ok: true, url: `rejected with: ${bad.error}` }
    : { ok: false, error: `expected a rejection, got ${JSON.stringify(bad)}` },
);

// 3. The two real operations.
const stamp = new Date().toISOString().slice(0, 19);

report(
  "creates a Doc in Applications",
  await call({
    action: "doc",
    folderId: env.DRIVE_APPLICATIONS_FOLDER_ID,
    name: `DELETE ME — wiring test ${stamp}`,
    body: "Test document created by scripts/check-apps-script.mjs.\nSafe to delete.",
  }),
);

report(
  "uploads a file to CVs",
  await call({
    action: "file",
    folderId: env.DRIVE_CVS_FOLDER_ID,
    name: `DELETE ME — wiring test ${stamp}.txt`,
    mimeType: "text/plain",
    dataBase64: Buffer.from("Test file. Safe to delete.").toString("base64"),
  }),
);

// 4. The allowlist should refuse a folder that is not one of the two.
report(
  "refuses an unlisted folder",
  await call({
    action: "doc",
    folderId: "root",
    name: "should not exist",
    body: "",
  }).then((r) =>
    r.ok === false && /not allowed/.test(r.error ?? "")
      ? { ok: true, url: "rejected as expected" }
      : { ok: false, error: `expected refusal, got ${JSON.stringify(r)}` },
  ),
);

console.log(
  failed
    ? "\nSomething is not wired up. Check the setup steps in scripts/apps-script/Code.gs.\n" +
        "If a change looks ignored, re-deploy: saving the script does not update the web app.\n"
    : "\nAll good. Delete the two 'DELETE ME' files from Drive.\n",
);

process.exit(failed ? 1 : 0);
