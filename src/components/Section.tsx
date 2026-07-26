import { clsx } from "clsx";

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
  /** Drop the top padding where a section follows another on the same surface. */
  flush?: boolean;
  tight?: boolean;
  className?: string;
  id?: string;
};

export function Section({
  children,
  tone = "oat",
  flush = false,
  tight = false,
  className,
  id,
}: SectionProps) {
  const dark = tone === "ink";

  return (
    <section
      id={id}
      className={clsx(
        dark ? "bg-ink text-body-inverse" : "bg-oat text-body",
        tight ? "pb-section-tight" : "pb-section",
        !flush && (tight ? "pt-section-tight" : "pt-section"),
        className,
      )}
    >
      <div className="mx-auto max-w-page px-gutter lg:px-gutter-lg">{children}</div>
    </section>
  );
}
