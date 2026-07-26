import type { Metadata } from "next";
import { CalloutBanner } from "@/components/CalloutBanner";
import { Card } from "@/components/Card";
import { CaretList } from "@/components/CaretList";
import { Reveal } from "@/components/Reveal";
import { ScoringTable, SCORING_ORGANISATIONS } from "@/components/ScoringTable";
import { Section } from "@/components/Section";
import { SectionRule } from "@/components/SectionRule";
import { Timeline } from "@/components/Timeline";
import { Body, Eyebrow, Heading, Lede } from "@/components/Typography";
import { TIMELINE } from "@/lib/navigation";
import { breadcrumbSchema, JsonLd } from "@/lib/structured-data";

/* For organisations. Copy transcribed verbatim from the prototype.
 *
 * Oat hero rather than Ink: the home page has already spent the Ink moment, and
 * two dark heroes in a row would flatten the contrast the system relies on.
 */

export const metadata: Metadata = {
  // "For organisations" is a navigation label, not a search. Nobody types it.
  // A volunteer treasurer searches for the thing they want, so the title leads
  // with that and names the district for local search.
  title: "Free digital tools for community organisations",
  description:
    "Free custom software for not-for-profits, charities and community groups in the Queenstown Lakes district. Local developers build it, at no cost to you.",
  alternates: { canonical: "/organisations" },
};

const WHAT_IT_INVOLVES = [
  "Discovery: we sit down with you and agree exactly what is being built",
  "During the build: you see working versions each week and say what is wrong",
  "Handover: training, light documentation and a supported bedding-in period",
  "For six weeks after handover: bugs fixed free",
  "After that: the code is open source, so you are never locked in",
];

export default function OrganisationsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "For organisations", path: "/organisations" },
        ])}
      />
      <Section className="pb-7">
        <Eyebrow className="mb-4">For community organisations</Eyebrow>
        <Heading level={1} fluid className="max-w-[var(--page-heading-max)]">
          Something useful, built for your organisation.
        </Heading>
        <Lede className="mt-6">
          Three solutions are built in parallel, each scoped to serve as many
          organisations as the problem allows, sometimes several, sometimes one. Each is
          matched with a small team of local developers working at community rates, well
          under what they charge commercially. Over a five-week build they work out what
          would help most, build it, and hand it over. There is no cost to your
          organisation.
        </Lede>
      </Section>

      <SectionRule variant="gold" />

      <Section>
        <Reveal>
          <div className="grid grid-cols-1 items-start gap-9 lg:grid-cols-[minmax(var(--col-min-wide),1.15fr)_minmax(var(--col-min-narrow),0.85fr)]">
            <div>
              <Heading level={2}>What taking part actually involves</Heading>
              <Body className="mt-5">
                One named contact person. Roughly one to two hours a week during the
                build to answer questions and test progress. A willingness to give honest
                feedback as it takes shape. That is the whole ask. You do not need any
                technical knowledge and you do not need to write a specification.
              </Body>
              <div className="mt-6">
                <CaretList items={WHAT_IT_INVOLVES} />
              </div>
            </div>

            <Card tone="light" accentRule>
              <Eyebrow className="mb-5">Key dates</Eyebrow>
              <Timeline steps={TIMELINE} />
              <div className="mt-6 border-t border-solid border-hairline pt-5">
                <Eyebrow>Who can apply</Eyebrow>
                <p className="mt-3 max-w-measure font-sans text-body-sm text-body">
                  Not-for-profits, registered charities, marae, sports clubs, community
                  groups and incorporated societies based in the Queenstown Lakes
                  district. Businesses can be eligible where what gets built serves the
                  community rather than commercial gain.
                </p>
              </div>
            </Card>
          </div>
        </Reveal>
      </Section>

      <Section flush>
        <Reveal>
          <div className="grid grid-cols-1 items-start gap-9 lg:grid-cols-[minmax(var(--col-min),1fr)_minmax(var(--col-min-narrow),0.8fr)]">
            <div>
              <Eyebrow className="mb-4">How we choose</Eyebrow>
              <Heading level={3} as="h2">
                A panel of local tech and community people reads every application
              </Heading>
              <Body className="mt-4">
                Reuse carries real weight, because only three solutions get built. If five
                organisations need the same thing, the aim is to build it once so all five
                can use it, rather than once for one of them.
              </Body>
            </div>

            <ScoringTable rows={SCORING_ORGANISATIONS} />
          </div>
        </Reveal>
      </Section>

      <Section tone="ink" tight>
        <CalloutBanner
          bare
          eyebrow="Applications open 15 to 31 August"
          title="Apply now"
          note="Applying commits you to nothing, and we reply to everyone."
          actionLabel="Apply now"
          actionHref="/apply"
        />
      </Section>
    </>
  );
}
