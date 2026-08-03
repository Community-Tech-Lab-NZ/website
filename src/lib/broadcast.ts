import { getWindowState, type WindowState } from "./application-window";
import type { Message } from "./email";
import type { EmailLogoWall } from "./email-template";
import { PRODUCTION_URL } from "./site";

/* Always the production domain, never SITE_URL. An email is read in someone
 * else's inbox, where a localhost or preview URL resolves to nothing. */
const LOGOS = `${PRODUCTION_URL}/logos/email`;

/* Broadcast mail: the same template, a different job.
 *
 * The confirmations in email.ts answer someone who has just filled in a form.
 * This goes the other way, to roughly 500 community organisations reached
 * through the Community Connect groups, none of whom asked for it and most of
 * whom have never heard the programme's name. That changes three things.
 *
 * IT HAS TO SAY WHAT IT IS BEFORE IT ASKS FOR ANYTHING. A confirmation can open
 * mid-conversation. This cannot: the first paragraph names the programme and
 * the district, because a reader who does not place it in one line deletes it.
 *
 * IT IS WRITTEN FOR THE COMMUNITY PATH, WHICH IS NOT THE DEVELOPER PATH. Two
 * things stay out on purpose.
 *
 * First, no delivery vocabulary. "The build", "five-week build", "scoped",
 * "specification" are shop-talk, and the reader is a volunteer coordinator with
 * a roster problem, not a client. `build` survives only as a verb. The thing
 * being made is "something to fix it" or "what gets made", never a countable
 * noun, which also sidesteps the tool-versus-solution disagreement between
 * brand-guide.md and the copy currently live on /organisations.
 *
 * What IS counted is problems: three problems get chosen, not three
 * organisations. The distinction is load-bearing and easy to get wrong. How
 * many organisations each one covers is not known yet and is the point of
 * weighting reuse at 20%, so the copy says several sometimes, one other times,
 * and promises no number it cannot keep.
 *
 * Second, nothing about how the developers are paid. Six paid seats and
 * community rates are true, and they are the developer path's opening move
 * because that audience is deciding whether to take work. This audience is
 * deciding whether there is a catch, and an unprompted mention of who is being
 * paid what invents one. They need one number about money, which is nil, and
 * one about time, which is one to two hours a week.
 *
 * IT IS THE DISTRICT, NOT A PROVIDER. An earlier draft read as one organisation
 * offering a service to another: you tell us, we choose, we make it, you are
 * never tied to us. Wrong relationship. Three things carry the correction.
 * Choosing is written in the passive, because "we choose" casts the sender as a
 * gatekeeper and the reader as a supplicant. The panel is named for what it is,
 * local tech and community people. And open source is put as a gift onward,
 * what gets built for one organisation can be picked up by the next, rather
 * than as protection against lock-in, which only makes sense if you assume a
 * vendor worth escaping.
 *
 * THE PARTNERS CLOSE, THEY DO NOT OPEN. Six organisation names and a council
 * fund are a credential, and a credential answers a question the reader has not
 * asked yet. Opening on it spends the first paragraph, the one that decides
 * whether any of the rest is read, on who is behind this rather than on what it
 * is and what it would mean for them. So the first paragraph is the whole offer
 * in three sentences, and the partner line sits at the end, where a reader who
 * is now interested wants to know who is actually running it.
 *
 * IT PROMISES ONE ROUND, NOT A SEASON. Nothing says "each year", "this year",
 * "the first round" or anything else implying it comes back. Whether there is a
 * second one is genuinely unknown, and a reader who decides to sit this one out
 * and catch the next has been misled by a word nobody meant to load. The
 * scarcity is real and the copy leaves it real: three problems, these dates.
 *
 * IT IS SENT BEFORE THE WINDOW OPENS, NOT DURING. Applications open on
 * 15 August, so "Apply now" would be a button that cannot do what it says. The
 * honest call to action this side of the 15th is "See what's involved", which
 * is on the approved list, and the copy's real ask is to read the questions
 * early. That is not a softer ask than applying: the form takes about an hour,
 * and the difference between a good application and an abandoned one is whether
 * the reader saw it coming.
 *
 * IT IS BULK MAIL, SO IT CARRIES WHAT BULK MAIL HAS TO. Postal address, a plain
 * statement of where the address came from, and a working unsubscribe. See
 * `EmailBulk` in email-template.ts.
 */

/* Where the addresses came from, in the reader's own terms.
 *
 * Not "you subscribed", because they did not, and a footer that opens with a
 * lie is what turns a deletion into a spam complaint. Naming the actual route
 * lets a reader place the email in about four words. */
const LIST_REASON =
  "You are receiving this because your organisation is listed with a Community Connect group in the Queenstown Lakes district.";

