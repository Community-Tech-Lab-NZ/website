#!/usr/bin/env npx tsx
/**
 * Builds the draft broadcast to the "Personal Friends & Contacts" segment.
 *
 * Run: npx tsx scripts/create-friends-broadcast.ts
 *
 * WHY IT IS SEPARATE FROM create-broadcast.ts. That script owns the Community
 * Connect launch: it reads day-N.csv batch files, creates segments, and SYNCS
 * their membership to match those files. None of that applies here. This
 * segment already exists and was assembled and audited in Resend rather than
 * from a file on disk, so there is no file to sync against and syncing to one
 * would empty it. The two scripts share the message, which is the part that
 * must not diverge, and nothing else.
 *
 * WHY IT ONLY EVER CREATES A DRAFT. Same rule as the launch script, and for the
 * same reason: `send` stays false and there is no flag to change it. The send is
 * a button in the dashboard, pressed by a person who has just read the thing.
 * Adding `send: true` here is not a shortcut, it is a decision, and it should
 * look like one in the diff.
 *
 * WHY THE LIST REASON IS PASSED EXPLICITLY. These addresses did not come from a
 * Community Connect listing, they came out of the inherited mailbox, so the
 * default provenance line in broadcast.ts is false about every one of them. The
 * footer stating where an address came from is the one line in bulk mail that
 * has to be true, so it is named at the call site rather than defaulted.
 *
 * WHY IT IS SAFE TO RUN AGAIN. An existing draft for this segment has its
 * content REPLACED, not duplicated, and a broadcast that has already sent is
 * left alone entirely. Matched on the segment rather than the name, because the
 * segment is the stable identity and a name is display text an update can
 * change.
 */

import { readFileSync } from "node:fs";
import { Resend } from "resend";
import { getWindowState } from "../src/lib/application-window";
import { communityLaunchBroadcast, LIST_REASON } from "../src/lib/broadcast";
import { renderHtmlEmail, renderTextEmail } from "../src/lib/email-template";

const SEGMENT_NAME = "Personal Friends & Contacts";
const BROADCAST_NAME = "Personal contacts, launch";

async function main() {
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
  }
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) throw new Error("RESEND_API_KEY or EMAIL_FROM missing from .env");

  // The window state decides the button and half the copy, so it is read once
  // and printed rather than left to surprise someone. A draft written before
  // the 15th and sent after it says the wrong thing.
  const state = getWindowState();
  const message = communityLaunchBroadcast(state, LIST_REASON.personalContacts);
  const html = renderHtmlEmail(message.content);
  const text = renderTextEmail(message.content);

  // Guard, not decoration. The footer for this audience is the whole reason
  // this script exists, and a refactor that dropped the second argument would
  // otherwise ship the Community Connect line to people who were never on a
  // Community Connect list.
  if (!html.includes("previously corresponded")) {
    throw new Error("The personal-contacts list reason is not in the rendered email.");
  }
  if (html.includes("listed with a Community Connect group")) {
    throw new Error("The Community Connect list reason is in the rendered email.");
  }
  if (!html.includes("{{{RESEND_UNSUBSCRIBE_URL}}}")) {
    throw new Error("No unsubscribe placeholder.");
  }

  // Every remote image has to resolve before any of this becomes a draft. A
  // 404 here is the difference between a credit wall and seven broken image
  // icons, and unlike a test send there is no second look once it has gone.
  const urls = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => m[1]);
  const statuses = await Promise.all(urls.map(async (url) => ({ url, status: (await fetch(url)).status })));
  const broken = statuses.filter((s) => s.status !== 200);
  if (broken.length) throw new Error(`Images did not resolve: ${broken.map((b) => b.url).join(", ")}`);

  console.log(`${statuses.length} images resolve`);
  console.log(`Window state: ${state}, call to action "${message.content.cta?.label}"`);
  console.log(`Subject: ${message.subject}`);
  console.log(`Body: ${((html.length + text.length) / 1024).toFixed(1)}KB, Gmail clips over ~102KB\n`);

  const resend = new Resend(apiKey);

  const segments = (await resend.segments.list()).data?.data ?? [];
  const segment = segments.find((s) => s.name === SEGMENT_NAME);
  if (!segment) throw new Error(`No segment named "${SEGMENT_NAME}".`);

  // Read the membership rather than set it. This is the audited list; the
  // count is printed so whoever runs this can check it against what the audit
  // reported before anything is drafted against it.
  const emails: string[] = [];
  let after: string | undefined;
  for (let page = 0; page < 60; page++) {
    const res = await resend.contacts.list({ segmentId: segment.id, limit: 100, ...(after ? { after } : {}) } as never);
    const rows = res.data?.data ?? [];
    emails.push(...rows.map((c) => c.email.toLowerCase()));
    if (!res.data?.has_more || !rows.length) break;
    after = rows[rows.length - 1].id;
  }
  console.log(`Segment "${SEGMENT_NAME}" ${segment.id}: ${emails.length} contacts`);

  const broadcasts = (await resend.broadcasts.list()).data?.data ?? [];
  const existing = broadcasts.find((b) => b.segment_id === segment.id) ?? broadcasts.find((b) => b.name === BROADCAST_NAME);

  if (existing) {
    if (existing.status === "sent") {
      console.log(`\nBroadcast ${existing.id} has already sent. Leaving it alone.`);
      return;
    }
    // `name` has to be resent: the update is a replace, not a merge, and
    // omitting it renames the draft to "Untitled".
    const updated = await resend.broadcasts.update(existing.id, {
      name: BROADCAST_NAME,
      subject: message.subject,
      replyTo: [message.replyTo!],
      html,
      text,
    });
    if (updated.error) throw new Error(`Update failed: ${updated.error.message}`);
    console.log(`\nDraft ${existing.id} updated with the current content.`);
  } else {
    const draft = await resend.broadcasts.create({
      segmentId: segment.id,
      from,
      replyTo: message.replyTo,
      subject: message.subject,
      name: BROADCAST_NAME,
      html,
      text,
      send: false,
    });
    if (draft.error) throw new Error(`Create failed: ${draft.error.message}`);
    console.log(`\nDraft ${draft.data?.id} created.`);
  }

  console.log("Open it in the dashboard, read it, then send it.");
}

main().catch((error: unknown) => {
  console.error(`\n${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
