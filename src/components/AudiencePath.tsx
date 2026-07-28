"use client";

import { clsx } from "clsx";
import { knockEnd, knockEnter } from "@/lib/knock";
import { useWordKnock } from "@/hooks/useWordKnock";
import { Button } from "./Button";
import { CaretList } from "./CaretList";
import { Eyebrow, splitWords } from "./Typography";

/* One of the two audience paths.
 *
 * The site forks community organisations and developers straight from the hero;
 * the handoff is explicit that you never write one path serving both.
 *
 * THE COMMUNITY CARD IS THE INK ONE. The prototype had it the other way round,
 * and the Ink card plainly draws the eye first, so it was sending that attention
 * to developers. The programme's actual constraint is finding community
 * organisations with a real problem worth building for; developers are the
 * easier side to fill. The emphasis follows the constraint.
 *
 * The gold action follows the Ink card, so "one gold thing per viewport" still
 * holds with the two side by side — it has just moved to the community side.
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
  const dark = audience === "community";
  // The blurb joins the word knock (it renders outside Body, so it missed it).
  const blurbRef = useWordKnock<HTMLParagraphElement>();

  return (
    <div
      className={clsx(
        // ctl-lift is motion override 4 and owns the whole transition —
        // border fade included — so the Fern highlight eases in on the same
        // slow hover timing as everything else. No Tailwind transition
        // utilities here; one would overwrite the shorthand.
        "ctl-lift flex flex-col gap-4 rounded-card border border-solid p-7 hover:border-fern",
        dark
          ? "border-transparent bg-ink text-body-inverse"
          : "border-hairline bg-oat text-body",
        className,
      )}
    >
      {eyebrow ? (
        /* This carried a text-fern class meant to accent the eyebrow on the Ink
           card. It never took effect — text-muted-inverse from `inverse` wins on
           stylesheet order — and it is just as well: Fern on Ink measures
           4.05:1, under the 4.5:1 needed at this size. Removed rather than made
           to work. The muted colour gives 7.69:1. */
        <Eyebrow inverse={dark}>{eyebrow}</Eyebrow>
      ) : null}

      <h3
        onMouseEnter={knockEnter}
        onAnimationEnd={knockEnd}
        className={clsx(
          "ctl-knock font-heading text-subhead font-extrabold",
          dark ? "text-heading-inverse" : "text-heading",
        )}
      >
        {title}
      </h3>

      {blurb ? (
        <p
          ref={blurbRef}
          className={clsx("font-sans text-body-md", dark ? "text-body-inverse" : "text-body")}
        >
          {splitWords(blurb)}
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
