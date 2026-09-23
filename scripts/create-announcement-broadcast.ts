#!/usr/bin/env npx tsx
/**
 * Builds the draft announcement broadcast, one per list.
 *
 * Run: pnpm broadcast:announce
 *
 * The three chosen problems, to the same two lists that had the launch, the
 * applications-open nudge and the final call. See the comment at the top of
 * src/lib/announcement.ts for what the message says and what it deliberately
 * does not.
 *
 * WHY THE BROADCAST NAMES ARE NEW, again. draftToLists matches an existing
 * broadcast on its name so a rerun updates rather than duplicates, and reusing
 * an earlier name would find a broadcast that has already sent, correctly leave
 * it alone, and exit having drafted nothing.
 *
 * WHY THERE IS NO WINDOW GUARD, unlike the two before it. Those messages point
 * at a form and have no honest version once it closes. This one reports what
 * was chosen, which stays true, so there is nothing for a guard to protect
 * against. The check that matters here is a different one, below.
 *
 * WHAT THIS CHECKS THAT THE OTHERS DID NOT.
 *
 * The photographs. draftToLists already refuses to draft anything if a remote
 * image 404s, and that now covers three JPEGs as well as seven marks, which is
 * the single most valuable thing it does for this send: the files are new, they
 * are deployed separately from the email, and a message whose three
 * photographs are broken icons is worse than one that never had them.
 *
 * The three names. They are the entire news, they contain a macron and two of
 * them are easy to typo, and once this sends there is no correcting it in front
 * of the organisation it names. So each is asserted against the rendered HTML
 * before anything reaches Resend. This duplicates what is in announcement.ts on
 * purpose: the point of a check is to fail when the thing it is checking
 * changes by accident.
 */

import { announcementBroadcast, BUILDS_PATH, CHOSEN } from "../src/lib/announcement";
import { LIST_REASON } from "../src/lib/broadcast";
import { renderHtmlEmail } from "../src/lib/email-template";
import { PRODUCTION_URL } from "../src/lib/site";
import { draftToLists, reportAndExit, type BroadcastList } from "./lib/draft-to-lists";

const LISTS: BroadcastList[] = [
  {
    segment: "Community Connect",
    broadcast: "The three chosen problems, Community Connect",
    reason: LIST_REASON.communityConnect,
    mustSay: "listed with a Community Connect group",
    mustNotSay: "previously corresponded",
  },
  {
    segment: "Personal Friends & Contacts",
    broadcast: "The three chosen problems, personal contacts",
    reason: LIST_REASON.personalContacts,
    mustSay: "previously corresponded",
    mustNotSay: "listed with a Community Connect group",
  },
];

async function main() {
  const html = renderHtmlEmail(announcementBroadcast().content);

  /* Every organisation is named, spelled as it spells itself. */
  for (const build of CHOSEN) {
    if (!html.includes(build.name)) {
      throw new Error(`"${build.name}" is not in the rendered email. Nothing has been drafted.`);
    }
  }

  /* Every photograph is present and credited.
   *
   * The src check is belt and braces over draftToLists, which fetches each one:
   * that catches a file that is not deployed, this catches a section that lost
   * its image in an edit, and they are different failures. The credit check is
   * the one that matters more, because a missing credit is invisible in a
   * dashboard preview and is somebody's work going out uncredited. */
  for (const { image } of CHOSEN) {
    if (!html.includes(image.src)) {
      throw new Error(`The photograph ${image.src} is not in the rendered email.`);
    }
    if (image.credit && !html.includes(image.credit)) {
      throw new Error(`${image.src} is credited to ${image.credit}, and that credit is not in the email.`);
    }
  }

  /* The button goes somewhere that exists.
   *
   * It points at a page added in the same change as this script, and the email
   * will outlive anyone's memory of that. If /builds is ever renamed, this
   * fails here rather than in seven hundred and eighty inboxes. */
  const builds = `${PRODUCTION_URL}${BUILDS_PATH}`;
  const page = await fetch(builds);
  if (page.status !== 200) {
    throw new Error(
      `${builds} returned ${page.status}. The call to action points there, so deploy the page before drafting this.`,
    );
  }
  console.log(`${builds} resolves\n`);

  await draftToLists((reason) => announcementBroadcast(reason), LISTS);
}

main().catch(reportAndExit);
