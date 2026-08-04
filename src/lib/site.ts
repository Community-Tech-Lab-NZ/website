/* Canonical site URL and environment.
 *
 * Needed for absolute URLs in Open Graph tags, canonicals, the sitemap and
 * robots.txt. Relative URLs do not work in any of those: a social card with a
 * relative image path shows nothing, and a canonical pointing at localhost is
 * worse than no canonical at all.
 *
 * The production domain is hardcoded as the fallback rather than left to an
 * environment variable. A missed env var would otherwise publish localhost
 * canonicals to the live site, which is exactly the kind of silent failure
 * nobody notices until the site is not ranking.
 */

/* www, not the apex.
 *
 * The apex 308-redirects to www at the edge, so www is the host that actually
 * serves the site and the one Google has indexed. This constant feeds every
 * URL the site says about itself — canonical, og:url, sitemap <loc>, the
 * robots.txt Host line, the @id values in structured data — and pointing all of
 * them at the apex made every one of those a redirect, including a canonical on
 * the www page claiming a URL that bounces straight back to www.
 *
 * That contradiction is worth clearing on its own, and it matters for the
 * favicon in particular: Google resolves favicons per host, from the home page
 * of the host it indexed. Mixed signals about which host that is are exactly
 * what you do not want while it is still working the site out.
 *
 * If the apex is ever made primary instead, flip the redirect on Vercel FIRST
 * and change this line second — never leave the two disagreeing.
 */
export const PRODUCTION_URL = "https://www.communitytechlab.co.nz";

type Environment = "production" | "preview" | "development";

function resolveEnvironment(): Environment {
  // Vercel sets this on every deployment.
  const vercelEnv = process.env.VERCEL_ENV;
  if (vercelEnv === "production" || vercelEnv === "preview") return vercelEnv;
  if (process.env.NODE_ENV === "development") return "development";
  return "production";
}

export const ENVIRONMENT = resolveEnvironment();
export const IS_PRODUCTION = ENVIRONMENT === "production";

function resolveSiteUrl(): string {
  // An explicit override always wins, for staging on another domain.
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  if (ENVIRONMENT === "development") return "http://localhost:3000";

  // Preview deployments get their own URL so their canonicals are
  // self-consistent. They are not indexed, so this never competes with
  // production in search results.
  if (ENVIRONMENT === "preview" && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return PRODUCTION_URL;
}

export const SITE_URL = resolveSiteUrl();

export const SITE_NAME = "Community Tech Lab";

export const SITE_DESCRIPTION =
  "A civic tech initiative in the Queenstown Lakes District. We pair senior developer mentors with juniors to build open-source digital tools for local community organisations.";

/** Routes in the sitemap, most important first. */
export const ROUTES = [
  { path: "/", priority: 1.0 },
  { path: "/apply", priority: 0.9 },
  { path: "/organisations", priority: 0.8 },
  { path: "/developers", priority: 0.8 },
  { path: "/about", priority: 0.6 },
  { path: "/terms", priority: 0.3 },
  { path: "/privacy", priority: 0.3 },
] as const;
