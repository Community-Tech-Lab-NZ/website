import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { CaretList } from "@/components/CaretList";
import { ClosingCta } from "@/components/ClosingCta";
import { KeyDatesCard } from "@/components/KeyDatesCard";
import { Reveal } from "@/components/Reveal";
import { RoleDescription } from "@/components/RoleDescription";
import { Section } from "@/components/Section";
import { SectionRule } from "@/components/SectionRule";
import { StatFigure } from "@/components/StatFigure";
import { Body, Eyebrow, Heading, Lede, Note } from "@/components/Typography";
import { applyHref } from "@/lib/apply-path";
import { getSiteCopy, getWindowState, isAnnounced } from "@/lib/application-window";
import { FEE_NOTE, ROLES } from "@/lib/roles";
import { breadcrumbSchema, JsonLd, jobPostingsSchema } from "@/lib/structured-data";

/* For developers. Copy transcribed verbatim from the prototype.
 *
 * Ink hero, with the eyebrow in Fern, the one structural accent on an otherwise
 * unbroken dark surface. The lede says what the seats are and nothing else: the
 * hours are in the stat row directly below it, the dates are in the key dates
 * card, and the community rate is explained under the role cards, beside the
 * figures it is explaining.
 */

// Developers search for work and a place, not for a nav label.
export function generateMetadata(): Metadata {
  return {
    title: "Paid developer roles in Queenstown Lakes",
    description: isAnnounced()
      ? "The paid developer seats in this round of Community Tech Lab: three senior and three junior across three build teams, about 12 hours a week for five weeks."
      : "Six paid contract seats for developers and designers in the Queenstown Lakes district. About 12 hours a week for five weeks, building open-source tools.",
    alternates: { canonical: "/developers" },
  };
}

/* Third person once announced: the reader is no longer applying. */
const WHAT_THEY_GET = [
  "Paid contract work, at a community rate",
  "A shipped tool with real users, named in their portfolio",
  "Weekly review and mentoring from an experienced local engineer",
  "A public open source repository at the end of the five weeks",
  "A way into a tech community that is small and spread out",
];

const WHAT_YOU_GET = [
  "Paid contract work on your invoice, at a community rate",
  "A shipped tool with real users, named in your portfolio",
  "Weekly review and mentoring from an experienced local engineer",
  "A public open source repository at the end of the five weeks",
  "A way into a tech community that is small and spread out",
];

