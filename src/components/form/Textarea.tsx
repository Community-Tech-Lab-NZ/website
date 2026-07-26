"use client";

import { clsx } from "clsx";
import { useField } from "./Field";
import { controlClasses } from "./control";

type TextareaProps = Omit<React.ComponentPropsWithoutRef<"textarea">, "className"> & {
  inverse?: boolean;
  invalid?: boolean;
  className?: string;
};

/* Multi-line input. Carries most of the community application: eleven of its
 * fourteen long-form answers are textareas.
 *
 * Line height steps up from the control default (1.4) to the body leading (1.6),
 * because these hold paragraphs rather than single values. resize-y is kept —
 * someone writing 150 words about what is going wrong in their week should be
 * able to see more than four rows of it.
 */
export function Textarea({ inverse, invalid, className, rows = 4, ...props }: TextareaProps) {
  const field = useField();
  const isInvalid = invalid ?? field.invalid ?? false;
  const isInverse = inverse ?? field.inverse ?? false;

  return (
    <textarea
      id={props.id ?? field.id}
      rows={rows}
      aria-describedby={props["aria-describedby"] ?? field.describedBy}
      aria-invalid={isInvalid || undefined}
      required={props.required ?? field.required}
      className={controlClasses({
        inverse: isInverse,
        invalid: isInvalid,
        className: clsx("resize-y leading-[var(--leading-body)]", className),
      })}
      {...props}
    />
  );
}
