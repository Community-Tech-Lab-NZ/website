/* eslint-disable @next/next/no-img-element */
import { clsx } from "clsx";
import { ExternalLink } from "./ExternalLink";
import { Eyebrow } from "./Typography";
import { PARTNER_URLS } from "@/lib/navigation";

/* Partner row.
 *
 * All six partners get strictly equal treatment; no logo is sized larger than
 * another. Startup Queenstown Lakes leads the programme and holds the fund, and
 * the handoff is explicit that this may be stated in text but must never be
 * shown as a bigger logo.
 *
 * EACH MARK SITS ON THE GROUND IT WAS DESIGNED FOR, checked against how the
 * partners present themselves on their own sites. An earlier pass put every
 * logo on an identical Ink plate, which read as six dark rectangles floating in
 * light cells and forced the wrong ground onto half the marks:
 *
 *   FLINT           light blue disc, self-contained     direct on the cell
 *   QRC             red tile, self-contained            direct on the cell
 *   Technology Q    navy, designed for light            direct on the cell
 *   Startup QL      lime reversed mark                  chip in SQL deep blue
 *   huddl           white mark, lives on their orange   chip in huddl orange
 *
 * The chip hugs its logo rather than being a fixed plate, and each chip is the
 * PARTNER'S OWN ground colour, supplied by the programme: #182073 for Startup
 * Queenstown Lakes, #F77815 for huddl (their site's hero orange). These two
 * hex values are the only non-palette colours in the codebase, which is why
 * they are inline styles rather than utilities — they are someone else's brand
 * constants, not ours, and the theme lock should keep refusing them.
 *
 * Plain <img> rather than next/image: huddl's mark is an SVG, and next/image
 * refuses SVG unless dangerouslyAllowSVG is enabled for the whole project.
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
  /** Chip colour for reversed marks: the partner's own ground. Absent means
   *  the mark sits directly on the light cell. */
  chip?: string;
};

export const CTL_PARTNERS: readonly Partner[] = [
  {
    name: "Startup Queenstown Lakes",
    logo: "/logos/startup_queenstown_lakes_logo.webp",
    w: 760,
    h: 300,
    chip: "#182073",
  },
  // No website and no logo file supplied.
  { name: "Queenstown Coders Connect" },
  { name: "FLINT Queenstown", logo: "/logos/flint_logo.png", w: 300, h: 300 },
  { name: "Queenstown Resort College", logo: "/logos/qrc_logo.png", w: 130, h: 130 },
  { name: "huddl", logo: "/logos/huddl_logo.svg", w: 239, h: 100, chip: "#F77815" },
  { name: "Technology Queenstown", logo: "/logos/tq_logo.webp", w: 1500, h: 291 },
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
              "flex min-h-[var(--partner-cell-min)] flex-col items-center justify-center gap-4 px-4 py-6 text-center",
              "font-heading text-body-sm font-bold leading-tight",
              inverse ? "bg-ink text-heading-inverse" : "bg-oat text-heading",
            )}
          >
            {partner.logo ? (
              /* The logo is the same link as the name below it — a logo that
                 grows on hover and then does nothing when clicked would be a
                 broken promise. The img alt names the link; the sr-only span
                 flags the new tab. */
              <LinkedLogo name={partner.name}>
                {partner.chip ? (
                  <span
                    className="ctl-grow flex items-center justify-center rounded-card px-4 py-2"
                    style={{ background: partner.chip }}
                  >
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      width={partner.w}
                      height={partner.h}
                      loading="lazy"
                      className="block h-[var(--partner-chip-logo-h)] w-auto max-w-[var(--partner-logo-max-w)] object-contain"
                    />
                  </span>
                ) : (
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    width={partner.w}
                    height={partner.h}
                    loading="lazy"
                    className="ctl-grow block h-[var(--partner-logo-h)] w-auto max-w-[var(--partner-logo-max-w)] object-contain"
                  />
                )}
              </LinkedLogo>
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
            {PARTNER_URLS[partner.name] ? (
              <ExternalLink
                href={PARTNER_URLS[partner.name]}
                className={clsx(
                  "ctl-link-grow underline decoration-transparent hover:decoration-current",
                  inverse ? "text-heading-inverse" : "text-heading",
                )}
              >
                {partner.name}
              </ExternalLink>
            ) : (
              <span>{partner.name}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* Wraps a partner logo in its site link where one exists; renders the logo
   bare where it does not (no partner currently has a logo without a site,
   but the data allows it). The img alt names the link and ExternalLink adds
   the new-tab note. */
function LinkedLogo({ name, children }: { name: string; children: React.ReactNode }) {
  const href = PARTNER_URLS[name];
  if (!href) return <>{children}</>;
  return (
    <ExternalLink href={href} className="no-underline">
      {children}
    </ExternalLink>
  );
}
