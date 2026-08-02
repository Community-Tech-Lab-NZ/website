import { z } from "zod";
import {
  COMMUNITY_ASKS,
  CTL_GATES,
  DEVELOPER_ASKS,
  DEVELOPER_HOURS,
  DEVELOPER_SEATS,
  EMAIL_PATTERN,
  FORM_MESSAGES,
  LEGAL_STRUCTURES,
  ORG_SIZES,
  SENSITIVE_ANSWERS,
  SYSTEM_ANSWERS,
} from "./form-options";

/* Validation for both application forms and the eligibility question panel.
 *
 * Field names and requiredness mirror the prototype exactly. The prototype
 * validated almost nothing (an email regex on the developer form, plus the
 * checkbox gates), so real rules are decided here.
 *
 * Guiding principle: be strict about what makes an application USABLE by the
 * panel, and lenient about everything else. A community organisation should
 * never lose a 50-minute form to a validation rule that did not need to exist.
 * Optional means optional; nothing is rejected for being too short.
 */

const shortText = z.string().trim().max(300, "Please keep this under 300 characters.");
const longText = z.string().trim().max(5000, "Please keep this under 5000 characters.");

const requiredShort = shortText.min(1, FORM_MESSAGES.required);

// Pattern and messages come from form-options so the client mirrors are
// word-for-word identical by construction; see the notes there on why the
// pattern is deliberately permissive.
const email = z
  .string()
  .trim()
  .min(1, FORM_MESSAGES.emailMissing)
  .regex(EMAIL_PATTERN, FORM_MESSAGES.emailInvalid);

/** Anti-spam. Both fields are invisible to humans. */
const antiSpam = {
  // Honeypot: a hidden field a bot fills in and a person never sees.
  //
  // Deliberately accepts ANY value. An earlier version used .max(0) here, which
  // rejected filled honeypots at validation with a 400 naming the `website`
  // field — telling a bot precisely which input to leave alone next time. The
  // route checks it after validation instead and returns a normal success, so a
  // bot cannot tell the difference between being accepted and being discarded.
  website: z.string().optional(),
  // Milliseconds from form mount to submit. Bots post instantly.
  elapsedMs: z.number().int().nonnegative().optional(),
};

/* Option lists, gates and declaration text live in form-options.ts, which has no
 * dependencies. Keeping them there stops the form components pulling Zod into
 * the browser just to render a dropdown. Re-exported so server code has one
 * import site. */
export {
  LEGAL_STRUCTURES,
  ORG_SIZES,
  SYSTEM_ANSWERS,
  SENSITIVE_ANSWERS,
  DEVELOPER_SEATS,
  DEVELOPER_HOURS,
  CTL_GATES,
  DECLARATION_STATEMENTS,
} from "./form-options";

export const communitySchema = z.object({
  formType: z.literal("community"),
  submissionId: z.string().uuid(),
  ...antiSpam,

  // 1. Your organisation
  orgName: requiredShort,
  legalStructure: z.enum(LEGAL_STRUCTURES).or(z.literal("")).optional(),
  registrationNumber: shortText.optional(),
  contactName: requiredShort,
  contactRole: shortText.optional(),
  contactEmail: email,
  contactPhone: shortText.optional(),
  basedIn: shortText.optional(),
  orgSize: z.enum(ORG_SIZES).or(z.literal("")).optional(),

  // 2. Eligibility. All six gates, enforced server-side as well as in the UI.
  gates: z
    .array(z.boolean())
    .length(CTL_GATES.length)
    .refine((g) => g.every(Boolean), {
      message: FORM_MESSAGES.gates,
    }),

  // 3. The problem
  problem: longText.min(1, FORM_MESSAGES.required),
  problemToday: longText.optional(),
  problemWho: longText.optional(),
  problemSuccess: longText.optional(),

  // 4. Scope and fit
  scopeEssentials: longText.optional(),
  scopeReuse: longText.optional(),
  scopeSystems: z.enum(SYSTEM_ANSWERS).or(z.literal("")).optional(),
  scopeSystemsWhich: shortText.optional(),
  scopeSensitive: z.enum(SENSITIVE_ANSWERS).or(z.literal("")).optional(),
  scopeSensitiveWhat: longText.optional(),

  // 5. Readiness
  readinessContact: longText.min(1, FORM_MESSAGES.required),
  readinessOwner: longText.optional(),
  readinessTiming: longText.optional(),
  readinessAnythingElse: longText.optional(),

  // 6. Declaration
  declarationName: requiredShort,
  declarationRole: shortText.optional(),
  declared: z.literal(true, {
    message: FORM_MESSAGES.declared,
  }),
});

export const developerSchema = z.object({
  formType: z.literal("developer"),
  submissionId: z.string().uuid(),
  ...antiSpam,

  seat: z.enum(DEVELOPER_SEATS, { message: FORM_MESSAGES.seat }),
  shipped: longText.min(1, FORM_MESSAGES.shipped),
  basedIn: shortText.optional(),
  hours: z.enum(DEVELOPER_HOURS).or(z.literal("")).optional(),
  name: requiredShort,
  email,
  understood: z.literal(true, {
    message: "Please confirm you understand the rate and the open source release.",
  }),
  aiUnderstood: z.literal(true, {
    message: "Please confirm you understand how AI tools are used.",
  }),
});

/** The eligibility question panel. Deliberately tiny. */
export const questionSchema = z.object({
  formType: z.literal("question"),
  submissionId: z.string().uuid(),
  ...antiSpam,

  gate: shortText.optional(),
  name: requiredShort,
  email,
  question: longText.min(1, "What would you like to ask?"),
});

export const submissionSchema = z.discriminatedUnion("formType", [
  communitySchema,
  developerSchema,
  questionSchema,
]);

export type CommunityApplication = z.infer<typeof communitySchema>;
export type DeveloperApplication = z.infer<typeof developerSchema>;
export type Question = z.infer<typeof questionSchema>;
export type Submission = z.infer<typeof submissionSchema>;

/* Field labels for the generated Google Doc, the confirmation email and the
 * Sheet's column order.
 *
 * THE QUESTION IS THE LABEL, unless it is said here that it is not. The asks
 * come straight from form-options.ts so a reworded question reaches the panel's
 * copy on its own; the overrides below are the handful of places where the two
 * surfaces genuinely want different words, and listing them together is the
 * point — they can be read, and argued with, as a set.
 *
 * Why they differ at all: the form ASKS, so it can afford a full sentence with
 * the conditional framing that makes an optional question feel optional. The
 * Doc LABELS an answer already given, where that framing is noise the panel
 * reads thirty times. "If you have a sense of what it might do, list the few
 * things that matter most" is a kind question; as a heading over someone's
 * answer it is a paragraph.
 *
 * Spread first, then override: re-assigning an existing key leaves it where it
 * was, so the Sheet's columns stay in the order the form asks them.
 */
export const COMMUNITY_LABELS: Record<string, string> = {
  ...COMMUNITY_ASKS,
  scopeEssentials: "The few things that matter most",
  scopeSensitiveWhat: "What kind of information",
  readinessContact: "Main point of contact during the build, and how much time",
  readinessOwner: "After handover, who would look after it",
  readinessTiming: "Anything time-sensitive about your need",
  // "Name" alone is unambiguous under a form heading that says Declaration.
  // In a document listing twenty-five answers it is one of four names.
  declarationName: "Declared by",
};

export const DEVELOPER_LABELS: Record<string, string> = {
  ...DEVELOPER_ASKS,
  hours: "Hours available per week",
  name: "Name",
};
