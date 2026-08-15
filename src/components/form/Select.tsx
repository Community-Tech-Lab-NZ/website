"use client";

import { useEffect, useRef } from "react";
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
 *
 * The `appearance` of the control is NOT set here, unlike every other control
 * style. It lives in utilities.css beside the picker-panel rules, because on a
 * pointer device the two are one decision — see "Select picker" there — and
 * because a Tailwind `appearance-none` in the utilities layer would beat the
 * base-select opt-in the panel styling depends on.
 */

export type SelectOption = string | { value: string; label: string };

type SelectProps = Omit<React.ComponentPropsWithoutRef<"select">, "className" | "children"> & {
  options: readonly SelectOption[];
  /** Shown first and non-selectable, so the field does not silently default. */
  placeholder?: string;
  /* Titles the touch sheet, so it says which question it is answering.
     Defaults to the enclosing Field's label, which is what you want in every
     case here; pass it only to override. See "The sheet's title" in
     utilities.css for why this is an attribute rather than an element. */
  sheetTitle?: string;
  inverse?: boolean;
  invalid?: boolean;
  className?: string;
};

export function Select({
  options,
  placeholder,
  sheetTitle,
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

  const title = sheetTitle ?? field.labelText;

  /* The sheet's title is the optgroup's <legend>, and it is created here rather
     than in the JSX below. Two separate reasons, both real:

     React refuses to render it. <legend> inside <optgroup> is what the
     customizable-select spec added precisely so a group can have a styleable
     label, but React's DOM nesting validator predates that and logs "In HTML,
     <legend> cannot be a child of <optgroup>. This will cause a hydration
     error" on every render. Verified in Chrome, not assumed.

     And the HTML parser would be the next problem anyway: the "in select"
     insertion mode drops start tags it does not expect, engines are at
     different stages of the relaxation that changes it, and under SSR an
     element one engine drops and another keeps is a hydration mismatch rather
     than a cosmetic difference. Building it with DOM APIs sidesteps both — no
     parser, no validator, no server render.

     Why a <legend> and not the optgroup's own `label` attribute, which Chrome
     does render and does let you style: the optgroup box wraps the entire list,
     so position:sticky on it holds nothing in place and a border-block-end
     lands under the last option rather than under the title. The legend is a
     child box, so it can do both. The `label` attribute stays on the optgroup
     regardless — it is what the iOS wheel picker and Firefox read.

     Gated on base-select because a browser that cannot style the picker would
     render this as an unstyled stray line. */
  const selectRef = useRef<HTMLSelectElement>(null);
  useEffect(() => {
    const group = selectRef.current?.querySelector("optgroup");
    if (!group || !CSS.supports("appearance", "base-select")) return;

    const legend = document.createElement("legend");
    legend.textContent = group.label;
    group.prepend(legend);
    return () => legend.remove();
  }, [title]);

  const rows = options.map((o) => {
    const value = typeof o === "string" ? o : o.value;
    const label = typeof o === "string" ? o : o.label;
    return (
      <option key={value} value={value}>
        {label}
      </option>
    );
  });

  return (
    <div className={clsx("relative", className)}>
      <select
        ref={selectRef}
        id={props.id ?? field.id}
        aria-describedby={props["aria-describedby"] ?? field.describedBy}
        aria-invalid={isInvalid || undefined}
        required={props.required ?? field.required}
        defaultValue={defaultValue}
        className={controlClasses({
          inverse: isInverse,
          invalid: isInvalid,
          className: "cursor-pointer pr-[var(--select-padding-right)]",
        })}
        {...props}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {title ? <optgroup label={title}>{rows}</optgroup> : rows}
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
