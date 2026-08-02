/**
 * Community Tech Lab — Drive writer.
 *
 * WHY THIS EXISTS. A service account has no Drive storage quota of its own. When
 * it creates a file it becomes that file's owner, and an owner needs quota — so
 * every attempt to create the application Doc or save a CV failed with a 403,
 * even though the folders were shared with it correctly. Permission was never
 * the problem; ownership was.
 *
 * Google's own suggested fixes are a Shared Drive or OAuth domain-wide
 * delegation, and both are Google Workspace features. The programme runs on a
 * consumer Gmail account, so neither is available.
 *
 * This script closes the gap. Deployed as a web app with "Execute as: Me", it
 * runs as the account that OWNS the folders, so files it creates are owned by
 * that account and draw on its own 15GB. No refresh token, so nothing here
 * silently expires — which matters more than it sounds: an OAuth refresh token
 * on an app in "Testing" status dies after seven days, which would have failed
 * quietly in the middle of the application window.
 *
 * SETUP (once, in the account that owns the two Drive folders)
 *
 *   1. script.google.com → New project. Paste this file in, replacing anything
 *      already there. Name it "Community Tech Lab — Drive writer".
 *
 *   2. Project Settings → Script Properties → add three:
 *        SHARED_SECRET          a long random string you invent
 *        APPLICATIONS_FOLDER_ID the Applications folder id
 *        CVS_FOLDER_ID          the CVs folder id
 *      The folder id is the last path segment of the folder's URL in Drive.
 *
 *   3. Deploy → New deployment → type "Web app".
 *        Execute as:     Me
 *        Who has access: Anyone
 *      "Anyone" is required — "Anyone with a Google account" makes the endpoint
 *      answer an HTML login page instead of running, which the caller cannot
 *      use. This is exactly why SHARED_SECRET is load-bearing rather than
 *      decorative: the URL is world-reachable and the secret is the only thing
 *      standing in front of it. Treat it like a password.
 *
 *   4. Authorise when prompted. The "unverified app" warning is expected —
 *      you are the author and the only user. Advanced → Go to project.
 *
 *   5. Copy the deployment URL into the site's .env as APPS_SCRIPT_URL, and the
 *      same secret as APPS_SCRIPT_SECRET.
 *
 * AFTER EDITING, RE-DEPLOY. Saving the script changes nothing on its own: a web
 * app serves the code as of its last deployment. Deploy → Manage deployments →
 * edit → Version "New version". Forgetting this is the single most common way
 * to spend an hour debugging a change that was never live.
 */

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return json({ ok: false, error: "empty request" });
    }

    var req = JSON.parse(e.postData.contents);
    var props = PropertiesService.getScriptProperties();

    var expected = props.getProperty("SHARED_SECRET");
    if (!expected) {
      return json({ ok: false, error: "SHARED_SECRET script property is not set" });
    }
    if (!req.secret || req.secret !== expected) {
      return json({ ok: false, error: "unauthorised" });
    }

    // The caller names the destination folder, but only the two configured here
    // are writable. Without this an leaked secret would be a write handle to the
    // whole of the account's Drive; with it, the blast radius is two folders.
    var allowed = [
      props.getProperty("APPLICATIONS_FOLDER_ID"),
      props.getProperty("CVS_FOLDER_ID"),
    ].filter(function (id) {
      return !!id;
    });

    if (allowed.indexOf(req.folderId) === -1) {
      return json({ ok: false, error: "folder not allowed" });
    }

    var folder = DriveApp.getFolderById(req.folderId);

    if (req.action === "doc") {
      // DocumentApp.create always lands in My Drive root, so the move is a
      // second step and not optional — skipping it strands every application
      // at the top of the owner's Drive.
      var doc = DocumentApp.create(req.name);
      doc.getBody().setText(req.body || "");
      doc.saveAndClose();

      var docFile = DriveApp.getFileById(doc.getId());
      docFile.moveTo(folder);
      return json({ ok: true, url: docFile.getUrl() });
    }

    if (req.action === "file") {
      var bytes = Utilities.base64Decode(req.dataBase64);
      var blob = Utilities.newBlob(
        bytes,
        req.mimeType || "application/octet-stream",
        req.name,
      );
      var file = folder.createFile(blob);
      return json({ ok: true, url: file.getUrl() });
    }

    return json({ ok: false, error: "unknown action: " + req.action });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

/** Health check. Deliberately says nothing beyond "this endpoint is alive". */
function doGet() {
  return json({ ok: true });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
