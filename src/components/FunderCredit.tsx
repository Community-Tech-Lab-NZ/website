import { clsx } from "clsx";
import { Eyebrow } from "./Typography";

/* Funder credit.
 *
 * The QLDC Economic Diversification Fund must be credited on any page promoting
 * the programme, so this is mandatory rather than decorative.
 *
 * Economic Futures is the team; the Economic Diversification Fund is the money.
 * Funder credits name the funding instrument, so the text carries the fund and
 * the logo slot carries whichever mark QLDC approves — likely the Economic
 * Futures one. Confirm their required wording when requesting logo approval,
 * because a funder's own wording overrides ours.
 *
 * Their logo needs written approval before use. This renders an empty slot
 * rather than a mark pulled from the web.
 */

type FunderCreditProps = {
  inverse?: boolean;
  note?: string | null;
  className?: string;
};

export function FunderCredit({
  inverse = false,
  note = "Logo pending written approval",
  className,
}: FunderCreditProps) {
  return (
    <div className={clsx("flex items-center gap-5", className)}>
      <div
        aria-hidden="true"
        className={clsx(
          "flex h-[var(--funder-slot-h)] w-[var(--funder-slot-w)] shrink-0 items-center justify-center border border-dashed p-2 text-center",
          "font-meta text-[length:var(--slot-label-size)] uppercase tracking-[var(--slot-label-tracking)]",
          inverse ? "border-hairline-inverse text-muted-inverse" : "border-hairline text-muted",
        )}
      >
        QLDC logo slot
      </div>

      <div>
        <Eyebrow inverse={inverse}>Funded by</Eyebrow>
        <div
          className={clsx(
            "mt-2 font-heading text-body-md font-bold",
            inverse ? "text-heading-inverse" : "text-heading",
          )}
        >
          QLDC Economic Diversification Fund
        </div>
        {note ? (
          <div
            className={clsx(
              "font-sans text-body-sm",
              inverse ? "text-muted-inverse" : "text-muted",
            )}
          >
            {note}
          </div>
        ) : null}
      </div>
    </div>
  );
}
