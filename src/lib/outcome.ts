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

/* The decline, for the community path.
 *
 * Thirteen organisations applied and were not chosen. This is the reply every
 * confirmation promised them, and it goes out BEFORE the public announcement,
 * which is the whole reason it exists as its own message rather than being left
 * to the announcement to deliver. Finding out from a mailout to seven hundred
 * people that you were not chosen, when you were told you would hear directly,
 * is the one outcome this round could still get wrong.
 *
 * WHY IT IS A BROADCAST AND NOT THIRTEEN TRANSACTIONAL LETTERS, which is how
 * the developer declines above were sent. It is one message going to thirteen
 * addresses at one moment, and a broadcast is the only path in this repo that
 * ends at a button in the dashboard rather than an API call. Thirteen separate
 * sends is thirteen chances to send twelve. The cost is the bulk footer, which
 * is the honest trade: these addresses came off application forms, so the
 * provenance line is short and true, and an unsubscribe on a message that may
 * be followed by news of a second round is a courtesy rather than an intrusion.
 *
 * THE GREETING IS A MERGE TAG, and that is not a cosmetic choice. A generic
 * "Kia ora koutou" on a message telling someone their application failed reads
 * as a circular, and a circular is what this must not be. Resend substitutes
 * `{{{contact.first_name|...}}}` per recipient at send time, so each of the
 * thirteen opens with their own name. The fallback after the pipe is what makes
 * it safe: a contact with no first name gets a sentence that still reads, not
 * "Kia ora ,". Both halves are checked by the draft script.
 *
 * WHAT IT SAYS, IN THE ORDER THE DEVELOPER DECLINE SAYS IT. Thanks, then the
 * answer, then the reason, then what happens next. The reader knows what this
 * is from the subject line and skims for the verdict, so making them hunt for
 * it reads as cowardice.
 *
 * THE REASON IS CAPACITY, AND IT IS TRUE. Three builds were funded and sixteen
 * organisations applied. That is the whole explanation, it reflects nothing
 * about the applicant, and being true is what lets it be said in one sentence
 * without hedging. It deliberately does NOT say their problem was too big or
 * not reusable enough: the panel scored on six weighted criteria and a
 * one-line paraphrase of a scoring matrix is a judgement the sender would then
 * have to defend, organisation by organisation, to people who are welcome to
 * ask. What is offered instead is a real conversation, below.
 *
 * NO PROMISE OF A SECOND ROUND. Whether there is one is not decided, and this
 * is exactly the audience that would remember being told there would be. The
 * copy says "if", in the same words the developer decline uses, and puts the
 * thing that IS certain, the open source code, next to it.
 *
 * NO CALL TO ACTION BUTTON, same rule as the developer decline. A decline with
 * a button is asking the reader to do something on their way out. */
export function communityDecline(replyTo: string): Message {
  /* The greeting, per recipient, with a fallback that is a real greeting.
   *
   * "there" is what Resend's own documentation uses as the example fallback and
   * it is wrong here: "Kia ora there" is the register of a marketing email, and
   * this is not one. The fallback is the plural greeting instead, which is
   * correct te reo for addressing an organisation and reads as deliberate
   * rather than as a failed substitution. */
  const greeting = "Kia ora {{{contact.first_name|koutou}}},";

  return {
    // Names the programme and the subject without previewing the verdict in the
    // subject line itself. The preheader carries the answer, because a reader
    // should not have to open this to learn what it says, but a subject line
    // reading "You were not successful" is a thing they see in a notification
    // on a phone at work, next to nothing that softens it.
    subject: "Your application · Community Tech Lab",
    replyTo,
    content: {
      // The answer, before the email is opened. Same reasoning as the developer
      // decline: a preview line that only thanks them makes the reader open the
      // email to find the no.
      preheader:
        "We are not able to take your problem forward this round. Thank you for the time you put into applying.",
      eyebrow: "Application outcome",
      heading: "Your application",
      intro: [
        greeting,
        "Thank you for applying to Community Tech Lab, and for the time your organisation put into the application. It is a long form and we know what an hour of an evening is worth in a small team.",
        // The answer. One sentence, no "unfortunately we regret to inform".
        "We are not able to take your problem forward this round.",
        // The reason, which is arithmetic rather than a judgement.
        "Sixteen organisations applied and three builds were funded. A local panel read every application in full, and the decision came down to what three teams could honestly finish in five weeks. It is not a reflection on your organisation or on the problem you brought us.",
        // Said plainly, because they are about to see it. This is the sentence
        // that makes the sequencing legible rather than odd.
        "The three that were chosen are announced publicly tomorrow, and you will most likely see that email as well. We wanted you to hear this from us first.",
        /* The open offer. Deliberately specific about what it is: a
         * conversation with a person, not a review or an appeal.
         *
         * An earlier draft ended "that offer is genuine and it stays open".
         * brand-guide.md bans "genuinely" for protesting too much, and the
         * objection holds for "genuine" doing the same job here: an offer that
         * has to assert its own sincerity invites the reader to wonder. Naming
         * who answers and saying there is no deadline is the version that
         * actually reassures. */
        "If you would like to know how your application was read, reply to this email and I will talk you through it. There is no deadline on that, and it is me who answers.",
        // What they get regardless. This is the one concrete thing that is true
        // for every organisation that did not get a build, and it is the reason
        // open source is in the brand guide rather than in a footnote.
        "Everything built in this round is released open source. If what gets made for one of the three turns out to be close to what you needed, it is yours to take and adapt, and we will tell you when each one is finished.",
        "If we run the programme again, I would be glad to see your application come back.",
      ],
      signoff: "Ngā mihi nui\nGiovanni Stephens\nChair, Community Tech Lab",
      /* Bulk, because it is a broadcast. See the note above on the trade.
       *
       * The provenance line is the shortest one in this repo and the most
       * clearly true: they filled in a form and gave us the address on it. The
       * reason field exists so bulk mail never has to pretend someone
       * subscribed, and here there is nothing to pretend about. */
      bulk: {
        reason:
          "You are receiving this because your organisation applied to Community Tech Lab in August, and gave this address on the application form.",
        unsubscribeUrl: "{{{RESEND_UNSUBSCRIBE_URL}}}",
      },
      // The letter asks them to reply, twice. Must not claim otherwise.
      unmonitored: false,
    },
  };
}

/** Where the site says the programme lives, for scripts that want to print it
 *  alongside a rendered message. */
export const OUTCOME_SITE_URL = PRODUCTION_URL;
