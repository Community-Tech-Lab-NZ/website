import Image from "next/image";
import { clsx } from "clsx";
import { ExternalLink } from "./ExternalLink";
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

/* The fund's page on the council site, verified live 28 July 2026. */
const FUND_URL =
  "https://www.qldc.govt.nz/community/community-funding/economic-diversification-fund/";

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
      {/* Plate and fund name both link to the fund's page on qldc.govt.nz,
          and the plate grows on hover like the partner logos — same promise,
          same behaviour. */}
      <ExternalLink
        href={FUND_URL}
        className="ctl-grow flex shrink-0 items-center justify-center rounded-card bg-white p-3 no-underline"
      >
        <Image
          src="/logos/economic_futures_logo.jpg"
          alt="Economic Futures, Queenstown Lakes District Council"
          width={885}
          height={159}
          className="block h-[var(--funder-logo-h)] w-auto"
        />
        <span className="sr-only"> QLDC Economic Diversification Fund</span>
      </ExternalLink>

      <div>
        <Eyebrow inverse={inverse}>Funded by</Eyebrow>
        <ExternalLink
          href={FUND_URL}
          className={clsx(
            "ctl-link-grow mt-2 block font-heading text-body-md font-bold no-underline",
            "underline decoration-transparent hover:decoration-current",
            inverse ? "text-heading-inverse" : "text-heading",
          )}
        >
          QLDC Economic Diversification Fund
        </ExternalLink>
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
