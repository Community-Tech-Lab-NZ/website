import type { Metadata } from "next";
import { Card } from "@/components/Card";
import { Section } from "@/components/Section";
import { SectionRule } from "@/components/SectionRule";
import { Eyebrow, Heading, Lede } from "@/components/Typography";

/* Privacy notice.
 *
 * NEW COPY, NOT FROM THE HANDOFF. Drafted to meet the collection-notice duty in
 * IPP 3 of the Privacy Act 2020: people have to be told what is collected, why,
 * who holds it, who reads it, where it goes and how to get at it.
 *
 * Written in the brand voice: NZ English, sentence case, no dashes, plain
 * language. The audience is a volunteer treasurer at a sports club, not a
 * privacy officer.
 *
 * NEEDS REVIEW by Giovanni and Startup Queenstown Lakes before launch, and
 * ideally by whoever reviews the Pilot Organisation Agreement. Two things in
 * particular need confirming, both marked below:
 *   1. Whether SQL's existing privacy policy already covers this collection.
 *   2. How someone exercises access and correction rights. The Privacy Act
 *      requires a workable route, and the site publishes no address by design.
 */

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What we collect when you apply, why we collect it, who reads it, where it is stored, and how to see or correct it.",
  alternates: { canonical: "/privacy" },
};

const SECTIONS = [
  {
    number: "01",
    title: "What we collect",
    paragraphs: [
      "If you apply as a community organisation, we collect your organisation's name, legal structure, registration number, location and rough size, the name, role, email and phone number of your main contact, and everything you write in the application itself.",
      "If you apply as a developer, we collect your name, email, where in the district you are based, which seat you are applying for, what you have shipped before, and your CV if you choose to attach one.",
      "Some of what you write may describe personal or sensitive information your organisation handles, for example client records or health information. We ask about it so the build team can plan properly. Please describe the kind of information rather than sending us actual records.",
    ],
  },
  {
    number: "02",
    title: "Why we collect it",
    paragraphs: [
      "To assess your application against the published criteria, to contact you about it, and to run the programme if you are selected. We do not use it for anything else, and we do not sell it or pass it to anyone outside the programme.",
    ],
  },
  {
    number: "03",
    title: "Who holds it and who reads it",
    paragraphs: [
      "Startup Queenstown Lakes holds this information as lead organisation and fund holder for Community Tech Lab.",
      "The selection panel reads every application. The panel is drawn from the six partner organisations and from local technology and community people. Everyone on it is bound by the same confidentiality expectations, and anyone with a conflict of interest steps out of the discussion for that application.",
    ],
  },
  {
    number: "04",
    title: "Where it is stored",
    paragraphs: [
      "Applications are stored in Google Workspace, which means the information is held on servers in the United States. That country's privacy laws are different to New Zealand's. We use it because it lets the whole panel read and score applications without extra cost to the programme.",
      "Access is limited to the people who need it: the delivery lead, the chair, and the selection panel during the assessment period.",
    ],
  },
  {
    number: "05",
    title: "How long we keep it",
    paragraphs: [
      "Applications from the 2026 round are kept until the end of 2027, so we can report to the funder, answer questions about how decisions were made, and get in touch if a future round might suit you. After that they are deleted.",
      "If you would rather we deleted yours sooner, ask and we will.",
    ],
  },
  {
    number: "06",
    title: "Seeing or correcting what we hold",
    paragraphs: [
      "Under the Privacy Act 2020 you can ask to see the personal information we hold about you, and ask us to correct it if it is wrong. There is no charge and we will respond within 20 working days.",
      "The programme does not publish an email address, so use the question form on the apply page and say what you are asking for.",
      "If you are not happy with how we handle a request, you can raise it with the Office of the Privacy Commissioner at privacy.org.nz.",
    ],
  },
  {
    number: "07",
    title: "Cookies and analytics",
    paragraphs: [
      "This site sets no cookies and runs no analytics or tracking. Fonts are served from this site rather than from Google, so visiting these pages does not tell anyone else you were here.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Section className="pb-6">
        <Eyebrow className="mb-4">Privacy</Eyebrow>
        <Heading level={1} fluid className="max-w-[var(--terms-measure)]">
          What we do with what you tell us.
        </Heading>
        <Lede className="mt-6">
          A community application asks you for a lot, including things about the people
          you serve. This is what happens to it.
        </Lede>
        <div className="mt-5">
          <Eyebrow>Last updated 27 July 2026 · applies to the 2026 round</Eyebrow>
        </div>
      </Section>

      <SectionRule variant="gold" />

      <Section>
        <div className="grid max-w-[var(--terms-measure)] gap-7">
          {SECTIONS.map((section) => (
            <section
              key={section.number}
              className="grid grid-cols-[var(--terms-number-col)_1fr] gap-5 border-t border-solid border-hairline pt-6"
            >
              <div className="font-meta text-body-sm font-bold text-fern">
                {section.number}
              </div>
              <div>
                <Heading level={3} as="h2" className="text-body-lg">
                  {section.title}
                </Heading>
                <div className="mt-4 grid gap-4">
                  {section.paragraphs.map((para, i) => (
                    <p key={i} className="max-w-measure font-sans text-body-md text-body">
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>

        <Card tone="sunk" className="mt-8 max-w-[var(--terms-measure)]">
          <Eyebrow>Before this goes live</Eyebrow>
          <p className="mt-3 max-w-measure font-sans text-body-sm text-body">
            This notice is a draft and needs sign-off from Startup Queenstown Lakes, who
            may already have a privacy policy this programme should sit under. Two details
            need confirming: how long applications are actually kept, and how someone
            makes an access or correction request given the programme publishes no email
            address. The Privacy Act requires a route that works.
          </p>
        </Card>
      </Section>
    </>
  );
}
