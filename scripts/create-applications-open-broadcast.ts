#!/usr/bin/env npx tsx
/**
 * Builds the draft "applications are open" broadcast, one per list.
 *
 * Run: pnpm broadcast:open
 *
 * WHY IT HANDLES BOTH LISTS AND THE LAUNCH SCRIPTS DID NOT. The launch went out
 * in two goes weeks apart, to lists assembled in different ways: Community
 * Connect came off CSV batches that had to be synced and split across days,
 * Personal Friends & Contacts was audited by hand in the dashboard. This message
 * goes to both at once, the segments already exist, and there is nothing left to
 * sync. Two scripts for one send would be two places for the copy to drift.
 *
 * WHY IT MATCHES THE EXISTING BROADCAST ON NAME, NOT SEGMENT. Both other scripts
 * look for a broadcast against the segment first, which was right when a segment
 * had at most one. Each of these segments now has a SENT launch broadcast on it,
 * so a segment match would find that one, see `status === "sent"`, and exit
 * reporting that everything was already done — having created nothing. The name
 * is the identity here. Change BROADCAST_NAME on a rerun and you get a second
 * draft, which is the failure that is at least visible.
 *
 * WHY IT ONLY EVER CREATES A DRAFT. Same rule as both launch scripts: `send`
 * stays false and there is no flag to change it. The send is a button in the
 * dashboard, pressed by a person who has just read the thing. Adding `send: true`
 * here is not a shortcut, it is a decision, and it should look like one in the
 * diff.
 *
 * WHY THE GUARDS ARE SYMMETRIC. The two bodies are byte-identical apart from one
 * sentence in the footer saying where the address came from. That makes the
 * mistake easy and invisible: nothing about a Community Connect draft looks
 * wrong when it is carrying the personal-contacts line. So each list asserts
 * both that its own reason is present AND that the other one is not, and the
 * script refuses to draft anything if either fails.
 *
 * WHY IT REFUSES OUTSIDE THE WINDOW. applicationsOpenBroadcast throws unless
 * applications are open, and that throw is load-bearing rather than defensive.
 * Every line of this message tells the reader to go and apply.
 */

import { readFileSync } from "node:fs";
import { Resend } from "resend";
import { getWindowState } from "../src/lib/application-window";
import { applicationsOpenBroadcast, LIST_REASON } from "../src/lib/broadcast";
import { renderHtmlEmail, renderTextEmail } from "../src/lib/email-template";

/* One entry per list. `reason` picks the footer sentence, and `mustSay` and
 * `mustNotSay` are the fragments that prove the right one arrived: they are
 * distinctive substrings of the two LIST_REASON values, deliberately short
 * enough to survive a wording edit that does not change which route is being
 * described. If a reason is ever reworded past them, these fail loudly, which is
 * the correct outcome. */
const LISTS = [
  {
    segment: "Community Connect",
    broadcast: "Applications open, Community Connect",
    reason: LIST_REASON.communityConnect,
    mustSay: "listed with a Community Connect group",
    mustNotSay: "previously corresponded",
  },
  {
    segment: "Personal Friends & Contacts",
    broadcast: "Applications open, personal contacts",
    reason: LIST_REASON.personalContacts,
    mustSay: "previously corresponded",
    mustNotSay: "listed with a Community Connect group",
  },
];

