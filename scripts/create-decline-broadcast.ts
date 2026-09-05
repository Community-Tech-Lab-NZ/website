#!/usr/bin/env npx tsx
/**
 * Drafts one applicant's decline into Resend, as a broadcast to a segment
 * containing only them. Never sends.
 *
 * Run: pnpm outcome:decline <email> "<Full Name>"
 *
 * WHY A BROADCAST AT ALL, FOR ONE PERSON. A broadcast is the only path in this
 * repo that ends at a button in the dashboard rather than at an API call, and
 * that button is the point. A decline is not recoverable and not resendable;
 * the person pressing send should have just read the exact words the applicant
 * will read, addressed to the applicant they mean. Sending straight from a
 * script would put that read on nobody.
 *
 * WHY THE SEGMENT IS THE DANGEROUS PART, AND WHAT IS DONE ABOUT IT. A broadcast
 * goes to whoever is in the segment, and this message opens "Kia ora Paul" and
 * tells the reader they did not get in. A segment holding one extra address
 * sends a personalised rejection to someone who did not apply, or worse, to
 * someone who did and was accepted. So:
 *
 *   - the segment is per applicant, named for them, never shared or reused;
 *   - it is read back after every write, and the draft is refused unless it
 *     contains exactly one contact and that contact is the intended address;
 *   - an existing segment of that name with anyone else in it is a hard stop,
 *     not something this quietly corrects.
 *
 * The check runs against what Resend actually returns, not against what this
 * script just asked for. Asserting your own intent proves nothing.
 *
 * WHY IT REFUSES TO TOUCH A SENT BROADCAST. Same rule as draftToLists: matching
 * on name means a rerun updates rather than duplicates, and a broadcast that
 * has already gone is left exactly alone.
 */

import { readFileSync } from "node:fs";
import { Resend } from "resend";
import { renderHtmlEmail, renderTextEmail } from "../src/lib/email-template";
import { developerDecline, firstNameOf } from "../src/lib/outcome";
import { reportAndExit } from "./lib/draft-to-lists";

/** Loads .env without a dependency, leaving anything already exported alone.
 *  Same as draft-to-lists.ts, which keeps it private. */
function loadEnv(): void {
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
  }
}

/** Where replies go. The letter asks the applicant to reply about the meet-ups
 *  and the WhatsApp channels, so this has to be a mailbox someone reads. */
const REPLY_TO = ["stephens.giovanni@gmail.com", "pradeesh@gmail.com"];

