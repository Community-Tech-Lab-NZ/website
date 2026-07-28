import { clsx } from "clsx";

/* Shared baseline for every form control: 12px/14px padding, 16px Source Sans 3,
 * white fill, 1px hairline border, 2px radius, full width.
 *
 * Focus turns the border Fern. The global :focus-visible outline from
 * tokens/base.css is deliberately left in place on top of that — the border
 * change alone is a colour-only signal, and the outline is what makes focus
 * unambiguous for keyboard users.
 *
 * Invalid draws a 2px Kowhai border. There is no red in this palette.
 */

export function controlClasses({
  inverse = false,
  invalid = false,
  className,
}: {
  inverse?: boolean;
  invalid?: boolean;
  className?: string;
}) {
  return clsx(
    "box-border w-full rounded-card border border-solid font-sans text-body-md",
    // Same muted placeholder everywhere: without this, inputs show the UA's
    // own grey while a select showing its placeholder option renders solid
    // ink — the mismatch that made the two controls look unrelated. The
    // select half of the pairing lives in utilities.css (:has rule).
    inverse ? "placeholder:text-muted-inverse" : "placeholder:text-muted",
    "px-[var(--control-padding-x)] py-[var(--control-padding-y)] leading-[var(--control-leading)]",
    "transition-[border-color] duration-[var(--duration-fast)] ease-brand",
    "focus:border-fern",
    "disabled:cursor-not-allowed disabled:opacity-50",
    inverse ? "border-oat-16 bg-transparent text-oat" : "border-ink-16 bg-white text-ink",
    invalid && "border-2 border-kowhai",
    className,
  );
}
