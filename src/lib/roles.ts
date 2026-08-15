/* The three developer seats, as one source of truth.
 *
 * These roles were written out in three places with three different wordings —
 * a local ROLES array on /developers, another inside jobPostingsSchema(), and
 * DEVELOPER_SEATS in form-options.ts — which was survivable while each was two
 * sentences long. It stops being survivable now that the full job descriptions
 * are on the page: a fourth copy of six hundred words would drift from the PDFs
 * within a round.
 *
 * The long-form fields are transcribed VERBATIM from the signed-off PDFs in
 * public/roles. If a PDF is replaced, this file changes with it — and so does
 * `bytes`, which the download link renders as a size and which nothing checks.
 *
 * DEVELOPER_SEATS stays where it is on purpose. It is a select-option label
 * ("Senior developer and mentor, paid"), not a role title, and coupling a form
 * control's wording to a job advertisement's buys nothing.
 *
 * One thing deliberately NOT transcribed: the "About the programme" paragraph
 * that opens all three PDFs. It is the same three sentences each time and it is
 * already the rest of the site, so on the page it would say the same thing
 * three times inside one section.
 */

/** A titled block of a job description: an optional lead-in, the list, and an
 *  optional closing qualifier. The intern JD uses all three; the paid roles are
 *  bare lists. */
export type RoleBlock = {
  lede?: string;
  items: readonly string[];
  note?: string;
};

export type Role = {
  /** Also the PDF basename and the row's anchor on /developers. */
  id: string;
  title: string;
  /** The meta line under the title. */
  pay: string;
  /** The indicative fee, under the meta line. Paid seats only.
   *
   *  NOT TRANSCRIBED FROM THE PDF, unlike everything long on this type. The
   *  signed-off job descriptions carry no figure at all, so this is the first
   *  place the programme has named one and the PDFs do not yet agree with it.
   *  Reissue them, or expect a candidate to notice.
   *
   *  It is INDICATIVE while the budget firms up, which `FEE_NOTE` says once
   *  below the table rather than three times inside it. Do not drop that note
   *  and leave the numbers: on their own they read as an offer.
   *
   *  A fee, not a rate, and the wording matters. The seats are a fixed price for
   *  the build, sized on an assumption of about 12 hours a week across five
   *  weeks. Publishing the hourly figure it was derived from would invite the
   *  reasonable question of what happens at eighty hours, which is a question
   *  the contract answers and an advertisement should not raise. */
  fee?: string;
  /** The one-paragraph version, shown in the collapsed row. */
  summary: string;
  /** Paid contract seats are real job postings; the unpaid internship is not,
   *  and is kept out of the JobPosting markup. */
  paid: boolean;
  /** How many of this seat there are, for totalJobOpenings. Null for the
   *  internship, which has never been capped at a number. */
  seats: number | null;
  lookingFor: string;
  doing: RoleBlock;
  bringing: RoleBlock;
  getting: RoleBlock;
  pdf: { href: string; bytes: number };
};

