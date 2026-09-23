#!/usr/bin/env node
/**
 * Prepares the announcement photographs for email and for the site.
 *
 * Tooling, not part of the site build. Run when the photographs change.
 * Run: node scripts/build-email-photos.mjs
 *
 * WHY THIS EXISTS AT ALL, WHEN build-email-logos.mjs IS RIGHT THERE. Different
 * problem. That script composites six flat marks onto their grounds and
 * quantises them to a palette, which is the correct treatment for artwork with
 * eight colours in it and the wrong one for a photograph of an aurora: a
 * palette PNG of a night sky bands into visible steps, and the file is larger
 * than the JPEG would have been. Photographs get a different pipeline, so they
 * get a different script rather than a third branch inside that one.
 *
 * WHAT COMES OUT, AND WHY TWO OF EVERYTHING.
 *
 *   email/   536px wide, JPEG, quality 78. 536 is the email card's usable
 *            width: 600 minus 32px of padding each side. Written at 1x and not
 *            2x, unlike the logos. A 2x photograph is four times the pixels and
 *            these are going to roughly 780 inboxes at once; the logos can
 *            afford 2x because they quantise to a few kilobytes each and a
 *            photograph does not. The cost is softness on a retina phone, which
 *            is the right thing to spend here.
 *   site/    1120px wide, JPEG and WebP. The page is a permanent record and is
 *            read on a desktop, where 536 would be visibly soft. WebP for the
 *            browsers that take it, JPEG behind it, which is what next/image
 *            would do anyway but these are plain <img> in an email-shaped
 *            layout and it is cheaper to do it here once.
 *
 * ASPECT RATIO IS FORCED TO 3:2 AND THE CROP IS NOT AUTOMATIC. sharp's
 * attention strategy crops to whatever it finds busiest, which on a photograph
 * of a dark sky is the one lit building in the corner. Every crop below is
 * stated, and where the subject is not centred the gravity says where it is.
 * A wrong crop here is a photograph of somebody's nursery with the nursery cut
 * off, so this is worth the eleven lines it costs.
 *
 * CREDITS ARE DATA, NOT DECORATION. Two of these are signed in the corner by
 * the photographer and one is credited in its filename. `credit` below is what
 * the site prints under the image and what the email's alt text carries, and it
 * is not optional on those three. See the note on each.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

// sharp arrives as a transitive dependency of next, so a bare specifier will
// not resolve. Asked for through next, as build-email-logos.mjs does.
const require = createRequire(import.meta.url);
const sharp = require(require.resolve("sharp", { paths: [require.resolve("next/package.json")] }));

const ROOT = new URL("..", import.meta.url).pathname;
const SRC = join(ROOT, "assets", "photos");
const OUT_EMAIL = join(ROOT, "public", "images", "email");
const OUT_SITE = join(ROOT, "public", "images", "builds");

/** The email card's usable width: 600 minus 32px padding each side. */
const EMAIL_W = 536;
/** The site's container. */
const SITE_W = 1120;
/** Every photograph is cropped to this. See the note at the top. */
const RATIO = 3 / 2;

/* The three chosen organisations, one photograph each, plus the spares.
 *
 * `use: true` is the one that ships. The rest are kept here rather than deleted
 * because the choice between two photographs of the same nursery is a judgement
 * someone should make by looking at them at the size they will be seen, not at
 * a filename. `--all` builds them for exactly that; see SELECTED below.
 *
 * `gravity` only where centre is wrong. sharp defaults to centre and that is
 * correct for most of these.
 */
const PHOTOS = [
  /* TĀHUNA GLENORCHY DARK SKY SANCTUARY.
   *
   * The aurora is the one that carries the section, and it is the reason this
   * script forces a crop rather than accepting 1920x1286: at 3:2 the frame
   * keeps the pink column and the ridgeline and loses the empty foreground
   * water, which at 536px wide is a band of near-black doing nothing.
   *
   * SIGNED IN THE FRAME. Corrine Davis's signature sits bottom right on the
   * Glenorchy shed photograph and the credit below is hers on both, which is
   * the arrangement her signature implies. Do not crop a signature out to make
   * a frame work: recrop or use another photograph. */
  {
    out: "dark-sky-aurora",
    src: "Davis_Corrine_Glenorchy-Water-Front-1920x1286.jpg",
    alt: "An aurora over the mountains at the head of Lake Whakatipu, pink columns rising into a green sky",
    credit: "Corrine Davis",
    gravity: "north", // the aurora is in the top two thirds; centre loses its head
    use: true,
  },
  {
    out: "dark-sky-milky-way",
    src: "glenorchy-dark-skies-gallery-03.jpg",
    alt: "The Milky Way over Lake Whakatipu, reflected in still water",
  },
  {
    out: "dark-sky-glenorchy-shed",
    src: "milky-way-024.jpg",
    alt: "The Glenorchy wharf shed lit under the Milky Way, with snow on the peaks behind",
    credit: "Corrine Davis",
  },

  /* WHAKATIPU REFORESTATION TRUST.
   *
   * The volunteers potting up is the one that ships. The nursery beds are the
   * better photograph and the wrong one for this: the section is about years of
   * records kept by people, and a frame with nobody in it illustrates the
   * plants rather than the work. The brand guide asks for real places and
   * real people, and this is the photograph that has both.
   *
   * banner-05 is 1920x750, which is a website banner and not a 3:2 frame. It
   * crops to 3:2 by taking the middle, which works because the beds run the
   * full width. It is a spare, so this matters less than it would if it shipped. */
  {
    out: "reforestation-volunteers",
    src: "R52_8383-1.jpg",
    alt: "Volunteers potting up seedlings at the Jean Malpas nursery, in low winter sun",
    use: true,
  },
  {
    out: "reforestation-nursery",
    src: "banner-05.jpg",
    alt: "Rows of native seedlings in the beds at the Jean Malpas nursery",
  },
  {
    out: "reforestation-planting",
    src: "IMG_9052-2048x1536.jpg",
    alt: "Flax and cabbage trees on a replanted hillside, with cloud down on the range behind",
  },
  /* CREDITED IN ITS FILENAME, which is the only record of it we have, so the
   * credit is carried here before the filename is lost to a rename. */
  {
    out: "reforestation-marsh-crake",
    src: "5.-Marsh-Crake-Shotover.-Photo-credit-Audrey-Austin-2048x1365.jpg",
    alt: "A marsh crake wading through weed in a wetland on the Shotover",
    credit: "Audrey Austin",
  },

  /* QUEENSTOWN MOUNTAIN BIKE CLUB.
   *
   * Three riders on the ridgeline above the lake at sunrise. The section is
   * about auditing a hundred kilometres of trail, and this is the only frame
   * that shows the scale of what gets audited.
   *
   * The forest trail is 3024x4032, portrait, and crops to 3:2 badly whichever
   * way it goes: landscape 3:2 out of a portrait frame throws away half the
   * picture. It is built as a spare and it is not the one to ship. */
  {
    out: "mtb-ridgeline",
    src: "785837452_929425526305828_3952477979990015680_n.jpeg",
    alt: "Three mountain bikers on a tussock ridgeline above Lake Whakatipu at sunrise",
    use: true,
  },
  {
    out: "mtb-trail",
    src: "786030674_18351567439217583_7742938609854745050_n.jpg",
    alt: "A newly cut trail climbing through pines, with the range visible through the trees",
  },
];

