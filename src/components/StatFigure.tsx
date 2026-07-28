import { clsx } from "clsx";

/* A plain number that tells the story: three solutions, five-week build.
 *
 * There is deliberately NO animated counting here. The brand guide names
 * "counters ticking up" as forbidden and StatFigure's own spec repeats it. A
 * figure that counts up would also undercut the warm, grounded voice — "6 paid
 * developer seats" is a fact, not a scoreboard.
 */

const LABEL_SIZE = {
  sm: "text-label",
  md: "text-[length:var(--stat-label-md-size)] tracking-[var(--stat-label-md-tracking)]",
  lg: "text-[length:var(--stat-label-lg-size)] tracking-[var(--stat-label-lg-tracking)]",
} as const;

type StatFigureProps = {
  figure: React.ReactNode;
  label: React.ReactNode;
  inverse?: boolean;
  accent?: boolean;
  labelSize?: keyof typeof LABEL_SIZE;
  /**
   * `row` opts into a parent grid's rows via subgrid, so that figures share one
   * row and labels share the next. Without it a figure that wraps onto two
   * lines ("Open source") pushes its own label below everyone else's. The
   * parent must define the two rows and own the vertical gap.
   */
  align?: "flow" | "row";
  /**
   * Reveal the figure with an Oat block that slides off, like a selection
   * un-highlighting, once an ancestor `.is-in` lands. Explicitly NOT the
   * banned counter: the figure itself never changes. Only makes sense on Ink.
   */
  wipe?: boolean;
  /** Brushing the pointer past the stat knocks the figure like a vase: it
   *  tips on its base and wobbles back to rest. */
  knock?: boolean;
  className?: string;
};

export function StatFigure({
  figure,
  label,
  inverse = false,
  accent = false,
  labelSize = "sm",
  align = "flow",
  wipe = false,
  knock = false,
  className,
}: StatFigureProps) {
  const row = align === "row";

  return (
    <div
      className={clsx(row && "row-span-2 grid grid-rows-subgrid", knock && "ctl-knock-zone", className)}
    >
      <div
        className={clsx(
          wipe && "ctl-wipe",
          knock && "ctl-knock",
          "font-heading text-headline font-black leading-none",
          accent
            ? inverse
              ? "text-kowhai"
              : "text-fern"
            : inverse
              ? "text-heading-inverse"
              : "text-heading",
        )}
      >
        {figure}
      </div>
      <div
        className={clsx(
          "font-meta uppercase leading-tight",
          // In row mode the parent's row-gap does this job.
          row ? "mt-0" : "mt-3",
          LABEL_SIZE[labelSize],
          inverse ? "text-muted-inverse" : "text-muted",
        )}
      >
        {label}
      </div>
    </div>
  );
}
