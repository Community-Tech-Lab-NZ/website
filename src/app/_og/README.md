# OG card font

`Archivo-ExtraBold.ttf` is a static instance of Archivo, pinned to `wght=800`
and `wdth=100` and subset to Latin plus the punctuation and macron characters
the brand uses.

Why it is here rather than fetched at runtime:

- Satori (which renders the Open Graph card) cannot parse the upstream variable
  font, and only variable cuts are published in google/fonts.
- Generating a social card should not depend on a third party being reachable.
- The subset is 16KB rather than 658KB.

The macrons matter: Kōwhai, Wānaka and Kāi Tahu all appear in programme copy, and
a subset without them would render those words wrong.

Archivo is licensed under the SIL Open Font License 1.1. See `OFL.txt`.

To regenerate after a copy change that needs new glyphs, re-run the instancing
and subsetting with fonttools against the upstream variable font at
`google/fonts/ofl/archivo`.
