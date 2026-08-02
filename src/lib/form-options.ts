/* Plain form data: the questions, option lists, eligibility gates and
 * declaration text.
 *
 * Deliberately kept in its own module with NO dependencies.
 *
 * These used to live in schemas.ts alongside the Zod schemas, which meant the
 * form components imported that module for six string arrays and dragged all of
 * Zod into the browser with it. Two consequences, both real:
 *
 *   1. A 318KB client chunk on /apply, most of it a validation library the
 *      browser never runs.
 *   2. A Content Security Policy violation. Zod compiles validators with
 *      `new Function`, which `script-src 'self'` blocks. The page still worked,
 *      because nothing on the client actually parsed with it, but the browser
 *      was reporting a blocked eval on every visit.
 *
 * Keep this file dependency-free so that stays true. It is also why the
 * QUESTIONS live here rather than beside the schema that labels them: the form
 * components need them in the browser, and COMMUNITY_LABELS sits in schemas.ts,
 * which is the module this one exists to keep out of the client bundle.
 */

/* The questions, worded exactly as the form asks them.
 *
 * These were written out twice — once in the JSX, once in COMMUNITY_LABELS for
 * the Doc and the confirmation email — and twenty of the twenty-five pairs were
 * character-for-character identical. Nothing kept them that way. Reword a
 * question and the panel would go on reading the old wording, in a document
 * whose entire job is to show the applicant's answers under the question they
 * actually answered.
 *
 * Same argument as FORM_MESSAGES at the bottom of this file: one constant makes
 * "the form and the record ask the same thing" a structural fact rather than a
 * discipline. The five places they genuinely differ are declared as overrides
 * in schemas.ts, where they can be read as a list.
 *
 * Keys match CommunityApplication field for field, in the order the form asks
 * them — the Sheet takes its column order from this. */
export const COMMUNITY_ASKS = {
  orgName: "Organisation name",
  legalStructure: "Legal structure",
  registrationNumber: "Charities or NZBN number",
  contactName: "Main contact name",
  contactRole: "Role or position",
  contactEmail: "Email",
  contactPhone: "Phone",
  basedIn: "Where you are based",
  orgSize: "Roughly how many people run your organisation",
  // "a tool", not "a digital solution". The site stopped saying "solution"
  // everywhere else; this is the question the whole application turns on, and
  // it was the last place a volunteer treasurer met the sector's word for it.
  problem: "What is the problem you are hoping a tool could help with",
  problemToday: "How do you handle this today, and what does it cost you",
  problemWho: "Who is affected, and how",
  problemSuccess: "What would success look like",
  scopeEssentials:
    "If you have a sense of what it might do, list the few things that matter most",
  scopeReuse: "Could something like this help other organisations in the district",
  scopeSystems: "Does it need to connect to, or replace, systems you already use",
  scopeSystemsWhich: "Which systems",
  scopeSensitive: "Would it handle personal or sensitive information",
  scopeSensitiveWhat: "Briefly, what kind of information",
  readinessContact:
    "Who would be the main point of contact during the build, and how much time could they give",
  readinessOwner:
    "After handover, who would look after it and help your people start using it",
  readinessTiming: "Is there anything time-sensitive about your need",
  readinessAnythingElse: "Anything else the selection panel should know",
  declarationName: "Name",
  declarationRole: "Role",
} as const;

export const DEVELOPER_ASKS = {
  seat: "Which seat fits",
  shipped: "Something you have shipped",
  basedIn: "Where in the district are you based",
  hours: "Roughly how many hours a week could you give",
  name: "Your name",
  email: "Email",
} as const;

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

/** The six eligibility gates. All must be confirmed to submit. */
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
  "I understand applying does not guarantee selection, and only three tools are built in this round.",
  "I consent to the programme partners using this information to assess and prioritise applications, and to contact us about it.",
  "I understand the code would be published openly, so other organisations can use and adapt it.",
  "I understand that AI tools, including large language models run by other companies, may be used to help summarise, extract from and organise what we submit, and that people make every decision.",
] as const;

/* The email rule, shared by the server schema and the client-side mirrors.
 * Deliberately permissive: anything with an @ and a dot after it. Bouncing a
 * real applicant over an unusual but valid address costs far more than
 * accepting the occasional typo, and we reply to everyone anyway. */
export const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/* Validation messages that appear in BOTH the server schema (schemas.ts) and
 * the client-side mirrors in the form components. One constant per message
 * makes "a client hint and a server rejection never disagree" a structural
 * fact rather than a discipline. Messages only the server sends (length caps,
 * checkbox confirms) stay inline in schemas.ts. */
export const FORM_MESSAGES = {
  required: "This one is required.",
  emailMissing: "We need an email address to reply to.",
  emailInvalid: "That does not look like an email address.",
  gates: "All six eligibility statements need to be confirmed.",
  declared: "Please confirm the statements before sending.",
  seat: "Tell us which seat fits.",
  shipped: "Point us at something you have shipped.",
} as const;
