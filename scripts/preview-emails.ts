#!/usr/bin/env npx tsx
/**
 * Renders every email the programme sends, to disk, without sending anything.
 *
 * Confirmations stay switched off until DNS is live, and even once they are on,
 * the only way to see one is to submit a real application. That is a bad loop to
 * be in the week before applications open. This writes the four messages to
 * .email-preview/ so they can be opened in a browser, checked on a phone, and
 * pasted into a client to see what Outlook does to them.
 *
 * These are the REAL messages: the content comes from src/lib/email.ts, so what
 * is rendered here is what lands in someone's inbox. Sample answers below are
 * invented, and deliberately long and awkward, because that is what an hour-long
 * form produces and short lorem never catches the wrapping.
 *
 * Run: pnpm preview:emails
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  communityApplicationSummary,
  developerApplicationSummary,
} from "../src/lib/application-doc";
import { applicationsOpenBroadcast, communityLaunchBroadcast, LIST_REASON } from "../src/lib/broadcast";
import { renderHtmlEmail, renderTextEmail } from "../src/lib/email-template";
import {
  applicationCopy,
  communityConfirmation,
  developerConfirmation,
  questionAlert,
  type Message,
} from "../src/lib/email";
import type { CommunityApplication, DeveloperApplication } from "../src/lib/schemas";

const OUT = join(process.cwd(), ".email-preview");

const communityData: CommunityApplication = {
  formType: "community",
  submissionId: "9f2c1e44-1b8e-4a2c-9a55-77c3ee01aa10",
  orgName: "Wakatipu Community Pātaka",
  legalStructure: "Charitable trust",
  registrationNumber: "CC61234",
  contactName: "Aroha Whitiora",
  contactRole: "Operations lead",
  contactEmail: "aroha@example.org.nz",
  contactPhone: "021 555 0134",
  basedIn: "Queenstown",
  orgSize: "4 to 10",
  gates: [true, true, true, true, true, true],
  problem:
    "Volunteer rosters live in three places at once: a shared spreadsheet, a Facebook group, and whatever the coordinator has written on the whiteboard that morning.\n\nWhen someone drops out on the day, nobody finds out until the shift is already short, and the food rescue run goes out with two people instead of four.",
  problemToday:
    "The coordinator spends most of Sunday evening rebuilding the week's roster by hand, then texts everyone individually. That is roughly six hours a week that could go into the runs themselves.",
  problemWho:
    "Our thirty volunteers, the coordinator, and the roughly ninety households who get a weekly box.",
  problemSuccess:
    "A volunteer can see their next shift without asking, and swap it themselves. The coordinator gets Sunday evening back.",
  scopeEssentials:
    "Seeing your own shifts, swapping a shift with someone else, and one screen the coordinator can look at to see the whole week.",
  scopeReuse:
    "Yes. Every food rescue and op shop in the district runs a roster the same way, and two of them have already asked how we do ours.",
  scopeSystems: "No, or not sure",
  scopeSystemsWhich: "",
  scopeSensitive: "Yes, described below",
  scopeSensitiveWhat:
    "Volunteer names, phone numbers and availability. No recipient or client details at all.",
  readinessContact: "Aroha, about two hours a week, more during the first fortnight.",
  readinessOwner: "Aroha, with our board treasurer as a backup.",
  readinessTiming:
    "Our volunteer intake runs in February, so having it in place before then matters more than the exact handover date.",
  readinessAnythingElse: "",
  declarationName: "Aroha Whitiora",
  declarationRole: "Operations lead",
  declared: true,
};

const developerData: DeveloperApplication = {
  formType: "developer",
  submissionId: "3ac09d21-77aa-4f10-8c31-2b9911fe4400",
  seat: "Junior developer or designer, paid",
  name: "Tama Rewi",
  email: "tama@example.com",
  basedIn: "Wānaka",
  hours: "Around 12",
  shipped:
    "A booking page for a mobile bike repair run, built in Next.js and still in use. About forty bookings a month.",
  understood: true,
  aiUnderstood: true,
};

const community = communityApplicationSummary(communityData, "2 August 2026 at 9:04 pm");
const developer = developerApplicationSummary(developerData, "2 August 2026 at 9:11 pm");

const messages: { name: string; message: Message }[] = [
  { name: "01-community-confirmation", message: communityConfirmation(community) },
  { name: "02-developer-confirmation", message: developerConfirmation(developer) },
  {
    name: "03-application-copy",
    message: applicationCopy({
      summary: community,
      applicantEmail: communityData.contactEmail,
      docUrl: "https://docs.google.com/document/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/edit",
      cvUrl: "",
    }),
  },
  {
    name: "04-developer-copy",
    message: applicationCopy({
      summary: developer,
      applicantEmail: developerData.email,
      docUrl: "https://docs.google.com/document/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/edit",
      // The failure string, not a link. Worth seeing rendered: this is the case
      // where somebody has to go and ask the applicant to resend.
      cvUrl: "CV SUBMITTED, UPLOAD FAILED: ask the applicant to resend",
    }),
  },
  {
    name: "05-question-alert",
    message: questionAlert({
      name: "Mere Tainui",
      fromEmail: "mere@example.org.nz",
      gate: "We are based in, or primarily serve, the Queenstown Lakes district.",
      body: "We are registered in Invercargill but two thirds of our programmes run in Wānaka and Hāwea. Does that count as primarily serving the district?",
    }),
  },
  // Not a confirmation: the launch broadcast to the Community Connect groups.
  // Rendered here for the same reason as the rest, and one more besides. It is
  // the only message that goes to people who did not ask for it, so the footer
  // it carries is the part most worth looking at before it sends.
  //
  // Both variants, because the send date is not locked. Passed explicitly
  // rather than left to the clock, so the pair can be compared on any date
  // rather than only whichever one today happens to produce.
  {
    name: "06-community-launch-broadcast-before",
    message: communityLaunchBroadcast("before"),
  },
  {
    name: "07-community-launch-broadcast-open",
    message: communityLaunchBroadcast("open"),
  },
  // The applications-open nudge, rendered once per list. The bodies are
  // identical apart from one sentence in the footer, and that sentence is the
  // whole reason both are here: it states how the sender got the address, it is
  // different for each list, and it is the one line in bulk mail that has to be
  // true. Reading them side by side is the check.
  {
    name: "08-applications-open-broadcast-community",
    message: applicationsOpenBroadcast("open", LIST_REASON.communityConnect),
  },
  {
    name: "09-applications-open-broadcast-friends",
    message: applicationsOpenBroadcast("open", LIST_REASON.personalContacts),
  },
];

mkdirSync(OUT, { recursive: true });

const rows: string[] = [];
for (const { name, message } of messages) {
  writeFileSync(join(OUT, `${name}.html`), renderHtmlEmail(message.content));
  writeFileSync(join(OUT, `${name}.txt`), renderTextEmail(message.content));
  rows.push(
    `<tr><td><a href="${name}.html">${name}</a></td><td>${message.subject}</td><td><a href="${name}.txt">text part</a></td></tr>`,
  );
}

writeFileSync(
  join(OUT, "index.html"),
  `<!doctype html><meta charset="utf-8"><title>Community Tech Lab email previews</title>
<body style="font-family:system-ui;background:#F3EFE3;color:#14211A;padding:48px;">
<h1 style="font-size:28px;">Email previews</h1>
<p>Rendered from src/lib/email.ts. Not sent.</p>
<table cellpadding="8" style="border-collapse:collapse;">${rows.join("")}</table>
</body>`,
);

console.log(`Wrote ${messages.length} previews to ${OUT}`);
console.log(`Open: file://${join(OUT, "index.html")}`);
