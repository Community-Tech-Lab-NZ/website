import { clsx } from "clsx";
import { Drift } from "./Drift";

/* Ported from the design handoff prototype.
 *
 * One change: the prototype padded the inner container with --gutter-lg (48px)
 * at every width. That is the missing responsive layer — 48px of gutter on a
 * 375px phone leaves very little room for a 700px reading measure. This uses
 * --gutter (24px) up to the lg breakpoint, which is what both tokens are for.
 */

type SectionProps = {
  children: React.ReactNode;
  tone?: "oat" | "ink";
  /** "auto": Ink sections carry the diagonal drift, Oat sections stay still.
   *  "hero": rising carets like the home hero, Ink-tinted on Oat.
   *  "none": no ambient layer at all. */
  drift?: "auto" | "hero" | "none";
  /** Drop the top padding where a section follows another on the same surface. */
  flush?: boolean;
  tight?: boolean;
  /** The Ink hero band at the top of a page: shorter, asymmetric padding.
   *  Follow it with a gold SectionRule, as the Oat heroes already do. */
  hero?: boolean;
  className?: string;
  id?: string;
};

export function Section({
  children,
  tone = "oat",
  drift = "auto",
  flush = false,
  tight = false,
  hero = false,
  className,
  id,
}: SectionProps) {
  const dark = tone === "ink";

  return (
    <section
      id={id}
      className={clsx(
        "relative",
        dark ? "bg-ink text-body-inverse" : "bg-oat text-body",
        hero
          ? "pb-8 pt-9"
          : [
              tight ? "pb-section-tight" : "pb-section",
              !flush && (tight ? "pt-section-tight" : "pt-section"),
            ],
        className,
      )}
    >
      {drift === "hero" ? (
        <Drift preset="hero" onLight={!dark} />
      ) : drift === "auto" && dark ? (
        <Drift preset="section" />
      ) : null}
      <div className="relative mx-auto max-w-page px-gutter lg:px-gutter-lg">{children}</div>
    </section>
  );
}
