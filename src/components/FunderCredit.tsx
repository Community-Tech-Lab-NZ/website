import Image from "next/image";
import { clsx } from "clsx";
import { Eyebrow } from "./Typography";

/* Funder credit.
 *
 * The QLDC Economic Diversification Fund must be credited on any page promoting
 * the programme, so this is mandatory rather than decorative.
 *
 * Economic Futures is the team; the Economic Diversification Fund is the money.
 * The supplied mark is a combined Economic Futures / QLDC lockup, so the logo
 * carries both organisations and the text carries the fund.
 *
 * THE WHITE PLATE IS DELIBERATE, and it is the one place on this site where a
 * palette other than the brand's four colours appears. The lockup is purple and
 * navy on white, a funder's mark may not be recoloured or reversed, and both
 * colours are illegible on Ink. A light plate is the standard treatment and the
 * only one that shows the mark as supplied.
 *
 * On the Oat surfaces it is not an exception at all: --surface-card is white, so
 * the plate reads as an ordinary card there.
 *
 * next/image rather than the plain <img> that Logo uses. That comment explains
 * itself: the lockups are SVG and have nothing to optimise. This is a 23KB
 * JPEG, which does.
 */

type FunderCreditProps = {
  inverse?: boolean;
  note?: string | null;
  className?: string;
};

export function FunderCredit({ inverse = false, note = null, className }: FunderCreditProps) {
  // flex-wrap: the plate plus the fund name is ~380px, wider than small
  // phones, so the text drops below the plate rather than pushing the page
  // into horizontal scroll.
  return (
    <div className={clsx("flex flex-wrap items-center gap-5", className)}>
      <div className="flex shrink-0 items-center justify-center rounded-card bg-white p-3">
        <Image
          src="/logos/economic_futures_logo.jpg"
          alt="Economic Futures, Queenstown Lakes District Council"
          width={885}
          height={159}
          className="block h-[var(--funder-logo-h)] w-auto"
        />
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
