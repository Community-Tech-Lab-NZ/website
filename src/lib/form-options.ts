/* Plain form data: the option lists, eligibility gates and declaration text.
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
 * Keep this file dependency-free so that stays true.
 */

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
  "I understand applying does not guarantee selection, and only three solutions are built in this round.",
  "I consent to the programme partners using this information to assess and prioritise applications, and to contact us about it.",
  "I understand the code would be published openly, so other organisations can use and adapt it.",
  "I understand that AI tools, including large language models run by other companies, may be used to help summarise, extract from and organise what we submit, and that people make every decision.",
] as const;
