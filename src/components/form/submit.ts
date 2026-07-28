import { EMAIL_PATTERN, FORM_MESSAGES } from "@/lib/form-options";

/* Client-side plumbing shared by everything that posts to /api/apply: the
 * community form, the developer form and the eligibility question panel.
 *
 * One request shape, one response contract. The server replies
 * { ok, error?, issues? }; a network failure has no reply at all, and each
 * caller chooses its own copy for that case — the community form promises
 * the draft is safe on this device, the others just ask to try again.
 */

export type Issue = { field: string; message: string };

export type ApplyResult =
  | { ok: true }
  | { ok: false; reason: "network" }
  | { ok: false; reason: "rejected"; error: string; issues: Issue[] };

/**
 * POST a submission. Passing `cv` (even as null) sends multipart form data —
 * the developer form's shape, where a file may ride along — otherwise the
 * payload goes as plain JSON.
 */
export async function postApplication(
  payload: Record<string, unknown>,
  cv?: File | null,
): Promise<ApplyResult> {
  let init: RequestInit;
  if (cv === undefined) {
    init = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    };
  } else {
    const body = new FormData();
    body.set("payload", JSON.stringify(payload));
    if (cv) body.set("cv", cv);
    init = { method: "POST", body };
  }

  try {
    const res = await fetch("/api/apply", init);
    const json = (await res.json()) as { ok: boolean; error?: string; issues?: Issue[] };
    if (!res.ok || !json.ok) {
      return {
        ok: false,
        reason: "rejected",
        error: json.error ?? "Something went wrong. Please try again.",
        issues: json.issues ?? [],
      };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "network" };
  }
}

/* Client-side mirrors of the REQUIRED rules in the server schema. Presence
 * plus the email shape only — everything subtler (length caps, enum
 * membership) stays with the server, where "never lose a long form to a
 * validation rule that did not need to exist" is enforced in one place.
 * Messages come from FORM_MESSAGES, the same constants the schema uses. */

/** Presence check, with the same message the server would send. */
export function requiredIssue(
  field: string,
  value: string,
  message: string = FORM_MESSAGES.required,
): Issue[] {
  return value.trim() ? [] : [{ field, message }];
}

/** The email shape check, mirroring the server rule exactly. */
export function emailIssues(field: string, value: string): Issue[] {
  if (!value.trim()) return [{ field, message: FORM_MESSAGES.emailMissing }];
  if (!EMAIL_PATTERN.test(value.trim())) return [{ field, message: FORM_MESSAGES.emailInvalid }];
  return [];
}
