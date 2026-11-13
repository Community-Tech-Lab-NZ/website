import type { Message } from "./email";
import type { EmailImage, EmailSection } from "./email-template";
import { CHOSEN } from "./announcement";
import { CREDIT_SENTENCE, CREDIT_WALL, LIST_REASON } from "./broadcast";
import { HUI, LINKEDIN_URL, RSVP_URL } from "./showcase-invite";
import { PRODUCTION_URL } from "./site";

/* The Showcase Hui reminder, sent to every list in the final week of building.
 *
 * Most of this audience has not heard from us since September, so it says what
 * Community Tech Lab is. "Build" is a verb only: the readers are not developers.
 * There is room left, but the copy says so as an invitation, not as a shortfall. */

const PHOTOS = `${PRODUCTION_URL}/images/email`;

const photo = (file: string, alt: string, credit?: string): EmailImage => ({
  src: `${PHOTOS}/${file}.jpg`,
  alt,
  w: 536,
  h: 357,
  ...(credit ? { credit } : {}),
});

// Same alt text as scripts/build-email-photos.mjs.
const WORK: Record<string, { paragraphs: string[]; image: EmailImage }> = {
  "dark-sky-aurora": {
    paragraphs: [
      "Volunteers take sky readings at remote sites, in the dark, and until now they wrote them down by hand. Their new app works offline, glows a dim red that won't spoil anyone's night vision, and fills in the location, time and moon on its own.",
    ],
    image: photo(
      "reminder-dark-sky",
      "A volunteer holding two sky meters up under the Milky Way, mountains dark on the horizon",
      // Giovanni's best guess, 13 November: the sanctuary's photographer, not confirmed.
      "Corrine Davis",
    ),
  },
  "reforestation-volunteers": {
    paragraphs: [
      // Figures from the trust's own dashboard, cleared with the trust on 13 November.
      "For the first time, the trust can see its whole planting history in one place: more than 140,000 recorded plants across 38 sites and 95 species, from autumn 2015 to now. Funder reports come straight out of it.",
    ],
    image: photo(
      "reminder-reforestation",
      "The trust's new planting history, showing 140,068 recorded plants across 38 sites and 95 species",
    ),
  },
  "mtb-ridgeline": {
    paragraphs: [
      "More than 100 km of trail, and every jump and drop has to be audited against national guidelines. Members now log each feature on their phone, right there on the trail, with before and after photos, and send fixes off for sign-off.",
    ],
    image: photo("reminder-mtb", "A club member in a pink helmet checking a berm on a forest trail with a phone"),
  },
};

const ORGANISATIONS: EmailSection[] = CHOSEN.map((org) => {
  const work = WORK[org.slug];
  if (!work) throw new Error(`No reminder copy written for ${org.slug}`);
  return { label: org.name, ...work };
});

export function showcaseReminderBroadcast(listReason: string = LIST_REASON.showcaseReminder): Message {
  return {
    subject: "Community Tech Lab Showcase Hui: Come see what the teams made",
    replyTo: "stephens.giovanni@gmail.com",
    content: {
      preheader: "Thursday 26 November at QRC. Three new tools for local community organisations, shown live.",
      eyebrow: "Showcase Hui, Thursday 26 November",
      heading: "Five weeks of work. One night to see it.",
      lede: `Five weeks ago, three teams of local developers started building for three Queenstown Lakes community organisations. This week they're putting on the final touches, and on [Thursday 26 November](${RSVP_URL}) they show you what they made.`,
      intro: [
        "Kia ora koutou,",
        "That went fast! Right now the teams are putting the last pieces in place, switching everything on, and working side by side with the organisations they made it for. It's the first time the district has done anything like this, and there's a lot to celebrate.",
        "New to us? Community Tech Lab brings local developers and community organisations together to build software the organisations couldn't otherwise afford.",
      ],
      sections: [
        {
          label: "Final week",
          image: photo(
            "reminder-team",
            "A developer talking through the work with two people from the organisation, at a desk of screens",
          ),
          paragraphs: [
            "Next comes the handover. Each organisation takes over what was made for it, with training for the people who'll use it every day and six weeks of bug fixes after that. The Showcase Hui lands just as the work goes into real use.",
          ],
        },
        {
          label: "Come and celebrate with us",
          paragraphs: [
            "This is where it all comes together. Each team demonstrates what it built, alongside the organisation it built it for. Then we celebrate: good chats, food, beers and wines with the district's tech and community crowd. FLINT Queenstown is hosting it as its Q4 event.",
            "There's still room, so bring a colleague, or someone from an organisation that could use one of these tools next. Grab your place so we get the food and drinks right. Already have your ticket? Thank you, see you there.",
          ],
          meta: HUI,
          metaLabelsFirst: true,
          cta: { label: "Save your place on Humanitix", href: RSVP_URL },
        },
        ...ORGANISATIONS,
        {
          label: "Follow along",
          paragraphs: ["Follow us on LinkedIn for the stories behind each one and photos from the night."],
          meta: [
            {
              label: "LinkedIn",
              value: LINKEDIN_URL,
              href: LINKEDIN_URL,
              display: "Follow Community Tech Lab",
              icon: `${PRODUCTION_URL}/images/email/linkedin.png`,
            },
          ],
        },
      ],
      outro: [CREDIT_SENTENCE],
      signoff: "Ngā mihi\nGiovanni Stephens\nChair, Community Tech Lab",
      logos: CREDIT_WALL,
      cta: { label: "Save my place", href: RSVP_URL, gold: true },
      bulk: {
        reason: listReason,
        unsubscribeUrl: "{{{RESEND_UNSUBSCRIBE_URL}}}",
      },
      unmonitored: false,
    },
  };
}
