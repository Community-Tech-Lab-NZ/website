"use client";

import { useField } from "./Field";
import { controlClasses } from "./control";

/* Single-line text input.
 *
 * id, aria-describedby, aria-invalid and required all come from the enclosing
 * Field via context, so the hint and error text a sighted user reads are the
 * same ones a screen reader announces.
 */

type InputProps = Omit<React.ComponentPropsWithoutRef<"input">, "className"> & {
  inverse?: boolean;
  invalid?: boolean;
  className?: string;
};

export function Input({ inverse, invalid, className, ...props }: InputProps) {
  const field = useField();
  const isInvalid = invalid ?? field.invalid ?? false;
  const isInverse = inverse ?? field.inverse ?? false;

  return (
    <input
      id={props.id ?? field.id}
      aria-describedby={props["aria-describedby"] ?? field.describedBy}
      aria-invalid={isInvalid || undefined}
      required={props.required ?? field.required}
      className={controlClasses({ inverse: isInverse, invalid: isInvalid, className })}
      {...props}
    />
  );
}
