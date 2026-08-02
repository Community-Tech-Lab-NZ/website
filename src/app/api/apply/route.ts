import { NextResponse } from "next/server";
import { getWindowState } from "@/lib/application-window";
import {
  communityApplicationSummary,
  developerApplicationSummary,
  docName,
  renderApplicationText,
  type ApplicationSummary,
} from "@/lib/application-doc";
import {
  getEmailConfig,
  sendApplicationCopy,
  sendCommunityConfirmation,
  sendDeveloperConfirmation,
  sendQuestionAlert,
} from "@/lib/email";
import { appendRow, createDoc, getGoogleConfig, uploadFile } from "@/lib/google";
import {
  COMMUNITY_LABELS,
  DEVELOPER_LABELS,
  submissionSchema,
  type Submission,
} from "@/lib/schemas";

/* Submission handler for both applications and eligibility questions.
 *
 * ORDERING IS LOAD-BEARING. The raw JSON lands in the `_raw` tab before any
 * formatting, Doc generation, file upload or email. If everything after step 2
 * fails, the applicant's 50 minutes are already safe and the row can be replayed
 * by hand.
 *
 * Corollary: once the raw write succeeds, this NEVER returns an error. Telling
 * someone their application failed, after they spent an hour on it, when the
 * data is actually sitting in the Sheet, would be the worst outcome this code
 * can produce. Later failures are logged and swallowed.
 */

export const runtime = "nodejs";
export const maxDuration = 30;

// Bots post instantly. A human cannot complete even the developer form in five
// seconds, and the community form takes closer to an hour.
const MIN_ELAPSED_MS = 5_000;
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

function log(step: string, error: unknown) {
  console.error(`[apply] ${step} failed:`, error instanceof Error ? error.message : error);
}