export const ROLES: readonly Role[] = [
  {
    id: "senior-developer-mentor",
    title: "Senior developer and mentor",
    pay: "Paid contract · 3 seats · about 12 hours a week",
    fee: "About $2,100 for the five weeks",
    summary:
      "Lead one team, mentor the junior, guide architecture and keep scope sensible. Roughly 60 hours across the build, contracted to Startup Queenstown Lakes as a sole trader.",
    paid: true,
    seats: 3,
    lookingFor:
      "An experienced developer who genuinely enjoys bringing others up — someone who would rather pair with a junior for an hour than write the code themselves in ten minutes. You will guide technical decisions, keep scope sensible, and make sure what gets built is maintainable and actually useful to the community organisation receiving it.",
    doing: {
      items: [
        "Lead or co-lead one of the three build teams",
        "Mentor junior developers through pairing, code review, and regular check-ins",
        "Guide technical architecture and tooling choices, consistent with the programme's shared standards",
        "Contribute to the advisory panel and tool selection process",
        "Support handover, documentation, and the defined warranty and support period",
        "Participate in the closing FLINT Showcase Hui",
      ],
    },
    bringing: {
      items: [
        "Solid track record shipping production software (stack-agnostic — we care about judgment, not specific frameworks)",
        "Genuine interest in mentoring and developing early-career talent",
        "Comfort with modern AI-assisted development workflows, and the judgment to coach juniors on where AI helps and where it hurts",
        "Ability to right-size solutions — this is about small, useful, reusable tools, not over-engineered platforms",
        "Openness to open-source licensing (the programme's default)",
      ],
    },
    getting: {
      items: [
        "A paid contract (sole trader) with Startup Queenstown Lakes",
        "Recognition as a mentor and programme partner across FLINT, QCC, Technology Queenstown, and QRC channels",
        "A tangible contribution to the local community and tech ecosystem",
        "Connection to the wider Queenstown Lakes tech leadership network",
      ],
    },
    pdf: { href: "/roles/senior-developer-mentor.pdf", bytes: 27848 },
  },
  {
    id: "junior-developer",
    title: "Junior developer or designer",
    pay: "Paid contract · 3 seats · about 12 hours a week",
    fee: "About $1,500 for the five weeks",
    summary:
      "Do the primary build work with a senior developer alongside you. Same contract structure, same hours, real users at the other end.",
    paid: true,
    seats: 3,
    lookingFor:
      "Someone curious about technology and AI, keen to learn by doing, and excited to ship something real that helps a local not-for-profit. You don't need a CS degree or a polished GitHub. You need curiosity, follow-through, and a willingness to ask questions.",
    doing: {
      items: [
        "Contribute to one of three small-team builds, from discovery through handover",
        "Pair with senior mentors and use AI coding tools as part of everyday workflow",
        "Participate in sprint ceremonies, code reviews, and the closing FLINT Showcase Hui",
        "Help document and hand over the tool to the community organisation",
      ],
    },
    bringing: {
      items: [
        "Genuine curiosity about AI and modern development tools (Claude Code, Cursor, Copilot, or similar — happy to introduce you)",
        "Willingness to learn in public and take feedback well",
        "Reliability, showing up to your sprints and commitments",
      ],
      note: "Any exposure to programming, web, design, or tech more broadly is a plus, but not mandatory. We care more about attitude and aptitude than prior experience.",
    },
    getting: {
      items: [
        "Mentorship from experienced local developers and tech leaders",
        "Real portfolio work with a named community organisation",
        "A paid contract (sole trader) with Startup Queenstown Lakes",
        "Pathway into the Queenstown Lakes tech community via FLINT, QCC, and Technology Queenstown networks",
        "Potential to contract directly with the community org beyond the programme",
      ],
    },
    pdf: { href: "/roles/junior-developer.pdf", bytes: 28974 },
  },
  {
    id: "programme-intern",
    title: "Programme intern",
    pay: "Unpaid · light and flexible hours",
    summary:
      "Sit in on stand-ups, demos and retrospectives, shadow the teams, and help with user testing and notes. No technical experience needed, and it is a stepping stone to a paid junior seat in a future cohort.",
    paid: false,
    seats: null,
    lookingFor:
      "Someone aspiring, curious, and keen to get involved and see how a real technology project comes together. You might be exploring whether tech is for you, building confidence before applying for a junior role, or simply wanting to be part of something good for the community. No technical experience is needed at all — what matters is interest, reliability, and a willingness to learn by watching, listening, and helping where you can.",
    doing: {
      lede: "This is a light-touch, learning-focused role. You'll be around the teams and the work without the pressure of delivery.",
      items: [
        "Sit in on sprint ceremonies, stand-ups, demos, and retrospectives as an observer and participant",
        "Shadow developers and mentors to see how tools are scoped, built, and handed over, and how AI tools are used along the way",
        "Help with light, non-build tasks where useful — note-taking, user research and testing, gathering feedback, and supporting documentation",
        "Get to know the people and organisations involved across the local tech community",
        "Join the closing FLINT Showcase Hui",
      ],
      note: "The time commitment is intentionally light and flexible — a few hours a week — so it can fit around study, work, or other commitments.",
    },
    bringing: {
      items: [
        "Curiosity about technology, AI, and how things get built",
        "Reliability and follow-through on what you commit to",
        "A respectful, open attitude — happy to ask questions and learn in public",
        "Care for the community organisations the programme supports, and discretion with anything sensitive you may see",
      ],
      note: "No programming, design, or prior tech experience is required.",
    },
    getting: {
      items: [
        "A genuine behind-the-scenes look at how a mentored build programme runs",
        "Exposure to modern, AI-assisted development without needing to write code yourself",
        "Mentorship and connection into the Queenstown Lakes tech community via FLINT, QCC, Technology Queenstown, and QRC",
        "Recognition for your involvement and a reference on request",
        "A natural stepping stone toward the paid junior developer role in a future cohort",
      ],
      note: "This is an unpaid, voluntary internship offered as a learning and community opportunity rather than a contracted role.",
    },
    pdf: { href: "/roles/programme-intern.pdf", bytes: 25607 },
  },
];

/** The qualifier the `fee` figures cannot go out without.
 *
 *  Said once under the table rather than on each row, because three hedges
 *  stacked in a column stop reading as care and start reading as doubt. It has
 *  to survive alongside the numbers though: a bare figure on a job advertisement
 *  is an offer, and this is not one yet. */
export const FEE_NOTE =
  "Fees are indicative while the programme budget is confirmed, and are fixed in writing before any work starts.";
