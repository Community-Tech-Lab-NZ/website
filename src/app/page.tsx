import type { Metadata } from "next";
import { AudiencePath } from "@/components/AudiencePath";
import { Button } from "@/components/Button";
import { CalloutBanner } from "@/components/CalloutBanner";
import { HeroDrift } from "@/components/HeroDrift";
import { TypeOn } from "@/components/TypeOn";
import { Card } from "@/components/Card";
import { CaretList } from "@/components/CaretList";
import { FunderCredit } from "@/components/FunderCredit";
import { PartnerRow } from "@/components/PartnerRow";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/Section";
import { SectionRule } from "@/components/SectionRule";
import { StatFigure } from "@/components/StatFigure";
import { Timeline } from "@/components/Timeline";
import { Body, Eyebrow, Heading, Lede } from "@/components/Typography";
import { TIMELINE } from "@/lib/navigation";

/* Home. Copy is final and iterated with the programme team — transcribed
 * verbatim from the prototype, not rewritten.
 *
 * The page's job: state what the programme is in one line, fork the two
 * audiences, and prove it is real.
 */

export const metadata: Metadata = {
  description:
    "Local developers build something useful for community organisations across the Queenstown Lakes district, at no cost to the organisation.",
};

const HERO_STATS = [
  { figure: "3", label: "Solutions to be built" },
  { figure: "6", label: "Paid developer seats" },
  { figure: "5 weeks", label: "One build, weekly sprints" },
  { figure: "Open source", label: "Free to reuse" },
];

const HOW_IT_RUNS = [
  "A panel of local tech and community people reads every application",
  "Discovery happens before the build, so scope is agreed with you",
  "Five weeks of weekly sprints, then handover with training and documentation",
  "Bugs fixed free for six weeks after handover, and the code is yours",
];

