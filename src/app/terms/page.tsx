import type { Metadata } from "next";
import { Card } from "@/components/Card";
import { ClosingCta } from "@/components/ClosingCta";
import { NumberedSections } from "@/components/NumberedSections";
import { Section } from "@/components/Section";
import { SectionRule } from "@/components/SectionRule";
import { Eyebrow, Heading, Lede, Note } from "@/components/Typography";
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

        {/* A real caveat, not a launch artifact, and it outlived the launch.
            It used to be headed "Before this goes live" and said all three
            underlying documents were drafts. The site is live and the
            memorandum of understanding is settled, so both of those had to go;
            the Pilot Organisation Agreement is still being finalised and still
            going to legal review, which is the part a reader relying on this
            summary genuinely needs to know. Retitled rather than removed.
            Remove it once that agreement is signed off. */}
        <Card tone="sunk" className="mt-8 max-w-[var(--terms-measure)]">
          <Eyebrow>About these terms</Eyebrow>
          <Note className="mt-3">
            This page is a plain-language summary of the programme&rsquo;s assessment
            criteria, the partner memorandum of understanding, and the Pilot Organisation
            Agreement. Only selected organisations sign that agreement, and it is still
            being finalised and going to legal review. Where this summary and the signed
            agreement differ, the agreement is the one that counts. Its waiver, indemnity
            and limitation of liability are legally operative, and how far liability can
            be limited under the Consumer Guarantees Act 1993 and Fair Trading Act 1986
            depends on the circumstances, so read the agreement itself before signing it.
          </Note>
        </Card>
      </Section>

      <ClosingCta
        title="Get involved"
        note="Open to community organisations and to developers based in the district."
      />
    </>
  );
}
