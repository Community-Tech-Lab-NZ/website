/* Canonical site URL.
 *
 * Needed for absolute URLs in Open Graph tags, the sitemap and robots.txt.
 * Relative URLs do not work in any of those: a social card with a relative image
 * path simply shows nothing.
 *
 * The domain is not registered yet, so this reads from the environment with a
 * placeholder fallback. Set NEXT_PUBLIC_SITE_URL in Vercel once the domain is
 * live, and everything downstream becomes correct without a code change.
 *
 * Vercel supplies VERCEL_PROJECT_PRODUCTION_URL automatically, so preview and
 * production deployments generate correct absolute URLs even before a custom
 * domain is attached.
 */

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
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