export default function HomePage() {
  return (
    <>
      {/* Hero — the one Ink moment on the site, and the one gold thing in view.
          This is also where nearly all of the chosen motion overrides live:
          the headline types on, faint carets drift and settle, and the lede,
          CTA and stats rise in sequence while the typing finishes. Each block
          is offset as a whole; nothing inside a block cascades. */}
      <section className="relative bg-ink text-body-inverse">
        <HeroDrift />
        <div className="relative mx-auto max-w-page px-gutter pb-8 pt-9 lg:px-gutter-lg">
          <Heading level={1} fluid inverse className="max-w-[var(--hero-heading-max)]">
            <TypeOn text="Solutions that get used." />
          </Heading>

          <Reveal delay={400}>
            <Lede inverse className="mt-6">
              Local developers build something useful for community organisations across
              the Queenstown Lakes district, at no cost to the organisation.
            </Lede>
          </Reveal>

          <Reveal delay={550} className="mt-7">
            <Button variant="primary" size="hero" href="/apply">
              Apply now
            </Button>
          </Reveal>

          {/* gap-y-3 is the figure-to-label spacing, not a gap between stats:
              each StatFigure spans both rows via subgrid, so every label starts
              on the same line however many lines its figure took. */}
          <Reveal
            delay={700}
            className="mt-9 grid grid-cols-[repeat(auto-fit,minmax(var(--hero-stat-min),max-content))] gap-x-8 gap-y-3"
          >
            {HERO_STATS.map((stat) => (
              <StatFigure
                key={stat.label}
                inverse
                align="row"
                labelSize="md"
                wipe
                figure={stat.figure}
                label={stat.label}
              />
            ))}
          </Reveal>
        </div>
        <SectionRule variant="gold" />
      </section>

      {/* Two ways in — the audience fork */}
      <Section>
        <Reveal>
          {/* Was "Two ways in", which framed the programme as a pair of doors
              you had to pick between. "Get involved" is an invitation. */}
          <Eyebrow as="h2" className="mb-5">Get involved</Eyebrow>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(var(--col-min-wide),1fr))] gap-6">
            <AudiencePath
              audience="community"
              eyebrow="For community organisations"
              title="Something useful, built for your organisation"
              blurb="Scoped with you, built for the way you work now, and handed over with training. There is no cost to your organisation."
              points={[
                "No cost to your organisation",
                "One to two hours a week from one named contact",
                "Training, documentation and six weeks of free bug fixes",
              ]}
              actionLabel="See what's involved"
              actionHref="/organisations"
            />
            <AudiencePath
              audience="developer"
              eyebrow="For developers"
              title="Paid work at community rates, with real users on the other end"
              blurb="Six paid seats across three teams, three senior and three junior, plus intern places. Roughly 12 hours a week for five weeks, after the ski season closes."
              points={[
                "Paid contract with Startup Queenstown Lakes, at community rates",
                "A senior developer mentoring every build",
                "An open source repository you can point at",
              ]}
              actionLabel="See the roles"
              actionHref="/developers"
            />
          </div>
        </Reveal>
      </Section>

      {/* Why it exists / Built once, used by many */}
      <Section flush>
        <Reveal>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(var(--col-min),1fr))] gap-8">
            <div>
              <Eyebrow className="mb-4">Why it exists</Eyebrow>
              <Heading level={3} as="h2">
                A small, dispersed tech community, working together
              </Heading>
              <Body className="mt-4">
                The district has good developers, particularly early in their careers,
                who rarely get paid local work with real users. They take this on at
                community rates, well under commercial, because the work is worth doing.
                This programme is what puts them in a room with experienced local
                engineers and with the organisations that need the work done.
              </Body>
            </div>
            <div>
              <Eyebrow className="mb-4">Built once, used by many</Eyebrow>
              <Heading level={3} as="h2">
                Everything is <span className="ctl-sweep-gold">open source</span>
              </Heading>
              <Body className="mt-4">
                Only three solutions get built, so each one is chosen partly on how many
                organisations it could serve. If five need the same thing, the aim is to
                build it once so all five can use it, rather than once for one of them.
              </Body>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* How it runs */}
      <Section flush>
        <Reveal>
          <div className="grid grid-cols-1 items-start gap-9 lg:grid-cols-[minmax(var(--col-min-wide),1.2fr)_minmax(var(--col-min-narrow),0.8fr)]">
            <div>
              <Eyebrow className="mb-4">How it runs</Eyebrow>
              <Heading level={2}>
                Properly scoped and mentored, not a rushed side project
              </Heading>
              <Body className="mt-5">
                Three solutions are chosen through an open application process, each one
                scoped so it can serve more than one organisation. Each is matched with a
                small team of local developers, led by a senior developer. The programme
                is run by Startup Queenstown Lakes and funded by the Queenstown Lakes
                District Council Economic Diversification Fund.
              </Body>
              <div className="mt-6">
                <CaretList items={HOW_IT_RUNS} />
              </div>
            </div>

            <Card tone="light" accentRule>
              <Eyebrow className="mb-5">Key dates</Eyebrow>
              <Timeline steps={TIMELINE} />
            </Card>
          </div>
        </Reveal>
      </Section>

      {/* Partners */}
      <Section flush>
        <Reveal>
          <SectionRule variant="hairline" draw={false} className="mb-7" />
          <PartnerRow eyebrow="Delivered with" />
          <p className="mt-5 max-w-measure font-sans text-body-sm text-muted">
            Startup Queenstown Lakes is the lead organisation, fund holder, and the
            entity developers contract to.
          </p>
          <div className="mt-7">
            <FunderCredit />
          </div>
        </Reveal>
      </Section>

      {/* Closing CTA. Padding and background stripped so the banner sits directly
          in the Ink section rather than reading as a card inside one. */}
      <Section tone="ink" tight>
        <CalloutBanner
          bare
          eyebrow="Applications open 15 to 31 August"
          title="Ready when you are"
          note="Three solutions get built this round. Applying commits you to nothing."
          actionLabel="Apply now"
          actionHref="/apply"
        />
      </Section>
    </>
  );
}