/* The partner and funder marks, closing the message.
 *
 * The names are already in the outro, and this says the same thing again in
 * the district's own visual shorthand. Both are needed. A reader who has never
 * heard of the programme is deciding whether it is real, and recognising QRC
 * and Technology Queenstown does that in a glance; a reader whose client blocks
 * images, which is most of Outlook, gets the alt text and the sentence.
 *
 * ORDER MATCHES src/components/PartnerRow.tsx, which is the site's own order.
 * Startup Queenstown Lakes leads the programme and holds the fund and so comes
 * first, but the handoff is explicit that this may be said in words and must
 * never be shown as a bigger logo. Every mark here is sized on the same rules.
 *
 * NOT LINKED, unlike the site's wall. This message has one thing it wants a
 * reader to do, and six outbound links to other organisations sitting under
 * the signature compete with it. Their sites are one search away.
 *
 * The files are built by scripts/build-email-logos.mjs, which is also where the
 * widths and heights below come from. Do not hand-edit them: they are the
 * generated files' real dimensions at 1x, and a wrong pair here is a mark that
 * arrives stretched. */
const CREDIT_WALL = {
  label: "Delivered with",
  logos: [
    { src: `${LOGOS}/partner-startup-queenstown-lakes.png`, alt: "Startup Queenstown Lakes", w: 134, h: 56 },
    { src: `${LOGOS}/partner-queenstown-coders-connect.png`, alt: "Queenstown Coders Connect", w: 232, h: 56 },
    { src: `${LOGOS}/partner-flint-queenstown.png`, alt: "FLINT Queenstown", w: 56, h: 56 },
    { src: `${LOGOS}/partner-queenstown-resort-college.png`, alt: "Queenstown Resort College", w: 56, h: 56 },
    { src: `${LOGOS}/partner-huddl.png`, alt: "huddl", w: 128, h: 56 },
    { src: `${LOGOS}/partner-technology-queenstown.png`, alt: "Technology Queenstown", w: 200, h: 39 },
  ],
  funder: {
    label: "Funded by",
    logo: {
      src: `${LOGOS}/funder-economic-futures.png`,
      // The mark is the combined Economic Futures and QLDC lockup, so the alt
      // names both organisations and adds the fund, which the mark does not
      // carry and the credit requirement is actually about.
      alt: "Economic Futures, Queenstown Lakes District Council: the QLDC Economic Diversification Fund",
      w: 299,
      h: 64,
    },
  },
} satisfies EmailLogoWall;

/* The launch broadcast.
 *
 * Takes the window state rather than assuming one. The send date is not fixed
 * yet and the list is still being assembled, so this can plausibly go out
 * either side of 15 August, and the difference is not cosmetic: before the
 * 15th the only honest instruction is to read the questions, and on the 15th it
 * becomes apply. Hard-coding either one means the day it slips is the day 500
 * organisations get a button that cannot do what it says. */
