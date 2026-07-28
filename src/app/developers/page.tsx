import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { CalloutBanner } from "@/components/CalloutBanner";
import { Drift } from "@/components/Drift";
import { Card } from "@/components/Card";
import { CaretList } from "@/components/CaretList";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/Section";
import { SectionRule } from "@/components/SectionRule";
import { StatFigure } from "@/components/StatFigure";
import { Timeline } from "@/components/Timeline";
import { Eyebrow, Heading, Lede } from "@/components/Typography";
import { TIMELINE } from "@/lib/navigation";
import { breadcrumbSchema, JsonLd, jobPostingsSchema } from "@/lib/structured-data";

/* For developers. Copy transcribed verbatim from the prototype.
 *
 * Ink hero, with the eyebrow in Fern — the one structural accent on an otherwise
 * unbroken dark surface. The lede is deliberately honest about the community
 * rate rather than burying it.
 */

export const metadata: Metadata = {
  // Developers search for work and a place, not for a nav label.
  title: "Paid developer roles in Queenstown Lakes",
  description:
    "Six paid contract seats for developers and designers in the Queenstown Lakes district. About 12 hours a week for five weeks, building open-source tools.",
  alternates: { canonical: "/developers" },
};

const ROLES = [
  {
    title: "Senior developer and mentor",
    pay: "Paid contract · 3 seats · about 12 hours a week",
    body: "Lead one team, mentor the junior, guide architecture and keep scope sensible. Roughly 60 hours across the build, contracted to Startup Queenstown Lakes as a sole trader.",
  },
  {
    title: "Junior developer or designer",
    pay: "Paid contract · 3 seats · about 12 hours a week",
    body: "Do the primary build work with a senior developer alongside you. Same contract structure, same hours, real users at the other end.",
  },
  {
    title: "Programme intern",
    pay: "Unpaid · light and flexible hours",
    body: "Sit in on stand-ups, demos and retrospectives, shadow the teams, and help with user testing and notes. No technical experience needed, and it is a stepping stone to a paid junior seat in a future cohort.",
  },
];

const WHAT_YOU_GET = [
  "Paid contract work on your invoice, at a community rate",
  "A shipped tool with real users, named in your portfolio",
  "Weekly review and mentoring from an experienced local engineer",
  "A public open source repository at the end of the five weeks",
  "A way into a tech community that is small and dispersed",
];

export default function DevelopersPage() {
  return (
    <>
      {/* These are genuine paid contract seats with defined hours and a closing
          date, which is exactly what JobPosting describes. Marking them up means
          a developer searching for work in the district can find them without
          ever having heard of the programme. */}
      <JsonLd
        data={[
          ...jobPostingsSchema(),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "For developers", path: "/developers" },
          ]),
        ]}
      />
      <section className="relative bg-ink text-body-inverse">
        <Drift preset="hero" />
        <div className="relative mx-auto max-w-page px-gutter pb-8 pt-9 lg:px-gutter-lg">
          <Eyebrow inverse className="mb-4">
            For developers
          </Eyebrow>
          <Heading level={1} fluid inverse className="max-w-[var(--page-heading-max)]">
            Paid work, real users, and code you can point at.
          </Heading>
          <Lede inverse className="mt-6">
            Six paid seats across three teams, three senior and three junior, plus unpaid
            intern places. The rate is a community rate, well under commercial, because
            the work goes to organisations that could not otherwise afford it. Part-time,
            evenings and weekends, roughly 12 hours a week for five weeks, after the ski
            season closes.
          </Lede>

          <div className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(var(--hero-stat-min),max-content))] gap-8">
            <StatFigure inverse knock labelSize="md" figure="6" label="Paid seats" />
            <StatFigure inverse knock labelSize="md" figure="3" label="Build teams" />
            <StatFigure inverse knock labelSize="md" figure="~12 hrs" label="Per week, approximate" />
          </div>

          <div className="mt-7">
            <Button variant="primary" size="lg" href="/apply">
              Apply now
            </Button>
          </div>
        </div>
        <SectionRule variant="gold" />
      </section>

      <Section>
        <Reveal>
          <Eyebrow as="h2" className="mb-5">The roles</Eyebrow>

          {/* Three rows in a single hairline frame. Stacks below lg, where a
              three-column row would squeeze the description to a few words. */}
          <div className="grid border border-solid border-hairline">
            {ROLES.map((role, i) => (
              <div
                key={role.title}
                className={`grid grid-cols-1 items-center gap-6 bg-white px-6 py-5 lg:grid-cols-[minmax(var(--role-col-min),1fr)_2fr_max-content] ${
                  i ? "border-t border-solid border-hairline" : ""
                }`}
              >
                <div>
                  <Heading level={3} as="h3" className="text-body-lg">
                    {role.title}
                  </Heading>
                  <div className="mt-2 font-meta text-label uppercase leading-tight text-muted">
                    {role.pay}
                  </div>
                </div>

                <p className="max-w-measure font-sans text-body-sm text-body">
                  {role.body}
                </p>

                <Button variant="outline" size="sm" href="/apply">
                  Apply
                </Button>
              </div>
            ))}
          </div>

          <p className="mt-5 max-w-measure font-sans text-body-sm text-muted">
            Open to developers based in the Queenstown Lakes district.
          </p>
        </Reveal>
      </Section>

      <Section flush>
        <Reveal>
          <div className="grid grid-cols-1 items-start gap-9 lg:grid-cols-[minmax(var(--col-min),1fr)_minmax(var(--col-min-narrow),0.8fr)]">
            <div>
              <Heading level={2}>What you get out of it</Heading>
              <div className="mt-5">
                <CaretList items={WHAT_YOU_GET} />
              </div>
            </div>

            <Card tone="light" accentRule>
              <Eyebrow className="mb-5">Key dates</Eyebrow>
              <Timeline steps={TIMELINE} />
            </Card>
          </div>
        </Reveal>
      </Section>

      <Section tone="ink" tight>
        <CalloutBanner
          bare
          eyebrow="Applications open 15 to 31 August"
          title="Six paid seats this round"
          note="Tell us which seat fits and what you have shipped before."
          actionLabel="Apply now"
          actionHref="/apply"
        />
      </Section>
    </>
  );
}
