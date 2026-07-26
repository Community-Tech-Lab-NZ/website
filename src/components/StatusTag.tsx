import { clsx } from "clsx";
import { cva, type VariantProps } from "class-variance-authority";

/* Status marker. Space Mono caps in a hairline capsule.
 *
 * The 999px radius is the one place pills are permitted in this system —
 * everything else is near-square. Status is carried by Fern (open) and Ink
 * (neutral); there is no red or amber in this palette.
 */

const tag = cva(
  [
    "inline-flex items-center gap-2",
    "font-meta text-label uppercase",
    "rounded-capsule border border-solid p-[var(--tag-padding)]",
  ],
  {
    variants: {
      tone: {
        // Text is the darker Fern, not --ctl-fern. Fern on Oat is 3.58:1, and
        // the brand guide itself restricts it to "large headings and UI elements
        // only, never body copy or small links" — but this tag is 11px Space
        // Mono, which is exactly the case it rules out. The border stays full
        // Fern, where 3.58:1 is fine for a non-text boundary.
        //
        // The darker value is --action-tertiary-bg-hover, already in the
        // palette, so no new colour enters the system. 4.74:1.
        open: "text-action-tertiary-hover border-fern bg-transparent",
        neutral: "text-muted border-hairline bg-transparent",
        gold: "text-ink border-kowhai bg-kowhai",
        inverse: "text-oat border-oat-16 bg-transparent",
      },
    },
    defaultVariants: { tone: "open" },
  },
);

type StatusTagProps = VariantProps<typeof tag> & {
  children: React.ReactNode;
  className?: string;
};

export function StatusTag({ tone, children, className }: StatusTagProps) {
  return <span className={clsx(tag({ tone }), className)}>{children}</span>;
}
