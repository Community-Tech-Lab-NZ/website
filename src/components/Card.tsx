import { clsx } from "clsx";
import { cva, type VariantProps } from "class-variance-authority";

/* Ported from the design handoff prototype.
 *
 * Cards in this design carry a 1px hairline border and NO shadow at all. The
 * brand guide treats shadow as a last resort reserved for dialogs, so there is
 * deliberately no elevation prop here.
 *
 * Tier-three motion: `interactive` steps the hairline toward Fern on hover.
 * That is only ever correct on a card that actually does something when
 * clicked — a hover affordance on static content lies about what will happen.
 *
 * PADDING STEPS WITH WIDTH, the same way Section's gutter does (24px, then
 * 48px from lg). The prototype's flat 32px was a desktop number applied at
 * every size: on a 320px phone a card spans 272px, and 32px each side left
 * 208px of usable line — 65% of the screen, with the rest spent on inset. The
 * card is already inside the page gutter, so its padding is the SECOND inset a
 * phone pays for, and 24px is enough to keep the border off the text. */

const card = cva("rounded-card border border-solid p-5 lg:p-6", {
  variants: {
    tone: {
      light: "bg-surface-card text-body border-hairline",
      oat: "bg-oat text-body border-hairline",
      sunk: "bg-surface-sunk text-body border-transparent",
      ink: "bg-surface-card-inverse text-body-inverse border-hairline-inverse",
    },
    accentRule: {
      true: "border-t-2 border-t-kowhai",
      false: "",
    },
    interactive: {
      true: "transition-[border-color] duration-[var(--duration-fast)] ease-brand hover:border-fern",
      false: "",
    },
  },
  defaultVariants: {
    tone: "light",
    accentRule: false,
    interactive: false,
  },
});

type CardProps = VariantProps<typeof card> & {
  children: React.ReactNode;
  className?: string;
};

export function Card({ tone, accentRule, interactive, children, className }: CardProps) {
  return (
    <div className={clsx(card({ tone, accentRule, interactive }), className)}>{children}</div>
  );
}
