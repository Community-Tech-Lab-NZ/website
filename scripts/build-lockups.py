"""Rebuild the Community Tech Lab lockup SVGs with the wordmark as real
Archivo Black outlines, plus wordmark-only SVGs for the animated header logo.

Why outlines: an SVG loaded through <img> is sandboxed and cannot reach the
page's webfonts, so <text font-family="Archivo"> rendered in Helvetica on any
machine without Archivo installed. Outlined paths render identically everywhere.

Tooling, not part of the site build. Run only when the lockup design changes.

Requires:  pip install fonttools uharfbuzz
Font:      Archivo Black (SIL OFL 1.1), fetched from Google Fonts:
           curl -s 'https://fonts.googleapis.com/css2?family=Archivo:wght@900' \
             | grep -o 'https://[^)]*'   # then curl that URL to archivo-900.ttf
Usage:     python3 scripts/build-lockups.py path/to/archivo-900.ttf

Shaping is done with HarfBuzz so GPOS kerning is applied exactly as a browser
would, then each glyph outline is extracted with fontTools and baked into page
coordinates. CSS letter-spacing (-1px) is added after every glyph, matching how
browsers combine it with kerning.
"""

import sys



import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.misc.transform import Transform

FONT_PATH = sys.argv[1] if len(sys.argv) > 1 else "archivo-900.ttf"
OUT_DIR = str(__import__("pathlib").Path(__file__).resolve().parent.parent / "public" / "logos")

font = TTFont(FONT_PATH)
glyph_set = font.getGlyphSet()
glyph_order = font.getGlyphOrder()
UPEM = font["head"].unitsPerEm

blob = hb.Blob.from_file_path(FONT_PATH)
face = hb.Face(blob)
hb_font = hb.Font(face)
hb_font.scale = (UPEM, UPEM)


def line_to_path(text: str, size: float, letter_spacing: float):
    """Shape one line; return (svg path data, painted advance in px)."""
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(hb_font, buf, {"kern": True, "liga": True})

    scale = size / UPEM
    x_px = 0.0
    parts = []
    n = len(buf.glyph_infos)
    for i, (info, pos) in enumerate(zip(buf.glyph_infos, buf.glyph_positions)):
        name = glyph_order[info.codepoint]
        pen = SVGPathPen(glyph_set, ntos=lambda v: f"{v:.1f}")
        # y-flip: font units are y-up, SVG is y-down. Baseline goes to y=0
        # here; the caller translates the whole line to its baseline.
        t = Transform().translate(x_px + pos.x_offset * scale, pos.y_offset * scale).scale(scale, -scale)
        glyph_set[name].draw(TransformPen(pen, t))
        d = pen.getCommands()
        if d:
            parts.append(d)
        x_px += pos.x_advance * scale
        if i < n - 1:
            x_px += letter_spacing
    return " ".join(parts), x_px


def wordmark(lines, size, fill, anchor_x, baselines, centred):
    """Lines of outlined text as SVG markup."""
    out = []
    for text, baseline in zip(lines, baselines):
        d, advance = line_to_path(text, size, -1.0)
        x = anchor_x - advance / 2 if centred else anchor_x
        out.append(
            f'<path transform="translate({x:.2f},{baseline})" fill="{fill}" d="{d}"/>'
        )
    return "\n".join(out)


CARET_HORIZONTAL = """<g transform="translate(30,25)">
<svg width="90" height="90" viewBox="0 0 100 100" fill="none" stroke="{caret}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20,62 50,30 80,62"></polyline><rect x="44" y="76" width="12" height="10" fill="{caret}" stroke="none"></rect></svg>
</g>"""

CARET_PRIMARY = """<g transform="translate(200,40)">
<svg width="120" height="120" viewBox="0 0 100 100" fill="none" stroke="{caret}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><polyline points="20,62 50,30 80,62"></polyline><rect x="44" y="76" width="12" height="10" fill="{caret}" stroke="none"></rect></svg>
</g>"""

NOTE = "<!-- Wordmark outlined from Archivo Black (SIL OFL 1.1) so the mark renders identically without webfonts. -->"

INK = "#14211A"
OAT = "#F3EFE3"
KOWHAI = "#F0A81E"

# (filename suffix, background rect or None, caret colour, text colour)
VARIANTS = [
    ("light-bg", OAT, INK, INK),
    ("dark-bg", INK, KOWHAI, OAT),
    ("transparent", None, INK, INK),
]

for suffix, bg, caret, text_fill in VARIANTS:
    rect = f'<rect width="520" height="140" fill="{bg}"></rect>\n' if bg else "\n"
    marks = wordmark(["Community", "Tech Lab"], 34, text_fill, 140, [68, 106], centred=False)
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="520" height="140" viewBox="0 0 520 140">\n'
        f"{NOTE}\n{rect}"
        + CARET_HORIZONTAL.format(caret=caret)
        + f"\n{marks}\n</svg>"
    )
    with open(f"{OUT_DIR}/lockup-horizontal-{suffix}.svg", "w") as fh:
        fh.write(svg)

    rect = f'<rect width="520" height="360" fill="{bg}"></rect>\n' if bg else "\n"
    marks = wordmark(["Community", "Tech Lab"], 38, text_fill, 260, [230, 272], centred=True)
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="520" height="360" viewBox="0 0 520 360">\n'
        f"{NOTE}\n{rect}"
        + CARET_PRIMARY.format(caret=caret)
        + f"\n{marks}\n</svg>"
    )
    with open(f"{OUT_DIR}/lockup-primary-{suffix}.svg", "w") as fh:
        fh.write(svg)

# Wordmark-only files for the animated header lockup: same 520x140 canvas as
# the horizontal lockup, text only, so AnimatedLockup can layer them under a
# live caret and cursor block with zero registration math.
for suffix, fill in [("light", INK), ("dark", OAT)]:
    marks = wordmark(["Community", "Tech Lab"], 34, fill, 140, [68, 106], centred=False)
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="520" height="140" viewBox="0 0 520 140">\n'
        f"{NOTE}\n{marks}\n</svg>"
    )
    with open(f"{OUT_DIR}/wordmark-horizontal-{suffix}.svg", "w") as fh:
        fh.write(svg)
print("wordmark-horizontal-light/dark written")

# Report painted widths so the ink boxes in Logo.tsx can be updated.
for size, label in [(34, "horizontal"), (38, "primary")]:
    for text in ["Community", "Tech Lab"]:
        _, adv = line_to_path(text, size, -1.0)
        print(f"{label} {text!r} at {size}px: advance {adv:.2f}px")
print("done: 6 SVGs written")
