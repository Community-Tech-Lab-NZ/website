import { clsx } from "clsx";
import { Button } from "./Button";
import { CaretList } from "./CaretList";
import { Eyebrow, KnockText, WordKnockText } from "./Typography";

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
 * NO HOVER STATE, DELIBERATELY. The card used to rise 3px and take a Fern
 * border under the pointer, on the reasoning that the whole thing was a link
 * target in practice. It is not — only the button inside navigates — and a card
 * that rises and lights up promises a click that never lands. The affordance
 * now sits where the behaviour is. This was the only caller of the lift, so the
 * rule went with it; see the note beside .ctl-grow in tokens/utilities.css.
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

  return (
    <div
      className={clsx(
        /* p-5 below lg, not the flat p-7 the prototype carried. 48px on both
           sides of a 272px card at 320px left 176px of line — 55% of the
           viewport reaching the reader, and the two card titles broke over four
           lines while the body text beneath them did not. Steps back up to 48px
           at lg, where the card is half a 1120px container and can afford it. */
        "flex flex-col gap-4 rounded-card border border-solid p-5 lg:p-7",
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

      <KnockText
        as="h3"
        className={clsx(
          "font-heading text-subhead font-extrabold",
          dark ? "text-heading-inverse" : "text-heading",
        )}
      >
        {title}
      </KnockText>

      {blurb ? (
        // The blurb joins the word knock (it renders outside Body, so it
        // would otherwise miss it).
        <WordKnockText
          className={clsx("font-sans text-body-md", dark ? "text-body-inverse" : "text-body")}
        >
          {blurb}
        </WordKnockText>
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
