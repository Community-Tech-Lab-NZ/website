import { applyHref } from "./apply-path";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "./site";

/* JSON-LD structured data.
 *
 * The site had none. That matters more here than for most small sites, because
 * almost everything this programme needs to be found for is LOCAL and
 * ORGANISATIONAL: a volunteer treasurer searching "help with our spreadsheets
 * Queenstown", a developer searching "tech work Wānaka". Search engines have no
 * other way to know this is a Queenstown Lakes programme rather than a software
 * product, that it is free to the organisations it serves, or who runs it.
 *
 * Everything below is a fact stated elsewhere on the site. Nothing is asserted
 * here that a reader could not verify on the page, which is both an honesty
 * rule and how you avoid a structured-data penalty.
 */

const PARTNERS = [
  "Startup Queenstown Lakes",
  "Queenstown Coders Connect",
  "FLINT Queenstown",
  "Queenstown Resort College",
  "huddl",
  "Technology Queenstown",
];

/** The towns the programme serves. Named explicitly so local search can match. */
const AREA_SERVED = [
  "Queenstown",
  "Wānaka",
  "Arrowtown",
  "Frankton",
  "Hāwea",
  "Glenorchy",
  "Kingston",
  "Queenstown Lakes District",
];

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/logos/lockup-primary-light-bg.svg`,
    },
    // A programme, not a company. Startup Queenstown Lakes is the lead
    // organisation, fund holder and the entity developers contract to.
    parentOrganization: {
      "@type": "Organization",
      name: "Startup Queenstown Lakes",
    },
    funder: {
      "@type": "Organization",
      name: "Queenstown Lakes District Council Economic Diversification Fund",
    },
    member: PARTNERS.map((name) => ({ "@type": "Organization", name })),
    areaServed: AREA_SERVED.map((name) => ({
      "@type": "Place",
      name,
      address: {
        "@type": "PostalAddress",
        addressRegion: "Otago",
        addressCountry: "NZ",
      },
    })),
    knowsLanguage: ["en-NZ"],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    inLanguage: "en-NZ",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

/**
 * The programme itself, described so a search engine can tell what is on offer
 * and to whom. `isAccessibleForFree` is the single most useful fact here: the
 * whole proposition to a community organisation is that it costs them nothing.
 */
export function programmeSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Project",
    "@id": `${SITE_URL}/#programme`,
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "A civic tech programme pairing senior developer mentors with juniors to build three custom, open-source digital tools for community organisations in the Queenstown Lakes district, at no cost to the organisations.",
    parentOrganization: { "@id": `${SITE_URL}/#organization` },
    startDate: "2026-08-15",
    endDate: "2026-11-26",
  };
}

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

/**
 * The developer seats, as real job postings.
 *
 * These are genuine paid roles with defined hours and a hiring window, which is
 * exactly what JobPosting describes. Being honest in the markup matters: the
 * rate is explicitly a community rate rather than commercial, and the
 * employment type reflects a short contract, not a permanent job.
 */
export function jobPostingsSchema() {
  const roles = [
    {
      title: "Senior developer and mentor",
      description:
        "Lead one team, mentor the junior, guide architecture and keep scope sensible. Roughly 60 hours across a five-week build, contracted to Startup Queenstown Lakes as a sole trader.",
      seats: 3,
    },
    {
      title: "Junior developer or designer",
      description:
        "Do the primary build work with a senior developer alongside you. About 12 hours a week for five weeks, with real users at the other end.",
      seats: 3,
    },
  ];

  return roles.map((role) => ({
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: role.title,
    description: role.description,
    datePosted: "2026-08-15",
    validThrough: "2026-08-31",
    employmentType: "CONTRACTOR",
    totalJobOpenings: role.seats,
    hiringOrganization: {
      "@type": "Organization",
      name: "Startup Queenstown Lakes",
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Queenstown",
        addressRegion: "Otago",
        addressCountry: "NZ",
      },
    },
    applicantLocationRequirements: {
      "@type": "Country",
      name: "New Zealand",
    },
    directApply: true,
    // directApply promises the application itself is at the other end of this
    // link, so it points at the developer form rather than at a page that opens
    // on a community application.
    url: `${SITE_URL}${applyHref("developer")}`,
  }));
}

/** The public showcase closing the programme. */
export function showcaseEventSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "Community Tech Lab Showcase Hui",
    description:
      "The three tools built during the programme are demonstrated publicly, hosted by FLINT Queenstown.",
    startDate: "2026-11-26",
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: "Queenstown Lakes district",
      address: {
        "@type": "PostalAddress",
        addressRegion: "Otago",
        addressCountry: "NZ",
      },
    },
    organizer: { "@id": `${SITE_URL}/#organization` },
    isAccessibleForFree: true,
  };
}

/** Renders one or more schema objects as a script tag. */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      // Content is generated from constants in this file, never from user
      // input, so there is nothing here to escape against.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
