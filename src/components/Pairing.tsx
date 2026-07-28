import { clsx } from "clsx";
import { Caret } from "./Caret";
import { Eyebrow, KnockText, WordKnockText } from "./Typography";

/* The two sides of the programme, facing each other with the caret between
 * them: developers with capacity on one side, organisations running on
 * spreadsheets on the other, and "nothing was connecting them" in the middle.
 *
 * Responsive behaviour is new work. The prototype used a fixed
 * `minmax(240px,1fr) 96px minmax(240px,1fr)` grid, which cannot survive a phone.
 * Below md it stacks to one column, the sides go left-aligned rather than
 * facing, and the join caret points down instead of across — the two carets are
 * rendered and swapped in CSS, since direction is a prop rather than a style.
 */

export type PairingSide = {
  eyebrow?: string;
  title: string;
  body?: string;
};

type PairingProps = {
  left: PairingSide;
  right: PairingSide;
  joinLabel?: string;
  inverse?: boolean;
  className?: string;
};

function Side({
  data,
  align,
  inverse,
}: {
  data: PairingSide;
  align: "left" | "right";
  inverse: boolean;
}) {
  return (
    <div className={clsx("text-left", align === "right" ? "md:text-right" : "md:text-left")}>
      {data.eyebrow ? (
        <Eyebrow inverse={inverse} className="mb-4">
          {data.eyebrow}
        </Eyebrow>
      ) : null}

      <KnockText
        className={clsx(
          "font-heading text-subhead font-extrabold",
          inverse ? "text-heading-inverse" : "text-heading",
        )}
      >
        {data.title}
      </KnockText>

      {data.body ? (
        <WordKnockText
          as="div"
          className={clsx(
            "mt-3 font-sans text-body-md",
            inverse ? "text-body-inverse" : "text-body",
          )}
        >
          {data.body}
        </WordKnockText>
      ) : null}
    </div>
  );
}

export function Pairing({ left, right, joinLabel, inverse = false, className }: PairingProps) {
  const rule = inverse ? "bg-hairline-inverse" : "bg-hairline";

  return (
    <div
      className={clsx(
        "grid grid-cols-1 items-center gap-7",
        "md:grid-cols-[minmax(var(--pairing-side-min),1fr)_var(--pairing-join)_minmax(var(--pairing-side-min),1fr)]",
        className,
      )}
    >
      <Side data={left} align="right" inverse={inverse} />

      <div className="grid content-center justify-items-center gap-3 self-stretch">
        <span className={clsx("hidden h-[var(--pairing-spine)] w-px md:block", rule)} />
        <Caret
          direction="right"
          size={12}
          thickness={2}
          color={inverse ? "var(--ctl-kowhai)" : "var(--ctl-fern)"}
          className="hidden md:inline-block"
        />
        <Caret
          direction="down"
          size={12}
          thickness={2}
          color={inverse ? "var(--ctl-kowhai)" : "var(--ctl-fern)"}
          className="md:hidden"
        />
        {joinLabel ? (
          <span
            className={clsx(
              "text-center font-meta text-label uppercase",
              inverse ? "text-muted-inverse" : "text-muted",
            )}
          >
            {joinLabel}
          </span>
        ) : null}
        <span className={clsx("hidden h-[var(--pairing-spine)] w-px md:block", rule)} />
      </div>

      <Side data={right} align="left" inverse={inverse} />
    </div>
  );
}
