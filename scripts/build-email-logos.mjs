#!/usr/bin/env node
/**
 * Bakes the partner and funder marks into email-safe PNGs.
 *
 * Tooling, not part of the site build. Run only when a partner mark changes.
 * Run: node scripts/build-email-logos.mjs
 *
 * WHY THE SITE'S FILES CANNOT BE USED DIRECTLY. The partner wall on the site is
 * two SVGs, two WebPs and two PNGs, sized by CSS and grounded by a coloured
 * chip element. An inbox supports none of that.
 *
 *   SVG      Not supported by any major client. Gmail, Outlook and Apple Mail
 *            all show a broken image. huddl and QT Coders are SVG.
 *   WebP     Fine in Gmail and Apple Mail, dead in Outlook for Windows, which
 *            renders through Word. Startup Queenstown Lakes and Technology
 *            Queenstown are WebP.
 *   The chip Three marks are reversed and only read on their own ground. On the
 *            site that ground is a styled span around the img. Doing the same
 *            in email means a nested table with a bgcolor, and then the mark
 *            and its ground scale independently on a phone, which is how you
 *            get a logo hanging off the edge of its own chip.
 *
 * So each mark is composited onto its ground here, once, and ships as a single
 * flat PNG. Six images that behave identically, no nested tables, and a phone
 * scaling one image scales the mark and its ground together.
 *
 * SIZES FOLLOW THE SITE, WITH ONE CHANGE. --partner-chip-logo-h is 40px inside
 * a chip and the chip's padding is the site's px-4 py-2, so a chipped mark
 * occupies a 56px band. --partner-logo-h then puts a bare mark at 48, which on
 * the site is fine because every cell also prints the partner's name underneath
 * and the marks are not being compared to each other. The email wall has no
 * names, so 48 next to 56 reads as one logo being smaller rather than as two
 * different kinds of mark, and the square ones, FLINT and QRC, lose the most.
 * Here every mark gets the same 56px band. --partner-logo-max-w still caps the
 * width at 200, which is what holds Technology Queenstown to 39px tall.
 *
 * Everything is written at 2x and displayed at 1x, so it stays sharp on a
 * phone.
 *
 * WHICH MARK GETS A CHIP is not a style choice, it is what each partner's own
 * site does; see the table in src/components/PartnerRow.tsx. The three chip
 * colours are those partners' brand constants, not ours, which is why they are
 * literals here and in that file and nowhere else.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

// sharp arrives as a transitive dependency of next, so it is not hoisted to the
// top level and a bare specifier will not resolve. Asked for through next,
// which is the package that actually declares it.
const require = createRequire(import.meta.url);
const sharp = require(require.resolve("sharp", { paths: [require.resolve("next/package.json")] }));

const ROOT = new URL("..", import.meta.url).pathname;
const SRC = join(ROOT, "public", "logos");
const OUT = join(SRC, "email");

const SCALE = 2;
const CHIP_MARK_H = 40 * SCALE; // --partner-chip-logo-h
const CHIP_PAD_X = 16 * SCALE; // px-4
const CHIP_PAD_Y = 8 * SCALE; // py-2
const BAND = CHIP_MARK_H + CHIP_PAD_Y * 2; // the height every partner mark fills
const MAX_W = 200 * SCALE; // --partner-logo-max-w
const RADIUS = 2 * SCALE; // --radius-card

/* SVG sources are rasterised at this density and then scaled down. sharp
 * otherwise renders an SVG at its declared box and scales the pixels, which
 * comes out soft; oversampling and downscaling does not. */
const DENSITY = 400;

const MARKS = [
  { out: "partner-startup-queenstown-lakes", src: "startup_queenstown_lakes_logo.webp", chip: "#182073" },
  { out: "partner-queenstown-coders-connect", src: "qt_coders_logo.svg", chip: "#020617" },
  { out: "partner-flint-queenstown", src: "flint_logo.png" },
  { out: "partner-queenstown-resort-college", src: "qrc_logo.png" },
  { out: "partner-huddl", src: "huddl_logo.svg", chip: "#F77815" },
  { out: "partner-technology-queenstown", src: "tq_logo.webp" },
  // The funder mark is purple and navy on white and may not be recoloured or
  // reversed, so it keeps the white plate it has on the site. On the email's
  // white card that plate is invisible, which is the point: it is there for the
  // clients that force a dark card, where an unplated mark would vanish.
  //
  // Wider than the partners because it stands alone on its own line rather than
  // in a 268px column, and --funder-logo-w is 267 on the site. It carries four
  // words of small type inside the artwork, so it is the one mark here that
  // stops being readable if it is held to the partner band.
  {
    out: "funder-economic-futures",
    src: "economic_futures_logo.jpg",
    chip: "#FFFFFF",
    maxW: 268 * SCALE,
    markH: 48 * SCALE,
  },
];

/** Rounded rectangle as an SVG buffer, for compositing under a reversed mark. */
function chipGround(w, h, fill) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${RADIUS}" ry="${RADIUS}" fill="${fill}"/></svg>`,
  );
}

/** Even numbers only, so the 2x file halves to a whole CSS pixel. */
function even(n) {
  return n % 2 === 0 ? n : n + 1;
}

const built = [];

for (const mark of MARKS) {
  const input = join(SRC, mark.src);
  const isSvg = mark.src.endsWith(".svg");

  // `inside` rather than `contain`: contain pads the mark out to the full box
  // with transparency, and a chip has to hug the mark rather than the box.
  const markH = mark.markH ?? (mark.chip ? CHIP_MARK_H : BAND);
  const fitted = await sharp(input, isSvg ? { density: DENSITY } : {})
    .resize({
      width: mark.maxW ?? MAX_W,
      height: markH,
      fit: "inside",
      withoutEnlargement: false,
    })
    .png()
    .toBuffer({ resolveWithObject: true });

  const fittedW = fitted.info.width;
  const fittedH = fitted.info.height;

  let image;
  let width;
  let height;

  if (mark.chip) {
    // The chip's inner height is the full mark height even when this particular
    // mark is shorter, so all three chips come out the same height and the row
    // does not step up and down.
    width = even(fittedW + CHIP_PAD_X * 2);
    height = markH + CHIP_PAD_Y * 2;
    image = sharp(chipGround(width, height, mark.chip)).composite([
      {
        input: fitted.data,
        left: Math.round((width - fittedW) / 2),
        top: Math.round((height - fittedH) / 2),
      },
    ]);
  } else {
    width = even(fittedW);
    height = even(fittedH);
    image = sharp(fitted.data).resize({ width, height, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } });
  }

  // Palette PNG: these are flat marks with few colours, and quantising them
  // takes each file to a few kilobytes. Every one is fetched separately by
  // every reader who loads images.
  const buffer = await image.png({ palette: true, compressionLevel: 9, effort: 10 }).toBuffer();

  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, `${mark.out}.png`), buffer);

  built.push({ name: mark.out, w: width / SCALE, h: height / SCALE, kb: (buffer.length / 1024).toFixed(1) });
}

console.log(`Wrote ${built.length} email logos to ${OUT}\n`);
console.log("Display size (CSS px), for the EmailLogo entries in src/lib/broadcast.ts:\n");
for (const b of built) {
  console.log(`  ${b.name.padEnd(38)} w: ${String(b.w).padStart(5)}, h: ${String(b.h).padStart(4)}   ${b.kb}KB`);
}
