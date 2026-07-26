import { OG_CONTENT_TYPE, OG_SIZE, renderCard } from "../_og/card";

/* Card for the developer audience.
 *
 * Paid and local are the two facts that matter to someone scrolling a channel
 * of job links, so both appear before they have to click. */

export const alt = "Six paid developer seats in the Queenstown Lakes district";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderCard({
    eyebrow: "For developers",
    headline: "Paid work, real users, and code you can point at.",
    footerRight: "6 paid seats · about 12 hrs a week",
  });
}
