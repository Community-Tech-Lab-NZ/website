#!/usr/bin/env npx tsx
/**
 * Builds the draft final call broadcast, one per list.
 *
 * Run: pnpm broadcast:final
 *
 * The last thing either list hears before the form closes on 31 August. See the
 * comment above finalCallBroadcast in src/lib/broadcast.ts for what the message
 * is and what it deliberately leaves out.
 *
 * WHY THE BROADCAST NAMES ARE NEW. draftToLists matches an existing broadcast on
 * its name so a rerun updates rather than duplicates. Reusing "Applications
 * open, Community Connect" here would find the broadcast that has already sent,
 * leave it alone as it should, and exit having drafted nothing.
 *
 * WHY IT CAN REFUSE TWICE. finalCallBroadcast throws outside the application
 * window, and again before the weekend the copy is written for. A message that
 * says "Monday" and "this weekend" is wrong on the 20th in a way that looks
 * entirely fine in the dashboard.
 */

import { getWindowState } from "../src/lib/application-window";
import { finalCallBroadcast, LIST_REASON } from "../src/lib/broadcast";
import { draftToLists, reportAndExit, type BroadcastList } from "./lib/draft-to-lists";

const LISTS: BroadcastList[] = [
  {
    segment: "Community Connect",
    broadcast: "Final call, Community Connect",
    reason: LIST_REASON.communityConnect,
    mustSay: "listed with a Community Connect group",
    mustNotSay: "previously corresponded",
  },
  {
    segment: "Personal Friends & Contacts",
    broadcast: "Final call, personal contacts",
    reason: LIST_REASON.personalContacts,
    mustSay: "previously corresponded",
    mustNotSay: "listed with a Community Connect group",
  },
];

async function main() {
  const state = getWindowState();
  console.log(`Window state: ${state}\n`);

  await draftToLists((reason) => finalCallBroadcast(state, reason), LISTS);
}

main().catch(reportAndExit);
