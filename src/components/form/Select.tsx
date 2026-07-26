"use client";

import { clsx } from "clsx";
import { Caret } from "../Caret";
import { useField } from "./Field";
import { controlClasses } from "./control";

/* Native select, styled flat with a caret indicator.
 *
 * Native rather than a custom listbox: it gets keyboard handling, screen reader
 * support and the platform picker on mobile for free, and none of that is worth
 * rebuilding for six dropdowns. The caret is the brand's own glyph, so no icon
 * set is introduced.
 */

export type SelectOption = string | { value: string; label: string };

type SelectProps = Omit<React.ComponentPropsWithoutRef<"select">, "className" | "children"> & {
  options: readonly SelectOption[];
  /** Shown first and non-selectable, so the field does not silently default. */
  placeholder?: string;
  inverse?: boolean;
  invalid?: boolean;
  className?: string;
};

export function Select({
  options,
  placeholder,
  inverse,
  invalid,
  className,
  ...props
}: SelectProps) {
  const field = useField();
  const isInvalid = invalid ?? field.invalid ?? false;
  const isInverse = inverse ?? field.inverse ?? false;

  // A select must be controlled OR uncontrolled, never both. When the caller
  // supplies `value` the placeholder is selected by that value being "", so
  // defaultValue must not also be set — React warns and the behaviour is
  // ambiguous otherwise.
  const uncontrolled = props.value === undefined;
  const defaultValue = uncontrolled
    ? (props.defaultValue ?? (placeholder ? "" : undefined))
    : undefined;

  return (
    <div className={clsx("relative", className)}>
      <select
        id={props.id ?? field.id}
        aria-describedby={props["aria-describedby"] ?? field.describedBy}
        aria-invalid={isInvalid || undefined}
        required={props.required ?? field.required}
        defaultValue={defaultValue}
        className={controlClasses({
          inverse: isInverse,
          invalid: isInvalid,
          className: "cursor-pointer appearance-none pr-[var(--select-padding-right)]",
        })}
        {...props}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((o) => {
          const value = typeof o === "string" ? o : o.value;
          const label = typeof o === "string" ? o : o.label;
          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
      </select>

      <Caret
        direction="down"
        size={8}
        thickness={2}
        color={isInverse ? "var(--ctl-oat)" : "var(--ctl-ink)"}
        className="pointer-events-none absolute right-[var(--select-caret-right)] top-1/2 -translate-y-2/3"
      />
    </div>
  );
}
