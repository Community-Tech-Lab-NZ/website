import type { Message } from "./email";
import { PRODUCTION_URL } from "./site";

/* What applicants hear back.
 *
 * The confirmations in email.ts said "we reply to everyone" and named 24
 * September. This is that reply. It is the last thing most applicants ever
 * receive from the programme, and for the ones told no it is the only thing
 * they get in exchange for an hour of their evening, so it is written to be
 * read once and not resented.
 *
 * IT IS TRANSACTIONAL, NOT BULK. One named person who applied, answered on the
 * date they were promised an answer. No unsubscribe, no list reason, no credit
 * wall: `bulk` stays unset and the footer keeps its short form. A decline
 * carrying six partner logos reads as a newsletter that happens to reject you.
 *
 * THE REPLY-TO IS REAL. Unlike the confirmations, this invites a reply — the
 * last paragraph offers the WhatsApp channels and the meet-ups — so
 * `unmonitored` is false and a working address has to be passed in. Sending
 * this from the no-reply address would make the offer a lie in the footer's
 * own words.
 *
 * NO CALL TO ACTION BUTTON. A decline with a button in it is asking the reader
 * to do something on their way out, and every honest candidate for that button
 * is a link back to the programme that just said no.
 */

/** The applicant, as little of them as the letter needs.
 *
 *  First name only, deliberately. "Kia ora Paul" reads like a person wrote it;
 *  the full name as typed into a form field reads like a mail merge, which is
 *  the one impression a decline cannot afford. */
export type Applicant = {
  /** Used in the greeting exactly as given. Trimmed to its first word by the
   *  caller if a full name arrives. */
  firstName: string;
  email: string;
};

/** Splits a full name down to what the greeting uses. Safe on a name already
 *  given as one word, and on the empty string, which falls back to a greeting
 *  with no name rather than "Kia ora ,". */
export function firstNameOf(name: string): string {
  return name.trim().split(/\s+/)[0] ?? "";
}

/* The decline, for the developer path.
 *
 * WHAT IT SAYS AND WHY IT SAYS IT THAT WAY.
 *
 * The answer comes first. Three paragraphs of warm-up before the word
 * "unfortunately" is worse than the no itself: the reader knows what this is
 * from the subject line and skims for the verdict, so making them hunt reads as
 * cowardice. Thanks, then the answer, then the reason.
 *
 * The reason is the shape of the cohort, not the applicant. It is also true —
 * three teams, balanced on skills against what the community organisations
 * need — and being true is what lets it be said plainly. "It is not a
 * reflection on the quality of your application" is kept because unsuccessful
 * applicants assume the opposite by default, and it costs one line to say.
 *
 * The door stays open in two specific ways rather than one vague one. A future
 * round is named as a maybe, because whether there is one is genuinely not
 * known and a warmer promise would be a lie. The meet-ups are named as a
 * certainty, because they run either way and are the part the reader can act
 * on this month.
 */
export function developerDecline(applicant: Applicant, replyTo: string): Message {
  const greeting = applicant.firstName ? `Kia ora ${applicant.firstName},` : "Kia ora,";

  return {
    subject: "Your application · Community Tech Lab",
    replyTo,
    content: {
      // Says the outcome. A preview line that only says "thank you for
      // applying" makes the reader open the email to find the no, which is a
      // small cruelty repeated across every inbox this lands in.
      preheader:
        "We are not able to offer you a place in this cohort. Thank you for the time you put into applying.",
      eyebrow: "Application outcome",
      // Not "Thank you for applying", which is the first line of the letter
      // too: as display type above its own opening sentence it reads as a
      // stutter, and in the plain-text part they are two adjacent lines saying
      // one thing. This names what the email is instead.
      heading: "Your application",
      intro: [
        greeting,
        "Thank you for applying to Community Tech Lab, and for the time you put into your application. We had a strong response, and the team has now worked through everyone who applied.",
        "Unfortunately we are not able to offer you a place in this cohort. There are three teams, and the decision came down to balancing skills across them against what the community organisations we are building for actually need. It is not a reflection on the quality of your application.",
        "If we run the programme again, I would be glad to hear from you.",
        "In the meantime you are very welcome at FLINT Queenstown and Queenstown Coders Connect events. Both are open to anyone in the local tech community and are a good way to meet people building things here. Reply to this email if you would like to come along, or if you would like to join the WhatsApp channels.",
      ],
      signoff: "Ngā mihi nui\nGiovanni Stephens\nChair, Community Tech Lab",
      // False, and it has to be: the paragraph above asks them to reply.
      unmonitored: false,
    },
  };
}

/** Where the site says the programme lives, for scripts that want to print it
 *  alongside a rendered message. */
export const OUTCOME_SITE_URL = PRODUCTION_URL;
