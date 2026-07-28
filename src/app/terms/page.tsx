import type { Metadata } from "next";
import { Card } from "@/components/Card";
import { ClosingCta } from "@/components/ClosingCta";
import { NumberedSections } from "@/components/NumberedSections";
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
        <NumberedSections sections={TERMS_SECTIONS} />

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

      <ClosingCta
        title="Get involved"
        note="Open to community organisations and to developers based in the district."
      />
    </>
  );
}
