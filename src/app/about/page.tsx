import type { Metadata } from "next";
import { CalloutBanner } from "@/components/CalloutBanner";
import { Card } from "@/components/Card";
import { CaretList } from "@/components/CaretList";
import { FunderCredit } from "@/components/FunderCredit";
import { Pairing } from "@/components/Pairing";
import { PartnerRow } from "@/components/PartnerRow";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/Section";
import { SectionRule } from "@/components/SectionRule";
import { Body, Eyebrow, Heading, Lede } from "@/components/Typography";
import { breadcrumbSchema, JsonLd, showcaseEventSchema } from "@/lib/structured-data";

/* About. Copy transcribed verbatim from the prototype. */

export const metadata: Metadata = {
  title: "About the programme",
  description:
    "The Queenstown Lakes district has developers with capacity to spare and community organisations running on spreadsheets. Nothing was connecting them.",
  alternates: { canonical: "/about" },
};

const PEOPLE = [
  {
    name: "Dr Pradeesh Parameswaran",
    role: "Delivery lead",
    accent: true,
    paragraphs: [
      "Pradeesh runs the programme day to day. He holds a PhD in computer science from the University of Otago, specialising in natural language processing, and teaches AI and generative AI courses at Queenstown Resort College.",
      "He is responsible for delivery: recruitment, the build schedule, technical standards across the three teams, and getting everything handed over properly.",
      "His research background is in how people actually write and speak, rather than how software wishes they would, which is a useful instinct in a programme where most of the work is understanding a problem before building anything. He also sits closest to the developers coming through Queenstown Resort College, so he sees which of them are ready for real client work.",
    ],
  },
  {
    name: "Gio Stephens",
    role: "Chair",
    accent: false,
    paragraphs: [
      "Gio founded Queenstown Coders Connect, the district's regular meet-up for local developers, and chairs FLINT Queenstown, the local branch of TUANZ. He works as a software engineer building AI systems.",
      "From 2024 to 2026 he was community investment adviser at Queenstown Lakes District Council, managing the community fund and designing The Funding Series, a capability programme helping community groups become more financially sustainable. That work meant sitting across the table from a lot of local organisations and hearing the same thing repeatedly: the problem was not always money, it was that the tools they needed did not exist at a price they could pay.",
      "He also advises Queenstown Resort College on its data and machine learning programmes, which is part of why QRC students have a guaranteed place in this cohort.",
    ],
  },
];

const PARTNER_ROLES = [
  <span key="sql">
    <strong>Startup Queenstown Lakes</strong> leads the programme, holds the funding and
    contracts the developers.
  </span>,
  <span key="qcc">
    <strong>Queenstown Coders Connect</strong> provides technical leadership, mentoring
    and developer recruitment.
  </span>,
  <span key="flint">
    <strong>FLINT Queenstown</strong> brings mentorship and hosts the closing Showcase Hui
    as its Q4 event.
  </span>,
  <span key="qrc">
    <strong>Queenstown Resort College</strong> supports recruitment and learning pathways,
    and reserves a place in the cohort for a current student or recent graduate.
  </span>,
  <span key="huddl">
    <strong>huddl</strong> connects the programme to the not-for-profit sector.
  </span>,
  <span key="tq">
    <strong>Technology Queenstown</strong> advises on the wider ecosystem and employer
    connections.
  </span>,
];

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={[
          showcaseEventSchema(),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
          ]),
        ]}
      />
      <Section className="pb-7">
        <Eyebrow className="mb-4">About</Eyebrow>
        <Heading level={1} fluid className="max-w-[var(--page-heading-max)]">
          Why this exists
        </Heading>
        <Lede className="mt-6">
          Two things are true about the Queenstown Lakes district at the same time.
        </Lede>
      </Section>

      <SectionRule variant="gold" />

      <Section>
        <Reveal>
          <Pairing
            joinLabel="Nothing was connecting them"
            left={{
              eyebrow: "One side",
              title: "Developers with capacity to spare",
              body: "There are more developers, designers and engineers living here than most people realise. Many work remotely for companies elsewhere, and plenty have room in their week and want that time to go somewhere local.",
            }}
            right={{
              eyebrow: "The other side",
              title: "Organisations running on spreadsheets",
              body: "Hundreds of community organisations across the district run on spreadsheets, shared inboxes and phone trees. Booking systems that are a whiteboard. Membership records in three places. The budget goes to the mahi, not to software.",
            }}
          />

          {/* Centred only from md up. The prototype centred this block at every
              width, which works in a wide column but not on a phone: three
              paragraphs of centred body copy give a ragged left edge and the eye
              loses its place on every line. Left-aligned below md, unchanged
              above it. */}
          <div className="mx-auto mt-9 max-w-measure md:text-center">
            <Body className="mx-auto">
              Queenstown Lakes is a district of about fifty thousand residents carrying
              several million visitors a year, and the community sector holds a lot of
              that weight. Hundreds of organisations operate here, most of them small,
              most of them run by a handful of people who are already stretched. Where an
              organisation elsewhere might have an operations person, here the same work
              sits on top of someone&rsquo;s actual job.
            </Body>
            <Body className="mx-auto mt-4">
              Software is what gets skipped. Not because nobody has thought about it, but
              because the money goes to the mahi and a quote for custom development is out
              of the question. Meanwhile the district has a real technical population,
              working remotely for companies elsewhere, largely invisible to the
              organisations down the road. Two problems that happen to be each
              other&rsquo;s answer.
            </Body>
            <Body className="mx-auto mt-4">
              This programme is the attempt to solve both at once. Community organisations
              get something they could not otherwise afford. Local developers get paid
              work at a community rate, mentoring, and a reason to be in a room together.
            </Body>
          </div>
        </Reveal>
      </Section>

      <Section flush>
        <Reveal>
          <Eyebrow as="h2" className="mb-5">Who is behind it</Eyebrow>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(var(--col-min-wide),1fr))] items-start gap-6">
            {PEOPLE.map((person) => (
              <Card key={person.name} tone="light" accentRule={person.accent}>
                <Heading level={3} as="h3" className="text-body-lg">
                  {person.name}
                </Heading>
                <div className="mt-2 font-meta text-label uppercase text-muted">
                  {person.role}
                </div>
                {person.paragraphs.map((para, i) => (
                  <p
                    key={i}
                    className="mt-4 max-w-measure font-sans text-body-sm text-body"
                  >
                    {para}
                  </p>
                ))}
              </Card>
            ))}
          </div>
        </Reveal>
      </Section>

      <Section flush>
        <Reveal>
          <Eyebrow className="mb-5">Who is involved</Eyebrow>
          <Heading level={3} as="h2">
            Six organisations deliver Community Tech Lab together
          </Heading>
          <div className="mt-6">
            <CaretList items={PARTNER_ROLES} />
          </div>
          <div className="mt-7">
            {/* Eyebrow suppressed: the section already says who is involved. */}
            <PartnerRow eyebrow={null} />
          </div>
          <div className="mt-7">
            <FunderCredit note={null} />
          </div>
        </Reveal>
      </Section>

      <Section tone="ink" tight>
        <CalloutBanner
          bare
          eyebrow="Applications open 15 to 31 August"
          title="Apply now"
          note="Open to community organisations and to developers based in the district."
          actionLabel="Apply now"
          actionHref="/apply"
        />
      </Section>
    </>
  );
}
