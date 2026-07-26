import { OG_CONTENT_TYPE, OG_SIZE, renderCard } from "../_og/card";

/* Card for the community organisation audience.
 *
 * "At no cost to your organisation" is the fact that decides whether a volunteer
 * treasurer clicks, so it goes in the headline rather than the footer. */

export const alt =
  "Free digital tools for community organisations in the Queenstown Lakes district";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderCard({
    eyebrow: "For community organisations",
    headline: "Something useful, built for your organisation.",
    footerRight: "No cost to your organisation",
  });
}
