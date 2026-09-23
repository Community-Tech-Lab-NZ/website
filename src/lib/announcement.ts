import type { Message } from "./email";
import type { EmailImage } from "./email-template";
import { CREDIT_SENTENCE, CREDIT_WALL, LIST_REASON } from "./broadcast";
import { PRODUCTION_URL } from "./site";

/* The announcement: the three chosen problems, and who brought them.
 *
 * The fourth and last broadcast of the round, to the same two lists as the
 * other three. It is the one the programme has been promising since the first
 * email in early August, and the date it names, 24 September, has been printed
 * on every page of the site and in every message since.
 *
 * WHAT IS DIFFERENT ABOUT THIS ONE, AND IT IS NOT THE PHOTOGRAPHS.
 *
 * The three earlier broadcasts asked for something. This one delivers, and that
 * inverts nearly every rule they were written under. They opened by naming the
 * programme because the reader had to place it in one line or delete it; this
 * opens by naming the three organisations, because that is the news and the
 * reader who scrolls no further should still leave with it. They carried a
 * button because they wanted an action; this one has a button to a page that is
 * the permanent record, not an ask. They counted problems rather than
 * organisations, carefully and at length. This one does both, because it can:
 * the panel has read the applications and the count is now a fact rather than a
 * forecast.
 *
 * THE COUNTING RULE IS RETIRED HERE, DELIBERATELY, AND ONLY HERE. See the top
 * of broadcast.ts for why the earlier sends never said "three organisations get
 * a tool": how many organisations each chosen problem covered was unknown, and
 * promising a number nobody could keep was the failure mode. That uncertainty
 * is resolved. Three problems were chosen, they came from three named
 * organisations, and saying so now is reporting rather than promising. What is
 * still NOT said is how many other organisations each one will end up serving,
 * because that is still unknown and is still the thing reuse weighting was
 * betting on. "Every one of them is a problem other groups in the district
 * share" is as far as the evidence goes, and it is as far as the copy goes.
 *
 * IT DESCRIBES PROBLEMS, NOT SOLUTIONS, AND THAT IS A PROMISE NOT A HEDGE.
 * Discovery runs 28 September to 9 October, and an email cannot be corrected
 * after it has gone to seven hundred and sixty three people. So each
 * organisation gets its problem in its own terms, the concrete detail that made
 * the panel pick it, and then the copy says plainly that the detail of what
 * gets made is worked out with them over the fortnight from the 28th. A reader
 * who wants to know what the thing will be is told when that will be known,
 * which is the honest answer and also the reason to open the next email.
 *
 * THAT IS NOT THE SAME AS KNOWING NOTHING, and an earlier draft got this wrong
 * by saying nobody knows yet what gets built. The panel scored these three
 * partly on whether five weeks was enough, which is not a judgement anyone can
 * make without a view of what each would take. There is a shape for each one;
 * what is open is the detail, and the detail is settled with the organisation
 * rather than for it. The copy now says exactly that and still names no
 * feature, because a shape cannot be quoted back at the delivery team in
 * October and a feature can.
 *
 * Writing it the other way was the tempting draft and it was a trap: "a phone
 * app that syncs readings to a shared dataset" is a lovely sentence to write in
 * September and a rod for the delivery team's back in October, when discovery
 * turns up the reason it should be something else.
 *
 * THE UNSUCCESSFUL APPLICANTS READ THIS TOO. Some of them are on these lists,
 * and every one of them was told the three builds would be announced today, so
 * the message cannot read as a victory lap over their heads.
 *
 * It carried a "What happens to the rest" section for exactly that, and that
 * section was removed on 23 September at the Chair's direction: the individual
 * replies to unsuccessful applicants carry it instead, and saying it twice made
 * the announcement read as half apology. What still holds the line here is the
 * thanks in the opening paragraph, which is why it comes before the news rather
 * than after it, and the absence of any word like "winners". Nobody won
 * anything; three problems fitted a five-week build and a great many did not.
 *
 * If a future round restores the section, restore it as its own labelled
 * section rather than a clause bolted onto the outro. A sentence about the
 * people who were not chosen, buried in a paragraph asking readers to forward
 * the email, is worse than not saying it.
 *
 * NO CONGRATULATIONS, NO EXCLAMATION MARKS, NO "WE ARE THRILLED". The brand
 * guide bans the exclamation mark outright and the register is plain
 * throughout. It is also, on its own terms, the right call: the three
 * organisations have not received a prize, they have agreed to give a person
 * for one to two hours a week for five weeks.
 */

/* Always the production domain, never SITE_URL, for the same reason the logo
 * wall uses it: an email is read in an inbox where a preview URL resolves to
 * nothing. */
const PHOTOS = `${PRODUCTION_URL}/images/email`;

