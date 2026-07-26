import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/* Open Graph card, inherited by every route.
 *
 * Partners will share this on LinkedIn and in newsletters, and a link with no
 * card looks like nothing much is behind it. That matters when the audience is
 * organisations deciding whether a programme is real.
 *
 * On-brand by the same rules as the site: Ink surface, Oat type, exactly one
 * gold thing (the caret), Archivo for the headline. The font is bundled rather
 * than fetched, so generating a card never depends on a third party being up.
 */

export const alt = "Community Tech Lab — solutions that get used";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const archivo = await readFile(join(process.cwd(), "src/app/_og/Archivo-ExtraBold.ttf"));

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#14211A",
          padding: "72px 80px",
          fontFamily: "Archivo",
        }}
      >
        {/* The caret, drawn the same way the site draws it: a square with two
            borders, rotated. The one gold element on the card. */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderTop: "6px solid #F0A81E",
              borderRight: "6px solid #F0A81E",
              transform: "rotate(-45deg)",
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              color: "#F3EFE3",
              fontSize: 30,
              fontWeight: 800,
              lineHeight: 1.1,
              marginLeft: 12,
            }}
          >
            <span>Community</span>
            <span>Tech Lab</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 88,
            fontWeight: 800,
            color: "#F3EFE3",
            letterSpacing: "-0.02em",
            lineHeight: 1.02,
            maxWidth: 900,
          }}
        >
          Solutions that get used.
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            color: "rgba(243,239,227,0.70)",
            fontSize: 24,
            fontWeight: 800,
          }}
        >
          <span>Queenstown Lakes · Aotearoa New Zealand</span>
          <span>Applications open 15 to 31 August</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Archivo", data: archivo, weight: 800, style: "normal" }],
    },
  );
}
