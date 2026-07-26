# Community Tech Lab — Design System

Community Tech Lab is a Queenstown Lakes community programme, not a product company. It pairs community organisations with junior and intern developers who build genuinely useful digital tools. No cost, no jargon.

The programme is run by **Startup Queenstown Lakes** (lead organisation, fund holder, and the entity developers contract to), delivered with five partner organisations, and funded by the **Queenstown Lakes District Council Economic Diversification Fund**. Three solutions are built each round through an open application process, each one scoped so it can serve more than one organisation, and each matched with a small team of local developers. Six paid developer seats, three senior and three junior, plus unpaid intern places. Five-week build, weekly sprints, then handover with training, documentation and six weeks of free bug fixes. Everything built is released open source so other organisations in the district can reuse it.

**Two beneficiaries, in this order.** First the local tech community: paid work on real projects with real users, mentoring from experienced local engineers, and a way into a tech scene that is small and dispersed. Second the community organisations: a tool they could not otherwise afford, built properly and handed over with training. Never write it as a charity appeal. The framing is a district with good developers and good community organisations that rarely get to work together.

The register to hold across every surface: *we pair community organisations with local developers who build them something useful. No cost, no jargon.*

**The work is social good done at a discount, not volunteering and not charity.** Developers are paid, at a community rate well under what they charge commercially, because the organisations receiving the work could not otherwise afford it. Say that plainly. Never imply the seats are unpaid, and never frame the organisations as recipients of charity.

It must not read as a charity appeal (no pity framing, no soft-focus warmth) and it must not read as generic SaaS (no gradient meshes, no glassmorphism, no floating dashboard mockups, no abstract network-node graphics).

## Sources

- `assets/reference/CTL Brand System.pdf` — the locked brand sheet. *Tartan Marketing for Startup Queenstown-Lakes · Community Tech Lab · Brand System · LOCKED · Logo C · Kōwhai · Pairing I · 16 Jul 2026 · Phase 2 Step 0.* Nothing downstream re-derives colour, type or logo decisions; this sheet is the authority.
- `assets/reference/ctl-one-pager.png` — the community EOI one-pager, the only finished layout supplied. Section rhythm, gold hero rule, Space Mono eyebrows, timeline and Ink CTA band in this design system are all taken from it.
- Logo and favicon files as supplied in `uploads/`, copied into `assets/`.
- Written brief from the programme team covering audience, palette behaviour, motion, imagery and voice.
- Programme documents in `uploads/`: `Community_Tech_Lab_EOI_Form.docx`, `Community_Tech_Lab_Assessment_Criteria_and_Scoring_Matrix.docx`, `Community_Tech_Lab_Assessor_Guide.docx`, `Community_Tech_Lab_Decision_Record.docx`, `Community Tech Lab MOU Draft.docx`, `Community Tech Lab Pilot Organisation Agreement.docx`. The application form, the assessment weightings and the programme terms page all come from these. Facts worth knowing when writing copy: the licence is the **MIT License**; the programme is delivered on a best efforts and goodwill basis, not as a commercial product; the support period is six weeks of bug fixes only; an organisation's data always stays its own and separate from the code; developers use AI coding assistants under programme controls. The MOU and Pilot Organisation Agreement are drafts pending legal review.
- Copy brief, 25 July 2026, covering the locked programme plan, both audiences, assessment weightings, numbers, calls to action and the items still unsettled. Where it conflicts with the one-pager (eight-week build, 9 November Showcase Hui), the copy brief wins and the one-pager template has been updated to match.

No codebase, Figma file or live site was supplied. There is no existing component library, so the component inventory here was authored from the brand sheet and the one-pager (see *Intentional additions*).

## Index

