/**
 * Drafts one broadcast message into Resend, once per list, and never sends it.
 *
 * WHY THIS IS SHARED RATHER THAN COPIED. It started as the body of
 * create-applications-open-broadcast.ts, where about twenty lines were specific
 * to that message and the rest was not. A second send that copied the file
 * would be a second place for the guards, the image check and the
 * update-or-create rule to drift, which is the failure that script's own header
 * comment objects to. The callers now carry only their message and their list
 * table.
 *
 * WHY IT MATCHES THE EXISTING BROADCAST ON NAME, NOT SEGMENT. Looking up by
 * segment was right when a segment had at most one broadcast. Each of these
 * segments now has several, and the sent ones would match first: the script
 * would find one, see `status === "sent"`, and exit reporting that everything
 * was already done, having created nothing. The name is the identity here.
 * Change a caller's broadcast name on a rerun and you get a second draft, which
 * is the failure that is at least visible.
 *
 * WHY IT ONLY EVER CREATES A DRAFT. `send` stays false and there is no flag to
 * change it. The send is a button in the dashboard, pressed by a person who has
 * just read the thing. Adding `send: true` here is not a shortcut, it is a
 * decision, and it should look like one in the diff.
 *
 * WHY THE GUARDS ARE SYMMETRIC. The bodies are byte-identical apart from one
 * sentence in the footer saying where the address came from. That makes the
 * mistake easy and invisible: nothing about a Community Connect draft looks
 * wrong when it is carrying the personal-contacts line. So each list asserts
 * both that its own reason is present AND that the other one is not, and
 * nothing is drafted if either fails.
 */

import { readFileSync } from "node:fs";
import { Resend } from "resend";
import type { Message } from "../../src/lib/email";
import { renderHtmlEmail, renderTextEmail } from "../../src/lib/email-template";

/** One list to draft into.
 *
 * `mustSay` and `mustNotSay` are the fragments that prove the right footer
 * arrived: distinctive substrings of the two LIST_REASON values, deliberately
 * short enough to survive a wording edit that does not change which route is
 * being described. If a reason is ever reworded past them, these fail loudly,
 * which is the correct outcome. */
export type BroadcastList = {
  /** Resend segment name. Must already exist; membership is read, never set. */
  segment: string;
  /** Resend broadcast name. The identity used to update rather than duplicate. */
  broadcast: string;
  /** The LIST_REASON for this audience. */
  reason: string;
  mustSay: string;
  mustNotSay: string;
};

/** Loads .env without a dependency, leaving anything already exported alone. */
function loadEnv(): void {
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
  }
}

export async function draftToLists(
  build: (reason: string) => Message,
  lists: readonly BroadcastList[],
): Promise<void> {
  loadEnv();
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) throw new Error("RESEND_API_KEY or EMAIL_FROM missing from .env");

  // Everything is rendered and checked before a single call reaches Resend. A
  // failure halfway through would otherwise leave one list drafted and the
  // other not, which is the state hardest to notice and easiest to send from.
  const built = lists.map((list) => {
    const message = build(list.reason);
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
  // and unlike a test send there is no second look once it has gone. The bodies
  // carry the same files, so they are checked once.
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
    const contacts: { email: string; unsubscribed: boolean }[] = [];
    let after: string | undefined;
    for (let page = 0; page < 60; page++) {
      const res = await resend.contacts.list({ segmentId: segment.id, limit: 100, ...(after ? { after } : {}) } as never);
      const rows = res.data?.data ?? [];
      for (const c of rows) {
        // Not a default. A missing flag means this cannot tell who has opted
        // out, and the one thing that must never happen is guessing "false"
        // and mailing them anyway.
        if (typeof c.unsubscribed !== "boolean") {
          throw new Error(
            `${list.segment}: contact ${c.email} has no unsubscribed flag, so this cannot tell who has opted out. Do not draft against a list it cannot read.`,
          );
        }
        contacts.push({ email: c.email.toLowerCase(), unsubscribed: c.unsubscribed });
      }
      if (!res.data?.has_more || !rows.length) break;
      after = rows[rows.length - 1].id;
    }

    /* THE COUNT THAT GETS PRINTED IS THE DELIVERABLE ONE.
     *
     * A segment keeps people who have unsubscribed: the flag on the contact IS
     * the record of the opt-out, and deleting them to tidy the count would
     * throw away the only thing stopping the next import mailing them again.
     * Resend skips them at send time.
     *
     * But this line is read by a person deciding whether the draft looks right
     * before they press send, and printing the raw membership tells them a
     * number of recipients that is wrong and too high. So it prints both, and
     * the opted-out figure is named rather than quietly subtracted, because a
     * count that moves between sends should be explainable. */
    const optedOut = contacts.filter((c) => c.unsubscribed).length;
    const deliverable = contacts.length - optedOut;
    console.log(
      `"${list.segment}" ${segment.id}: ${deliverable} will receive this` +
        (optedOut ? `, ${optedOut} unsubscribed and skipped` : ", none unsubscribed"),
    );

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

/** Prints the reason and exits non-zero, so a guard reads as a refusal rather
 *  than a stack trace. Every caller ends with this. */
export function reportAndExit(error: unknown): never {
  console.error(`\n${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
