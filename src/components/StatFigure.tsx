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
  className?: string;
};

export function StatFigure({
  figure,
  label,
  inverse = false,
  accent = false,
  labelSize = "sm",
  className,
}: StatFigureProps) {
  return (
    <div className={className}>
      <div
        className={clsx(
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
          "mt-3 font-meta uppercase leading-tight",
          LABEL_SIZE[labelSize],
          inverse ? "text-muted-inverse" : "text-muted",
        )}
      >
        {label}
      </div>
    </div>
  );
}
