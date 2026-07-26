import type { MetadataRoute } from "next";
import { ROUTES, SITE_URL } from "@/lib/site";

/* sitemap.xml
 *
 * Seven static routes. /apply is weighted just below the home page because it is
 * the page the site exists to deliver people to.
 *
 * lastModified is deliberately omitted rather than set to the build time: every
 * page would claim to have changed on every deploy, which teaches crawlers to
 * ignore the field. Add real dates if the content ever starts changing
 * independently.
 */

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    priority: route.priority,
    changeFrequency: "monthly" as const,
  }));
}
