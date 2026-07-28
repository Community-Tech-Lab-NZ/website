/* eslint-disable @next/next/no-img-element */
import { clsx } from "clsx";
import { Eyebrow } from "./Typography";

/* Partner row.
 *
 * All six partners get strictly equal treatment; no logo is sized larger than
 * another. Startup Queenstown Lakes leads the programme and holds the fund, and
 * the handoff is explicit that this may be stated in text but must never be
 * shown as a bigger logo.
 *
 * THE PLATES ARE INK, and that is forced by the files rather than chosen. The
 * marks supplied are a mix of variants:
 *
 *   Startup Queenstown Lakes  lime on transparent    needs a dark background
 *   huddl                     white on transparent   needs a dark background
 *   FLINT Queenstown          light blue disc        carries its own background
 *   Queenstown Resort College red tile               carries its own background
 *   Technology Queenstown     navy on transparent    needs a LIGHT background
 *
 * No single plate colour suits all five. Ink suits four of them; white would
 * suit three and would render the two reversed marks invisible. So Ink, and
 * Technology Queenstown keeps a placeholder until a reversed version of their
 * mark arrives — navy on Ink would read as a rendering fault rather than as a
 * missing asset, which is worse than an honest empty slot.
 *
 * Plain <img> rather than next/image: huddl's mark is an SVG, and next/image
 * refuses SVG unless dangerouslyAllowSVG is enabled for the whole project.
 * Enabling that to save a few KB across four small files is a bad trade.
 *
 * The prototype hard-coded three columns and drew cell borders with index maths
 * (i % 3, i < 3), which breaks the moment the grid reflows. This uses a 1px gap
 * over a hairline background instead, so separators stay correct at one, two or
 * three columns without any index arithmetic.
 */

type Partner = {
  name: string;
  /** Public path. Absent where no usable file exists yet. */
  logo?: string;
  /** Intrinsic pixel size, so the browser reserves the box and nothing shifts. */
  w?: number;
  h?: number;
};

export const CTL_PARTNERS: readonly Partner[] = [
  {
    name: "Startup Queenstown Lakes",
    logo: "/logos/startup_queenstown_lakes_logo.webp",
    w: 760,
    h: 300,
  },
  // No website and no logo file supplied.
  { name: "Queenstown Coders Connect" },
  { name: "FLINT Queenstown", logo: "/logos/flint_logo.png", w: 300, h: 300 },
  { name: "Queenstown Resort College", logo: "/logos/qrc_logo.png", w: 130, h: 130 },
  { name: "huddl", logo: "/logos/huddl_logo.svg", w: 239, h: 100 },
  // tq_logo.webp is on file but is the navy-on-transparent variant, which is
  // illegible on Ink. Awaiting a reversed version.
  { name: "Technology Queenstown" },
] as const;

type PartnerRowProps = {
  partners?: readonly Partner[];
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
        {partners.map((partner) => (
          <div
            key={partner.name}
            className={clsx(
              "flex min-h-[var(--partner-cell-min)] flex-col items-center justify-center gap-4 px-4 py-5 text-center",
              "font-heading text-body-sm font-bold leading-tight",
              inverse ? "bg-ink text-heading-inverse" : "bg-oat text-heading",
            )}
          >
            {partner.logo ? (
              <span className="flex h-[var(--partner-slot-h)] w-full max-w-[var(--partner-slot-w)] items-center justify-center rounded-card bg-ink px-3 py-2">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  width={partner.w}
                  height={partner.h}
                  loading="lazy"
                  className="max-h-full w-auto max-w-full object-contain"
                />
              </span>
            ) : (
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
            )}
            <span>{partner.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