async function main() {
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
  }
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) throw new Error("RESEND_API_KEY or EMAIL_FROM missing from .env");

  // Read once and print it. The message itself throws on anything but "open",
  // so this is here to say WHY when it does.
  const state = getWindowState();
  console.log(`Window state: ${state}\n`);

  // Everything is rendered and checked before a single call reaches Resend. A
  // failure halfway through would otherwise leave one list drafted and the
  // other not, which is the state hardest to notice and easiest to send from.
  const built = LISTS.map((list) => {
    const message = applicationsOpenBroadcast(state, list.reason);
    const html = renderHtmlEmail(message.content);
    const text = renderTextEmail(message.content);

    // Both parts, and both flattened first. The text renderer hard-wraps at 72
    // columns, so "listed with a Community Connect group" arrives split across
    // two lines and a plain substring test on it fails on a correct email. The
    // HTML has its own line breaks for the same reason. Collapsing whitespace
    // makes the check about the words rather than about where they landed.
    const flat = (s: string) => s.replace(/\s+/g, " ");
    for (const part of [flat(html), flat(text)]) {
      if (!part.includes(list.mustSay)) {
        throw new Error(`${list.segment}: the list reason for this audience is not in the rendered email.`);
      }
      if (part.includes(list.mustNotSay)) {
        throw new Error(`${list.segment}: the OTHER audience's list reason is in the rendered email.`);
      }
    }
    if (!html.includes("{{{RESEND_UNSUBSCRIBE_URL}}}")) {
      throw new Error(`${list.segment}: no unsubscribe placeholder.`);
    }

    return { ...list, message, html, text };
  });

  // Every remote image has to resolve before any of this becomes a draft. A 404
  // here is the difference between a credit wall and seven broken image icons,
  // and unlike a test send there is no second look once it has gone. The two
  // bodies carry the same seven files, so they are checked once.
  const urls = [...new Set(built.flatMap((b) => [...b.html.matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => m[1])))];
  const statuses = await Promise.all(urls.map(async (url) => ({ url, status: (await fetch(url)).status })));
  const broken = statuses.filter((s) => s.status !== 200);
  if (broken.length) throw new Error(`Images did not resolve: ${broken.map((b) => b.url).join(", ")}`);

  const { message, html, text } = built[0];
  console.log(`${statuses.length} images resolve`);
  console.log(`Subject: ${message.subject}`);
  console.log(`Call to action: "${message.content.cta?.label}" to ${message.content.cta?.href}`);
  console.log(`Body: ${((html.length + text.length) / 1024).toFixed(1)}KB, Gmail clips over ~102KB\n`);

  const resend = new Resend(apiKey);

  const segments = (await resend.segments.list()).data?.data ?? [];
  const broadcasts = (await resend.broadcasts.list()).data?.data ?? [];

  for (const list of built) {
    const segment = segments.find((s) => s.name === list.segment);
    if (!segment) throw new Error(`No segment named "${list.segment}".`);

    // Read the membership rather than set it. Both lists were assembled and
    // audited elsewhere; the count is printed so whoever runs this can sanity
    // check it against what they expect before anything is drafted against it.
    const emails: string[] = [];
    let after: string | undefined;
    for (let page = 0; page < 60; page++) {
      const res = await resend.contacts.list({ segmentId: segment.id, limit: 100, ...(after ? { after } : {}) } as never);
      const rows = res.data?.data ?? [];
      emails.push(...rows.map((c) => c.email.toLowerCase()));
      if (!res.data?.has_more || !rows.length) break;
      after = rows[rows.length - 1].id;
    }
    console.log(`"${list.segment}" ${segment.id}: ${emails.length} contacts`);

    const existing = broadcasts.find((b) => b.name === list.broadcast);

    if (existing) {
      if (existing.status === "sent") {
        console.log(`  Broadcast ${existing.id} has already sent. Leaving it alone.\n`);
        continue;
      }
      // `name` has to be resent: the update is a replace, not a merge, and
      // omitting it renames the draft to "Untitled".
      const updated = await resend.broadcasts.update(existing.id, {
        name: list.broadcast,
        subject: list.message.subject,
        replyTo: [list.message.replyTo!],
        html: list.html,
        text: list.text,
      });
      if (updated.error) throw new Error(`Update failed for ${list.segment}: ${updated.error.message}`);
      console.log(`  Draft ${existing.id} updated with the current content.\n`);
    } else {
      const draft = await resend.broadcasts.create({
        segmentId: segment.id,
        from,
        replyTo: list.message.replyTo,
        subject: list.message.subject,
        name: list.broadcast,
        html: list.html,
        text: list.text,
        send: false,
      });
      if (draft.error) throw new Error(`Create failed for ${list.segment}: ${draft.error.message}`);
      console.log(`  Draft ${draft.data?.id} created.\n`);
    }
  }

  console.log("Open them in the dashboard, read both, then send them.");
}

main().catch((error: unknown) => {
  console.error(`\n${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
