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

/* The intern offer, for a junior applicant who did not get a paid seat.
 *
 * NOT A DECLINE, THOUGH IT CARRIES ONE. The paid junior seats are gone and the
 * letter says so in its second sentence, but the message exists to make a real
 * offer rather than to soften a no. That ordering matters: the reader is told
 * where they stand immediately, and then given something they can actually act
 * on, rather than reading four paragraphs about an internship while still
 * wondering about the job they applied for.
 *
 * THE CONDITION IS THE POINT, NOT THE FOOTNOTE. Both recipients are in
 * Wellington and the role cannot be done from there, so the geography is stated
 * plainly and early rather than buried under the good news. The reason is given
 * — the fund exists to build capability in this district — because "you must be
 * local" without a reason reads as arbitrary, and with one it reads as a
 * constraint the sender also did not choose.
 *
 * WHAT IT PROMISES IS WHAT THE SITE PROMISES. The published role offers
 * recognition and a reference on request. It does not promise a certificate, so
 * neither does this. An offer letter that is more generous than the role
 * description is a correction someone has to make later, to someone who has by
 * then moved cities.
 *
 * TWO VARIANTS, ONE OFFER. The recipients appear to know each other, and two
 * identical letters landing side by side read as a mail merge, which makes a
 * personal offer feel like a form rejection. The terms are identical because
 * they have to be — same role, same dates, same condition — and the framing
 * differs. `variant` picks which.
 */
export type InternOfferVariant = "observation" | "practice";

export function juniorInternOffer(
  applicant: Applicant,
  replyTo: string,
  variant: InternOfferVariant,
): Message {
  const greeting = applicant.firstName ? `Kia ora ${applicant.firstName},` : "Kia ora,";

  // The offer paragraph, said two ways. Same role, same hours, same unpaid
  // terms; one leads on what you would watch, the other on what you would do.
  const offer =
    variant === "observation"
      ? "There is one option that might still work, depending on your circumstances. We have a programme intern place, which sits alongside the build teams as a learning role rather than a delivery one. It is unpaid and light touch, roughly five hours a week: sitting in on sprint ceremonies, shadowing the engineers, helping with user research and testing, and joining the closing showcase."
      : "There is one option that might still work, depending on your circumstances. We have a programme intern place alongside the build teams. It is unpaid and deliberately light, roughly five hours a week, and it is a learning role rather than a delivery one: you would be in the stand-ups, demos and retrospectives, working next to the engineers, helping with user research and testing, and at the closing showcase.";

  const closing =
    variant === "observation"
      ? "If you are in a position to be down here over that period and this still appeals, let me know and we can talk about how it would work. If not, that is completely understandable, and I would encourage you to stay in touch for future rounds."
      : "If being in the district over those weeks is realistic for you and this still appeals, reply and we can work out the details. If it is not, I completely understand, and I would be glad to hear from you when the next round comes around.";

  return {
    subject: "Community Tech Lab, junior roles and an option worth considering",
    replyTo,
    content: {
      // Leads with the answer on the paid seat, then the offer. A preview line
      // that only advertises the internship hides the decline behind it.
      preheader:
        "The junior places are filled, but there is an intern place that may still work if you can be in the district.",
      eyebrow: "Application outcome",
      heading: "Your application",
      intro: [
        greeting,
        "Thank you for applying to Community Tech Lab, and for your interest in the junior role. The junior places have now been filled, so I am not able to offer you one of those.",
        offer,
        // Kept as one paragraph. Split in two, the condition and its reason
        // drift apart and the reason starts reading like an apology for the
        // condition rather than the cause of it.
        "The one condition is that it has to be in person and local. The programme is funded by the QLDC Economic Diversification Fund, which exists to build capability and opportunity within this district, so participants need to be based here for the duration. In practice that means being in the Queenstown Lakes area from the kickoff on 12 October through to the Showcase Hui on 26 November. We are not able to run it remotely from Wellington, and I would rather say that plainly than leave it ambiguous.",
        "It comes with recognition for your involvement and a reference on request.",
        closing,
      ],
      signoff: "Ngā mihi nui\nGiovanni Stephens\nChair, Community Tech Lab",
      unmonitored: false,
    },
  };
}

/** Where the site says the programme lives, for scripts that want to print it
 *  alongside a rendered message. */
export const OUTCOME_SITE_URL = PRODUCTION_URL;
