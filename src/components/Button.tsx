import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";

/* Ported from the design handoff prototype.
 *
 * Two deliberate changes from the prototype source:
 *  - Hover and press ran on React state (onMouseEnter/onMouseLeave/onMouseDown).
 *    They are real CSS :hover and :active here, so they work for keyboard and
 *    touch users and cost no re-renders.
 *  - It rendered a bare <a> when href was set. This renders next/link for
 *    internal routes so client navigation and the cross-route View Transition
 *    apply, falling back to <a> for anything external.
 *
 * Brand rules encoded here: hover is a single colour step in the same hue over
 * 120ms, press is translateY(1px), and nothing lifts or scales.
 */

const button = cva(
  [
    "inline-flex items-center justify-center gap-2 text-center no-underline",
    "font-heading font-bold tracking-action",
    // Border WIDTH only. The colour is set per variant: a shared
    // `border-transparent` here would compete with the variants' border-colour
    // utilities, and CSS resolves that by stylesheet order rather than by the
    // order classes appear in className — so the outline variants would lose
    // their border at random.
    "cursor-pointer border-2 border-solid rounded-card",
    "transition-[background-color,color,border-color]",
    "duration-[var(--duration-fast)] ease-brand",
    "active:translate-y-px",
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:translate-y-0",
  ],
  {
    variants: {
      variant: {
        primary:
          "border-transparent bg-action-primary text-ink hover:bg-action-primary-hover",
        secondary:
          "border-transparent bg-action-secondary text-oat hover:bg-action-secondary-hover",
        // Oat on Fern is 3.6:1, so this variant needs 18px+ at weight 800.
        fern: "border-transparent bg-action-tertiary text-oat font-extrabold hover:bg-action-tertiary-hover",
        oat: "border-transparent bg-oat text-ink hover:bg-white",
        outline: "border-ink bg-transparent text-ink hover:bg-ink hover:text-oat",
        "outline-inverse":
          "border-oat-16 bg-transparent text-oat hover:border-kowhai hover:text-kowhai",
      },
      size: {
        sm: "text-body-sm px-4 py-2",
        md: "text-body-md px-5 py-3",
        lg: "text-body-lg px-6 py-4",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  },
);

type ButtonVariants = VariantProps<typeof button>;

type ButtonProps = ButtonVariants & {
  children: React.ReactNode;
  href?: string;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
};

export function Button({
  variant,
  size,
  fullWidth,
  href,
  disabled = false,
  children,
  className,
  onClick,
  type = "button",
}: ButtonProps) {
  const classes = button({ variant, size, fullWidth, class: className });

  if (href && !disabled) {
    const isExternal = /^(https?:)?\/\//.test(href) || href.startsWith("mailto:");
    if (isExternal) {
      return (
        <a href={href} className={classes} onClick={onClick}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled} className={classes} onClick={onClick}>
      {children}
    </button>
  );
}

export { button as buttonVariants };
