import { z } from "zod";

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

const requiredShort = shortText.min(1, "This one is required.");

// Deliberately permissive. Anything with an @ and a dot after it gets through:
// bouncing a real applicant over an unusual but valid address costs far more
// than accepting the occasional typo, and we reply to everyone anyway.
const email = z
  .string()
  .trim()
  .min(1, "We need an email address to reply to.")
  .regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, "That does not look like an email address.");

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

export const LEGAL_STRUCTURES = [
  "Registered charity",
  "Incorporated society",
  "Charitable trust",
  "Community group",
  "Not-for-profit",
  "Marae or iwi organisation",
  "Other",
] as const;

export const ORG_SIZES = [
  "1 to 3",
  "4 to 10",
  "11 to 25",
  "26 to 50",
  "More than 50",
] as const;

export const SYSTEM_ANSWERS = ["No, or not sure", "Yes, please name them below"] as const;
export const SENSITIVE_ANSWERS = ["No", "Yes, described below"] as const;

export const DEVELOPER_SEATS = [
  "Senior developer and mentor, paid",
  "Junior developer or designer, paid",
  "Programme intern, unpaid",
] as const;

export const DEVELOPER_HOURS = ["Around 12", "Fewer than 12", "More than 12"] as const;

/** The six eligibility gates. All must be true to submit. */
export const CTL_GATES = [
  "We are a not-for-profit, community organisation, charity, trust, incorporated society, or similar mission-based group.",
  "We are based in, or primarily serve, the Queenstown Lakes district.",
  "What we are asking for would support our charitable or community purpose, not a commercial product we intend to sell.",
  "We have a person who can be available during the programme to answer questions and test progress.",
  "We understand the code would be open source, meaning it is published publicly so other organisations can use and adapt it, and that delivery happens over a short build cycle in late 2026.",
  "We understand that after handover there is a six-week period for bug fixes only, and later changes would be arranged separately.",
] as const;

export const DECLARATION_STATEMENTS = [
  "I am authorised to submit this form on behalf of the organisation named above.",
  "The information provided is accurate to the best of my knowledge.",
  "I understand applying does not guarantee selection, and only three solutions are built in this round.",
  "I consent to the programme partners using this information to assess and prioritise applications, and to contact us about it.",
  "I understand the code would be published openly, so other organisations can use and adapt it.",
] as const;

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
      message: "All six eligibility statements need to be confirmed.",
    }),

  // 3. The problem
  problem: longText.min(1, "This one is required."),
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
  readinessContact: longText.min(1, "This one is required."),
  readinessOwner: longText.optional(),
  readinessTiming: longText.optional(),
  readinessAnythingElse: longText.optional(),

  // 6. Declaration
  declarationName: requiredShort,
  declarationRole: shortText.optional(),
  declared: z.literal(true, {
    message: "Please confirm the statements before sending.",
  }),
});

export const developerSchema = z.object({
  formType: z.literal("developer"),
  submissionId: z.string().uuid(),
  ...antiSpam,

  seat: z.enum(DEVELOPER_SEATS, { message: "Tell us which seat fits." }),
  shipped: longText.min(1, "Point us at something you have shipped."),
  basedIn: shortText.optional(),
  hours: z.enum(DEVELOPER_HOURS).or(z.literal("")).optional(),
  name: requiredShort,
  email,
  understood: z.literal(true, {
    message: "Please confirm you understand the rate and the open source release.",
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

/* Field labels for the generated Google Doc and the confirmation email.
 *
 * Kept beside the schema so a new field cannot be added without a human-readable
 * name, which is what the panel actually reads.
 */
export const COMMUNITY_LABELS: Record<string, string> = {
  orgName: "Organisation name",
  legalStructure: "Legal structure",
  registrationNumber: "Charities or NZBN number",
  contactName: "Main contact name",
  contactRole: "Role or position",
  contactEmail: "Email",
  contactPhone: "Phone",
  basedIn: "Where you are based",
  orgSize: "Roughly how many people run your organisation",
  problem: "What is the problem you are hoping a digital solution could help with",
  problemToday: "How do you handle this today, and what does it cost you",
  problemWho: "Who is affected, and how",
  problemSuccess: "What would success look like",
  scopeEssentials: "The few things that matter most",
  scopeReuse: "Could something like this help other organisations in the district",
  scopeSystems: "Does it need to connect to, or replace, systems you already use",
  scopeSystemsWhich: "Which systems",
  scopeSensitive: "Would it handle personal or sensitive information",
  scopeSensitiveWhat: "What kind of information",
  readinessContact: "Main point of contact during the build, and how much time",
  readinessOwner: "After handover, who would look after it",
  readinessTiming: "Anything time-sensitive about your need",
  readinessAnythingElse: "Anything else the selection panel should know",
  declarationName: "Declared by",
  declarationRole: "Role",
};

export const DEVELOPER_LABELS: Record<string, string> = {
  seat: "Which seat fits",
  shipped: "Something you have shipped",
  basedIn: "Where in the district are you based",
  hours: "Hours available per week",
  name: "Name",
  email: "Email",
};
