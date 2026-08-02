/**
 * Read-only diagnostic: where do the two Drive folders actually live, and who
 * owns them?
 *
 * This is what found the original problem, and it is kept because the next
 * person to set the programme up from scratch will hit the same wall. It
 * distinguishes a My Drive folder — which a service account cannot create files
 * in, having no storage quota — from a Shared Drive folder, which it can. If
 * Docs or CVs ever start failing with a 403, run this before anything else: it
 * answers "whose Drive is this actually?" in one call.
 *
 * Needs the Google Drive API enabled on the Cloud project. The site itself does
 * NOT — it only uses Sheets — so if this errors with an API-disabled message on
 * a fresh setup, that is expected and harmless. Enable Drive if you want the
 * diagnostic, or ignore it.
 */
import { JWT } from "google-auth-library";
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

const client = new JWT({
  email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  // Metadata only. This reads owners and capabilities and never touches file
  // contents, so the full drive scope it used to ask for was write access it
  // had no use for.
  scopes: ["https://www.googleapis.com/auth/drive.metadata.readonly"],
});
const token = (await client.getAccessToken()).token;

console.log("service account:", env.GOOGLE_SERVICE_ACCOUNT_EMAIL, "\n");

for (const [label, id] of [
  ["applications", env.DRIVE_APPLICATIONS_FOLDER_ID],
  ["cvs", env.DRIVE_CVS_FOLDER_ID],
]) {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${id}` +
      `?fields=id,name,driveId,owners(emailAddress),capabilities(canAddChildren)` +
      `&supportsAllDrives=true`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const j = await res.json();
  if (!res.ok) {
    console.log(`${label}: ERROR ${res.status} ${JSON.stringify(j.error?.message)}`);
    continue;
  }
  console.log(`${label}: "${j.name}"`);
  console.log(`  driveId:        ${j.driveId ?? "(none — this is a My Drive folder)"}`);
  console.log(`  owner:          ${j.owners?.[0]?.emailAddress ?? "(shared drive owns it)"}`);
  console.log(`  canAddChildren: ${j.capabilities?.canAddChildren}`);
}

const drives = await (
  await fetch("https://www.googleapis.com/drive/v3/drives?pageSize=10", {
    headers: { Authorization: `Bearer ${token}` },
  })
).json();
console.log(
  "\nshared drives visible to the service account:",
  drives.drives?.length ? drives.drives.map((d) => d.name).join(", ") : "none",
);
