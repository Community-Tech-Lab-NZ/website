import {
  COMMUNITY_LABELS,
  CTL_GATES,
  DEVELOPER_LABELS,
  type CommunityApplication,
  type DeveloperApplication,
} from "./schemas";

/* One application, described once.
 *
 * The same answers are shown in three places: the Google Doc the panel reads,
 * the plain-text part of the applicant's confirmation, and the HTML part of it.
 * All three render from the structure below rather than from each other, so a
 * question added to the form cannot turn up in one and be missing from another,
 * and the HTML email is not a monospace dump of the Doc.
 *
 * The panel reads 30-odd applications between 1 and 18 September, most of the
 * content being long prose. The Doc is what they actually read; the Sheet row is
 * what they score against. Section order matches the form, so a reader who has
 * seen the form knows where they are.
 *
 * Empty optional answers are shown as "Not answered" rather than omitted. A
 * panel needs to see that a question was skipped, not silently wonder whether it
 * was asked.
 */

export const NOT_ANSWERED = "Not answered";

/** A written answer, or a box the applicant had to tick. */
export type ApplicationField =
  | { label: string; value: string }
  | { label: string; confirmed: boolean };

export type ApplicationSection = { title: string; fields: ApplicationField[] };

export type ApplicationSummary = {
  kind: "community" | "developer";
  /** What this document is, above the name. */
  title: string;
  /** The organisation's name, or the developer's. */
  subject: string;
  submittedAt: string;
  reference: string;
  sections: ApplicationSection[];
};

export function isConfirmation(
  field: ApplicationField,
): field is { label: string; confirmed: boolean } {
  return "confirmed" in field;
}

/** The answer as it should be read, with the blank case spelled out. */
export function answerText(field: ApplicationField): string {
  if (isConfirmation(field)) return field.confirmed ? "Confirmed" : "Not confirmed";
  return field.value || NOT_ANSWERED;
}

function answer(label: string, value: string | undefined | null): ApplicationField {
  return { label, value: (value ?? "").toString().trim() };
}

export function communityApplicationSummary(
  data: CommunityApplication,
  submittedAt: string,
): ApplicationSummary {
  const L = COMMUNITY_LABELS;

  return {
    kind: "community",
    title: "Community Tech Lab application",
    subject: data.orgName,
    submittedAt,
    reference: data.submissionId,
    sections: [
      {
        title: "Your organisation",
        fields: [
          answer(L.orgName, data.orgName),
          answer(L.legalStructure, data.legalStructure),
          answer(L.registrationNumber, data.registrationNumber),
          answer(L.contactName, data.contactName),
          answer(L.contactRole, data.contactRole),
          answer(L.contactEmail, data.contactEmail),
          answer(L.contactPhone, data.contactPhone),
          answer(L.basedIn, data.basedIn),
          answer(L.orgSize, data.orgSize),
        ],
      },
      {
        title: "Eligibility",
        fields: CTL_GATES.map((gate, i) => ({
          label: gate,
          confirmed: Boolean(data.gates[i]),
        })),
      },
      {
        title: "The problem",
        fields: [
          answer(L.problem, data.problem),
          answer(L.problemToday, data.problemToday),
          answer(L.problemWho, data.problemWho),
          answer(L.problemSuccess, data.problemSuccess),
        ],
      },
      {
        title: "Scope and fit",
        fields: [
          answer(L.scopeEssentials, data.scopeEssentials),
          answer(L.scopeReuse, data.scopeReuse),
          answer(L.scopeSystems, data.scopeSystems),
          answer(L.scopeSystemsWhich, data.scopeSystemsWhich),
          answer(L.scopeSensitive, data.scopeSensitive),
          answer(L.scopeSensitiveWhat, data.scopeSensitiveWhat),
        ],
      },
      {
        title: "Readiness",
        fields: [
          answer(L.readinessContact, data.readinessContact),
          answer(L.readinessOwner, data.readinessOwner),
          answer(L.readinessTiming, data.readinessTiming),
          answer(L.readinessAnythingElse, data.readinessAnythingElse),
        ],
      },
      {
        title: "Declaration",
        fields: [
          answer(L.declarationName, data.declarationName),
          answer(L.declarationRole, data.declarationRole),
          {
            label: "Declared on behalf of the organisation",
            confirmed: Boolean(data.declared),
          },
        ],
      },
    ],
  };
}

export function developerApplicationSummary(
  data: DeveloperApplication,
  submittedAt: string,
): ApplicationSummary {
  const L = DEVELOPER_LABELS;

  return {
    kind: "developer",
    title: "Community Tech Lab developer application",
    subject: data.name,
    submittedAt,
    reference: data.submissionId,
    sections: [
      {
        title: "Your application",
        fields: [
          answer(L.seat, data.seat),
          answer(L.name, data.name),
          answer(L.email, data.email),
          answer(L.basedIn, data.basedIn),
          answer(L.hours, data.hours),
          answer(L.shipped, data.shipped),
        ],
      },
      {
        title: "Confirmations",
        fields: [
          {
            label: "Understands the community rate and the open source release",
            confirmed: Boolean(data.understood),
          },
          {
            label: "Understands how AI tools are used",
            confirmed: Boolean(data.aiUnderstood),
          },
        ],
      },
    ],
  };
}

/** The application as plain text, for the Google Doc and for email clients
 *  showing the text part. Headings are underlined rather than styled, because
 *  neither surface can carry weight. */
export function renderApplicationText(
  summary: ApplicationSummary,
  withHeader = true,
): string {
  /* Off wherever something above has already said whose application this is
     and when it arrived — the programme copy leads with a meta block carrying
     both. The HTML renderer has taken the same flag from the start; the text
     one did not, so that email printed the reference and the date twice within
     eight lines and the organisation's name three times. Default on, because
     the Doc has nothing above it. */
  const header = withHeader
    ? [
        summary.title.toUpperCase(),
        summary.subject,
        `Submitted ${summary.submittedAt}`,
        `Reference ${summary.reference}`,
      ].join("\n")
    : "";

  const sections = summary.sections.map((section, i) => {
    const heading = `${i + 1}. ${section.title}`.toUpperCase();
    const entries = section.fields.map((field) =>
      isConfirmation(field)
        ? // Marker first, so a panel scanning the gates sees the exceptions
          // without reading the sentence that follows each one.
          `${field.confirmed ? "[confirmed]" : "[NOT CONFIRMED]"} ${field.label}`
        : `${field.label}\n${answerText(field)}`,
    );

    return [`${heading}\n${"=".repeat(heading.length)}`, ...entries].join("\n\n");
  });

  return [header, ...sections].filter(Boolean).join("\n\n");
}

/** Filename for the generated Doc. Sorts chronologically in the Drive folder. */
export function docName(orgOrPerson: string, submittedAtIso: string, id: string): string {
  const date = submittedAtIso.slice(0, 10);
  const safe = orgOrPerson.replace(/[^\p{L}\p{N} .-]/gu, "").trim().slice(0, 60) || "Application";
  return `${date} ${safe} (${id.slice(0, 8)})`;
}
