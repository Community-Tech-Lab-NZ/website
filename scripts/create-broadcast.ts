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
 * WHY IT IS SAFE TO RUN TWICE. Every step checks for its own output first: a
 * segment with the right name is reused rather than duplicated, a contact
 * already in a segment is left alone, and a draft that already exists is
 * skipped. If it fails halfway through, fix the cause and run it again. The
 * alternative is unpicking half-built segments by hand in a dashboard.
 *
 * WHY THE LIST IS SPLIT ACROSS DAYS. The free plan allows 100 emails a day and
 * the list is 448. The day-N.csv files are batched round-robin by domain rather
 * than sliced alphabetically, so no single receiver gets the whole list at once
 * and the ramp doubles as domain warming. See the batching note in the list
 * folder's README.
 *
 * WHY IT RECYCLES SEGMENTS. The same plan allows three segments and the send
 * needs five. A segment whose broadcast has already gone is finished work, so
 * once day one has sent, its segment is emptied and refilled with day four.
 * That means this script cannot build all five in one run and is not meant to:
 * run it now for as many days as there is room for, send one, run it again.
 * It only ever recycles a segment whose broadcast reports `sent`, so a draft
 * waiting to go out can never have its recipients pulled out from under it.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { Resend } from "resend";
import { getWindowState } from "../src/lib/application-window";
import { communityLaunchBroadcast } from "../src/lib/broadcast";
import { renderHtmlEmail, renderTextEmail } from "../src/lib/email-template";

const BATCH_DIR = process.argv[2];
const SEGMENT_NAME = (day: number, of: number) => `Community Connect, day ${day} of ${of}`;

/** Resend allows 10 requests a second. Adding 448 contacts to segments is 448
 *  requests, so they go out in small waves with a pause between: fast enough to
 *  finish in under a minute, slow enough never to see a 429. */
async function throttled<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(...(await Promise.all(items.slice(i, i + size).map(fn))));
    if (i + size < items.length) await new Promise((r) => setTimeout(r, 1100));
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
      const res = await resend.contacts.list({ segmentId, limit: 100, ...(after ? { after } : {}) } as never);
      const rows = res.data?.data ?? [];
      emails.push(...rows.map((c) => c.email.toLowerCase()));
      if (!res.data?.has_more || !rows.length) break;
      after = rows[rows.length - 1].id;
    }
    return emails;
  }

  const deferred: number[] = [];

  for (const { day, emails } of batches) {
    const name = SEGMENT_NAME(day, batches.length);
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
        await throttled(old, 8, (email) => resend.contacts.segments.remove({ email, segmentId: spent.id }));
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
    const toAdd = emails.filter((e) => !already.has(e));
    if (toAdd.length) {
      const results = await throttled(toAdd, 8, (email) => resend.contacts.segments.add({ email, segmentId }));
      const failed = results.filter((r) => r.error);
      if (failed.length) throw new Error(`Day ${day}: ${failed.length} adds failed, first: ${failed[0].error?.message}`);
    }
    console.log(`         ${emails.length} contacts (${toAdd.length} added, ${already.size} already there)`);

    if (broadcasts.some((b) => b.name === name)) {
      console.log(`         draft already exists, skipping\n`);
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
