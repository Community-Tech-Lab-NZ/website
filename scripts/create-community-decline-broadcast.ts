#!/usr/bin/env npx tsx
/**
 * Builds the segment of unsuccessful community applicants and drafts their
 * decline into Resend. Never sends.
 *
 * Run: pnpm broadcast:decline
 *
 * WHAT THIS IS. Sixteen organisations applied, three were chosen, and the
 * thirteen who were not are told directly, before the public announcement goes
 * out to seven hundred and sixty three people. See communityDecline in
 * src/lib/outcome.ts for what the letter says and why.
 *
 * WHY THE SEGMENT IS BUILT HERE AND NOT IN THE DASHBOARD. Thirteen addresses
 * typed into a web form is thirteen chances to typo one and a fourteenth to
 * paste in a row from the wrong list. The roster below is the applicant list as
 * supplied, all sixteen of them, with the three chosen ones marked. The
 * exclusion is computed rather than done by hand, and the membership is read
 * back from Resend afterwards and compared against what it should be. Nothing
 * is drafted unless those two sets match exactly.
 *
 * THE FAILURE THIS EXISTS TO PREVENT. A decline sent to one of the three
 * organisations that was actually chosen. It is the single worst thing that
 * could happen in this round, it is one misplaced row away, and it would be
 * discovered by the recipient. So the three are held in the roster rather than
 * deleted from it, marked `chosen`, and asserted absent from the segment at the
 * end. Deleting them would make the check impossible to write.
 *
 * WHY IT IS STILL A DRAFT. Same rule as every other broadcast here: `send`
 * stays false in draftToLists and there is no flag. The send is a button in the
 * dashboard pressed by someone who has just read the thing, and for this
 * message that person should also have checked the recipient list.
 */

import { Resend } from "resend";
import { renderHtmlEmail, renderTextEmail } from "../src/lib/email-template";
import { communityDecline } from "../src/lib/outcome";
import { loadEnv, reportAndExit } from "./lib/draft-to-lists";

/** Where replies go. The letter offers to talk someone through how their
 *  application was read, and says it is Giovanni who answers, so this has to be
 *  a mailbox he reads. */
const REPLY_TO = "stephens.giovanni@gmail.com";

const SEGMENT = "Community applicants, unsuccessful";
const BROADCAST = "Application outcome, unsuccessful community applicants";

/* Every organisation that applied, as supplied on 23 September.
 *
 * ALL SIXTEEN ARE HERE, including the three that were chosen. They carry
 * `chosen: true` and are filtered out below rather than being absent, so that
 * the guard at the end can assert they are not in the segment. A roster with
 * them already removed cannot prove anything about them.
 *
 * `firstName` is what Resend substitutes into the greeting. It is the contact's
 * first name as given, except where noted.
 *
 * NAMES ARE AS THE ORGANISATION WROTE THEM, with two corrections that are
 * typography rather than fact: "Whakatipu Reforestation TRust" and the double
 * space in the Dark Sky row. Both are chosen rows and neither is mailed, so the
 * corrections only affect what gets printed to the console.
 */
type Applicant = {
  org: string;
  firstName: string;
  email: string;
  chosen?: true;
  note?: string;
};

const APPLICANTS: Applicant[] = [
  { org: "Grow Wānaka Community Garden", firstName: "Emberly", email: "emberly@growwanaka.com" },
  {
    org: "Tāhuna Glenorchy Dark Sky Sanctuary, under the Glenorchy Heritage and Museum Group",
    firstName: "Leslie",
    email: "leslie.vangelder@gmail.com",
    chosen: true,
  },
  { org: "Te Atamira Whakatipu Community Trust", firstName: "Ruth", email: "director@teatamira.nz" },
  { org: "The Lightfoot Initiative", firstName: "Paul", email: "pauljaquin@gmail.com" },
  { org: "Headlight Trust", firstName: "Niamh", email: "niamh.shaw@headlight.org.nz" },
  {
    org: "Wao Aotearoa, Better Events Collective Working Group",
    firstName: "Kelcey",
    email: "events@wao.co.nz",
  },
  {
    org: "Arrowtown Primary School",
    firstName: "Hannah",
    email: "hannah.rutherford@arrowtown.school.nz",
  },
  {
    org: "Japanese Family Society of Queenstown",
    firstName: "Keiko",
    email: "japanesefamilyqueenstown@gmail.com",
  },
  { org: "Queenstown Ice Hockey Club", firstName: "JC", email: "gm@queenstownicehockey.co.nz" },
  {
    org: "Whakatipu Reforestation Trust",
    firstName: "Sararose",
    email: "volunteer@wrtqt.org.nz",
    chosen: true,
  },
  {
    org: "Upper Clutha Children's Medical Trust",
    firstName: "Diana",
    email: "dianas@xtra.co.nz",
  },
  {
    org: "WAI Wanaka",
    firstName: "Prue",
    email: "prue@waiwanaka.nz",
    /* The supplied row had "Prue" in the contact column and "Kane" in the role
     * column, which is a column shift rather than a person called Prue with the
     * role "Kane". Read as Prue Kane, with no role recorded. Only the first
     * name is used, so the reading is safe either way: "Kia ora Prue" is
     * correct whether or not Kane is the surname. */
    note: "Surname read from a shifted column, first name only is used",
  },
  {
    org: "Women's Shed Aotearoa",
    firstName: "Alex",
    email: "queenstown@womensshedaotearoa.org.nz",
  },
  {
    org: "Queenstown Lakes Community Housing Trust",
    firstName: "Julie",
    email: "Juliemscott21@gmail.com",
  },
  {
    org: "Wanaka Community Hub",
    firstName: "Alicia",
    email: "manager@wanakacommunityhub.org.nz",
  },
  {
    org: "Queenstown Mountain Bike Club",
    firstName: "Natalie",
    email: "manager@queenstownmtb.co.nz",
    chosen: true,
  },
];

