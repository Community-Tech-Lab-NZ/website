import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/* robots.txt
 *
 * Everything is crawlable except the submission endpoint, which is a POST-only
 * API and has nothing to index.
 *
 * Applications are meant to be found: the whole point of the site is getting
 * community organisations to the form before 31 August, and search is how some
 * of them will arrive.
 */

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
