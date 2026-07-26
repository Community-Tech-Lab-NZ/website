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
    // No hrefs: partner sites were not supplied, and all six are listed at
    // strictly equal weight.
    title: "Partners",
    links: [
      { label: "Startup Queenstown Lakes" },
      { label: "Queenstown Coders Connect" },
      { label: "FLINT Queenstown" },
      { label: "Queenstown Resort College" },
      { label: "huddl" },
      { label: "Technology Queenstown" },
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
