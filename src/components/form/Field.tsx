"use client";

import { createContext, useContext, useId } from "react";
import { clsx } from "clsx";

/* Label, hint and error wrapper for a form control.
 *
 * The prototype rendered hint and error text but never connected them to the
 * control, so a screen reader user heard the label and nothing else — no hint,
 * no error, no required state. That matters more here than on most sites: the
 * community form is 32 fields long, its hints carry the actual guidance
 * ("about 100 to 150 words"), and the audience is explicitly non-technical.
 *
 * Field now publishes id, aria-describedby, invalid and required through
 * context, and every control in this folder consumes it automatically. Nothing
 * has to be wired by hand at the call site.
 *
 * Error styling follows the brand: there is no red in this palette. Invalid
 * controls take a 2px Kowhai border, and the message is bold Ink on Oat —
 * Kowhai on Oat is 1.8:1 and fails, so it is never used for error text on a
 * light surface.
 */

type FieldContextValue = {
  id: string;
  describedBy?: string;
  invalid: boolean;
  required: boolean;
  inverse: boolean;
};

const FieldContext = createContext<FieldContextValue | null>(null);

export function useField(): Partial<FieldContextValue> {
  return useContext(FieldContext) ?? {};
}

type FieldProps = {
  children: React.ReactNode;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  inverse?: boolean;
  /** Override the generated id when the control needs a stable, known id. */
  id?: string;
  className?: string;
};

export function Field({
  children,
  label,
  hint,
  error,
  required = false,
  inverse = false,
  id,
  className,
}: FieldProps) {
  const generated = useId();
  const fieldId = id ?? generated;
  const hintId = `${fieldId}-hint`;
  const errorId = `${fieldId}-error`;

  const showHint = Boolean(hint) && !error;
  const describedBy =
    [showHint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

  return (
    <FieldContext.Provider
      value={{ id: fieldId, describedBy, invalid: Boolean(error), required, inverse }}
    >
      <div className={clsx("grid gap-2", className)}>
        {label ? (
          <label
            htmlFor={fieldId}
            className={clsx(
              "font-heading text-body-sm font-bold",
              inverse ? "text-heading-inverse" : "text-heading",
            )}
          >
            {label}
            {required ? (
              <span className="text-fern">
                {" *"}
                <span className="sr-only">required</span>
              </span>
            ) : null}
          </label>
        ) : null}

        {children}

        {showHint ? (
          <div
            id={hintId}
            className={clsx(
              "font-sans text-body-sm",
              inverse ? "text-muted-inverse" : "text-muted",
            )}
          >
            {hint}
          </div>
        ) : null}

        {error ? (
          <div
            id={errorId}
            role="alert"
            className={clsx(
              "font-sans text-body-sm font-semibold",
              inverse ? "text-kowhai" : "text-ink",
            )}
          >
            {error}
          </div>
        ) : null}
      </div>
    </FieldContext.Provider>
  );
}
