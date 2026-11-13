#!/usr/bin/env npx tsx
/**
 * Builds the "Showcase Hui reminder" segment and drafts the reminder to it. Never sends.
 *
 * Run: pnpm broadcast:reminder
 *
 * The audience is everyone in any segment, which takes in the personal contacts
 * the invite left out. Left out: anyone unsubscribed, the addresses in
 * scripts/private/never-send.json (bounced or suppressed by hand), and contacts
 * in no segment, who were held back from the personal-contacts launch on purpose.
 */

import { Resend } from "resend";
import { LIST_REASON } from "../src/lib/broadcast";
import { renderHtmlEmail, renderTextEmail } from "../src/lib/email-template";
import { HUI_WHEN, LINKEDIN_URL, RSVP_URL } from "../src/lib/showcase-invite";
import { showcaseReminderBroadcast } from "../src/lib/showcase-reminder";
import { draftToLists, loadEnv, reportAndExit } from "./lib/draft-to-lists";
import { readPrivate } from "./lib/private";
import { listSegment, syncSegment } from "./lib/segment";

const SEGMENT = "Showcase Hui reminder";
const BROADCAST = "Showcase Hui reminder";

const NEVER_SEND: string[] = readPrivate("never-send.json");

async function main() {
  const message = showcaseReminderBroadcast();
  const html = renderHtmlEmail(message.content);
  const text = renderTextEmail(message.content).replace(/\s+/g, " ");

  // Both parts, since the text part is all some readers see.
  for (const must of [HUI_WHEN, RSVP_URL, LINKEDIN_URL]) {
    if (!html.includes(must) || !text.includes(must)) throw new Error(`"${must}" is missing from the HTML or text part.`);
  }
  // Whole words, so the partner Queenstown Coders Connect passes.
  for (const word of /\b(builds|the build|code)\b/gi.exec(text) ?? []) {
    throw new Error(`"${word}" is in the email. This audience is not developers.`);
  }

  const rsvp = await fetch(RSVP_URL);
  if (rsvp.status !== 200) throw new Error(`${RSVP_URL} returned ${rsvp.status}. The button points there.`);

  loadEnv();
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY missing from .env");
  const resend = new Resend(apiKey);

  const segments = ((await resend.segments.list()).data?.data ?? []).filter((s) => s.name !== SEGMENT);
  const intended = new Set<string>();
  for (const s of segments) {
    const emails = (await listSegment(resend, s.id)).map((m) => m.email);
    const fresh = emails.filter((e) => !intended.has(e));
    fresh.forEach((e) => intended.add(e));
    console.log(`${s.name}: ${emails.length}, ${fresh.length} not already counted`);
  }

  const all = await listSegment(resend);
  console.log(`\nIn no segment, left out: ${all.filter((m) => !intended.has(m.email)).length}`);
  const unsubscribed = all.filter((m) => m.unsubscribed).map((m) => m.email);
  console.log(`Unsubscribed, left out: ${unsubscribed.filter((e) => intended.delete(e)).length}`);
  console.log(`Never send, left out: ${NEVER_SEND.filter((e) => intended.delete(e.toLowerCase())).length}`);
  console.log(`Audience: ${intended.size}`);

  await syncSegment(resend, SEGMENT, intended);

  await draftToLists((reason) => showcaseReminderBroadcast(reason), [
    {
      segment: SEGMENT,
      broadcast: BROADCAST,
      reason: LIST_REASON.showcaseReminder,
      mustSay: "corresponded with someone",
      mustNotSay: "contact records Community Tech Lab now holds",
    },
  ]);
}

main().catch(reportAndExit);
