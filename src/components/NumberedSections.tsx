import { Reveal } from "./Reveal";
import { Body, Heading } from "./Typography";

/* The numbered long-form shell shared by /terms and /privacy: one
 * hairline-topped row per section, Space Mono number in the left column,
 * paragraphs capped at the reading measure. Extracted because the two pages
 * had copy-pasted the whole arrangement, contrast note and all.
 *
 * Paragraphs are ReactNode rather than string so the odd one can carry a
 * link (the privacy notice does); the terms content is plain strings. */

export type NumberedSection = {
  number: string;
  title: string;
  paragraphs: React.ReactNode[];
};

export function NumberedSections({ sections }: { sections: readonly NumberedSection[] }) {
  return (
    <div className="grid max-w-[var(--terms-measure)] gap-7">
      {sections.map((section) => (
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
                <Body key={i}>{para}</Body>
              ))}
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
