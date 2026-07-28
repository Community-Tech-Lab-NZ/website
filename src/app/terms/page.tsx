import type { Metadata } from "next";
import { CalloutBanner } from "@/components/CalloutBanner";
import { Card } from "@/components/Card";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/Section";
import { SectionRule } from "@/components/SectionRule";
import { Eyebrow, Heading, Lede } from "@/components/Typography";
import { TERMS_SECTIONS, TERMS_UPDATED } from "@/lib/terms";

/* Programme terms. Reached from the footer only.
 *
 * Long-form copy in a capped reading column. Content lives in src/lib/terms.ts,
 * extracted verbatim rather than retyped.
 */

export const metadata: Metadata = {
  title: "Programme terms",
  description:
    "Who can apply, how applications are assessed, what you receive, who owns the data and the code, and what happens after a build finishes.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <>
      <Section drift="hero" className="pb-6">
        <Eyebrow className="mb-4">Programme terms</Eyebrow>
        <Heading level={1} fluid className="max-w-[var(--terms-measure)]">
          How this programme works, in full.
        </Heading>
        <Lede className="mt-6">
          The short version is on the other pages. This is the detail: who can apply, how
          applications are assessed, what you receive and what you are responsible for,
          who owns the data and the code, and what happens after a build finishes.
        </Lede>
        <div className="mt-5">
          <Eyebrow>{TERMS_UPDATED}</Eyebrow>
        </div>
      </Section>

      <SectionRule variant="gold" />

      <Section>
        <div className="grid max-w-[var(--terms-measure)] gap-7">
          {TERMS_SECTIONS.map((section) => (
            <Reveal
              as="section"
              key={section.number}
              className="grid grid-cols-[var(--terms-number-col)_1fr] gap-5 border-t border-solid border-hairline pt-6"
            >
              {/* Darker Fern, not --ctl-fern. Fern on Oat is 3.58:1 and this is 14px
                  bold, which is not "large text" under WCAG, so it needed 4.5:1.
                  Same substitution StatusTag already makes; 4.74:1. */}
              <div className="font-meta text-body-sm font-bold text-action-tertiary-hover">
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
            </Reveal>
          ))}
        </div>

        {/* Carried over from the prototype. This is a real caveat, not a
            placeholder: the underlying agreements are still drafts. */}
        <Card tone="sunk" className="mt-8 max-w-[var(--terms-measure)]">
          <Eyebrow>Before this goes live</Eyebrow>
          <p className="mt-3 max-w-measure font-sans text-body-sm text-body">
            This page is a plain-language summary of the programme&rsquo;s assessment
            criteria, the partner memorandum of understanding, and the Pilot Organisation
            Agreement, all of which are still drafts. The waiver, indemnity and limitation
            of liability in the Pilot Organisation Agreement are legally operative and how
            far liability can be limited under the Consumer Guarantees Act 1993 and Fair
            Trading Act 1986 depends on the circumstances, so a lawyer needs to review
            both that agreement and this summary before anyone is asked to sign or rely on
            it.
          </p>
        </Card>
      </Section>

      <Section tone="ink" tight>
        <CalloutBanner
          bare
          eyebrow="Applications open 15 to 31 August"
          title="Get involved"
          note="Open to community organisations and to developers based in the district."
          actionLabel="Apply now"
          actionHref="/apply"
        />
      </Section>
    </>
  );
}
