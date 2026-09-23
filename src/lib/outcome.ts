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
 * THE REASON IS THE FUND AND THE CRITERIA, IN THAT ORDER. The grant covered
 * three builds; sixteen organisations applied. That arithmetic comes first
 * because it reflects nothing about the applicant.
 *
 * Then three of the six criteria are named, as examples rather than as a
 * ranking. Naming the CRITERIA rather than the winners is the whole design of
 * this paragraph. It explains the decision without asking thirteen
 * organisations to measure themselves against three named others, which is
 * what "we chose X because it was more Y than yours" does however carefully it
 * is phrased.
 *
 * NO WEIGHTS AND NO TOTAL. Both were here and both came out. The percentages
 * live on /organisations and in the programme terms, which is the right place
 * for someone who wants to audit the process; inside a decline they invite the
 * reader to score their own application, and the letter cannot finish that
 * conversation. Totalling them was worse again, being arithmetic the reader
 * can do unaided.
 *
 * It does not say where any individual application scored. That is a
 * conversation, and the letter offers one.
 *
 * THE ALTERNATIVES ARE THE POINT OF THE LETTER, NOT A CONSOLATION. A scan of
 * the thirteen found that most of these problems already have good answers,
 * several of them free, and for at least one the answer is a setup change in
 * accounting software the organisation already pays for. Sending a decline
 * without that, having just had them describe the problem in detail, would be
 * sitting on the single most useful thing this programme learned about them.
 *
 * THREE EXAMPLES, AND THEY ARE WRITTEN AS EXAMPLES. This is one broadcast to
 * thirteen organisations, so every product named is read by twelve it was not
 * chosen for. The copy therefore says "the kind of thing" and gives three
 * shapes, and the specific pairing for each organisation is offered as a
 * conversation rather than asserted here. Do not turn these into
 * recommendations addressed to the reader; a reader told to use Sporty when
 * they run a food bank stops trusting the rest of the paragraph.
 *
 * NO PRICES, DELIBERATELY. The scan's figures were checked five weeks before
 * this sends, and one product in it turned out to be unavailable in New Zealand
 * after being recommended. Plan names are stable in a way numbers are not, so
 * "a free community plan" is safe where "$0 for unlimited volunteers" is a
 * hostage. The copy also says plainly that these are worth checking, which is
 * both true and the honest way to hand over research of this age.
 *
 * NO PROMISE OF A SECOND ROUND. Whether there is one is not decided, and this
 * is exactly the audience that would remember being told there would be. The
 * copy says "if", in the same words the developer decline uses.
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
      /* The answer, then the reason to keep reading.
       *
       * Both halves matter. The verdict is first because a preview line that
       * hides it makes the reader open the email to find the no. But this
       * letter now carries something they would want even having read the
       * verdict, and a preheader that stopped at "not this round" would get it
       * deleted before the useful half was seen. */
      preheader:
        "Not this round. We did find something that may solve your problem anyway, and it is often free.",
      eyebrow: "Application outcome",
      heading: "Your application",
      intro: [
        greeting,
        "Thank you for applying to Community Tech Lab, and for the time your organisation put into the application. It is a long form and we know what an hour of an evening is worth in a small team.",
        // The answer. One sentence, no "unfortunately we regret to inform".
        "We are not able to take your problem forward this round.",
        /* The arithmetic, as one thought, and the Chair's wording.
         *
         * "Unfortunately" earns its place here and nowhere else in the letter:
         * it attaches to the funding rather than to the reader, which is the
         * one place regret is about a constraint instead of about them.
         *
         * "Challenging decisions" is the Chair's and it does something the
         * earlier draft did not: it says the panel found this hard, which is
         * both true and the difference between a close call and a filter. */
        "Unfortunately, our funding from the QLDC Economic Diversification Fund covers but three builds. With 16 applications, the assessment panel had to make some challenging decisions.",
        /* The criteria, introduced and then enumerated.
         *
         * A LIST BECAUSE IT IS A LIST. Three weighted criteria read as three
         * things when they are numbered and as a long sentence when they are
         * not, and the reader deciding whether the process was fair is
         * counting them.
         *
         * The weights came out too; see the note beside the list itself. */
        "They read every application in full and scored each against six criteria, such as:",
        /* Three of the six, immediately under the colon that introduces them.
         *
         * Worded as the questions the panel was actually asking rather than as
         * the scoring matrix's own labels ("genuine need", "reuse and wider
         * application"), which are the internal names for these and read as
         * jargon to the person being told no.
         *
         * "THEY", because the Chair's sentence above has just introduced the
         * assessment panel and naming it again two lines later reads as two
         * different panels.
         *
         * NO WEIGHTS. They are published on /organisations and in the terms,
         * which is where someone who wants to audit the process should find
         * them; in a decline they invite the reader to work out their own
         * score, which is not a conversation this letter can finish.
         *
         * "SUCH AS" MEANS THESE ARE EXAMPLES, so nothing above may call them
         * the heaviest or the top three, and they take the caret marker rather
         * than numbers: a numbered list implies a ranking, which is the one
         * thing "such as" is there to avoid. If a weight is ever put back, that
         * framing has to come back with it. */
        {
          list: [
            "How much difference it would make",
            "How many other organisations in the district share the same problem",
            "Whether five weeks was honestly enough to finish something useful",
          ],
        },
        /* The reassurance, after the list rather than inside it.
         *
         * "It is not a reflection on you" is the sentence every decline
         * contains and every reader discounts, so it is paired with the thing
         * that makes it true. That was "it was a very close field", which is
         * competition vocabulary: a close field is a horse race or an election,
         * and it casts thirteen organisations as entrants who lost narrowly.
         * The whole letter says the opposite, that the constraint was three
         * builds rather than the quality of what came in.
         *
         * So it says that instead, in words anyone uses. */
        "There were more good applications than there were places, and this is not a reflection on your organisation or on the problem you brought us.",
        // "Today", not "tomorrow": this sends on the same day as the
        // announcement.
        "The three that were chosen are announced publicly later today, and you will most likely see that email as well.",
        /* The finding, said plainly.
         *
         * This opened "There is something more useful I can offer than a no",
         * which announced the paragraph instead of being it. The finding is
         * interesting on its own and does not need billing. */
        "While the panel was reading, we looked at what already exists for the problems people brought us. For most of them something does, often free, and sometimes needing no new software at all.",
        /* The examples. Written as shapes, not as advice to this reader: one
         * broadcast means every product named is read by twelve organisations
         * it was not chosen for.
         *
         * Xero leads because it is the most surprising and the only one where
         * the answer is a setup change to something already being paid for.
         * myTurn closes it because shared equipment was a shape that came up
         * more than once, across groups that look nothing like each other.
         *
         * No prices; see the note at the top of this function. */
        "A few examples, from the problems we saw more than once. Tracking what a grant commits you to, and what is left of it, is usually a chart of accounts change in Xero rather than anything new. Volunteer hours collected for funder reporting is what Zelos does, and it has a free community plan. Club membership, subscriptions and equipment records are covered by Sporty, which is free and built in New Zealand. Lending gear or tools out and getting them back is what myTurn is for.",
        /* First person, because the Chair signs the letter.
         *
         * This named him in the third person for a while, on the reasoning that
         * a reader who has never met him should know who was going to answer.
         * The signature already does that, four lines below, and a letter that
         * refers to its own author by name and title reads as though it was
         * written by somebody else on his behalf. Which, for a decline offering
         * a personal conversation, is the wrong impression entirely. */
        "Yours may well have one, and we kept notes on every application. Reply to this email and I will tell you what we found for your problem and whether it looks worth pursuing. Plans and prices move, so treat anything we point you at as a starting point to check rather than a recommendation to buy.",
        /* NOTHING ABOUT A SECOND ROUND, AND THAT IS THE POINT.
         *
         * This closed on "if we run the programme again, I would be glad to see
         * your application come back". Removed at the Chair's direction: whether
         * there is another round is not decided, and this is exactly the
         * audience that would remember being invited back. Even hedged with
         * "if", a closing line about next time sets an expectation the
         * programme may not be able to meet, and these thirteen have already
         * had one disappointment from us.
         *
         * Do not reinstate it, in any hedged form, until a second round is
         * actually funded. The letter ends on the offer above instead, which is
         * a thing that exists now. */
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
