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
 * WHY IT REFUSES OUTSIDE THE WINDOW. applicationsOpenBroadcast throws unless
 * applications are open, and that throw is load-bearing rather than defensive.
 * Every line of this message tells the reader to go and apply.
 *
 * Everything about drafting itself lives in scripts/lib/draft-to-lists.ts, which
 * the final call script shares.
 */

import { getWindowState } from "../src/lib/application-window";
import { applicationsOpenBroadcast, LIST_REASON } from "../src/lib/broadcast";
import { draftToLists, reportAndExit, type BroadcastList } from "./lib/draft-to-lists";

const LISTS: BroadcastList[] = [
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
  // Read once and print it. The message itself throws on anything but "open",
  // so this is here to say WHY when it does.
  const state = getWindowState();
  console.log(`Window state: ${state}\n`);

  await draftToLists((reason) => applicationsOpenBroadcast(state, reason), LISTS);
}

main().catch(reportAndExit);
