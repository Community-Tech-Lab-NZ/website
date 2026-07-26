import { clsx } from "clsx";
import { Eyebrow } from "./Typography";

/* Partner row.
 *
 * All six partners get strictly equal treatment; no logo is sized larger than
 * another. Startup Queenstown Lakes leads the programme and holds the fund, and
 * the handoff is explicit that this may be stated in text but must never be
 * shown as a bigger logo.
 *
 * No partner logo files were supplied, so each slot renders a dashed placeholder
 * above the partner name in Archivo.
 *
 * The prototype hard-coded three columns and drew cell borders with index maths
 * (i % 3, i < 3), which breaks the moment the grid reflows. This uses a 1px gap
 * over a hairline background instead, so separators stay correct at one, two or
 * three columns without any index arithmetic.
 */

export const CTL_PARTNERS = [
  "Startup Queenstown Lakes",
  "Queenstown Coders Connect",
  "FLINT Queenstown",
  "Queenstown Resort College",
  "huddl",
  "Technology Queenstown",
] as const;

type PartnerRowProps = {
  partners?: readonly string[];
  eyebrow?: string | null;
  inverse?: boolean;
  className?: string;
};

export function PartnerRow({
  partners = CTL_PARTNERS,
  eyebrow = "Delivered with",
  inverse = false,
  className,
}: PartnerRowProps) {
  return (
    <div className={className}>
      {eyebrow ? (
        <Eyebrow inverse={inverse} className="mb-5">
          {eyebrow}
        </Eyebrow>
      ) : null}

      <div
        className={clsx(
          "grid grid-cols-1 gap-px border border-solid sm:grid-cols-2 lg:grid-cols-3",
          inverse ? "border-hairline-inverse bg-hairline-inverse" : "border-hairline bg-hairline",
        )}
      >
        {partners.map((name) => (
          <div
            key={name}
            className={clsx(
              "flex min-h-[var(--partner-cell-min)] flex-col items-center justify-center gap-4 px-4 py-5 text-center",
              "font-heading text-body-sm font-bold leading-tight",
              inverse ? "bg-ink text-heading-inverse" : "bg-oat text-heading",
            )}
          >
            <span
              aria-hidden="true"
              className={clsx(
                "flex h-[var(--partner-slot-h)] w-full max-w-[var(--partner-slot-w)] items-center justify-center border border-dashed",
                "font-meta text-[length:var(--slot-label-size)] font-normal uppercase tracking-[var(--slot-label-tracking)]",
                inverse
                  ? "border-hairline-inverse text-muted-inverse"
                  : "border-hairline text-muted",
              )}
            >
              Logo slot
            </span>
            <span>{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