/** The permanent record. The email is the announcement; this is where it lives
 *  afterwards, for the reader who hears about it in November. */
export const BUILDS_PATH = "/builds";

/* The three, in the order the email prints them.
 *
 * THE ORDER IS NOT A RANKING and is not the panel's scoring order. It runs
 * Glenorchy, then the nursery, then the trails, which is roughly geographic and
 * entirely arbitrary, and the copy never numbers them. A numbered list of three
 * organisations invites the reader to work out which came first, which is a
 * question the panel's scoring answers and this email must not.
 *
 * Exported because the /builds page renders the same three from the same
 * source. Two copies of this would be two places for a name to be misspelled
 * and one of them to be missed, and the name of a community organisation in the
 * email announcing it is exactly the wrong thing to get wrong.
 *
 * WHAT EACH ENTRY OWES THE READER. `who` places the organisation for someone
 * who has never heard of it, in one sentence, with the detail that makes it
 * real rather than generic: the certification and the area, the fourteen years
 * and the plant count, the membership and the kilometres. `problem` is the
 * problem as the organisation described it, kept concrete. Not "inefficient
 * data management": readings written down by hand and typed into a spreadsheet
 * held by one person. The concrete version is the one that makes another
 * organisation in the district recognise itself, which is the whole reason the
 * section exists. */
export type ChosenBuild = {
  /** The organisation, exactly as it writes its own name. Macrons correct. */
  name: string;
  /** The photograph's filename, without extension or directory.
   *
   *  The email points at the 536px JPEG and the site at the 1120px pair, both
   *  built from the same source by scripts/build-email-photos.mjs and both
   *  named for this. One field rather than two URLs, so the two surfaces cannot
   *  end up showing different photographs of the same organisation. */
  slug: string;
  /** Where they are, for the reader placing them on a map. */
  place: string;
  /** Who they are, in a sentence. */
  who: string;
  /** The problem, in their terms, concrete. */
  problem: string;
  /** The problem in one line, for the home page cards. Site only. */
  short: string;
  /** The organisation's own website, checked live 23 September. Site only. */
  url?: string;
  /** The photograph, and the words for the reader who cannot see it. */
  image: EmailImage;
};

export const CHOSEN: ChosenBuild[] = [
  {
    name: "Tāhuna Glenorchy Dark Sky Sanctuary",
    slug: "dark-sky-aurora",
    url: "https://glenorchydarkskies.org.nz/",
    short: "Sky readings taken by hand, two people at a time, and typed into one person's spreadsheet.",
    place: "Glenorchy",
    // The certification is the fact that does the work here: it is recent, it
    // is external, and it is why the monitoring matters rather than being a
    // hobby. The area is in the application and is worth printing because
    // 2,150 square kilometres is not a number anyone guesses.
    who: "A subgroup of the Glenorchy Heritage and Museum Group, certified by DarkSky International in February this year, covering about 2,150 square kilometres at the head of Lake Whakatipu.",
    problem:
      "Keeping the certification means measuring how dark the sky actually is. Meter readings are taken at fixed sites, four compass points at a time, written down by hand, and typed up later into a spreadsheet that lives with one person. It takes two people every time.",
    image: {
      src: `${PHOTOS}/dark-sky-aurora.jpg`,
      alt: "An aurora over the mountains at the head of Lake Whakatipu, pink columns rising into a green sky",
      w: 536,
      h: 357,
      credit: "Corrine Davis",
    },
  },
  {
    name: "Whakatipu Reforestation Trust",
    slug: "reforestation-volunteers",
    url: "https://wrtqt.org.nz/",
    short: "Seed, nursery, planting and survival records in Excel files that cannot talk to each other.",
    place: "Kelvin Heights",
    who: "A volunteer powered trust running the Jean Malpas nursery since 2013, growing around 10,000 native plants a year and putting more than 140,000 into the ground across some 70 sites since 2015.",
    // "Cannot talk to each other" is the trust's own phrase and it is better
    // than anything that would replace it. The point is not that spreadsheets
    // are bad, it is that the seed, the seedling, the planting and the survival
    // are four records of one plant kept in four places.
    /* "Since the trust started", not "fourteen years".
     *
     * The application said fourteen years of records and the trust was founded
     * in 2013, which is thirteen. The discrepancy is probably a season counted
     * inclusively, or records that predate the trust itself, and either way it
     * is not worth being wrong about in public over: the sentence works without
     * a number, and a community organisation reading its own founding date
     * miscounted in the email announcing it is a bad first impression. Put the
     * figure back if someone confirms it. */
    problem:
      "Every record the trust has, covering seed collection, the nursery stages, where things were planted and what survived, sits in Excel files that cannot talk to each other. The question it most wants to answer, whether what it planted is still alive, is the hardest one to ask.",
    image: {
      src: `${PHOTOS}/reforestation-volunteers.jpg`,
      alt: "Volunteers potting up seedlings at the Jean Malpas nursery, in low winter sun",
      w: 536,
      h: 357,
    },
  },
  {
    name: "Queenstown Mountain Bike Club",
    slug: "mtb-ridgeline",
    url: "https://www.queenstownmtb.co.nz/",
    short: "Trail audits and feature inspections noted on the trail, then typed up again afterwards.",
    place: "Queenstown",
    who: "The district's largest club, formed in 2003, with more than 2,000 members and over 100 kilometres of trails kept up largely by volunteers.",
    // The new national guidelines are the reason this became urgent this year
    // rather than any year, and that is worth a clause: it explains why a club
    // that has managed for twenty-two years needs something now.
    problem:
      "New national trail guidelines introduced this year require regular audits. At the moment an audit is notes and photos taken on the trail and typed up afterwards into a Word template, and the annual inspection of every wooden trail feature runs the same way through a spreadsheet.",
    image: {
      src: `${PHOTOS}/mtb-ridgeline.jpg`,
      alt: "Three mountain bikers on a tussock ridgeline above Lake Whakatipu at sunrise",
      w: 536,
      h: 357,
    },
  },
];