/* Only the three that ship, unless asked for all of them.
 *
 * `--all` builds the spares too, which is what you want when choosing between
 * two photographs of the same nursery: they land in public/images and can be
 * looked at in a browser at the size they would be seen. What you do not want
 * is six unused photographs deployed to production and served on a public URL
 * forever because nobody remembered to delete them. So the default is the three
 * in the email, and the spares are an explicit ask.
 *
 * Run: node scripts/build-email-photos.mjs --all */
const ALL = process.argv.includes("--all");
const SELECTED = ALL ? PHOTOS : PHOTOS.filter((p) => p.use === true);

const built = [];

for (const photo of SELECTED) {
  const input = join(SRC, photo.src);
  const position = photo.gravity ?? "centre";

  /** One size, cropped to 3:2 and re-encoded. */
  async function render(width, format) {
    const pipeline = sharp(input)
      .resize({
        width,
        height: Math.round(width / RATIO),
        fit: "cover",
        position,
        withoutEnlargement: true,
      })
      // Strips EXIF, which on these runs to camera serial numbers and, on two
      // of them, GPS coordinates. A photograph of a wetland where a threatened
      // bird was found should not carry that wetland's location into eight
      // hundred inboxes.
      .rotate();

    return format === "webp"
      ? pipeline.webp({ quality: 80, effort: 6 }).toBuffer({ resolveWithObject: true })
      : pipeline
          // 4:4:4 rather than the default 4:2:0. These are dark frames with
          // saturated colour in them, and chroma subsampling is what turns the
          // pink of an aurora into blocks.
          .jpeg({ quality: format === "email" ? 78 : 82, chromaSubsampling: "4:4:4", mozjpeg: true })
          .toBuffer({ resolveWithObject: true });
  }

  mkdirSync(OUT_EMAIL, { recursive: true });
  mkdirSync(OUT_SITE, { recursive: true });

  const email = await render(EMAIL_W, "email");
  writeFileSync(join(OUT_EMAIL, `${photo.out}.jpg`), email.data);

  const siteJpeg = await render(SITE_W, "site");
  const siteWebp = await render(SITE_W, "webp");
  writeFileSync(join(OUT_SITE, `${photo.out}.jpg`), siteJpeg.data);
  writeFileSync(join(OUT_SITE, `${photo.out}.webp`), siteWebp.data);

  built.push({
    name: photo.out,
    use: photo.use === true,
    w: email.info.width,
    h: email.info.height,
    emailKb: email.data.length / 1024,
    siteKb: siteWebp.data.length / 1024,
  });
}

const shipping = built.filter((b) => b.use);
const total = shipping.reduce((sum, b) => sum + b.emailKb, 0);

console.log(`Wrote ${built.length} photograph(s)${ALL ? ", including the spares" : ""} to:`);
console.log(`  ${OUT_EMAIL}   (${EMAIL_W}px JPEG)`);
console.log(`  ${OUT_SITE}   (${SITE_W}px JPEG and WebP)\n`);
console.log("For the EmailImage entries in src/lib/announcement.ts:\n");
for (const b of built) {
  console.log(
    `  ${b.use ? "*" : " "} ${b.name.padEnd(28)} w: ${b.w}, h: ${b.h}   email ${b.emailKb.toFixed(0)}KB, site ${b.siteKb.toFixed(0)}KB`,
  );
}
console.log(
  `\n* ships in the announcement. ${shipping.length} photographs, ${total.toFixed(0)}KB of email.` +
    (ALL ? "" : "  Pass --all to build the spares as well."),
);

/* A ceiling, not a guideline. Gmail clips a message at 102KB of HTML, which
 * this cannot breach because images are fetched rather than embedded, but a
 * reader on a phone in Glenorchy is on the end of a rural connection and three
 * photographs are the whole weight of this email. 300KB is about two seconds on
 * a bad 4G connection, which is the point at which images start arriving after
 * the reader has finished reading. */
if (total > 300) {
  throw new Error(
    `The three shipping photographs come to ${total.toFixed(0)}KB, over the 300KB ceiling. Drop the quality or crop tighter.`,
  );
}
