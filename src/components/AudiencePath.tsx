import { clsx } from "clsx";
import { Button } from "./Button";
import { CaretList } from "./CaretList";
import { Eyebrow } from "./Typography";

/* One of the two audience paths.
 *
 * The site forks community organisations and developers straight from the hero;
 * the handoff is explicit that you never write one path serving both. The
 * community card sits on Oat with an outline action, the developer card on Ink
 * with the gold action — which is also how the "one gold thing per viewport"
 * rule stays satisfied when the two sit side by side.
 *
 * The whole card is a link target in practice, so the tier-three hover step on
 * the hairline is legitimate here: something does happen when you click it.
 */

type AudiencePathProps = {
  audience?: "community" | "developer";
  eyebrow?: string;
  title: string;
  blurb?: string;
  points?: React.ReactNode[];
  actionLabel?: string;
  actionHref?: string;
  className?: string;
};

export function AudiencePath({
  audience = "community",
  eyebrow,
  title,
  blurb,
  points = [],
  actionLabel,
  actionHref,
  className,
}: AudiencePathProps) {
  const dark = audience === "developer";

  return (
    <div
      className={clsx(
        "flex flex-col gap-4 rounded-card p-7",
        dark
          ? "bg-ink text-body-inverse"
          : "border border-solid border-hairline bg-oat text-body transition-[border-color] duration-[var(--duration-fast)] ease-brand hover:border-fern",
        className,
      )}
    >
      {eyebrow ? (
        // Fern rather than muted on the developer card: the eyebrow is the one
        // structural accent on an otherwise unbroken Ink surface.
        <Eyebrow inverse={dark} className={dark ? "text-fern" : undefined}>
          {eyebrow}
        </Eyebrow>
      ) : null}

      <h3
        className={clsx(
          "font-heading text-subhead font-extrabold",
          dark ? "text-heading-inverse" : "text-heading",
        )}
      >
        {title}
      </h3>

      {blurb ? (
        <p className={clsx("font-sans text-body-md", dark ? "text-body-inverse" : "text-body")}>
          {blurb}
        </p>
      ) : null}

      {points.length ? <CaretList items={points} inverse={dark} /> : null}

      {actionLabel ? (
        <div className="mt-auto pt-4">
          <Button variant={dark ? "primary" : "outline"} href={actionHref}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
