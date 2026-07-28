import type { TimelineStep } from "@/components/Timeline";

/* Navigation, footer and timeline data, lifted from the prototype.
 *
 * The prototype switched views client-side with string ids ('community',
 * 'developers'). These are real routes now, so ids become hrefs. Route naming
 * follows the handoff: /organisations rather than /community, because the nav
 * label is "For organisations" and the URL should match what people read.
 */

export type NavItem = { href: string; label: string };

export const NAV: NavItem[] = [
  { href: "/organisations", label: "For organisations" },
  { href: "/developers", label: "For developers" },
  { href: "/about", label: "About" },
];

export type FooterColumn = {
  title: string;
  links: { label: string; href?: string }[];
};

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Take part",
    links: [
      { label: "For organisations", href: "/organisations" },
      { label: "For developers", href: "/developers" },
      { label: "Apply now", href: "/apply" },
    ],
  },
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
     * gives them. An absolute href opens in a new tab; see SiteFooter.
     *
     * Queenstown Coders Connect has no href because it has no website. It is
     * real and active — Queenstown's tourism board lists it alongside FLINT and
     * the Chamber — but it runs through events and word of mouth rather than a
     * site of its own. The only codersconnect domain on the web belongs to an
     * unrelated recruitment agency in the UK, so linking anything here would be
     * worse than linking nothing.
     *
     * FLINT is a TUANZ programme and the Queenstown chapter has no separate
     * page, so the link goes to FLINT itself rather than a chapter URL that
     * does not exist.
     */
    title: "Partners",
    links: [
      { label: "Startup Queenstown Lakes", href: "https://www.startupqueenstownlakes.com" },
      { label: "Queenstown Coders Connect" },
      { label: "FLINT Queenstown", href: "https://tuanz.org.nz/about-flint/" },
      { label: "Queenstown Resort College", href: "https://www.qrc.ac.nz" },
      { label: "huddl", href: "https://huddl.nz" },
      { label: "Technology Queenstown", href: "https://www.technologyqueenstown.com" },
    ],
  },
];

export const TIMELINE: TimelineStep[] = [
  { date: "15 to 31 Aug", label: "Applications open", done: true },
  { date: "1 to 18 Sep", label: "A local panel reads every application" },
  { date: "24 Sep", label: "The three builds are announced" },
  { date: "28 Sep to 9 Oct", label: "Discovery, agreeing what gets built" },
  { date: "12 Oct to 13 Nov", label: "Five-week build, in weekly sprints" },
  { date: "26 Nov", label: "Showcase Hui, the three solutions demonstrated" },
];

export const FOOTER_NOTE =
  "A Startup Queenstown Lakes programme, funded by the QLDC Economic Diversification Fund";

export const OPEN_SOURCE_NOTE = "Everything we build is open source";
