import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/* Shared renderer for the Open Graph cards.
 *
 * The site forks its two audiences hard, and a shared card undoes that: a
 * developer sharing /developers in a Slack channel would show a card about
 * community organisations. Each audience page gets a card that matches what the
 * link actually offers, which is the whole point of a preview.
 *
 * One renderer rather than three copies, so the brand rules stay in one place:
 * Ink surface, Oat type, exactly one gold thing, Archivo throughout.
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

type CardProps = {
  /** The single line that does the work. Keep it short; it renders large. */
  headline: string;
  /** Small mono-ish line under the lockup. Optional context. */
  eyebrow?: string;
  footerLeft?: string;
  footerRight?: string;
};

export async function renderCard({
  headline,
  eyebrow,
  footerLeft = "Queenstown Lakes · Aotearoa New Zealand",
  footerRight = "Applications open 15 to 31 August",
}: CardProps) {
  const archivo = await readFile(join(process.cwd(), "src/app/_og/Archivo-ExtraBold.ttf"));

  // Long headlines need to step down or they overflow the card.
  const fontSize = headline.length > 46 ? 64 : headline.length > 30 ? 76 : 88;

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
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* The caret: a square with two borders, rotated. The one gold thing. */}
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
          {eyebrow ? (
            <span
              style={{
                marginLeft: 28,
                color: "rgba(243,239,227,0.70)",
                fontSize: 22,
                fontWeight: 800,
              }}
            >
              {eyebrow}
            </span>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            fontSize,
            fontWeight: 800,
            color: "#F3EFE3",
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
            maxWidth: 1000,
          }}
        >
          {headline}
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
          <span>{footerLeft}</span>
          <span>{footerRight}</span>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [{ name: "Archivo", data: archivo, weight: 800, style: "normal" }],
    },
  );
}
