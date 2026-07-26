import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

/* Web app manifest.
 *
 * Not about making this a "web app": it is what lets someone add the site to a
 * phone home screen with the right name and icon, and it gives Android and
 * Chrome proper metadata rather than a screenshot and a truncated URL.
 *
 * Worth having on a site whose main audience will meet it on a phone, often
 * part-way through a 50-minute form they may want to come back to.
 *
 * Theme colour is Ink, matching the header surface, so the browser chrome does
 * not fight the page.
 */

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "Tech Lab",
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#F3EFE3", // Oat, the default page surface
    theme_color: "#14211A", // Ink
    lang: "en-NZ",
    dir: "ltr",
    categories: ["education", "productivity"],
    icons: [
      { src: "/favicons/favicon-192.png", sizes: "192x192", type: "image/png" },
      {
        src: "/favicons/favicon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/favicons/favicon-darkbg-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
