#!/usr/bin/env npx tsx
/**
 * Builds the launch broadcast in Resend: segments, membership, and drafts.
 *
 * Run: npx tsx scripts/create-broadcast.ts <dir of day-N.csv files>
 *
 * WHY THIS EXISTS RATHER THAN COPY AND PASTE. Resend's dashboard composer is a
 * no-code editor with Markdown support and no HTML mode. This email is 23KB of
 * hand-built table layout with every style inlined, because that is the only
 * thing Outlook renders correctly, and there is nowhere in that editor to put
 * it. The Broadcast API takes `html` and `text` directly, so what reaches a
 * segment is the same bytes the preview and the test sends used.
 *
 * WHY IT ONLY EVER CREATES DRAFTS. `send` stays false and there is no flag to
 * change that. The script hands back broadcast IDs; the send is a button in the
 * dashboard, pressed by a person who has just read the thing. Mailing four
 * hundred and forty-eight organisations should be a deliberate act, not an exit
 * code. Deleting this comment and adding `send: true` is not a shortcut, it is
 * a decision, and it should look like one in the diff.
 *
 * WHY IT IS SAFE TO RUN AGAIN, AND WHY IT SHOULD BE RUN AGAIN. A segment with
 * the right name is reused rather than duplicated, and an existing draft has
 * its content REPLACED rather than being left alone. That second part matters:
 * the copy and the template keep changing, and a draft is a snapshot of the day
 * it was written. Skipping it would ship a fix to days one and two but not to
 * three, four and five. Membership is SYNCED rather than topped up,
 * so rebatching the list — dropping an address, pulling 25 out for the canary —
 * leaves no stragglers behind to be sent to twice. If it fails halfway, fix the
 * cause and run it again. The alternative is unpicking half-built segments by
 * hand in a dashboard.
 *
 * It will not touch the membership of a segment whose broadcast has already
 * sent. That mail has gone; the segment is now a record of who received it, and
 * quietly editing it would destroy the only account of what actually happened.
 *
 * WHY THE LIST IS SPLIT ACROSS DAYS, STILL. It began as the free plan's 100 a
 * day. The plan has since been upgraded and the split stays, for the better
 * reason: this domain has never sent bulk mail, and a steady ramp is how a
 * sender builds a reputation instead of announcing itself with 448 messages in
 * one minute. Batches are round-robin by domain rather than sliced
 * alphabetically, so no single receiver gets the whole list at once, and every
 * address carrying a doubt rides in the last batch, behind four days of
 * delivered mail.
 *
 * WHY IT CAN RECYCLE A SEGMENT. Plans cap how many segments exist at once. When
 * the cap is hit, a segment whose broadcast has already gone is finished work,
 * so it is emptied and refilled with the next day's contacts. It only ever
 * recycles one reporting `sent`, so a draft waiting to go out can never have
 * its recipients pulled out from under it. Not needed on the current plan, kept
 * because plans change.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { Resend } from "resend";
import { getWindowState } from "../src/lib/application-window";
import { communityLaunchBroadcast } from "../src/lib/broadcast";
import { renderHtmlEmail, renderTextEmail } from "../src/lib/email-template";

const BATCH_DIR = process.argv[2];

/* day-0.csv is the canary: a small, provider-diverse batch of the addresses
 * least likely to bounce, sent first so a person can open a real inbox and see
 * whether it landed in Promotions or junk. That is the one thing no dashboard
 * reports — a message filed under Promotions looks identical to a delivered one
 * in every metric Resend has. It is named rather than numbered so nobody sends
 * it thinking it is the first real batch. */
const SEGMENT_NAME = (day: number, sendingDays: number) =>
  day === 0 ? "Community Connect, canary" : `Community Connect, day ${day} of ${sendingDays}`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* Resend allows 10 requests a second, and syncing a segment is one request per
 * contact plus the paging needed to read the segment first. Waves alone are not
 * enough: the paging and the writes share the same budget, so a wave sized to
 * fit on its own still overruns when it lands behind a page fetch. Hence both a
 * conservative wave and a retry.
 *
 * The retry matters more than the pacing. A rate limit is a "come back in a
 * moment", not a failure, and treating it as one aborted a sync a third of the
 * way through and left a segment holding a partial list. */
