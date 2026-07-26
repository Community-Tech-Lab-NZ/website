"use client";

import { useId } from "react";
import { clsx } from "clsx";

/* Square checkbox with a caret-derived tick. Fern fill, Oat tick.
 *
 * These carry real weight in the community form: six of them are eligibility
 * gates that all have to be ticked before the form can be submitted, and a
 * seventh is the declaration.
 *
 * Accessibility fix over the prototype: it hid the real input with
 * `position:absolute; opacity:0`, which also hid the focus ring, leaving
 * keyboard users unable to see which gate they were on. The input is now
 * sr-only but still focusable, and the visual box picks up the focus ring
 * through peer-focus-visible.
 *
 * The tick is targeted with peer-checked:[&_[data-tick]]:block rather than a
 * bare peer-checked:block — the tick sits inside the label, so it is a
 * descendant of the peer's sibling rather than a sibling itself.
 */

type CheckboxProps = {
  label: React.ReactNode;
  id?: string;
  name?: string;
  value?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  inverse?: boolean;
  required?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
};

export function Checkbox({
  label,
  id,
  name,
  value,
  checked,
  defaultChecked,
  disabled = false,
  inverse = false,
  required = false,
  onChange,
  className,
}: CheckboxProps) {
  const generated = useId();
  const inputId = id ?? generated;

  return (
    <div className={clsx(disabled && "opacity-50", className)}>
      <input
        id={inputId}
        name={name}
        value={value}
        type="checkbox"
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        required={required}
        onChange={onChange}
        className="peer sr-only"
      />

      <label
        htmlFor={inputId}
        className={clsx(
          "flex items-start gap-3",
          disabled ? "cursor-not-allowed" : "cursor-pointer",
          // Checked and focus states reach the box and tick from the input.
          "peer-checked:[&_[data-box]]:border-fern peer-checked:[&_[data-box]]:bg-fern",
          "peer-checked:[&_[data-tick]]:block",
          "peer-focus-visible:[&_[data-box]]:outline-2 peer-focus-visible:[&_[data-box]]:outline-offset-2 peer-focus-visible:[&_[data-box]]:outline-fern",
        )}
      >
        <span
          data-box
          aria-hidden="true"
          className={clsx(
            "mt-[var(--checkbox-offset)] grid h-[var(--checkbox-size)] w-[var(--checkbox-size)] shrink-0 place-items-center",
            "rounded-card border border-solid",
            "transition-[background-color,border-color] duration-[var(--duration-fast)] ease-brand",
            inverse ? "border-oat-16 bg-transparent" : "border-ink-16 bg-white",
          )}
        >
          <span
            data-tick
            className="hidden h-[var(--checkbox-tick-h)] w-[var(--checkbox-tick-w)] rotate-[-45deg] border-b-2 border-l-2 border-solid border-oat"
          />
        </span>

        <span
          className={clsx(
            "font-sans text-body-md leading-[var(--checkbox-leading)]",
            inverse ? "text-body-inverse" : "text-body",
          )}
        >
          {label}
        </span>
      </label>
    </div>
  );
}
