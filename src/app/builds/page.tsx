import type { Metadata } from "next";
import Image from "next/image";
import { Card } from "@/components/Card";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/Section";
import { SectionRule } from "@/components/SectionRule";
import { Timeline } from "@/components/Timeline";
import { Body, Eyebrow, Heading, Lede, Note } from "@/components/Typography";
import { CHOSEN } from "@/lib/announcement";
import { breadcrumbSchema, JsonLd } from "@/lib/structured-data";

/* The three chosen problems, as a permanent record.
 *
 * WHY THE PAGE EXISTS AT ALL. The announcement went out by email on
 * 24 September, and an email is a thing that happens once to whoever was on the
 * list that day. Anyone who hears about this in November, or who is sent it by
 * a friend, or who wants to check a name before writing about it, needs
 * somewhere it still is. This is that place, and it is what the announcement's
 * one button points at.
 *
 * IT IS THE SAME THREE, FROM THE SAME SOURCE. `CHOSEN` in src/lib/announcement.ts
 * feeds both this page and the email. Not copied: a community organisation's
 * name spelled one way in the email and another on the page is the specific
 * error this arrangement exists to make impossible.
 *
 * WHAT IT DOES NOT DO.
 *
 * It does not say what is being built, for the reason set out at length in
 * announcement.ts: discovery runs 28 September to 9 October and has not
 * happened. Unlike the email, this page CAN be corrected afterwards, and the
 * intention is that it is — once each team knows what it is making, this is
 * where that goes, and later still the link to the thing itself. The page is
 * built to be added to. It is not built to be right about the future.
 *
 * It does not carry the ClosingCta band that the other five content pages end
 * on. That band invites the reader to apply, and applications for this cohort
 * closed on 31 August. A page announcing who was chosen, closing on a button
 * asking the reader to apply, is the one arrangement that would actively
 * mislead. It closes on what happens next instead.
 *
 * THE PHOTOGRAPHS ARE THE ORGANISATIONS' OWN, and two of the three carry a
 * photographer's credit that is not optional. See `credit` on EmailImage. They
 * are also the first photographs anywhere on this site: brand-guide.md records
 * that none were supplied and that the layouts were type-led as a result, which
 * was a constraint rather than a preference. Real places and real people are
 * what it asks for, and these are that.
 */

export const metadata: Metadata = {
  // Names all three in the description, because the searches that should land
  // here are for the organisations rather than for the programme.
  title: "The three chosen problems",
  description:
    "Tāhuna Glenorchy Dark Sky Sanctuary, Whakatipu Reforestation Trust and Queenstown Mountain Bike Club. The three problems chosen for the first Community Tech Lab build round.",
  alternates: { canonical: "/builds" },
};

/* The future only, matching the email's table.
 *
 * Not the site's TIMELINE, which starts at applications and whose first three
 * rows are now history. A reader arriving here wants to know what is coming,
 * and a list whose top half has already happened buries it. */
const WHAT_HAPPENS_NEXT = [
  { date: "28 Sep to 9 Oct", label: "Working out exactly what gets made" },
  { date: "12 Oct to 13 Nov", label: "Building it, with something to try each week" },
  { date: "From 13 Nov", label: "Handover, with training and written instructions" },
  { date: "26 Nov", label: "Showcase Hui, where all three are demonstrated" },
];

export default function BuildsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "The three chosen problems", path: "/builds" },
        ])}
      />

      <Section drift="hero" className="pb-7">
        <Eyebrow className="mb-4">Announced 24 September</Eyebrow>
        <Heading level={1} fluid className="max-w-[var(--page-heading-max)]">
          The three are chosen.
        </Heading>
        <Lede className="mt-6">
          A local panel read every application between 1 and 18 September. These are the
          three problems going to a build, chosen on how much difference it would make,
          whether other organisations in the district have the same problem, and whether
          five weeks is honestly enough to do something useful about it.
        </Lede>
      </Section>

      <SectionRule variant="gold" />

      {/* One section per organisation, alternating nothing: same treatment,
          same order as the email, and no numbering. A numbered list of three
          organisations invites the reader to work out which came first, which
          is a question the panel's scoring answers and this page must not. */}
      <Section>
        <div className="flex flex-col gap-16">
          {CHOSEN.map((build) => (
            <Reveal key={build.name}>
              <article className="grid grid-cols-1 items-start gap-9 lg:grid-aside">
                <div>
                  <Eyebrow className="mb-4">{build.place}</Eyebrow>
                  <Heading level={2}>{build.name}</Heading>
                  <Body className="mt-5">{build.who}</Body>
                  <Body className="mt-4">{build.problem}</Body>
                </div>

                <figure className="m-0">
                  {/* The 1120px files from scripts/build-email-photos.mjs, which
                      are already cropped to 3:2. `sizes` stops next/image
                      serving the full width into a column that is never wider
                      than about half the page on a desktop. */}
                  <Image
                    src={`/images/builds/${build.slug}.jpg`}
                    alt={build.image.alt}
                    width={1120}
                    height={747}
                    sizes="(min-width: 1024px) 45vw, 100vw"
                    className="h-auto w-full rounded-card"
                  />
                  {build.image.credit ? (
                    <figcaption className="mt-3">
                      <Eyebrow>{build.image.credit}</Eyebrow>
                    </figcaption>
                  ) : null}
                </figure>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <SectionRule />

      <Section>
        <Reveal>
          <div className="grid grid-cols-1 items-start gap-9 lg:grid-aside">
            <div>
              <Heading level={2}>What happens now</Heading>
              <Body className="mt-5">
                Nobody knows yet what gets built. Each team spends the fortnight from
                28 September sitting down with their organisation and working out what
                would actually help, and only then does anything get made. From 12 October
                there are five weeks of building, with something to try at the end of each
                week.
              </Body>
              <Body className="mt-4">
                All three are demonstrated at the Showcase Hui on 26 November, which FLINT
                Queenstown is running as its Q4 event.
              </Body>
              <Body className="mt-4">
                Everything made is open source. What gets built for these three is there
                for any other organisation in the district to pick up and use.
              </Body>
            </div>

            <Card tone="light" accentRule>
              <Eyebrow className="mb-5">What happens next</Eyebrow>
              <Timeline steps={WHAT_HAPPENS_NEXT} />
              <div className="mt-6 border-t border-solid border-hairline pt-5">
                <Eyebrow>What happens to the rest</Eyebrow>
                <Note className="mt-3">
                  Far more good applications came in than three, and the ones that did not
                  get a build this time were not weak. Most were simply bigger than five
                  weeks. Every organisation that applied hears from us directly.
                </Note>
              </div>
            </Card>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