async function main() {
  const [email, ...nameParts] = process.argv.slice(2);
  const fullName = nameParts.join(" ");
  if (!email || !fullName) {
    throw new Error('Usage: pnpm outcome:decline <email> "<Full Name>"');
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    throw new Error(`"${email}" does not look like an email address.`);
  }

  loadEnv();
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) throw new Error("RESEND_API_KEY or EMAIL_FROM missing from .env");

  const address = email.toLowerCase();
  const firstName = firstNameOf(fullName);
  const message = developerDecline({ firstName, email: address }, REPLY_TO.join(", "));
  const html = renderHtmlEmail(message.content);
  const text = renderTextEmail(message.content);

  // The greeting is the whole reason this is per-applicant rather than a list
  // send, so it is checked rather than assumed. A rendering that lost the name
  // would go out reading "Kia ora ," and nobody would catch it in a dashboard
  // preview they had already skimmed twice.
  if (firstName && !html.includes(`Kia ora ${firstName},`)) {
    throw new Error(`The rendered email does not greet ${firstName}.`);
  }
  // Bulk furniture must not be here. If a future edit sets `bulk`, this stops
  // a personal decline going out with an unsubscribe link under it.
  if (html.includes("RESEND_UNSUBSCRIBE_URL") || html.includes("Unsubscribe")) {
    throw new Error("This is transactional mail and must not carry an unsubscribe link.");
  }
  if (html.includes("not monitored")) {
    throw new Error("The letter asks for a reply, so it must not say the address is unmonitored.");
  }

  // Every remote image resolves before this becomes a draft, as with the
  // broadcasts. Only the logo here, but a 404 is still a broken mark at the top
  // of the one email this person keeps.
  const urls = [...new Set([...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => m[1]))];
  const statuses = await Promise.all(urls.map(async (url) => ({ url, status: (await fetch(url)).status })));
  const broken = statuses.filter((s) => s.status !== 200);
  if (broken.length) throw new Error(`Images did not resolve: ${broken.map((b) => b.url).join(", ")}`);

  console.log(`${statuses.length} images resolve`);
  console.log(`To: ${fullName} <${address}>`);
  console.log(`Subject: ${message.subject}`);
  console.log(`Reply-to: ${REPLY_TO.join(", ")}`);
  console.log(`Body: ${((html.length + text.length) / 1024).toFixed(1)}KB\n`);

  const resend = new Resend(apiKey);

  // A segment of one, named for the applicant so it is obvious in the dashboard
  // what it is and who it reaches.
  const segmentName = `Outcome, decline, ${fullName}`;
  const broadcastName = `Decline, ${fullName}`;

  const segments = (await resend.segments.list()).data?.data ?? [];
  const existingSegment = segments.find((s) => s.name === segmentName);

  // Only the id is carried forward: the create and list responses have
  // different shapes, and everything below needs the id and nothing else.
  let segmentId: string;
  if (existingSegment) {
    segmentId = existingSegment.id;
    console.log(`Segment "${segmentName}" already exists: ${segmentId}`);
  } else {
    const created = await resend.segments.create({ name: segmentName });
    if (created.error || !created.data) {
      throw new Error(`Could not create the segment: ${created.error?.message}`);
    }
    segmentId = created.data.id;
    console.log(`Segment "${segmentName}" created: ${segmentId}`);
  }

  // `segments`, not `segmentId`. The contact create takes a list of segment
  // ids; passing `segmentId` is silently accepted and creates a contact in no
  // segment at all, which is how the first run of this drafted nothing.
  const contact = await resend.contacts.create({ email: address, segments: [{ id: segmentId }] });
  if (contact.error) throw new Error(`Could not add ${address} to the segment: ${contact.error.message}`);

  /* THE CHECK THAT MATTERS.
   *
   * Read the segment back and refuse unless it is exactly the one person meant.
   * Everything above is intent; this is the only place that knows who Resend
   * will actually mail. */
  const members: string[] = [];
  let after: string | undefined;
  for (let page = 0; page < 10; page++) {
    const res = await resend.contacts.list({ segmentId, limit: 100, ...(after ? { after } : {}) } as never);
    const rows = res.data?.data ?? [];
    for (const c of rows) members.push(c.email.toLowerCase());
    if (!res.data?.has_more || !rows.length) break;
    after = rows[rows.length - 1].id;
  }

  if (members.length !== 1 || members[0] !== address) {
    throw new Error(
      `Segment "${segmentName}" holds ${members.length} contact(s): ${members.join(", ") || "none"}. ` +
        `It must hold exactly ${address} and nothing else. Nothing has been drafted. Fix the segment in the dashboard first.`,
    );
  }
  console.log(`Segment holds exactly 1 contact: ${members[0]}\n`);

  const broadcasts = (await resend.broadcasts.list()).data?.data ?? [];
  const existing = broadcasts.find((b) => b.name === broadcastName);

  if (existing) {
    if (existing.status === "sent") {
      console.log(`Broadcast ${existing.id} has already sent. Leaving it alone.`);
      return;
    }
    const updated = await resend.broadcasts.update(existing.id, {
      name: broadcastName,
      subject: message.subject,
      replyTo: REPLY_TO,
      html,
      text,
    });
    if (updated.error) throw new Error(`Update failed: ${updated.error.message}`);
    console.log(`Draft ${existing.id} updated with the current content.`);
  } else {
    const draft = await resend.broadcasts.create({
      segmentId,
      from,
      replyTo: REPLY_TO,
      subject: message.subject,
      name: broadcastName,
      html,
      text,
      send: false,
    });
    if (draft.error) throw new Error(`Create failed: ${draft.error.message}`);
    console.log(`Draft ${draft.data?.id} created.`);
  }

  console.log("\nOpen it in the dashboard, read it as if you were them, then send it.");
}

main().catch(reportAndExit);
