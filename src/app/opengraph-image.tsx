import { OG_CONTENT_TYPE, OG_SIZE, renderCard } from "./_og/card";

/* Default Open Graph card, inherited by every route without its own. */

export const alt = "Community Tech Lab, built by local developers, for local good";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function OpengraphImage() {
  return renderCard({ headline: "Built by local developers. For local good." });
}
