/* Programme terms content, transcribed verbatim from the prototype.
 *
 * Extracted programmatically rather than retyped: 14 sections of
 * legally-adjacent copy is exactly where a transcription slip would do real
 * damage, and this text is destined for a lawyer's review.
 *
 * NOT YET LEGALLY REVIEWED. See the notice at the foot of /terms.
 */

export type TermsSection = {
  number: string;
  title: string;
  paragraphs: string[];
};

export const TERMS_SECTIONS: TermsSection[] = [
  {
    number: "01",
    title: "Who runs the programme",
    paragraphs: [
      "Community Tech Lab is delivered by six organisations working together: Startup Queenstown Lakes, Queenstown Coders Connect, FLINT Queenstown, Queenstown Resort College, huddl and Technology Queenstown. It is supported by a grant from the Queenstown Lakes District Council Economic Diversification Fund.",
      "Startup Queenstown Lakes is a charitable trust acting as facilitator and fiscal agent. It holds the funding agreement, contracts the developers, and is the organisation a selected group signs with.",
    ],
  },
  {
    number: "02",
    title: "Who can apply",
    paragraphs: [
      "Applications are open to not-for-profits, registered charities, marae, trusts, incorporated societies, community groups and comparable mission-based organisations based in, or primarily serving, the Queenstown Lakes district. A business may be eligible where what is built serves the community rather than a commercial product it intends to sell.",
      "Every application is checked against seven threshold conditions before it is scored: eligible organisation, district connection, charitable or community purpose, that the need can plausibly be met by a small buildable digital solution, that a contact person can take part, that an open source release is acceptable, and that the intended use is lawful with any personal information able to be handled responsibly. Where a condition is unclear from the form we will talk to you before recording it as a fail.",
    ],
  },
  {
    number: "03",
    title: "How applications are assessed",
    paragraphs: [
      "Applications that pass every threshold condition are scored by a panel of local technology and community people against six criteria, each scored from one to five and weighted to a total out of one hundred: genuine need 25 percent, reuse and wider application 20 percent, realistic scope and deliverability 20 percent, readiness and adoption 15 percent, strategic and community fit 10 percent, and data, risk and sustainability 10 percent.",
      "Assessors score independently before the panel meets, then moderate together. Scores inform the decision; they do not replace panel judgement. The panel also reviews the selected three as a set, so benefit is spread across different parts of the community, the combined build is deliverable in the hours available, and at least one solution has strong reuse potential. Every score carries a written reason.",
    ],
  },
  {
    number: "04",
    title: "Selection, reserves and feedback",
    paragraphs: [
      "Three solutions are selected each round, along with one reserve in case a selected organisation withdraws or a solution proves unviable during discovery. Applying does not guarantee selection.",
      "Everyone who applies is told the outcome. Feedback is offered to organisations that are not selected, and an unsuccessful application in one round does not count against you in a later one.",
    ],
  },
  {
    number: "05",
    title: "Conflicts of interest",
    paragraphs: [
      "This is a small district and the panel is well connected. That is a strength for understanding local need and a risk for fair assessment, so conflicts are declared and managed openly rather than assumed away. Panel members declare any relationship with an applicant before scoring and step out where the conflict is material. Declarations are recorded alongside the scores.",
    ],
  },
  {
    number: "06",
    title: "What you receive, and what is out of scope",
    paragraphs: [
      "Working with a build team and the delivery lead, a selected organisation helps define a tightly scoped solution, a minimum viable product. The programme then builds that, and provides handover, documentation and a goodwill support period.",
      "The scope agreed at the start is what the programme commits to deliver. Additional features are outside it. The programme does not build platforms, take on open-ended change, or commit to future development, and the technical approach is decided by the senior developer leading the build and the delivery lead, not by the assessment panel.",
      "The programme prefers solutions that more than one organisation can use, so what you help shape may also be built for, or shared with, other organisations. Your data is never part of that.",
    ],
  },
  {
    number: "07",
    title: "What we ask of you",
    paragraphs: [
      "A selected organisation agrees to give accurate and complete information about its needs and respond to the team in good time, and to nominate a primary contact who is reasonably available during the build to make decisions and give feedback.",
      "It also agrees to provide only data it is lawfully entitled to provide, and no more personal or sensitive information than the solution needs; to keep its own independent backups and not treat the solution as its only copy of anything; to test the solution and satisfy itself that it is suitable before relying on it operationally; and to meet its own obligations under the Privacy Act 2020.",
    ],
  },
  {
    number: "08",
    title: "Who owns the data",
    paragraphs: [
      "All data you provide, or that is entered into, stored within, or generated by the solution on your behalf, remains your exclusive property. No programme party acquires any ownership interest in it by having built, hosted or maintained the solution.",
      "Where a solution is also used by other organisations, each organisation's data is kept separate, and no other organisation acquires any right to yours.",
    ],
  },
  {
    number: "09",
    title: "Privacy",
    paragraphs: [
      "You remain the agency responsible under the Privacy Act 2020 for personal information you provide or that the solution handles for you. Developers handle it only on your behalf and under your direction, coordinated through the delivery lead, and you remain responsible for any notification obligations you have.",
      "If a programme party becomes aware of unauthorised access to, or loss of, data held in the solution, it will tell you and the steering group without undue delay so you can take whatever steps you consider necessary.",
      "Separately, the information in your application is used by the programme partners to assess and prioritise applications and to contact you about it. It is not used for marketing and it is not sold. Applications, panel scores, conflict declarations and the decision record are retained as the programme's evidence of a fair process, which its funding requires.",
    ],
  },
  {
    number: "10",
    title: "Use of AI",
    paragraphs: [
      "Developers in the programme use AI tools, including coding assistants, as part of everyday development work, to help build, review and document software.",
      "Your data is treated carefully when they do. Developers will not enter your data, including any personal or sensitive information, into an AI tool unless that tool has been approved for use with such data under the programme's controls. You can ask the delivery lead which AI tools are in use and how your data is handled.",
      "Where a delivered solution itself includes an AI feature, AI outputs can be inaccurate or incomplete and should be reviewed by a person before being relied on. Any third-party AI service the solution uses, with its terms and any costs, becomes your responsibility from the end of the support period.",
    ],
  },
  {
    number: "11",
    title: "Open source and the licence",
    paragraphs: [
      "Software built in the programme is released as open source under the MIT License, reflecting the community nature of the programme. You get the benefit of that licence and the source code is publicly available.",
      "The open source release covers the software only, meaning source code and technical documentation. It does not cover your data, which is kept separate from the code at all times. In practice you are not locked in: you can keep running what was built, change it yourself, or engage anyone you like to work on it afterwards.",
    ],
  },
  {
    number: "12",
    title: "Support after handover, and no warranty",
    paragraphs: [
      "Handover includes training, light documentation and a supported bedding-in period. For six weeks after handover, bugs are fixed at no charge. That goodwill period covers faults, not new features. Changes after it are arranged separately and are not part of the programme, though developers may agree to further work with you directly on their own terms.",
      "Outside that period the solution is provided as is and as available. The programme is delivered on a best efforts and goodwill basis by a mix of developers, including people early in their careers who are developing their skills through it, supported by mentors and a steering group. What you receive is not a commercial product and is not delivered by a professional software vendor, and taking part means accepting that.",
    ],
  },
  {
    number: "13",
    title: "Developer engagement",
    paragraphs: [
      "Paid developer seats are contracts with Startup Queenstown Lakes, engaged on a sole trader basis. Intern places are voluntary and unpaid, and are not a route to a paid seat in the same round.",
      "A place in a build team depends on the match working for both sides, and on the standards the delivery lead sets across the three teams.",
    ],
  },
  {
    number: "14",
    title: "Changes to the programme",
    paragraphs: [
      "Dates, capacity and the number of solutions built in a round depend on funding and on developer availability. If any of those change we will publish the change here and tell everyone affected.",
    ],
  },
];

export const TERMS_UPDATED = "Last updated 25 July 2026 · applies to the 2026 round";
