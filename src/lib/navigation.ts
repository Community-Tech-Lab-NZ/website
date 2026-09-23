import type { TimelineStep } from "@/components/Timeline";
import { getSiteCopy, isAnnounced } from "./application-window";

/* Navigation, footer and timeline data, lifted from the prototype.
 *
 * The prototype switched views client-side with string ids ('community',
 * 'developers'). These are real routes now, so ids become hrefs. Route naming
 * follows the handoff: /organisations rather than /community, because the nav
 * label is "For organisations" and the URL should match what people read.
 */

export type NavItem = { href: string; label: string };

const BASE_NAV: NavItem[] = [
  { href: "/organisations", label: "For organisations" },
  { href: "/developers", label: "For developers" },
  { href: "/about", label: "About" },
];

/** The builds lead the nav once they are public. */
export function nav(announced: boolean = isAnnounced()): NavItem[] {
  return announced ? [{ href: "/builds", label: "The builds" }, ...BASE_NAV] : BASE_NAV;
}

export type FooterColumn = {
  title: string;
  links: { label: string; href?: string }[];
};

/* One place for partner websites, used by the footer, the partner logo wall
 * and the about page's roles list.
 *
 * Queenstown Coders Connect has no entry because it has no website. It is real
 * and active — Queenstown's tourism board lists it alongside FLINT and the
 * Chamber — but it runs through events and word of mouth rather than a site of
 * its own. The only codersconnect domain on the web belongs to an unrelated
 * recruitment agency in the UK, so linking anything would be worse than
 * linking nothing.
 *
 * FLINT is a TUANZ programme and the Queenstown chapter has no separate page,
 * so the link goes to FLINT itself rather than a chapter URL that does not
 * exist. */
export const PARTNER_URLS: Record<string, string> = {
  "Startup Queenstown Lakes": "https://www.startupqueenstownlakes.com",
  "FLINT Queenstown": "https://tuanz.org.nz/about-flint/",
  "Queenstown Resort College": "https://www.qrc.ac.nz",
  huddl: "https://huddl.nz",
  "Technology Queenstown": "https://www.technologyqueenstown.com",
};

/** The fund's page on the council site, verified live 28 July 2026.
 *
 *  Here rather than beside the component that first used it, because the email's
 *  credit wall now links its marks too and a second copy of a council URL is a
 *  second thing to re-verify when the council reorganises its site. */
export const FUNDER_URL =
  "https://www.qldc.govt.nz/community/community-funding/economic-diversification-fund/";

/* A function rather than a constant because the first column follows the
 * round: an apply link while applications run, the builds once announced. */
export function footerColumns(now: Date = new Date()): FooterColumn[] {
  const cta = getSiteCopy(now).cta;
  const first: FooterColumn = isAnnounced(now)
    ? {
        title: "This round",
        links: [
          { label: "The builds", href: "/builds" },
          { label: "For organisations", href: "/organisations" },
          { label: "For developers", href: "/developers" },
        ],
      }
    : {
        title: "Take part",
        links: [
          { label: "For organisations", href: "/organisations" },
          { label: "For developers", href: "/developers" },
          { label: cta.label, href: cta.href },
        ],
      };

  return [
    first,
    {
      title: "Programme",
      links: [
        { label: "About", href: "/about" },
        { label: "Programme terms", href: "/terms" },
        { label: "Privacy", href: "/privacy" },
      ],
    },
    {
      /* All six are listed at strictly equal weight, in the order the handoff
       * gives them. An absolute href opens in a new tab; see SiteFooter. */
      title: "Partners",
      links: [
        { label: "Startup Queenstown Lakes", href: PARTNER_URLS["Startup Queenstown Lakes"] },
        { label: "Queenstown Coders Connect" },
        { label: "FLINT Queenstown", href: PARTNER_URLS["FLINT Queenstown"] },
        { label: "Queenstown Resort College", href: PARTNER_URLS["Queenstown Resort College"] },
        { label: "huddl", href: PARTNER_URLS["huddl"] },
        { label: "Technology Queenstown", href: PARTNER_URLS["Technology Queenstown"] },
      ],
    },
  ];
}

/* `ends` is the exclusive NZ end of each step; a step is done once it passes,
 * so the card keeps itself current. `past` is the label once it has happened.
 * October and November are NZDT, hence +13:00. */
const TIMELINE_STEPS: { date: string; label: string; past?: string; ends: string }[] = [
  { date: "15 to 31 Aug", label: "Applications open", ends: "2026-09-01T00:00:00+12:00" },
  {
    date: "1 to 18 Sep",
    label: "A local panel reads every application",
    past: "Every application read by a local panel",
    ends: "2026-09-19T00:00:00+12:00",
  },
  {
    date: "24 Sep",
    label: "The three builds are announced",
    past: "The three builds announced",
    // Follows the site's own switch, override included.
    ends: "announced",
  },
  { date: "28 Sep to 9 Oct", label: "Working out exactly what gets built", ends: "2026-10-10T00:00:00+13:00" },
  { date: "12 Oct to 13 Nov", label: "Five-week build, something to try each week", ends: "2026-11-14T00:00:00+13:00" },
  { date: "26 Nov", label: "Showcase Hui, the three tools demonstrated", ends: "2026-11-27T00:00:00+13:00" },
];

export function timeline(now: Date = new Date()): TimelineStep[] {
  const announced = isAnnounced(now);
  return TIMELINE_STEPS.map(({ date, label, past, ends }) => {
    const done = ends === "announced" ? announced : now.getTime() >= new Date(ends).getTime();
    return { date, label: done && past ? past : label, done };
  });
}

export const FOOTER_NOTE =
  "A Startup Queenstown Lakes programme, funded by the QLDC Economic Diversification Fund";

export const OPEN_SOURCE_NOTE = "Everything we build is open source";