export default function DevelopersPage() {
  const state = getWindowState();
  const announced = isAnnounced();
  const cta = getSiteCopy().cta;

  return (
    <>
      {/* These are genuine paid contract seats with defined hours and a closing
          date, which is exactly what JobPosting describes. Marking them up means
          a developer searching for work in the district can find them without
          ever having heard of the programme. */}
      {/* The postings go once the seats are filled; their validThrough has
          passed anyway. */}
      <JsonLd
        data={[
          ...(announced ? [] : jobPostingsSchema()),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "For developers", path: "/developers" },
          ]),
        ]}
      />
      <Section tone="ink" drift="hero" hero>
        <Eyebrow inverse className="mb-4">
          For developers
        </Eyebrow>
        <Heading level={1} fluid inverse className="max-w-[var(--page-heading-max)]">
          {announced
            ? "Three teams. Three local builds."
            : "Paid work, real users, and code you can point at."}
        </Heading>
        <Lede inverse className="mt-6">
          {announced
            ? "Six paid seats across three teams, three senior and three junior, plus unpaid intern places. Applications closed on 31 August, and the teams start with their organisations on 28 September."
            : "Six paid seats across three teams, three senior and three junior, plus unpaid intern places."}
        </Lede>

        <div className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(var(--hero-stat-min),max-content))] gap-8">
          <StatFigure inverse knock labelSize="md" figure="6" label="Paid seats" />
          <StatFigure inverse knock labelSize="md" figure="3" label="Build teams" />
          <StatFigure inverse knock labelSize="md" figure="~12 hrs" label="Per week, approximate" />
        </div>

        {/* Every apply link on this page opens the developer form. Nobody who
            has read this far wants the community application.
            Closed, the parameter is dead weight: /apply renders no tabs to
            fork, so it goes to the bare page.
            Announced, it goes: "Meet the three" under a headline about the
            teams reads as meeting the developers. */}
        {announced ? null : (
          <div className="mt-7">
            <Button
              variant="primary"
              size="lg"
              href={state === "closed" ? cta.href : applyHref("developer")}
            >
              {cta.label}
            </Button>
          </div>
        )}
      </Section>
      <SectionRule variant="gold" />

      <Section>
        <Reveal>
          <Eyebrow as="h2" className="mb-5">{announced ? "The roles this round" : "The roles"}</Eyebrow>

          {/* Said out loud, because a fold nobody opens is a fold nobody knew
              was there. The row summary is forty words; the decision someone is
              actually making needs the six hundred behind it. */}
          <Body className="mb-5">
            {announced
              ? "Applications for these seats closed on 31 August. The full descriptions stay here as a record of what each role involves."
              : "Every seat has a full description you can read here, or take away as a PDF."}
          </Body>

          {/* Three rows in a single hairline frame. Stacks below lg, where a
              three-column row would squeeze the description to a few words.
              The description fold sits BELOW the three columns rather than
              inside them: a <summary> is interactive, and the Apply button
              cannot be nested inside one. */}
          <div className="grid border border-solid border-hairline">
            {ROLES.map((role, i) => (
              <div
                key={role.id}
                id={role.id}
                className={`bg-white px-6 py-5 ${
                  i ? "border-t border-solid border-hairline" : ""
                }`}
              >
                <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[minmax(var(--role-col-min),1fr)_2fr_max-content]">
                  <div>
                    <Heading level={3} as="h3" className="text-body-lg">
                      {role.title}
                    </Heading>
                    <div className="mt-2 font-meta text-label uppercase leading-tight text-muted">
                      {role.pay}
                    </div>
                    {/* Ink rather than muted, and on its own line. It is the
                        one thing on this row a developer is scanning for, and
                        set in the same grey as the contract-and-hours line it
                        would be read as more of the same small print. */}
                    {role.fee ? (
                      <div className="mt-1 font-meta text-label uppercase leading-tight">
                        {role.fee}
                      </div>
                    ) : null}
                  </div>

                  <Note>{role.summary}</Note>

                  {/* Closed, the button goes rather than being relabelled.
                      Its whole job is applying for THIS seat, there are three
                      of them down the page, and "what happens next" is one
                      answer that does not need saying three times: the hero and
                      the closing band both carry it already. */}
                  {state === "closed" ? null : (
                    <Button variant="outline" size="sm" href={applyHref("developer")}>
                      Apply
                    </Button>
                  )}
                </div>

                <RoleDescription role={role} />
              </div>
            ))}
          </div>

          <Note muted className="mt-5">
            The rate is a community rate, well under commercial, because the work goes
            to organisations that could not otherwise afford it. {FEE_NOTE}{" "}
            {announced ? "Seats were open" : "Open"} to developers based in the Queenstown
            Lakes district.
          </Note>
        </Reveal>
      </Section>

      <Section flush>
        <Reveal>
          <div className="grid grid-cols-1 items-start gap-9 lg:grid-aside">
            <div>
              <Heading level={2}>
                {announced ? "What the developers get out of it" : "What you get out of it"}
              </Heading>
              <div className="mt-5">
                <CaretList items={announced ? WHAT_THEY_GET : WHAT_YOU_GET} />
              </div>
            </div>

            <KeyDatesCard />
          </div>
        </Reveal>
      </Section>

      <ClosingCta
        title="Six paid seats this round"
        note="Tell us which seat fits and what you have shipped before."
        actionHref={applyHref("developer")}
      />
    </>
  );
}