async function withRetry<R>(fn: () => Promise<R & { error?: { name?: string } | null }>): Promise<R> {
  for (let attempt = 0; ; attempt++) {
    const result = await fn();
    if (result.error?.name !== "rate_limit_exceeded" || attempt >= 5) return result;
    await sleep(1500 * (attempt + 1));
  }
}

async function throttled<T, R extends { error?: { name?: string } | null }>(
  items: T[],
  size: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(...(await Promise.all(items.slice(i, i + size).map((item) => withRetry(() => fn(item))))));
    if (i + size < items.length) await sleep(1200);
  }
  return out;
}

function readBatches(dir: string): { day: number; emails: string[] }[] {
  const files = readdirSync(dir).filter((f) => /^day-\d+\.csv$/.test(f)).sort();
  if (!files.length) throw new Error(`No day-N.csv files in ${dir}`);
  return files.map((file) => {
    const lines = readFileSync(join(dir, file), "utf8").split("\n").filter(Boolean);
    const header = lines[0].split(",").map((h) => h.trim());
    const emailAt = header.indexOf("email");
    if (emailAt < 0) throw new Error(`${file} has no email column`);
    return {
      day: Number(/\d+/.exec(file)?.[0]),
      // Split on comma only: these files are written by the cleaner and the
      // email column never contains one. Anything fancier would be pretending
      // this is a general CSV parser.
      emails: lines.slice(1).map((l) => l.split(",")[emailAt].trim().toLowerCase()).filter(Boolean),
    };
  });
}

