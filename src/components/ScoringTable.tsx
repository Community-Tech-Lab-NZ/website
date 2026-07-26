import { Card } from "./Card";
import { Eyebrow } from "./Typography";

/* The selection rubric, shown to applicants on two pages.
 *
 * The rows are passed in rather than hard-coded, because the prototype words two
 * criteria differently on each page: /organisations says "Reusable by other
 * organisations" and "Readiness to adopt it", while /apply says "Reuse and wider
 * application" and "Readiness and adoption". The weights match; only the labels
 * differ.
 *
 * That is preserved rather than unified, since the handoff marks copy as final
 * and iterated with the programme team. Worth them deciding whether the
 * difference is deliberate before launch — an applicant reading both pages will
 * see two names for the same criterion.
 */

export type ScoringRow = readonly [criterion: string, weight: string];

export const SCORING_ORGANISATIONS: ScoringRow[] = [
  ["Genuine need", "25%"],
  ["Reusable by other organisations", "20%"],
  ["Realistic scope and deliverability", "20%"],
  ["Readiness to adopt it", "15%"],
  ["Strategic and community fit", "10%"],
  ["Data, risk and sustainability", "10%"],
];

export const SCORING_APPLY: ScoringRow[] = [
  ["Genuine need", "25%"],
  ["Reuse and wider application", "20%"],
  ["Realistic scope and deliverability", "20%"],
  ["Readiness and adoption", "15%"],
  ["Strategic and community fit", "10%"],
  ["Data, risk and sustainability", "10%"],
];

type ScoringTableProps = {
  rows: ScoringRow[];
  children?: React.ReactNode;
  className?: string;
};

export function ScoringTable({ rows, children, className }: ScoringTableProps) {
  return (
    <Card tone="light" className={className}>
      <Eyebrow className="mb-4">How applications are scored</Eyebrow>
      <dl className="m-0">
        {rows.map(([criterion, weight], i) => (
          <div
            key={criterion}
            className={`flex justify-between gap-4 py-3 ${
              i ? "border-t border-solid border-hairline" : ""
            }`}
          >
            <dt className="font-sans text-body-sm">{criterion}</dt>
            <dd className="m-0 font-meta text-body-sm font-bold">{weight}</dd>
          </div>
        ))}
      </dl>
      {children}
    </Card>
  );
}
