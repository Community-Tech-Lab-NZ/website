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
  /* Set only in group mode: the id of the label span, for aria-labelledby.
     A <label htmlFor> cannot name a radiogroup — htmlFor only binds to
     labelable elements, so pointing it at a group drops the association
     silently and a screen reader user hears no question at all. */
  labelId?: string;
  /* The label as a plain string, when it is one. Select reads this for the
     touch sheet's title, so the sheet names the question it is answering
     without every call site having to repeat it. */
  labelText?: string;
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
  /** The control is a group of inputs rather than one, as RadioGroup is. */
  group?: boolean;
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
  group = false,
  id,
  className,
}: FieldProps) {
  const generated = useId();
  const fieldId = id ?? generated;
  const hintId = `${fieldId}-hint`;
  const errorId = `${fieldId}-error`;
  const labelId = `${fieldId}-label`;

  const showHint = Boolean(hint) && !error;
  const describedBy =
    [showHint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

  /* Identical in both branches, so it is written once rather than twice.
     Darker Fern: --ctl-fern on Oat is 3.58:1, and this asterisk is 14px bold,
     which WCAG does not count as large text. The screen reader gets the word
     regardless, but the mark is the only visual cue that a field is required,
     so it has to clear 4.5:1. 4.74:1 here, the same substitution StatusTag
     makes. */
  const requiredMark = required ? (
    <span className="text-action-tertiary-hover">
      {" *"}
      <span className="sr-only">required</span>
    </span>
  ) : null;

  const labelClass = clsx(
    "font-heading text-body-sm font-bold",
    inverse ? "text-heading-inverse" : "text-heading",
  );

  return (
    <FieldContext.Provider
      value={{
        id: fieldId,
        labelId: group ? labelId : undefined,
        labelText: typeof label === "string" ? label : undefined,
        describedBy,
        invalid: Boolean(error),
        required,
        inverse,
      }}
    >
      <div className={clsx("grid gap-2", className)}>
        {label ? (
          /* A group is named through aria-labelledby, not htmlFor, so in that
             mode this is a span carrying an id rather than a real label. */
          group ? (
            <span id={labelId} className={labelClass}>
              {label}
              {requiredMark}
            </span>
          ) : (
            <label htmlFor={fieldId} className={labelClass}>
              {label}
              {requiredMark}
            </label>
          )
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