async function main() {
  if (!BATCH_DIR) throw new Error("Pass the directory holding the day-N.csv files.");

  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
  }
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) throw new Error("RESEND_API_KEY or EMAIL_FROM missing from .env");

  const batches = readBatches(BATCH_DIR);
  const sendingDays = batches.filter((b) => b.day > 0).length;
  const total = batches.reduce((n, b) => n + b.emails.length, 0);
  console.log(`${batches.length} batches, ${total} addresses\n`);

  // The window state decides the button and half the copy, so it is read once
  // and printed rather than left to surprise someone. A draft written before
  // the 15th and sent after it says the wrong thing.
  const state = getWindowState();
  const message = communityLaunchBroadcast(state);
  const html = renderHtmlEmail(message.content);
  const text = renderTextEmail(message.content);

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
  const broadcasts = (await resend.broadcasts.list()).data?.data ?? [];

  /** Everyone currently in a segment. */
  async function membersOf(segmentId: string): Promise<string[]> {
    const emails: string[] = [];
    let after: string | undefined;
    for (let page = 0; page < 30; page++) {
      const res = await withRetry(() => resend.contacts.list({ segmentId, limit: 100, ...(after ? { after } : {}) } as never));
      const rows = res.data?.data ?? [];
      emails.push(...rows.map((c) => c.email.toLowerCase()));
      if (!res.data?.has_more || !rows.length) break;
      after = rows[rows.length - 1].id;
    }
    return emails;
  }

  const deferred: number[] = [];

  for (const { day, emails } of batches) {
    const name = SEGMENT_NAME(day, sendingDays);
    let segment = segments.find((s) => s.name === name);

    if (!segment) {
      const created = await resend.segments.create({ name });

      if (created.error) {
        // Out of segments. The only ones safe to take are those whose broadcast
        // has already gone: that work is finished and its recipients are a
        // record, not a pending list.
        const spent = segments.find((s) =>
          broadcasts.some((b) => b.segment_id === s.id && b.status === "sent"),
        );
        if (!spent) {
          console.log(`Day ${day}  no segment available: ${created.error.message}`);
          deferred.push(day);
          continue;
        }
        console.log(`Day ${day}  recycling "${spent.name}" (its broadcast has sent)`);
        const old = await membersOf(spent.id);
        await throttled(old, 5, (email) => resend.contacts.segments.remove({ email, segmentId: spent.id }));
        // The API has no rename, so the segment keeps the label it was born
        // with while now holding a different day's contacts. Logged loudly,
        // because a dashboard that says "day 1 of 5" over day four's people is
        // exactly the kind of thing that gets sent to the wrong list. The
        // broadcast's own name is the one that is correct.
        segment = { ...spent, name };
        console.log(`         emptied ${old.length}; in the dashboard this segment is still labelled "${spent.name}"`);
        segments.splice(segments.indexOf(spent), 1);
      } else {
        segment = { id: created.data!.id, name, created_at: "" };
        segments.push(segment);
        console.log(`Day ${day}  segment created  ${segment.id}`);
      }
    } else {
      console.log(`Day ${day}  segment exists, reusing  ${segment.id}`);
    }

    const segmentId = segment.id;
    const already = new Set(await membersOf(segmentId));
    const wanted = new Set(emails);
    const toAdd = emails.filter((e) => !already.has(e));
    // Membership is SYNCED, not just topped up. Rebatching the list is a normal
    // thing to do — an address gets dropped, the canary takes 25 out of the
    // middle — and a script that only ever adds would leave the old membership
    // behind and send to people twice.
    const toRemove = [...already].filter((e) => !wanted.has(e));

    const sent = broadcasts.some((b) => b.segment_id === segmentId && b.status === "sent");
    if (sent && (toAdd.length || toRemove.length)) {
      console.log(`         broadcast already sent, leaving membership alone\n`);
      continue;
    }

    if (toAdd.length) {
      const results = await throttled(toAdd, 5, (email) => resend.contacts.segments.add({ email, segmentId }));
      const failed = results.filter((r) => r.error);
      if (failed.length) throw new Error(`Day ${day}: ${failed.length} adds failed, first: ${failed[0].error?.message}`);
    }
    if (toRemove.length) {
      const results = await throttled(toRemove, 5, (email) => resend.contacts.segments.remove({ email, segmentId }));
      const failed = results.filter((r) => r.error);
      if (failed.length) throw new Error(`Day ${day}: ${failed.length} removals failed, first: ${failed[0].error?.message}`);
    }
    console.log(`         ${emails.length} contacts (+${toAdd.length} -${toRemove.length}, ${already.size} were there)`);

    // A draft that already exists is UPDATED, not skipped. The copy and the
    // template both keep changing, and a draft written on Tuesday is a
    // snapshot: skipping it means the fix made on Wednesday ships to days one
    // and two and not to three, four and five, which is the sort of bug nobody
    // finds until a recipient mentions it. Content is pushed every run so the
    // drafts and this repo cannot drift apart.
    // Matched on the segment, not the name. One segment has one broadcast, so
    // the segment is the stable identity; the name is display text that an
    // update can change. Matching on the name meant that the moment an update
    // renamed a draft, the next run stopped recognising it and made a second
    // one pointed at the same people.
    const existing =
      broadcasts.find((b) => b.segment_id === segmentId) ?? broadcasts.find((b) => b.name === name);
    if (existing) {
      if (existing.status === "sent") {
        console.log(`         broadcast already sent, leaving it alone\n`);
        continue;
      }
      const updated = await withRetry(() =>
        resend.broadcasts.update(existing.id, {
          // `name` has to be resent. The update is a replace, not a merge: the
          // first version of this call omitted it and turned all six drafts
          // into "Untitled", which is precisely the state the names exist to
          // prevent when five of them share one subject line.
          name,
          subject: message.subject,
          replyTo: [message.replyTo!],
          html,
          text,
        }),
      );
      if (updated.error) throw new Error(`Day ${day} update: ${updated.error.message}`);
      console.log(`         draft ${existing.id} updated with the current content\n`);
      continue;
    }
    const draft = await resend.broadcasts.create({
      segmentId,
      from,
      replyTo: message.replyTo,
      subject: message.subject,
      // Named for the day, because five drafts with one subject line between
      // them are indistinguishable in a dashboard list.
      name,
      html,
      text,
      send: false,
    });
    if (draft.error) throw new Error(`Day ${day} broadcast: ${draft.error.message}`);
    console.log(`         draft ${draft.data?.id}\n`);
  }

  if (deferred.length) {
    console.log(`Days ${deferred.join(" and ")} could not be built: the plan is out of segments and`);
    console.log(`none of the existing ones have sent yet. Send a draft, then run this again.`);
  } else {
    console.log("Done. Open each draft in the dashboard, read it, then send one a day.");
  }
}

main().catch((error: unknown) => {
  console.error(`\n${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
