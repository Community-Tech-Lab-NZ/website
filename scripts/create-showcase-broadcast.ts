#!/usr/bin/env npx tsx
/**
 * Builds the "Showcase Hui invite" segment and drafts the invitation to it. Never sends.
 *
 * Run: pnpm broadcast:showcase
 *
 * The audience is every applicant, the Community Connect list, council and
 * funders, less anyone who has unsubscribed. Not the personal contacts list as a
 * whole. The segment is read back and must match exactly before anything is
 * drafted. Safe to rerun: members are added or removed to match, and the draft
 * is updated in place.
 */

import { Resend } from "resend";
import { CHOSEN } from "../src/lib/announcement";
import { LIST_REASON } from "../src/lib/broadcast";
import { renderHtmlEmail, renderTextEmail } from "../src/lib/email-template";
import { HUI_WHEN, LINKEDIN_URL, RSVP_URL, showcaseInviteBroadcast } from "../src/lib/showcase-invite";
import { APPLICANTS } from "./lib/applicants";
import { draftToLists, loadEnv, reportAndExit } from "./lib/draft-to-lists";
import { readPrivate } from "./lib/private";
import { listSegment, syncSegment } from "./lib/segment";

const SEGMENT = "Showcase Hui invite";
const BROADCAST = "Showcase Hui invite";
const COMMUNITY_CONNECT = "Community Connect";

// Funders (by organisation) and council staff, from scripts/private, which git
// ignores. Advisory services such as funding-hq are left out, as they do not
// fund. Libraries and pools already come in through Community Connect.
const { funders: FUNDERS, qldc: QLDC } = readPrivate<{
  funders: { org: string; emails: string[] }[];
  qldc: string[];
}>("showcase-audience.json");

async function main() {
  const message = showcaseInviteBroadcast();
  const html = renderHtmlEmail(message.content);
  const text = renderTextEmail(message.content).replace(/\s+/g, " ");

  for (const { name, image } of CHOSEN) {
    if (!html.includes(name)) throw new Error(`"${name}" is not in the rendered email.`);
    if (!html.includes(image.src)) throw new Error(`The photograph ${image.src} is not in the rendered email.`);
    if (image.credit && !html.includes(image.credit)) throw new Error(`${image.src} has lost its credit.`);
  }
  // Both parts, since the text part is all some readers see.
  for (const must of [HUI_WHEN, RSVP_URL, LINKEDIN_URL]) {
    if (!html.includes(must) || !text.includes(must)) throw new Error(`"${must}" is missing from the HTML or text part.`);
  }

  // LinkedIn answers bots with 999, so only the RSVP page is fetched.
  const rsvp = await fetch(RSVP_URL);
  if (rsvp.status !== 200) throw new Error(`${RSVP_URL} returned ${rsvp.status}. The button points there.`);

  loadEnv();
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY missing from .env");
  const resend = new Resend(apiKey);

  const segments = (await resend.segments.list()).data?.data ?? [];
  const cc = segments.find((s) => s.name === COMMUNITY_CONNECT);
  if (!cc) throw new Error(`No segment named "${COMMUNITY_CONNECT}".`);

  // Applicants carry a first name, which only matters if the contact is new.
  const firstNames = new Map(APPLICANTS.map((a) => [a.email.toLowerCase(), a.firstName]));
  const sources: [string, string[]][] = [
    ["Applicants", APPLICANTS.map((a) => a.email)],
    [COMMUNITY_CONNECT, (await listSegment(resend, cc.id)).map((m) => m.email)],
    ["Funders", FUNDERS.flatMap((f) => f.emails)],
    ["QLDC", QLDC],
  ];
  const intended = new Set<string>();
  for (const [name, emails] of sources) {
    const fresh = emails.map((e) => e.toLowerCase()).filter((e) => !intended.has(e));
    fresh.forEach((e) => intended.add(e));
    console.log(`${name}: ${emails.length}, ${fresh.length} not already counted`);
  }
  for (const e of intended) {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) throw new Error(`"${e}" does not look like an email address.`);
  }

  // Unsubscribed is per contact, not per segment, so it is read off every contact.
  const unsubscribed = (await listSegment(resend)).filter((m) => m.unsubscribed).map((m) => m.email);
  const dropped = unsubscribed.filter((e) => intended.delete(e));
  console.log(`Unsubscribed, left out: ${dropped.length}${dropped.length ? ` (${dropped.join(", ")})` : ""}`);
  console.log(`Audience: ${intended.size}`);

  await syncSegment(resend, SEGMENT, intended, firstNames);

  await draftToLists((reason) => showcaseInviteBroadcast(reason), [
    {
      segment: SEGMENT,
      broadcast: BROADCAST,
      reason: LIST_REASON.showcase,
      mustSay: "fund or work alongside",
      mustNotSay: "previously corresponded",
    },
  ]);
}

main().catch(reportAndExit);