| Path | What it is |
| --- | --- |
| `styles.css` | Global entry point. `@import` list only. Consumers link this. |
| `tokens/` | `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `shape.css`, `motion.css`, `base.css`, `utilities.css` |
| `components/core/` | Buttons, tags, lists, timeline, cards, figures, rules, CTA band, audience fork |
| `components/brand/` | Logo, partner row, funder credit |
| `components/forms/` | Field, input, textarea, select, checkbox, file upload |
| `components/navigation/` | Site header, site footer |
| `guidelines/` | 23 foundation specimen cards (Colors, Type, Spacing, Motion, Brand) |
| `ui_kits/website/` | Programme website recreation: home, both audience paths, about, apply form, programme terms |
| `templates/one-pager/` | Community EOI one-pager, rebuilt from the supplied artefact |
| `assets/logos/` | Logo C lockups and icons, SVG and PNG |
| `assets/favicons/` | Favicons, light and dark background |
| `assets/reference/` | Brand sheet PDF and one-pager PNG |
| `SKILL.md` | Agent Skills entry point |

## Components

**Core** — `Button`, `Caret`, `CaretList`, `Timeline`, `Card`, `Eyebrow`, `StatusTag`, `StatFigure`, `SectionRule`, `CalloutBanner`, `AudiencePath`, `Pairing`.
**Brand** — `Logo`, `PartnerRow`, `FunderCredit`.
**Forms** — `Field`, `Input`, `Textarea`, `Select`, `Checkbox`, `FileUpload`.
**Navigation** — `SiteHeader`, `SiteFooter`.

Every component has a sibling `.d.ts` props contract and a `.prompt.md` with a usage example.

### Intentional additions

No source defined a component inventory, so these were authored from the brand sheet and one-pager rather than copied:

- `Caret` — the brand sheet names the caret as the structural motif but ships no marker asset. Drawn in CSS, not as a new logo file.
- `AudiencePath` — the brief requires the two audiences to fork early, ideally from the hero. This is that fork as a component.
- `Pairing` — the two sides of the equation, developers and community organisations, facing each other with the caret between them. It shows the connection rather than describing it.
- `FunderCredit` — the QLDC credit is non-negotiable and their logo needs written approval, so the component keeps a labelled placeholder slot.
- `PartnerRow` — six partners at strictly equal weight, as required.

## Visual foundations

**Palette.** Four colours, locked. Ink `#14211A`, Fern `#2E8E52`, Kōwhai gold `#F0A81E`, Oat `#F3EFE3`. Two colours maximum per surface: most surfaces are Ink on Oat or Oat on Ink. Derived neutrals are alpha tints of Ink or Oat only; no new hues, no greys, no purple or lilac.

**Colour behaviour.**
- Kōwhai is an accent only, and the discipline is one gold thing per viewport: one highlight word, or one icon, or one CTA button. Never all three. Gold sits on Ink or Oat, never on Fern. Gold is never body copy.
- Fern is the secondary structural colour: icons, tags, links on dark, small rules and markers. Not a large section background, not a second accent.
- Section rhythm alternates Oat and Ink, with Ink reserved for the one moment that needs weight (hero *or* closing CTA, not both plus everything between). In doubt: more Oat, less Ink.

**Contrast facts.** Ink on Oat 14.5:1 (safe everywhere, the workhorse). Kōwhai on Ink 8.2:1 (safe for text and buttons). Kōwhai on Oat 1.8:1 (fails; decorative only — rules, underlines, large icon fills, never text). Fern on Oat 3.6:1 and Oat on Fern 3.6:1 (large headings and UI only; a Fern button needs large bold Archivo, not 14px body weight).

**Type.** Archivo sets every headline, nav item, button label and eyebrow. Source Sans 3 sets every paragraph and anything long-form. Space Mono is restricted to dates, eyebrows and meta at small sizes, usually caps with 0.16em tracking. No fourth typeface, and body copy never moves into Archivo. Scale 52 / 34 / 22 / 16 at weights 900 / 800 / 700 / regular; display headlines get tight leading (1.02) and should be genuinely large rather than mid-sized and bold. Body measure is capped at 700px (roughly 65 to 75 characters) even where the layout is wider.

**The caret motif.** The logo is a roofline and a code caret in one stroke — a mountain peak and a cursor. Echo that angle sparingly, in one or two places per page: the caret as a list marker in place of a bullet, the caret as a timeline node, an angled section divider repeating the roofline, and the clear-space cursor block as the padding unit. Avoid literal mountain silhouettes, blinking cursor animations, and the caret as a repeating background pattern. The mark already carries the mountain idea.

**Spacing and layout.** The 8px cursor block is the unit; scale 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128. Sections use 96px vertical rhythm (64px tight), page gutters 24px mobile and 48px desktop, container 1120px. Nothing is fixed or sticky by default; the header scrolls with the page.

**Backgrounds.** Flat colour only. No gradients, no meshes, no noise or texture overlays, no patterns, no blur, no glass. Cards are white or Oat on Oat, or Ink-raised `#1D2E24` on Ink.

**Corners, borders, shadows.** Near-square: 0 or 2px, 4px at most. Capsules (999px) are reserved for status markers. Borders are 1px hairlines at 16% Ink (or 16% Oat on dark); the 2px Kōwhai rule under a hero is the signature. Flat by default — `--shadow-card` is a 1px hairline lift, `--shadow-raised` for a floating panel, `--shadow-overlay` for dialogs only. Never a shadow on the logo. No inner shadows; recessed areas use `--ctl-oat-sunk` instead.

