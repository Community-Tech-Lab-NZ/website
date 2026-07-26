import {
  COMMUNITY_LABELS,
  CTL_GATES,
  DEVELOPER_LABELS,
  type CommunityApplication,
  type DeveloperApplication,
} from "./schemas";

/* Formats an application as readable plain text for the generated Google Doc.
 *
 * The panel reads 30-odd applications between 1 and 18 September, most of the
 * content being long prose. This is what they actually read; the Sheet row is
 * what they score against. Section order matches the form, so a reader who has
 * seen the form knows where they are.
 *
 * Empty optional answers are shown as "Not answered" rather than omitted. A
 * panel needs to see that a question was skipped, not silently wonder whether it
 * was asked.
 */

const NOT_ANSWERED = "Not answered";

function field(label: string, value: string | undefined | null): string {
  const answer = (value ?? "").toString().trim();
  return `${label}\n${answer || NOT_ANSWERED}\n`;
}

function heading(text: string): string {
  return `\n${text.toUpperCase()}\n${"=".repeat(text.length)}\n\n`;
}

export function formatCommunityApplication(
  data: CommunityApplication,
  submittedAt: string,
): string {
  const L = COMMUNITY_LABELS;

  return [
    `COMMUNITY TECH LAB — APPLICATION`,
    `${data.orgName}`,
    `Submitted ${submittedAt}`,
    `Reference ${data.submissionId}`,
    "",
    heading("1. Your organisation"),
    field(L.orgName, data.orgName),
    field(L.legalStructure, data.legalStructure),
    field(L.registrationNumber, data.registrationNumber),
    field(L.contactName, data.contactName),
    field(L.contactRole, data.contactRole),
    field(L.contactEmail, data.contactEmail),
    field(L.contactPhone, data.contactPhone),
    field(L.basedIn, data.basedIn),
    field(L.orgSize, data.orgSize),

    heading("2. Eligibility"),
    ...CTL_GATES.map((gate, i) => `${data.gates[i] ? "[confirmed]" : "[NOT CONFIRMED]"} ${gate}\n`),

    heading("3. The problem"),
    field(L.problem, data.problem),
    field(L.problemToday, data.problemToday),
    field(L.problemWho, data.problemWho),
    field(L.problemSuccess, data.problemSuccess),

    heading("4. Scope and fit"),
    field(L.scopeEssentials, data.scopeEssentials),
    field(L.scopeReuse, data.scopeReuse),
    field(L.scopeSystems, data.scopeSystems),
    field(L.scopeSystemsWhich, data.scopeSystemsWhich),
    field(L.scopeSensitive, data.scopeSensitive),
    field(L.scopeSensitiveWhat, data.scopeSensitiveWhat),

    heading("5. Readiness"),
    field(L.readinessContact, data.readinessContact),
    field(L.readinessOwner, data.readinessOwner),
    field(L.readinessTiming, data.readinessTiming),
    field(L.readinessAnythingElse, data.readinessAnythingElse),

    heading("6. Declaration"),
    field(L.declarationName, data.declarationName),
    field(L.declarationRole, data.declarationRole),
    `Confirmed on behalf of the organisation: ${data.declared ? "yes" : "no"}\n`,
  ].join("\n");
}

export function formatDeveloperApplication(
  data: DeveloperApplication,
  submittedAt: string,
): string {
  const L = DEVELOPER_LABELS;

  return [
    `COMMUNITY TECH LAB — DEVELOPER APPLICATION`,
    `${data.name}`,
    `Submitted ${submittedAt}`,
    `Reference ${data.submissionId}`,
    "",
    field(L.seat, data.seat),
    field(L.name, data.name),
    field(L.email, data.email),
    field(L.basedIn, data.basedIn),
    field(L.hours, data.hours),
    field(L.shipped, data.shipped),
    `Understands the community rate and open source release: ${data.understood ? "yes" : "no"}\n`,
  ].join("\n");
}

/** Filename for the generated Doc. Sorts chronologically in the Drive folder. */
export function docName(orgOrPerson: string, submittedAtIso: string, id: string): string {
  const date = submittedAtIso.slice(0, 10);
  const safe = orgOrPerson.replace(/[^\p{L}\p{N} .-]/gu, "").trim().slice(0, 60) || "Application";
  return `${date} ${safe} (${id.slice(0, 8)})`;
}
