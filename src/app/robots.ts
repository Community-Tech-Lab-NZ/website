import type { MetadataRoute } from "next";
import { IS_PRODUCTION, SITE_URL } from "@/lib/site";

/* robots.txt
 *
 * Production: everything crawlable except the submission endpoint, which is a
 * POST-only API with nothing to index. Applications are meant to be found —
 * the site exists to get community organisations to the form before 31 August,
 * and search is how some of them will arrive.
 *
 * Preview deployments: blocked entirely. A preview URL that gets indexed
 * competes with the real domain for the programme's own name, and duplicate
 * content on a *.vercel.app is slow and annoying to get removed once Google has
 * it. Cheap to prevent, tedious to fix.
 */

export default function robots(): MetadataRoute.Robots {
  if (!IS_PRODUCTION) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
