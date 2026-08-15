"use client";

import { useId } from "react";
import { clsx } from "clsx";
import { useField } from "./Field";

/* Single-choice rows, for the questions a dropdown was doing badly.
 *
 * A native select is a modal sheet on a phone: two taps, a panel that covers
 * the page, and no sight of the question while you answer it. For two or three
 * options that is a lot of ceremony to answer yes or no, and for options
 * written as sentences the single-line row truncates them. Radios show every
 * option, in full, in place. Baymard puts the usable range for a drop-down at
 * five to ten options and finds 55% of people open one purely to see what is
 * inside, then close it again; the GOV.UK Design System calls select a last
 * resort. Six of this site's seven were under that floor.
 *
 * The visual language is borrowed, not invented. The chosen row wears the same
 * Oat fill and 2px Fern left rail that `select option:checked` wears inside the
 * picker (see utilities.css), and the tick is Checkbox's own 9x5 box rotated
 * -45deg, in Fern. So a chosen radio, a chosen picker row and the current stage
 * in StageNav are all the same object. No new glyph, no new colour, no new
 * token.
 *
 * Deliberately NOT a circle. Capsules in this brand are reserved for status
 * markers, and a round radio would be the only round thing on the site.
 *
 * The input is `peer sr-only` but still focusable, and the drawn row picks up
 * the focus ring through peer-focus-visible. That is Checkbox's pattern and the
 * reason is recorded there: hiding the input with opacity:0 also hides the
 * focus ring, which leaves a keyboard user unable to see where they are.
 *
 * Naming comes from the enclosing Field through context. Pass `group` to Field
 * or aria-labelledby points at an id that does not exist and the group has no
 * accessible name at all.
 */

export type RadioOption = string | { value: string; label: string };

type RadioGroupProps = {
  options: readonly RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Native grouping name. Defaults to the Field id, which is already unique. */
  name?: string;
  /** Two columns from sm up. Short labels only, four words at most. */
  columns?: 1 | 2;
  disabled?: boolean;
  inverse?: boolean;
  invalid?: boolean;
  required?: boolean;
  className?: string;
};

export function RadioGroup({
  options,
  value,
  defaultValue,
  onChange,
  name,
  columns = 1,
  disabled = false,
  inverse,
  invalid,
  required,
  className,
}: RadioGroupProps) {
  const field = useField();
  const generated = useId();
  const groupId = field.id ?? generated;
  const isInvalid = invalid ?? field.invalid ?? false;
  const isInverse = inverse ?? field.inverse ?? false;
  const isRequired = required ?? field.required ?? false;

  return (
    <div
      id={groupId}
      role="radiogroup"
      aria-labelledby={field.labelId}
      aria-describedby={field.describedBy}
      aria-required={isRequired || undefined}
      aria-invalid={isInvalid || undefined}
      className={clsx("grid gap-2", columns === 2 && "sm:grid-cols-2", className)}
    >
      {options.map((option, index) => {
        const optionValue = typeof option === "string" ? option : option.value;
        const optionLabel = typeof option === "string" ? option : option.label;
        const inputId = `${groupId}-${index}`;

        return (
          <div key={optionValue} className={clsx(disabled && "opacity-50")}>
            <input
              id={inputId}
              type="radio"
              name={name ?? groupId}
              value={optionValue}
              checked={value === undefined ? undefined : value === optionValue}
              defaultChecked={value === undefined ? defaultValue === optionValue : undefined}
              disabled={disabled}
              required={isRequired}
              onChange={onChange}
              className="peer sr-only"
            />

            <label
              htmlFor={inputId}
              data-radio-row
              className={clsx(
                /* --tap-target, not the control's own height: a row is a thumb
                   target, and 48px is the figure the rest of the site holds. */
                "flex min-h-[var(--tap-target)] w-full items-center gap-3",
                disabled ? "cursor-not-allowed" : "cursor-pointer",
                "rounded-card border border-solid border-l-2 border-l-transparent",
                "px-[var(--control-padding-x)] py-[var(--control-padding-y)]",
                "font-sans text-body-md leading-[var(--control-leading)]",
                "transition-[background-color,border-color] duration-[var(--duration-fast)] ease-brand",
                isInverse
                  ? "border-oat-16 bg-transparent text-body-inverse"
                  : "border-ink-16 bg-white text-body",
                isInvalid && "border-2 border-kowhai",
                /* Oat rather than Oat-sunk: the picker's chosen row is Oat on
                   white, and inside a sunk Card (EligibilityQuestion) a sunk
                   fill would be the same colour as the card behind it. */
                "peer-checked:border-l-fern peer-checked:bg-oat",
                "peer-checked:[&_[data-tick]]:opacity-100",
                "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-fern",
              )}
            >
              <span className="flex-1">{optionLabel}</span>
              <span
                data-tick
                aria-hidden="true"
                className="h-[var(--checkbox-tick-h)] w-[var(--checkbox-tick-w)] shrink-0 rotate-[-45deg] border-b-2 border-l-2 border-solid border-fern opacity-0 transition-opacity duration-[var(--duration-fast)] ease-brand"
              />
            </label>
          </div>
        );
      })}
    </div>
  );
}