/* What happens next, as dates.
 *
 * DELIBERATELY NOT `KEY_DATES` FROM broadcast.ts, and not the site's TIMELINE
 * either. Those are the whole programme from applications onward, and three of
 * their six rows are now in the past. A table whose top half is history is a
 * table that makes today's news look like one row of admin.
 *
 * So this is the future only, from the fortnight that starts on Monday. Four
 * rows, every one of them ahead of the reader. The wording follows broadcast.ts
 * rather than navigation.ts for the reason set out there: the site says "build"
 * as a noun and this audience is not sold to in delivery vocabulary. */
const WHAT_HAPPENS_NEXT = [
  /* "Designing" here, not "working out exactly what gets made", which is the
   * wording the three earlier broadcasts and navigation.ts use for the same
   * fortnight.
   *
   * Deliberately diverged rather than changed everywhere. The paragraph above
   * this table now says the solutions have yet to be designed, and a row
   * underneath calling the same fortnight something else reads as two
   * descriptions of two activities. The sent broadcasts keep their wording
   * because they are history and cannot be edited anyway. */
  { label: "Designing each solution, with the organisation", value: "28 September to 9 October" },
  { label: "Building it, with something to try each week", value: "12 October to 13 November" },
  { label: "Handover, with training and written instructions", value: "From 13 November" },
  { label: "Showcase Hui, where all three are demonstrated", value: "26 November" },
];

/**
 * The announcement broadcast.
 *
 * Takes the list reason for the same reason every other broadcast does: the
 * body is identical for both audiences and only the provenance line in the
 * footer differs, so one function with a parameter keeps them from drifting.
 *
 * UNLIKE THE OTHER THREE, THIS ONE HAS NO WINDOW GUARD. The applications-open
 * and final-call messages throw outside their window because every line of them
 * points at a form that would not take the reader. Nothing here points at a
 * form. This is a statement of fact about what was chosen, and it stays true
 * next month and next year, which is also why it is the one broadcast whose
 * content is worth keeping on the site afterwards.
 */
