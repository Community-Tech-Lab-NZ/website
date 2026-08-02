import { applyHref } from "./apply-path";
import { escapeHtml } from "./html";
import { ROLES } from "./roles";
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
 *
 * The unpaid internship is deliberately absent. It is a voluntary learning
 * place, not a job, and marking it up as one would be a lie to a job board.
 *
 * `description` is assembled from the same role data the page renders rather
 * than being written out again here — the two drifted once already. Google
 * wants the full description and accepts HTML, so the duties go in as a list
 * instead of the two-sentence summary this used to carry.
 */
export function jobPostingsSchema() {
  const roles = ROLES.filter((role) => role.paid);

  return roles.map((role) => ({
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: role.title,
    // Escaped, because this is the one field where transcribed prose becomes
    // markup. An ampersand in a JD bullet is not a hypothetical — the roles
    // already say "FLINT, QCC, Technology Queenstown, and QRC" — and a bare one
    // is invalid HTML in a field job boards render.
    description: [
      `<p>${escapeHtml(role.summary)}</p>`,
      `<p>${escapeHtml(role.lookingFor)}</p>`,
      "<p>What you'll do:</p>",
      `<ul>${role.doing.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`,
    ].join(""),
    datePosted: "2026-08-15",
    validThrough: "2026-08-31",
    employmentType: "CONTRACTOR",
    // Dropped from the JSON entirely when a role has no fixed count, rather
    // than emitted as null.
    totalJobOpenings: role.seats ?? undefined,
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

/* Renders one or more schema objects as a script tag.
 *
 * The `<` escape is not defensive against user input — nothing here comes from
 * a visitor. It is defensive against OURSELVES. This used to carry only prose
 * written a few lines above it, and said so; it now carries the job
 * descriptions from lib/roles.ts, marked up as HTML because that is what
 * JobPosting wants. So there is markup inside a <script> block, which ends at
 * the first `</script` in the raw text no matter how deep in a JSON string it
 * sits — and JSON.stringify does not escape `<`.
 *
 * Nothing in the roles trips it today. The point is that the failure moved from
 * impossible to one unlucky sentence in a PDF someone transcribes next year,
 * and the failure is the whole page, not the markup. `<` is valid JSON and
 * parses back to `<`, so consumers see exactly what they saw before. */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
