import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { CaretList } from "@/components/CaretList";
import { ClosingCta } from "@/components/ClosingCta";
import { KeyDatesCard } from "@/components/KeyDatesCard";
import { Reveal } from "@/components/Reveal";
import { ScoringTable, SCORING_ORGANISATIONS } from "@/components/ScoringTable";
import { Section } from "@/components/Section";
import { SectionRule } from "@/components/SectionRule";
import { Body, Eyebrow, Heading, Lede, Note } from "@/components/Typography";
import { CHOSEN } from "@/lib/announcement";
import { isAnnounced } from "@/lib/application-window";
import { breadcrumbSchema, JsonLd } from "@/lib/structured-data";

/* For organisations. Copy transcribed verbatim from the prototype.
 *
 * Oat hero rather than Ink: the home page has already spent the Ink moment, and
 * two dark heroes in a row would flatten the contrast the system relies on.
 */

// "For organisations" is a navigation label, not a search. Nobody types it.
// A volunteer treasurer searches for the thing they want, so the title leads
// with that and names the district for local search.
export function generateMetadata(): Metadata {
  return {
    title: "Free digital tools for community organisations",
    description: isAnnounced()
      ? "Local developers are building free tools for three community organisations in the Queenstown Lakes district. What taking part involves, and how the three were chosen."
      : "Free custom software for not-for-profits, charities and community groups in the Queenstown Lakes district. Local developers build it, at no cost to you.",
    alternates: { canonical: "/organisations" },
  };
}

/* Third person once announced: the reader is no longer the one taking part. */
const WHAT_IT_INVOLVED = [
  "First: the team and the organisation design exactly what gets built, together",
  "During the build: the organisation sees working versions each week and says what is wrong",
  "At handover: training, written instructions, and help settling in",
  "For six weeks after that: bugs fixed free",
  "After that: the code is open source, so nobody is locked in",
];

const WHAT_IT_INVOLVES = [
  "First: we sit down with you and agree exactly what is being built",
  "During the build: you see working versions each week and say what is wrong",
  "When we hand it over: training, written instructions, and help settling in",
  "For six weeks after that: bugs fixed free",
  "After that: the code is open source, so you are never locked in",
];

/* "A, B and C", for the lede. */
const CHOSEN_NAMES = `${CHOSEN.slice(0, -1).map((b) => b.name).join(", ")} and ${CHOSEN.at(-1)!.name}`;

export default function OrganisationsPage() {
  const announced = isAnnounced();

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "For organisations", path: "/organisations" },
        ])}
      />
      <Section drift="hero" className="pb-7">
        <Eyebrow className="mb-4">For community organisations</Eyebrow>
        <Heading level={1} fluid className="max-w-[var(--page-heading-max)]">
          {announced
            ? "A real problem, and a local team to fix it."
            : "Tell us a problem. We build you the tool to fix it."}
        </Heading>
        {announced ? (
          <>
            <Lede className="mt-6">
              This round, three organisations bring a problem each: {CHOSEN_NAMES}.
              Each is matched with a small team of local developers working at community
              rates. From 28 September each solution is designed with its organisation,
              then built over five weeks and handed over, at no cost to the organisation.
            </Lede>
            <div className="mt-7">
              <Button variant="secondary" href="/builds">
                Meet the three
              </Button>
            </div>
          </>
        ) : (
          <Lede className="mt-6">
            Three tools are built at the same time, each one aimed at as many organisations
            as the problem allows, sometimes several, sometimes one. Each is matched with a
            small team of local developers working at community rates, well under what they
            charge commercially. Over five weeks they work out what would help most, build
            it, and hand it over. There is no cost to your organisation.
          </Lede>
        )}
      </Section>

      <SectionRule variant="gold" />

      <Section>
        <Reveal>
          <div className="grid grid-cols-1 items-start gap-9 lg:grid-aside">
            <div>
              <Heading level={2}>What taking part actually involves</Heading>
              {announced ? (
                <Body className="mt-5">
                  From each of the three: one named contact person, roughly one to two
                  hours a week during the build to answer questions and test progress, and
                  honest feedback as it takes shape. That is the whole ask. Nobody needs
                  technical knowledge, and nobody has to write a specification.
                </Body>
              ) : (
                <Body className="mt-5">
                  One named contact person. Roughly one to two hours a week during the
                  build to answer questions and test progress. A willingness to give honest
                  feedback as it takes shape. That is the whole ask. You do not need any
                  technical knowledge and you do not need to write a specification.
                </Body>
              )}
              <div className="mt-6">
                <CaretList items={announced ? WHAT_IT_INVOLVED : WHAT_IT_INVOLVES} />
              </div>
            </div>

            {/* Once announced the eligibility note goes with nothing in its
                place: a second round is not decided. */}
            <KeyDatesCard>
              {announced ? null : (
                <div className="mt-6 border-t border-solid border-hairline pt-5">
                  <Eyebrow>Who can apply</Eyebrow>
                  <Note className="mt-3">
                    Not-for-profits, registered charities, marae, sports clubs, community
                    groups and incorporated societies based in the Queenstown Lakes
                    district. Businesses can be eligible where what gets built serves the
                    community rather than commercial gain.
                  </Note>
                </div>
              )}
            </KeyDatesCard>
          </div>
        </Reveal>
      </Section>

      <Section flush>
        <Reveal>
          <div className="grid grid-cols-1 items-start gap-9 lg:grid-aside">
            <div>
              <Eyebrow className="mb-4">{announced ? "How the three were chosen" : "How we choose"}</Eyebrow>
              <Heading level={3} as="h2">
                A panel of local tech and community people {announced ? "read" : "reads"} every
                application
              </Heading>
              <Body className="mt-4">
                Reuse {announced ? "carried" : "carries"} real weight, because only three tools get built. If five
                organisations need the same thing, the aim is to build it once so all five
                can use it, rather than once for one of them.
              </Body>
            </div>

            <ScoringTable
              rows={SCORING_ORGANISATIONS}
              title={announced ? "How applications were scored" : undefined}
            />
          </div>
        </Reveal>
      </Section>

      <ClosingCta
        title="Bring us a real problem"
        note="Applying commits you to nothing, and we reply to everyone."
      />
    </>
  );
}