**Cards.** Hairline border, 2px radius, generous padding (32px), no shadow. An optional 2px Kōwhai top rule marks the one card worth pointing at, and that counts as the viewport's gold thing.

**Motion.** Restrained. A quiet fade, or a short 12px rise on scroll for section entries, 420ms, `cubic-bezier(0,0,.32,1)`. Nothing else: no parallax, no counters ticking up, no staggered card cascades, no hover lifts or scale. `prefers-reduced-motion` zeroes every duration in `tokens/motion.css`.

**Hover and press.** Hover is a single colour step in the same hue: gold to `#E09A14`, Ink to `#0D170F`, Fern to `#267844`; outline buttons invert to solid Ink. Press is a 1px downward nudge, no shrink, no shadow. Focus is a 2px Fern outline at 2px offset. Links are Ink with a Kōwhai underline that turns Fern on hover; on Ink they are Fern turning Kōwhai.

**Transparency and blur.** Alpha is used only for text and rule tints. No backdrop blur, no translucent overlays over imagery, no protection gradients — if text needs to sit on a photograph, put it beside the photograph instead.

**Imagery.** Real Queenstown Lakes places and real people, or nothing. Where good photography is not available, run type-led sections with generous space; that reads better than filler. Never stock imagery of diverse teams high-fiving around a laptop, and never tech-abstract imagery: circuit boards, glowing nodes, code rain, AI orbs, isometric city illustrations. Screenshots of the actual tools, once they exist, beat all of it. Photography should read natural and slightly cool — Southern light, no heavy warm grade, no grain filters, no duotone.

No photography was supplied, so the website kit and the one-pager template are deliberately type-led, with a plain Oat placeholder block where the one-pager reserved space for an image.

## Content fundamentals

**Language.** NZ and British English: organisation, programme, centre, prioritise, favourite. Macrons correct: Kōwhai, Whakatipu, Wānaka, Kāi Tahu, kaupapa, mahi. Te Reo greetings are welcome where they read naturally, never sprinkled for decoration.

**Mechanics.** No em dashes or en dashes anywhere; use a comma, a full stop or the word "to" for ranges ("Oct to Nov"). Short paragraphs. Sentence case for headings and buttons. No emoji. No exclamation marks.

**Person.** Address the reader as "you" and the programme as "we". "You get a tool your team can run." "We reply to every EOI." Never "users", never third-person distance about the organisations themselves.

**Words to avoid.** "Charity" (say community organisations or not-for-profits), "EOI" and "expression of interest" in public copy, empower, unlock, revolutionise, leverage, and any sentence that could appear on any other programme's website.

**"Genuinely" is banned**, along with "genuinely useful". It reads as filler and it protests too much. Say what the thing does, or say "useful" and stop.

**Hero headlines are five words or fewer.** "Solutions that actually get used." The supporting line carries the detail, and it does not need to name the programme; the lockup in the header already does.

**On "tools" and "solutions".** "Tool" is out; it undersells the work and it invited a list of categories that pigeon-holed the programme. The countable noun is **solution**: three solutions, one per organisation. Elsewhere prefer "something genuinely useful", "what gets built", or naming the actual thing once it exists. The brand sheet warns against "solutions" used as a vague noun, and that still holds: "three solutions" is fine, "digital solutions for the community sector" is not.

**Do not publish a category list.** No "the kind of tools we build" section. Describing bookings, memberships and websites as the menu narrows what organisations think they can ask for, and it dates badly.

**Buttons say what happens.** "Apply now", "See what's involved", "Send my application". Never "Submit", "Get started", "Learn more". One call to action, worded identically wherever it appears, and always a real button rather than a pill or a label.

**Numbers, plainly.** Three solutions, each scoped to serve more than one organisation. Six paid developer seats. One five-week build. Six-week free bug-fix period after handover. Six partner organisations. No cost to the organisation. Open source. Never write a range where a single number is locked, and never publish the grant amount or budget figures.

**Two audiences, one site, forked early.** Community organisations need plain language, no cost stated clearly, low intimidation, and a clear picture of the hours involved (one named contact, one to two hours a week); this audience bounces first if the page feels technical. If a reader has to know what a database is to follow the page, it is pitched too high. Developers get the paid work first, then portfolio and mentoring, then the community contribution. Never lead with volunteering and never imply the paid seats are unpaid; the honest framing is part-time, evenings and weekends, roughly 12 hours a week for five weeks, after the ski season closes. Both paths carry the same dates at equal prominence.