async function main() {
  const recipients = APPLICANTS.filter((a) => !a.chosen);
  const chosen = APPLICANTS.filter((a) => a.chosen);

  /* The roster has to be internally sound before it reaches Resend.
   *
   * Three builds were funded, so exactly three rows are marked chosen. A fourth
   * or a second means the roster was edited wrongly, and the resulting segment
   * would silently be one address short or long. */
  if (chosen.length !== 3) {
    throw new Error(`${chosen.length} applicants are marked chosen. There were three builds.`);
  }
  const addresses = APPLICANTS.map((a) => a.email.toLowerCase());
  const duplicates = addresses.filter((e, i) => addresses.indexOf(e) !== i);
  if (duplicates.length) {
    throw new Error(`Duplicate addresses in the roster: ${[...new Set(duplicates)].join(", ")}`);
  }
  for (const a of APPLICANTS) {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(a.email)) {
      throw new Error(`"${a.email}" (${a.org}) does not look like an email address.`);
    }
    if (!a.firstName.trim()) {
      throw new Error(`${a.org} has no first name, so the greeting would fall back for them.`);
    }
  }

  const message = communityDecline(REPLY_TO);
  const html = renderHtmlEmail(message.content);
  const text = renderTextEmail(message.content);

  /* THE MERGE TAG IS THE WHOLE POINT OF THIS BEING PERSONALISED, so it is
   * checked rather than assumed, in both parts.
   *
   * It has to survive escapeHtml, which it does because braces and pipes are
   * not escaped, and it has to still carry its fallback. A tag that lost its
   * `|koutou` would render "Kia ora ," for any contact whose first name did not
   * store, which is the exact failure the fallback exists to prevent. */
  const TAG = "{{{contact.first_name|koutou}}}";
  for (const [part, name] of [
    [html, "HTML"],
    [text, "text"],
  ] as const) {
    if (!part.includes(TAG)) {
      throw new Error(`The ${name} part does not carry the first-name merge tag with its fallback.`);
    }
  }
  if (!html.includes("{{{RESEND_UNSUBSCRIBE_URL}}}")) {
    throw new Error("No unsubscribe placeholder, and this is bulk mail.");
  }

  loadEnv();
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) throw new Error("RESEND_API_KEY or EMAIL_FROM missing from .env");

  console.log(`Subject: ${message.subject}`);
  console.log(`Reply-to: ${REPLY_TO}`);
  console.log(`Body: ${((html.length + text.length) / 1024).toFixed(1)}KB\n`);
  console.log(`${recipients.length} organisations receive this:`);
  for (const a of recipients) {
    console.log(`  ${a.firstName.padEnd(10)} ${a.email.padEnd(40)} ${a.org}`);
    if (a.note) console.log(`             note: ${a.note}`);
  }
  console.log(`\n${chosen.length} chosen, excluded, and asserted absent below:`);
  for (const a of chosen) console.log(`  ${a.email.padEnd(40)} ${a.org}`);
  console.log();

  const resend = new Resend(apiKey);

  const segments = (await resend.segments.list()).data?.data ?? [];
  const existing = segments.find((s) => s.name === SEGMENT);

  let segmentId: string;
  if (existing) {
    segmentId = existing.id;
    console.log(`Segment "${SEGMENT}" already exists: ${segmentId}`);
  } else {
    const created = await resend.segments.create({ name: SEGMENT });
    if (created.error || !created.data) {
      throw new Error(`Could not create the segment: ${created.error?.message}`);
    }
    segmentId = created.data.id;
    console.log(`Segment "${SEGMENT}" created: ${segmentId}`);
  }

  /* `segments`, not `segmentId`. The contact create takes a list of segment
   * ids, and passing the bare string is accepted silently and files the contact
   * under no segment at all. create-outcome-broadcast.ts has the same note and
   * learned it the same way.
   *
   * firstName is what the merge tag reads at send time. A contact created
   * without it gets the fallback, which is why every roster row is checked for
   * a first name above rather than being allowed to degrade quietly. */
  for (const a of recipients) {
    const contact = await resend.contacts.create({
      email: a.email.toLowerCase(),
      firstName: a.firstName,
      segments: [{ id: segmentId }],
    });
    if (contact.error) {
      throw new Error(`Could not add ${a.email} to the segment: ${contact.error.message}`);
    }
  }

  /* THE CHECK THAT MATTERS.
   *
   * Read the segment back and compare it to the roster. Everything above is
   * intent; this is the only place that knows who Resend will actually mail.
   * Three things have to hold, and all three are failures of a different kind:
   *
   *   every intended recipient is present   — or somebody is not told
   *   nobody else is present                — or a stranger gets a decline
   *   none of the three chosen is present   — the unrecoverable one
   */
  /* `first_name`, snake case, NOT `firstName`.
   *
   * The Resend SDK takes camelCase on contacts.create and returns snake_case on
   * contacts.list. That asymmetry is in its own types and it is not a mistake
   * here: reading `c.firstName` off a listed contact is undefined at runtime,
   * which would make the nameless check below pass for everyone and defeat
   * itself silently. Do not "fix" the casing to match the create call above. */
  const members: { email: string; firstName: string | null }[] = [];
  let after: string | undefined;
  for (let page = 0; page < 20; page++) {
    const res = await resend.contacts.list({
      segmentId,
      limit: 100,
      ...(after ? { after } : {}),
    } as never);
    const rows = res.data?.data ?? [];
    for (const c of rows) members.push({ email: c.email.toLowerCase(), firstName: c.first_name });
    if (!res.data?.has_more || !rows.length) break;
    after = rows[rows.length - 1].id;
  }

  const inSegment = new Set(members.map((m) => m.email));
  const intended = new Set(recipients.map((a) => a.email.toLowerCase()));

  const missing = [...intended].filter((e) => !inSegment.has(e));
  const unexpected = [...inSegment].filter((e) => !intended.has(e));
  const chosenPresent = chosen.filter((a) => inSegment.has(a.email.toLowerCase()));

  if (chosenPresent.length) {
    throw new Error(
      `STOP. The segment contains ${chosenPresent.map((a) => `${a.email} (${a.org})`).join(", ")}, ` +
        `which ${chosenPresent.length === 1 ? "was" : "were"} chosen for a build. Nothing has been drafted. ` +
        `Remove them in the dashboard before running this again.`,
    );
  }
  if (missing.length || unexpected.length) {
    throw new Error(
      `Segment "${SEGMENT}" does not match the roster. Nothing has been drafted.\n` +
        (missing.length ? `  Missing: ${missing.join(", ")}\n` : "") +
        (unexpected.length ? `  Unexpected: ${unexpected.join(", ")}\n` : "") +
        `  Fix the segment in the dashboard first.`,
    );
  }

  /* The merge tag reads firstName off the contact, so a contact stored without
   * one silently falls back for that person. Checked here rather than trusted,
   * because a fallback greeting on a decline is exactly the kind of thing
   * nobody notices in a dashboard preview of somebody else's email. */
  const nameless = members.filter((m) => !m.firstName);
  if (nameless.length) {
    throw new Error(
      `These contacts have no first name stored, so they would be greeted "Kia ora koutou": ` +
        `${nameless.map((m) => m.email).join(", ")}. Nothing has been drafted.`,
    );
  }

  console.log(`\nSegment holds exactly the ${members.length} intended recipients, all with a first name.`);
  console.log(`None of the three chosen organisations is in it.\n`);

  const broadcasts = (await resend.broadcasts.list()).data?.data ?? [];
  const existingBroadcast = broadcasts.find((b) => b.name === BROADCAST);

  if (existingBroadcast) {
    if (existingBroadcast.status === "sent") {
      console.log(`Broadcast ${existingBroadcast.id} has already sent. Leaving it alone.`);
      return;
    }
    const updated = await resend.broadcasts.update(existingBroadcast.id, {
      name: BROADCAST,
      subject: message.subject,
      replyTo: [REPLY_TO],
      html,
      text,
    });
    if (updated.error) throw new Error(`Update failed: ${updated.error.message}`);
    console.log(`Draft ${existingBroadcast.id} updated with the current content.`);
  } else {
    const draft = await resend.broadcasts.create({
      segmentId,
      from,
      replyTo: [REPLY_TO],
      subject: message.subject,
      name: BROADCAST,
      html,
      text,
      send: false,
    });
    if (draft.error) throw new Error(`Create failed: ${draft.error.message}`);
    console.log(`Draft ${draft.data?.id} created.`);
  }

  console.log(
    "\nSend this BEFORE the announcement, and on the same day. The letter says " +
      "the three are announced publicly later today and that they are hearing " +
      "it from us first, so both halves have to be true when it lands.",
  );
}

main().catch(reportAndExit);
