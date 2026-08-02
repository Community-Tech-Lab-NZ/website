import type { Metadata } from "next";
import { AudiencePath } from "@/components/AudiencePath";
import { Button } from "@/components/Button";
import { ClosingCta } from "@/components/ClosingCta";
import { TypeOn } from "@/components/TypeOn";
import { CaretList } from "@/components/CaretList";
import { KeyDatesCard } from "@/components/KeyDatesCard";
import { PartnerRow } from "@/components/PartnerRow";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/Section";
import { SectionRule } from "@/components/SectionRule";
import { StatFigure } from "@/components/StatFigure";
import { Body, Eyebrow, Heading, Lede, Note } from "@/components/Typography";

/* Home. Copy came verbatim from the prototype, then took a plain-language pass:
 * the owner's read was that a reader could finish the fork without learning what
 * the programme actually does.
 *
 * Two words did most of the damage. "Solutions" is what the sector calls the
 * thing and what nobody else does — it is now "tools", which is the word the
 * brand guide itself reaches for when it stops being formal, and the word the
 * /organisations metadata was already using. "Scoped", "discovery" and "sprints"
 * are agency vocabulary; a volunteer treasurer does not have to learn them to
 * find out what five weeks will cost them.
 *
 * Left alone deliberately: the terms page, where "solution" is a defined term
 * carrying legal weight and the review is still outstanding.
 *
 * The page's job: state what the programme is in one line, fork the two
 * audiences, and prove it is real.
 */

export const metadata: Metadata = {
  description:
    "Local developers build software for community organisations across the Queenstown Lakes district, at no cost to the organisation.",
};

const HERO_STATS = [
  { figure: "3", label: "Tools to be built" },
  { figure: "6", label: "Paid developer seats" },
  { figure: "5 weeks", label: "One build, start to finish" },
  { figure: "Open source", label: "Free to reuse" },
];

const HOW_IT_RUNS = [
  "A panel of local tech and community people reads every application",
  "We agree exactly what is being built with you, before anyone writes code",
  "Five weeks of building, with something to try each week, then training when we hand it over",
  "Bugs fixed free for six weeks after you get it, and the code is yours",
];

export default function HomePage() {
  return (
    <>
      {/* Hero — the one Ink moment on the site, and the one gold thing in view.
          This is also where nearly all of the chosen motion overrides live:
          the headline types on, faint carets drift and settle, and the lede,
          CTA and stats rise in sequence while the typing finishes. Each block
          is offset as a whole; nothing inside a block cascades. */}
      <Section tone="ink" drift="hero" hero>
        <Heading level={1} fluid inverse className="max-w-[var(--hero-heading-max)]">
          <TypeOn text="Tools that get used." loop />
        </Heading>

        <Reveal delay={400}>
          <Lede inverse className="mt-6">
            Local developers build software for community organisations across the
            Queenstown Lakes district, at no cost to the organisation.
          </Lede>
        </Reveal>

        <Reveal delay={550} className="mt-7">
          <Button variant="primary" size="hero" href="/apply" className="ctl-cta-ping">
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
              knock
              figure={stat.figure}
              label={stat.label}
            />
          ))}
        </Reveal>
      </Section>
      <SectionRule variant="gold" />

      {/* Two ways in — the audience fork */}
      <Section>
        <Reveal>
          {/* Was "Two ways in", which framed the programme as a pair of doors
              you had to pick between. "Get involved" is an invitation. */}
          <Eyebrow as="h2" className="mb-5">Get involved</Eyebrow>
          {/* min(): a bare minmax(320px,1fr) track does not shrink below its
              minimum, so on a phone narrower than 320 plus gutters the card
              pushed out of the container and took the whole page into
              horizontal scroll with it. min(…,100%) lets the track give. */}
          <div className="grid grid-fit gap-6">
            <AudiencePath
              audience="community"
              eyebrow="For community organisations"
              title="Tell us a problem. A local team builds you the tool to fix it."
              blurb="We work out what to build with you, build it around the way you already work, and train your people to use it. It costs your organisation nothing."
              points={[
                "No cost to your organisation",
                "One to two hours a week, from one person at your end",
                "Training, written instructions, and six weeks of free fixes",
              ]}
              actionLabel="See what's involved"
              actionHref="/organisations"
            />
            {/* The title used to lead on the rate, which sold the seat as a
                contract and nothing more. The thing developers here actually
                say yes to is the company: a tech community this small and
                dispersed means the people you would enjoy building with are the
                people you never get to build with. So the invitation leads, and
                the money — which the handoff insists comes first for this
                audience, and which must never read as volunteering — holds the
                opening words of the blurb and the first point. */}
            <AudiencePath
              audience="developer"
              eyebrow="For developers"
              title="Five weeks building a tool a local organisation actually needs"
              blurb="Six paid seats across three teams, three senior and three junior, plus intern places. You build alongside local developers you rarely get to work with, roughly 12 hours a week after the ski season closes."
              points={[
                "Paid contract with Startup Queenstown Lakes, at community rates",
                "A senior developer on the build beside you",
                "An open repo, and locals using what you built",
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
          <div className="grid grid-fit gap-8">
            <div>
              <Eyebrow className="mb-4">Why it exists</Eyebrow>
              <Heading level={3} as="h2">
                A small, spread-out tech community, working together
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
                Only three tools get built, so each one is chosen partly on how many
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
          <div className="grid grid-cols-1 items-start gap-9 lg:grid-aside">
            <div>
              <Eyebrow className="mb-4">How it runs</Eyebrow>
              <Heading level={2}>
                Planned properly and led by senior developers, not a rushed side project
              </Heading>
              <Body className="mt-5">
                Three tools are chosen by open application, each one picked so more than
                one organisation can use it. Each is matched with a small team of local
                developers, led by a senior developer. The programme
                is run by Startup Queenstown Lakes and funded by the Queenstown Lakes
                District Council Economic Diversification Fund.
              </Body>
              <div className="mt-6">
                <CaretList items={HOW_IT_RUNS} />
              </div>
            </div>

            <KeyDatesCard />
          </div>
        </Reveal>
      </Section>

      {/* Partners */}
      <Section flush>
        <Reveal>
          <SectionRule variant="hairline" draw={false} className="mb-7" />
          <PartnerRow eyebrow="Delivered with" />
          <Note muted className="mt-5">
            Startup Queenstown Lakes leads the programme, holds the funding, and is who
            developers contract to.
          </Note>
          {/* No FunderCredit here — it sits in the footer of every page,
              which keeps the mandatory credit while avoiding it appearing
              twice within one scroll. */}
        </Reveal>
      </Section>

      <ClosingCta
        title="Ready when you are"
        note="Three tools get built this round. Applying commits you to nothing."
      />
    </>
  );
}