export function communityLaunchBroadcast(state: WindowState = getWindowState()): Message {
  const open = state === "open";

  if (state === "closed") {
    // Not a state this message has. A launch broadcast after applications shut
    // sends people to a form that will not take them, so the caller has picked
    // the wrong email rather than the wrong wording.
    console.warn(
      "[broadcast] Applications have closed. The launch broadcast must not be sent now.",
    );
  }

  return {
    // Deliberately does not name a KIND of problem. "What slows your
    // organisation down" framed the whole programme as time-saving, which
    // quietly rules out the organisation that cannot do a thing at all, or can
    // only do it badly, or cannot show a funder what it achieved. Same failure
    // the brand guide warns about for category lists: it narrows what people
    // think they are allowed to ask for. An open question narrows nothing.
    subject: "What would your organisation fix, if it could?",
    replyTo: "stephens.giovanni@gmail.com",
    content: {
      preheader: open
        ? "Local developers will build it, at no cost. Applications close 31 August."
        : "Local developers will build it, at no cost. Applications open 15 to 31 August.",
      eyebrow: open ? "Applications close 31 August" : "Applications open 15 to 31 August",
      // The offer and the promise in one line, which is what a reader who gets
      // no further than the headline should still walk away with.
      heading: "Tell us a problem, we'll fix it.",
      // Carries what the headline cannot: whose promise it is, who does the
      // work, and the price. The brand name leads and is set in Archivo so it
      // reads as the masthead rather than as another noun in a sentence.
      //
      // "Software developers", not "developers": in this sector development
      // means fundraising, and to everyone else it means houses.
      lede: "**Community Tech Lab** pairs local software developers with community organisations across the Queenstown Lakes district. No cost to you.",
      // A greeting on its own butts straight up against the first section rule
      // and reads as though a paragraph went missing. This is the line it needs
      // to be a greeting to, and it does a different job from the lede: that
      // one says what the programme is, this one says there is a door open.
      intro: [
        "Kia ora koutou,",
        "Something new is starting in the district, and your organisation can be part of it.",
      ],
      sections: [
        {
          label: "Why it exists",
          paragraphs: [
            "Hundreds of community organisations across this district run on spreadsheets, shared inboxes and someone ringing round. Software is what gets skipped, because the budget goes to the mahi and paying someone to build software is out of the question.",
            "At the same time, there are more software developers living here than most people realise. Many work remotely for companies elsewhere, and have room in their week they would rather give to something local.",
            "Two problems that happen to be each other's answer. Nothing was connecting them. That is what this is.",
          ],
        },
        {
          label: "What counts as a problem",
          paragraphs: [
            "Anything that gets in the way of the work you do. It might be something that eats hours every week, something you cannot do at all, or something you can only do badly.",
            "You do not need to know what the answer looks like. Describing the problem is the whole job.",
          ],
        },
        {
          label: "How it works",
          paragraphs: [
            "A panel of local tech and community people reads every application. Problems that more than one group shares rise to the top, so that what gets made can help several organisations at once. Sometimes that will be a few, sometimes just one.",
            "Three get chosen. A small team of local developers spends five weeks building something to fix each one, and you see it taking shape every week.",
          ],
        },
        {
          label: "What it asks of you",
          paragraphs: [
            "One person to talk to, for about one to two hours a week over those five weeks. That is the whole ask.",
            "No technical knowledge needed. Nothing formal to write. No cost, now or later.",
          ],
        },
        {
          label: "What you keep",
          paragraphs: [
            "Everything made in the programme is open source. The code belongs to everyone, so what gets built for one organisation here can be picked up and reused by the next.",
          ],
        },
        {
          label: "Key dates",
          paragraphs: [
            open
              ? "Applications are open now and close on 31 August. The form is long, so give yourself a decent run at it rather than starting on the last night."
              : "Applications open on 15 August and close on 31 August. The form is long, and you can read every question today. Looking through it before the 15th makes a real difference.",
          ],
          meta: [
            { label: "Applications open", value: "15 to 31 August" },
            { label: "A local panel reads every application", value: "1 to 18 September" },
            { label: "The three chosen problems are announced", value: "24 September" },
            { label: "Working out exactly what gets made", value: "28 September to 9 October" },
            { label: "Building it, with something to try each week", value: "12 October to 13 November" },
            { label: "Showcase Hui", value: "26 November" },
          ],
        },
        {
          label: "Who can apply",
          paragraphs: [
            "Not-for-profits, registered charities, marae, sports clubs, community groups and incorporated societies based in the Queenstown Lakes district. Businesses can apply where what gets made serves the community rather than commercial gain.",
          ],
        },
      ],
      outro: [
        "Applying commits you to nothing. If you are not sure whether your organisation fits, reply to this email and ask.",
        // Two sentences, not one. As a single sentence this ran to 45 words and
        // was the hardest thing in the email to read, six proper nouns deep
        // before the funder even arrives.
        "**Community Tech Lab** is run by six local organisations working together: Startup Queenstown Lakes, Queenstown Coders Connect, FLINT Queenstown, Queenstown Resort College, huddl and Technology Queenstown. It is paid for by a grant from the Queenstown Lakes District Council Economic Diversification Fund.",
      ],
      // Title per the About page, which lists Giovanni as Chair and Dr Pradeesh
      // Parameswaran as delivery lead.
      signoff: "Ngā mihi\nGiovanni Stephens\nChair, Community Tech Lab",
      logos: CREDIT_WALL,
      cta: open
        ? { label: "Apply now", href: `${PRODUCTION_URL}/apply` }
        : { label: "See what's involved", href: `${PRODUCTION_URL}/organisations` },
      bulk: {
        reason: LIST_REASON,
        // No postal address, by decision. Startup Queenstown Lakes does not
        // publish one, and it is on neither the Charities Register nor the
        // Companies Register under that name, so nothing here could be verified
        // rather than copied off a data broker. The Act asks for accurate
        // sender information and a way to make contact: the footer names the
        // programme and the lead organisation, the signature names a person,
        // and replies reach a real inbox. Do not reinstate a guess.
        // Resend substitutes this per recipient when the broadcast sends. Left
        // as the literal placeholder so the preview shows exactly what ships.
        unsubscribeUrl: "{{{RESEND_UNSUBSCRIBE_URL}}}",
      },
      // There is a reply-to now, so the "do not reply" line must not appear:
      // this email asks a question and invites an answer.
      unmonitored: false,
    },
  };
}