export function announcementBroadcast(
  listReason: string = LIST_REASON.communityConnect,
): Message {
  return {
    /* The news, and nothing else in it.
     *
     * Not "The results are in", which makes the reader open an email to find
     * out what happened; not a question, which is what the launch subject was
     * and was right for an introduction to a stranger. Three organisations were
     * chosen and the subject says so. The reader who never opens this has still
     * been told the programme did what it said it would.
     *
     * "Chosen", not "selected" or "successful". Plain word, and it does not
     * carry the competition framing the rest of the email avoids. */
    subject: "The three chosen problems",
    replyTo: "stephens.giovanni@gmail.com",
    content: {
      // Names all three in the preview line. It is the one place the reader
      // sees before deciding to open, and three recognisable local names do
      // more than any sentence about the programme could.
      preheader:
        "Tāhuna Glenorchy Dark Sky Sanctuary, Whakatipu Reforestation Trust and Queenstown Mountain Bike Club.",
      eyebrow: "Announced 24 September",
      // Five words, per the brand guide's cap on headlines. The lede carries
      // who and what.
      heading: "The three are chosen.",
      lede: "**Community Tech Lab** pairs local software developers with community organisations across the Queenstown Lakes district. Three problems were chosen from the applications, and the work starts on Monday.",
      intro: [
        "Kia ora koutou,",
        // The thanks comes before the news, and it is one sentence rather than
        // a paragraph. Every organisation that applied gave up an evening on a
        // form, and a good number of them are reading this having not been
        // chosen. Opening on the three names without acknowledging that is the
        // version of this email that makes people unsubscribe.
        "Thank you to every organisation that applied. A local panel read all of them between 1 and 18 September, and the three problems below are the ones going to a build.",
        // Says what the panel was actually weighing, briefly, because the
        // reader who was not chosen is owed the reason and the reader who was
        // is owed the knowledge that it was not a raffle.
        "They were chosen on how much difference it would make, whether other organisations in the district have the same problem, and whether five weeks is honestly enough to do something useful about it.",
      ],
      sections: [
        ...CHOSEN.map((build) => ({
          // The organisation's name IS the section label, in Space Mono caps
          // like every other eyebrow. The macron on Tāhuna survives
          // text-transform; this was checked rather than assumed.
          label: build.name,
          paragraphs: [build.who, build.problem],
          image: build.image,
        })),
        {
          label: "What happens now",
          paragraphs: [
            // The single most important sentence in the email for managing what
            // people expect, and it is first in its section for that reason.
            //
            // "AN IDEA OF THE SHAPE", NOT "NOBODY KNOWS". The first draft said
            // nobody knows yet what gets built, which was wrong in the
            // direction that costs most: the panel scored these three partly on
            // deliverability, which it could not have done without a view of
            // what each would take. Saying otherwise makes the programme sound
            // like it picked three problems and will work the rest out later,
            // and it tells the three organisations their build has not been
            // thought about.
            //
            // "HAS YET TO BE DESIGNED" is doing the real work, and it is the
            // Chair's wording. It puts a named activity between now and the
            // build, which is what stops "we have an idea" being read as "it is
            // basically decided". The shape is claimed, the design is not.
            //
            // NO FEATURE, NO PLATFORM, no noun that discovery could contradict.
            // A shape cannot be quoted back at the delivery team in October and
            // a feature can. Do not let a later edit trade "the shape" for an
            // example of it.
            //
            // "SOLUTION" IS THE BRAND'S COUNTABLE NOUN, per brand-guide.md:
            // three solutions, one per organisation. It is deliberately absent
            // from broadcast.ts, which was written for readers who had been
            // promised nothing and where any countable noun was a promise. That
            // reason expired when these three were chosen. "Each solution" is
            // the sanctioned use; "digital solutions for the community sector"
            // is the one the brand sheet warns against.
            "We have an idea of the shape of each solution. What each will do, and how they will work exactly, has yet to be designed. Between 28 September and 9 October each team will sit down with their organisation and work that out with them, before anything gets built.",
            "From 12 October there are five weeks of building, with something to try at the end of each week. All three are demonstrated at the Showcase Hui on 26 November, which FLINT Queenstown is running as its Q4 event.",
            // The open source line is not a footnote in this programme, per the
            // brand guide, and this is the email where it pays off: the reader
            // who was not chosen is being told the work still reaches them.
            "Everything made is open source. What gets built for these three is there for any other organisation in the district to pick up and use.",
          ],
          meta: WHAT_HAPPENS_NEXT,
        },
      ],
      /* THE CREDIT SENTENCE AND NOTHING ELSE.
       *
       * This carried a forward ask as well, which asked readers to pass the
       * email on and to reply with problems of their own for a future round.
       * Removed on 23 September at the Chair's direction.
       *
       * The second half was the part that had to go: whether there IS a second
       * round is not decided, and inviting seven hundred people to describe a
       * problem into an inbox that may never be able to do anything with it
       * spends trust the programme will want later. The first half went with it
       * rather than leave a one-line ask hanging where a paragraph had been.
       *
       * The credit line stays, because the funder credit is a condition of the
       * grant and the partner names are owed. An outro of one sentence is a
       * normal shape here: the message has already finished saying what it came
       * to say, and the last section ends on open source, which is a better
       * close than a request would have been. */
      outro: [CREDIT_SENTENCE],
      signoff: "Ngā mihi\nGiovanni Stephens\nChair, Community Tech Lab",
      logos: CREDIT_WALL,
      // The permanent record, not an ask. Every earlier broadcast's button sent
      // the reader to a form; this one sends them to the page that will still
      // be there when the builds are finished and something can be linked from
      // it.
      cta: { label: "Meet the three", href: `${PRODUCTION_URL}${BUILDS_PATH}` },
      bulk: {
        reason: listReason,
        unsubscribeUrl: "{{{RESEND_UNSUBSCRIBE_URL}}}",
      },
      /* Still false, though the copy no longer asks for a reply anywhere.
       *
       * Two paragraphs that did have been cut. What has not changed is that
       * replyTo is a real mailbox and the footer offers "reply and say so" as
       * the unsubscribe route that works when the hosted link does not, which
       * only holds if someone reads replies. Setting this true would print
       * "this address is not monitored" directly above that offer. */
      unmonitored: false,
    },
  };
}