export async function POST(request: Request) {
  let payload: Submission;
  let cv: File | null = null;

  // --- Parse -------------------------------------------------------------
  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const raw = form.get("payload");
      if (typeof raw !== "string") {
        return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
      }
      payload = JSON.parse(raw) as Submission;
      const file = form.get("cv");
      if (file instanceof File && file.size > 0) cv = file;
    } else {
      payload = (await request.json()) as Submission;
    }
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  // --- Validate ----------------------------------------------------------
  const parsed = submissionSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Some answers need another look.",
        issues: parsed.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 400 },
    );
  }
  const data = parsed.data;

  // --- Anti-spam ---------------------------------------------------------
  // Honeypot and timing are checked after validation so a bot gets the same
  // shaped response as a person, and cannot use the difference to probe.
  if (data.website) {
    return NextResponse.json({ ok: true, id: data.submissionId });
  }
  // Zero or missing means "not measured", NOT "instant". The client only starts
  // the clock in an effect, so a legitimate submission can arrive with 0 if
  // anything unusual happened to the timing. Treating that as spam would
  // silently bin a real application, which is far worse than letting a bot
  // through — so only a positive-but-impossibly-fast time is rejected.
  if (typeof data.elapsedMs === "number" && data.elapsedMs > 0 && data.elapsedMs < MIN_ELAPSED_MS) {
    return NextResponse.json({ ok: true, id: data.submissionId });
  }

  // --- Window ------------------------------------------------------------
  // Enforced here, not only in the UI: a tab left open since before the window,
  // or a fiddled system clock, must not be able to post outside it. Questions
  // are always allowed, since someone may need to ask before applying.
  if (data.formType !== "question" && getWindowState() !== "open") {
    return NextResponse.json(
      { ok: false, error: "Applications are not open at the moment." },
      { status: 409 },
    );
  }

  if (cv && cv.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { ok: false, error: "That file is over 4MB. Please attach a smaller one." },
      { status: 400 },
    );
  }

  const submittedAtIso = new Date().toISOString();
  const submittedAtNz = new Intl.DateTimeFormat("en-NZ", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Pacific/Auckland",
  }).format(new Date(submittedAtIso));

  const google = getGoogleConfig();
  const email = getEmailConfig();

  // --- Step 1: durability first -----------------------------------------
  // Everything else is best-effort. If this fails, the applicant is told, and
  // they still have their answers on screen and in their local draft.
  if (!google) {
    log("storage", "Google is not configured (missing env vars)");
    return NextResponse.json(
      {
        ok: false,
        error:
          "We could not save your application just now. Please try again in a few minutes.",
      },
      { status: 503 },
    );
  }

  try {
    await appendRow(google, "_raw", [
      data.submissionId,
      submittedAtIso,
      data.formType,
      JSON.stringify(data),
    ]);
  } catch (error) {
    log("raw write", error);
    return NextResponse.json(
      {
        ok: false,
        error:
          "We could not save your application just now. Please try again in a few minutes.",
      },
      { status: 503 },
    );
  }

  // ---------------------------------------------------------------------
  // From here on the application is SAFE. Nothing below may fail the request.
  // ---------------------------------------------------------------------

  let docUrl = "";
  let cvUrl = "";

  // Built before the try, not inside it. This is pure string assembly over
  // already-validated data, so it has no failure mode worth guarding, and
  // keeping it out here means a Doc that fails to write cannot also cost the
  // applicant the copy of their answers in the confirmation email.
  const summary: ApplicationSummary | null =
    data.formType === "community"
      ? communityApplicationSummary(data, submittedAtNz)
      : data.formType === "developer"
        ? developerApplicationSummary(data, submittedAtNz)
        : null;

  try {
    if (summary) {
      docUrl = await createDoc(
        google,
        docName(summary.subject, submittedAtIso, data.submissionId),
        renderApplicationText(summary),
      );
    }
  } catch (error) {
    log("doc generation", error);
    // The Doc is a convenience, not a record: everything in it is formatted
    // from the `_raw` row, so it can be rebuilt at any time. Saying so in the
    // cell beats a blank that reads like "no Doc was ever wanted".
    docUrl = "DOC FAILED, regenerate from _raw";
  }

  // A failed CV upload must not cost the application. The answers matter more
  // than the attachment, and the CV was optional to begin with.
  if (cv && data.formType === "developer") {
    try {
      const surname = data.name.trim().split(/\s+/).pop() ?? "cv";
      const ext = cv.name.includes(".") ? cv.name.slice(cv.name.lastIndexOf(".")) : "";
      const safe = surname.replace(/[^\p{L}\p{N}-]/gu, "");
      cvUrl = await uploadFile(
        google,
        `${submittedAtIso.slice(0, 10)}-${safe}-${data.submissionId.slice(0, 8)}${ext}`,
        cv.type || "application/octet-stream",
        await cv.arrayBuffer(),
      );
    } catch (error) {
      log("cv upload", error);
      // Unlike the Doc, this one is GONE. The file existed only in this request
      // and there is no second copy to rebuild from, so the row has to carry
      // the fact that a CV was sent and lost — otherwise an empty cell is
      // indistinguishable from an applicant who simply did not attach one, and
      // nobody thinks to ask them to resend.
      cvUrl = "CV SUBMITTED, UPLOAD FAILED: ask the applicant to resend";
    }
  }

  // --- Structured row ----------------------------------------------------
  try {
    if (data.formType === "community") {
      const keys = Object.keys(COMMUNITY_LABELS);
      await appendRow(google, "Community", [
        data.submissionId,
        submittedAtIso,
        docUrl,
        "New",
        ...keys.map((k) => String((data as Record<string, unknown>)[k] ?? "")),
        data.gates.every(Boolean) ? "All six confirmed" : "INCOMPLETE",
      ]);
    } else if (data.formType === "developer") {
      const keys = Object.keys(DEVELOPER_LABELS);
      await appendRow(google, "Developers", [
        data.submissionId,
        submittedAtIso,
        docUrl,
        cvUrl,
        "New",
        ...keys.map((k) => String((data as Record<string, unknown>)[k] ?? "")),
      ]);
    } else {
      await appendRow(google, "Questions", [
        data.submissionId,
        submittedAtIso,
        data.name,
        data.email,
        data.gate ?? "",
        data.question,
        "Unanswered",
      ]);
    }
  } catch (error) {
    log("structured row", error);
  }

  // --- Notify ------------------------------------------------------------
  // Every send is caught on its own. A bounced applicant address must not cost
  // the programme its copy of the application, and vice versa.
  const notify = async (step: string, send: () => Promise<void>) => {
    try {
      await send();
    } catch (error) {
      log(step, error);
    }
  };

  if (email) {
    // Second home for the application, beside the Sheet. Unset, nothing extra
    // is sent and the pipeline behaves exactly as it did before.
    const backupInbox = process.env.APPLICATION_BACKUP_INBOX;
    const programmeInbox = process.env.PROGRAMME_INBOX;

    if (data.formType === "community" && summary) {
      await notify("confirmation email", () =>
        sendCommunityConfirmation(email, data.contactEmail, summary),
      );
      if (backupInbox) {
        await notify("backup copy", () =>
          sendApplicationCopy(email, backupInbox, {
            summary,
            applicantEmail: data.contactEmail,
            docUrl,
            cvUrl,
          }),
        );
      }
    } else if (data.formType === "developer" && summary) {
      await notify("confirmation email", () =>
        sendDeveloperConfirmation(email, data.email, summary),
      );
      if (backupInbox) {
        await notify("backup copy", () =>
          sendApplicationCopy(email, backupInbox, {
            summary,
            applicantEmail: data.email,
            docUrl,
            cvUrl,
          }),
        );
      }
    } else if (data.formType === "question" && programmeInbox) {
      await notify("question alert", () =>
        sendQuestionAlert(
          email,
          programmeInbox,
          data.name,
          data.email,
          data.gate ?? "",
          data.question,
        ),
      );
    }
  }

  return NextResponse.json({ ok: true, id: data.submissionId });
}
