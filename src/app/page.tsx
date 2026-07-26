import { Button } from "@/components/Button";

/* TEMPORARY — phase 1 pilot.
 *
 * This is the theme-mapping proving harness, not the home page. It renders every
 * Button variant and size, the locked type scale, the palette and the spacing
 * scale, so a wrong or missing @theme key is visible immediately rather than
 * after 21 components have been built on top of it.
 *
 * Replaced by the real home page in phase 3.
 */

const VARIANTS = [
  "primary",
  "secondary",
  "fern",
  "oat",
  "outline",
  "outline-inverse",
] as const;

const SIZES = ["sm", "md", "lg"] as const;

const TYPE_SCALE = [
  { cls: "text-display font-heading font-black", label: "display / 52 / 900" },
  { cls: "text-headline font-heading font-extrabold", label: "headline / 34 / 800" },
  { cls: "text-subhead font-heading font-bold", label: "subhead / 22 / 700" },
  { cls: "text-body-lg font-sans", label: "body-lg / 18 / 400" },
  { cls: "text-body-md font-sans", label: "body-md / 16 / 400" },
  { cls: "text-body-sm font-sans", label: "body-sm / 14 / 400" },
  { cls: "text-label font-meta uppercase", label: "label / 11 / mono caps" },
];

const PALETTE = [
  { cls: "bg-ink", name: "ink" },
  { cls: "bg-fern", name: "fern" },
  { cls: "bg-kowhai", name: "kowhai" },
  { cls: "bg-oat border border-hairline", name: "oat" },
  { cls: "bg-white border border-hairline", name: "white" },
  { cls: "bg-oat-sunk", name: "oat-sunk" },
  { cls: "bg-ink-raised", name: "ink-raised" },
];

const SPACING = [
  { n: 1, w: "w-1" },
  { n: 2, w: "w-2" },
  { n: 3, w: "w-3" },
  { n: 4, w: "w-4" },
  { n: 5, w: "w-5" },
  { n: 6, w: "w-6" },
  { n: 7, w: "w-7" },
  { n: 8, w: "w-8" },
  { n: 9, w: "w-9" },
  { n: 10, w: "w-10" },
];

export default function PilotPage() {
  return (
    <main className="bg-surface-page text-body">
      <div className="mx-auto max-w-page px-gutter py-section lg:px-gutter-lg">
        <p className="font-meta text-label uppercase text-muted">Phase 1 pilot</p>
        <h1 className="mt-4 font-heading text-display-fluid font-black text-heading">
          Theme mapping check
        </h1>
        <p className="mt-5 max-w-measure font-sans text-body-lg">
          Every value on this page comes from the token layer through the{" "}
          <code className="font-meta">@theme</code> block. If something here looks
          wrong, the mapping is wrong.
        </p>

        <hr className="ctl-rule-gold my-9" />

        <h2 className="font-heading text-headline font-extrabold text-heading">
          Buttons on Oat
        </h2>
        <div className="mt-6 flex flex-col gap-6">
          {VARIANTS.filter((v) => v !== "outline-inverse").map((variant) => (
            <div key={variant} className="flex flex-wrap items-center gap-4">
              <span className="w-40 font-meta text-body-sm text-muted">{variant}</span>
              {SIZES.map((size) => (
                <Button key={size} variant={variant} size={size}>
                  Apply now
                </Button>
              ))}
              <Button variant={variant} size="md" disabled>
                Disabled
              </Button>
            </div>
          ))}
        </div>

        <hr className="my-9 border-t border-hairline" />

        <h2 className="font-heading text-headline font-extrabold text-heading">
          Type scale
        </h2>
        <div className="mt-6 flex flex-col gap-5">
          {TYPE_SCALE.map((t) => (
            <div key={t.label}>
              <span className="font-meta text-label uppercase text-muted">{t.label}</span>
              <p className={`${t.cls} text-heading`}>Solutions that get used</p>
            </div>
          ))}
        </div>

        <hr className="my-9 border-t border-hairline" />

        <h2 className="font-heading text-headline font-extrabold text-heading">
          Palette
        </h2>
        <div className="mt-6 flex flex-wrap gap-4">
          {PALETTE.map((c) => (
            <div key={c.name} className="flex flex-col gap-2">
              <div className={`${c.cls} h-8 w-8 rounded-card`} />
              <span className="font-meta text-body-sm text-muted">{c.name}</span>
            </div>
          ))}
        </div>

        <hr className="my-9 border-t border-hairline" />

        <h2 className="font-heading text-headline font-extrabold text-heading">
          Spacing scale
        </h2>
        <p className="mt-3 max-w-measure font-sans text-body-sm text-muted">
          8px base, derived from the cursor block in the logo. Brand numbering is
          preserved, so space-5 is 24px.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          {SPACING.map((s) => (
            <div key={s.n} className="flex items-center gap-4">
              <span className="w-16 font-meta text-body-sm text-muted">space-{s.n}</span>
              <div className={`${s.w} h-3 bg-fern`} />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface-inverse">
        <div className="mx-auto max-w-page px-gutter py-section lg:px-gutter-lg">
          <h2 className="font-heading text-headline font-extrabold text-heading-inverse">
            Buttons on Ink
          </h2>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <span className="w-40 font-meta text-body-sm text-muted-inverse">
              outline-inverse
            </span>
            {SIZES.map((size) => (
              <Button key={size} variant="outline-inverse" size={size}>
                See what&rsquo;s involved
              </Button>
            ))}
          </div>
          <div className="mt-8">
            <p className="font-meta text-label uppercase text-muted-inverse">
              Hero CTA, detached ring
            </p>
            <div className="mt-5">
              <Button variant="primary" size="lg" className="ring-detached">
                Apply now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
