import { clsx } from "clsx";

/* Inline error line for the forms: bold Ink on light surfaces, Kowhai on
 * dark. There is no red in this palette, and Kowhai on Oat fails contrast,
 * so weight and placement do the signalling on light ground. Field.tsx keeps
 * its own error rendering because its message is wired to the control by id;
 * this is for everything announced outside a Field. */

export function FormAlert({
  inverse = false,
  className,
  children,
}: {
  inverse?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p
      role="alert"
      className={clsx(
        "max-w-measure font-sans text-body-sm font-semibold",
        inverse ? "text-kowhai" : "text-ink",
        className,
      )}
    >
      {children}
    </p>
  );
}