**Calls to action.** One phrase for both audiences: **Apply now**. Never "EOI" or "expression of interest" in public copy; most readers do not know the term. Say "applications open 15 to 31 August" and "apply now". Internally the process is still an EOI round.

**Locked programme plan.** 15 to 31 August expressions of interest open. 1 to 18 September panel assessment and high-level solution design. 24 September three selected organisations announced (a date, not a promised public event, which is not funded). 28 September to 9 October discovery. 12 October to 13 November five-week build in weekly sprints. 26 November Showcase Hui, run as FLINT Queenstown's Q4 event. Handover completed through early December.

**Assessment weightings**, worth stating on the community path: genuine need 25%, reuse by other organisations 20%, realistic scope and deliverability 20%, readiness to adopt 15%, strategic and community fit 10%, data, risk and sustainability 10%.

**Do not write copy on these yet.** Developer eligibility beyond "based in the Queenstown Lakes district". The exact scope of the post-build support period, describe it in general terms only. huddl and Technology Queenstown logos. A public event on 24 September. The QLDC logo.

Examples in the register:

> Solutions that actually get used.
> Local developers work at community rates, well under what they charge commercially, to build small practical solutions for not-for-profits across the district.
> One named contact person. Roughly one to two hours a week during the build. That is the whole ask.
> Paid contract work, real users, and code you can point at.

Space Mono label examples: `HOW IT RUNS`, `WHY IT EXISTS`, `WHO CAN APPLY`, `KEY DATES`, `APPLICATIONS OPEN 1 TO 31 AUGUST`.

**No email address yet.** There is no inbox that can receive mail, so no address goes on the site or in the footer. All contact runs through the application form until one exists.

## Iconography

There is no icon set in the supplied material, and none has been invented. The only brand glyph is the caret from the logo, available as `assets/logos/icon-ink.svg`, `icon-kowhai.svg` and `icon-white.svg`, and as the `Caret` component drawn in CSS for use as a list marker, timeline node and select indicator.

- Emoji: never.
- Unicode symbols as decoration: never. The caret replaces bullets and arrows.
- No icon font, no sprite sheet, no CDN icon library is part of the brand. If a future surface genuinely needs a functional icon set (e.g. an admin tool), pick one restrained outline set at 1.5px to 2px stroke, use it in Ink or Fern only, flag the addition, and add it here rather than mixing sets.

## Logo handling

Clear space equals the cursor-block height on all sides. The full lockup holds down to 16px; below that use the icon alone. Ink or Kōwhai gold only for the mark. Never stretched or squashed, never recoloured off-palette, never with a drop shadow. Horizontal lockup in the header, primary lockup in the footer or hero.

If Logo C genuinely fails somewhere — for example against a partner lockup row — flag it rather than substituting. Logo F "Reflection" is the agreed fallback and only Iona makes that call.

## Non-negotiables

- The QLDC Economic Diversification Fund must be credited as funder on any page promoting the programme. The QLDC logo needs written approval before use and must follow their brand guidelines, so `FunderCredit` renders a placeholder slot. Do not pull a logo from the web. Footer credit line: *a Startup Queenstown Lakes programme, funded by the QLDC Economic Diversification Fund*.
- All six partners get equal treatment in the partner row: Startup Queenstown Lakes, Queenstown Coders Connect, FLINT Queenstown, Queenstown Resort College, huddl, Technology Queenstown. Startup Queenstown Lakes' role as lead organisation and fund holder can be stated in text, but the logo row must not rank them by size. No partner logo files were supplied, so names render in Archivo until real marks arrive. Signed partner certifications are on file for Startup Queenstown Lakes, FLINT Queenstown, Queenstown Coders Connect and QRC only; confirm before huddl or Technology Queenstown logos go on the site.
- Everything built in the programme is open source. It belongs on the page, not in a footnote.

## Known gaps

- **Fonts.** No font binaries were supplied. Archivo, Source Sans 3 and Space Mono are all on Google Fonts and are loaded from there in `tokens/fonts.css`. If licensed webfont files exist, drop them into `assets/fonts/` and swap the `@import` for local `@font-face` rules.
- **Photography.** None supplied. Type-led layouts and one plain placeholder block are used instead.
- **Partner and funder logos.** None supplied, and the QLDC mark needs written approval. Text placeholders throughout.
- **Logo F "Reflection".** Referenced in the brand sheet as the agreed fallback but not supplied, so it is not in `assets/`.
- **The original one-pager artefact** (`assets/reference/ctl-one-pager.png`) still shows the superseded eight-week build and 9 November Showcase Hui. The `templates/one-pager/` rebuild uses the locked plan; the printed or shared PDF version needs replacing before the EOI window opens.
