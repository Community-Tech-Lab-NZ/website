import type { Metadata } from "next";
import { Card } from "@/components/Card";
import { ScoringTable, SCORING_APPLY } from "@/components/ScoringTable";
import { Section } from "@/components/Section";
import { Timeline } from "@/components/Timeline";
import { Body, Eyebrow, Heading } from "@/components/Typography";
import { TIMELINE } from "@/lib/navigation";

/* Apply.
 *
 * PHASE 3 SHELL. The static furniture is here — the heading, the key dates card
 * and the scoring card. The two forms and the submission pipeline are phase 4,
 * which is the critical path.
 *
 * Layout note: the sidebar drops below the form on narrow screens, so the key
 * dates and scoring stay visible without pushing a 32-field form off the page.
 */

export const metadata: Metadata = {
  title: "Apply",
  description:
    "Applications open 15 to 31 August. Six sections, about 45 to 60 minutes. You do not need to be technical.",
};

export default function ApplyPage() {
  return (
    <Section>
      <div className="grid grid-cols-1 items-start gap-9 lg:grid-cols-[minmax(var(--col-min-wide),1fr)_minmax(var(--col-min-narrow),0.6fr)]">
        <div>
          <Eyebrow className="mb-4">Applications open 15 to 31 August</Eyebrow>
          <Heading level={2} as="h1">Apply now</Heading>
          <Body className="mt-4">
            Six sections, about 45 to 60 minutes. You do not need to be technical, and you
            do not need to know how it would be built. Focus on the problem you are trying
            to solve.
          </Body>

          <Card tone="sunk" className="mt-6">
            <Eyebrow>Not built yet</Eyebrow>
            <p className="mt-3 max-w-measure font-sans text-body-sm text-body">
              The application forms arrive in the next phase, along with the submission
              pipeline, draft autosave and confirmation emails.
            </p>
          </Card>
        </div>

        <div className="grid gap-6">
          <Card tone="light" accentRule>
            <Eyebrow className="mb-5">Key dates</Eyebrow>
            <Timeline steps={TIMELINE} />
          </Card>

          <ScoringTable rows={SCORING_APPLY}>
            <p className="mt-4 max-w-measure font-sans text-body-sm text-muted">
              Something that could help several organisations, not just one, is especially
              welcome. If you are unsure whether your idea fits, apply anyway and we will
              talk it through.
            </p>
          </ScoringTable>
        </div>
      </div>
    </Section>
  );
}
