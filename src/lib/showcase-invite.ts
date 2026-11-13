import type { Message } from "./email";
import type { EmailMeta, EmailSection } from "./email-template";
import { CHOSEN } from "./announcement";
import { CREDIT_SENTENCE, CREDIT_WALL, LIST_REASON } from "./broadcast";
import { PRODUCTION_URL } from "./site";

/* The Showcase Hui invitation, with a short progress update on each build.
 *
 * Progress is from the steering group decks of 5 Oct, 19 Oct and 2 Nov. Status
 * ratings, budget, staffing and anything still being negotiated stay out.
 * Energy comes from the wording: the brand bans exclamation marks. */

export const RSVP_URL = "https://events.humanitix.com/community-tech-lab-showcase-hui";
export const LINKEDIN_URL = "https://www.linkedin.com/company/community-tech-lab-qt/";

// Asserted by the draft script, because a wrong date or time cannot be recalled.
export const HUI_WHEN = "Thursday 26 November, 5:30pm to 9pm";

// Two short paragraphs per build: the problem, then what the team made.
const PROGRESS: Record<string, string[]> = {
  "dark-sky-aurora": [
    "Volunteers take sky readings at remote sites, in the dark, and write them down by hand.",
    "Their new app works offline, glows a dim red that won't spoil anyone's night vision, and fills in the location, time and moon on its own. First real test: the new moon on 9 November.",
  ],
  "reforestation-volunteers": [
    "Every plant's story was spread across spreadsheets and typed in two or three times.",
    "Now it lives in one place, from the nursery to the hillside, with funder reports ready to send. The trust is already using it.",
  ],
  "mtb-ridgeline": [
    "Every jump and drop on more than 100 km of trail now has to be audited against national guidelines.",
    "The club's new phone app records each feature with photos and checks it against its grade on the spot, no handbook needed. Members are taking it out for a full audit this week.",
  ],
};

// Same names and photographs as the announcement and the /builds page.
const BUILDS: EmailSection[] = CHOSEN.map((build) => {
  const paragraphs = PROGRESS[build.slug];
  if (!paragraphs) throw new Error(`No progress written for ${build.slug}`);
  return { label: build.name, paragraphs, image: build.image };
});

export const HUI: EmailMeta[] = [
  { label: "When", value: HUI_WHEN },
  { label: "Where", value: "Queenstown Resort College, 7 Coronation Drive, Queenstown" },
];

export function showcaseInviteBroadcast(listReason: string = LIST_REASON.showcase): Message {
  return {
    subject: "You're invited to the Community Tech Lab Showcase Hui, 26 November",
    replyTo: "stephens.giovanni@gmail.com",
    content: {
      preheader: `Three community builds, demonstrated live at QRC. Places are limited.`,
      eyebrow: "Showcase Hui, join us on 26 November",
      heading: "Three builds. One night.",
      lede: `Since 12 October, three teams of local developers have been building for three Queenstown Lakes community organisations. On [Thursday 26 November](${RSVP_URL}) they show you what they made.`,
      intro: [
        "Kia ora koutou,",
        "Five weeks of building is nearly done, and there is a lot to show.",
      ],
      sections: [
        // First, so the button is near the top rather than under three builds.
        {
          label: "You're invited",
          paragraphs: [
            "Each team demonstrates what it built, alongside the organisation it built it for, and we'll share a few recognitions along the way. Then it's good chats, snacks and drinks with the district's tech and community crowd. FLINT Queenstown is hosting it as its Q4 event, and a photographer will be there to capture the night.",
            "There is limited capacity, so grab your place now.",
          ],
          meta: HUI,
          metaLabelsFirst: true,
          cta: { label: "Save your place on Humanitix", href: RSVP_URL },
        },
        ...BUILDS,
        {
          label: "Follow along",
          paragraphs: [
            "Everything we build is open source, for any organisation to pick up. Follow us on LinkedIn for the stories behind each build and photos from the night.",
          ],
          // A meta row, not an inline link, because the text part drops inline URLs.
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
      // replyTo is a real mailbox, and the footer offers replying as an unsubscribe route.
      unmonitored: false,
    },
  };
}
