"use client";

import { useId, useRef, useState } from "react";
import { clsx } from "clsx";
import { useField } from "./Field";

/* File attachment control. Outline trigger plus the chosen file name.
 *
 * Used once, for the optional CV on the developer form. The backend caps
 * uploads at 4MB to stay under the serverless body limit, so that is enforced
 * here too — telling someone their file is too large before they submit is far
 * better than failing after.
 *
 * The native input is visually hidden but focusable, and the trigger is a real
 * button, so keyboard and screen reader users get the same affordance.
 */

const MAX_BYTES = 4 * 1024 * 1024;

type FileUploadProps = {
  id?: string;
  name?: string;
  accept?: string;
  buttonLabel?: string;
  emptyLabel?: string;
  disabled?: boolean;
  inverse?: boolean;
  onChange?: (file: File | null) => void;
  className?: string;
};

export function FileUpload({
  id,
  name,
  accept = ".pdf,.doc,.docx",
  buttonLabel = "Choose a file",
  emptyLabel = "No file chosen",
  disabled = false,
  inverse = false,
  onChange,
  className,
}: FileUploadProps) {
  const field = useField();
  const generated = useId();
  const inputId = id ?? field.id ?? generated;
  const ref = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const isInverse = inverse || (field.inverse ?? false);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (file && file.size > MAX_BYTES) {
      setError("That file is over 4MB. Please attach a smaller one.");
      setFileName("");
      event.target.value = "";
      onChange?.(null);
      return;
    }

    setError("");
    setFileName(file?.name ?? "");
    onChange?.(file);
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-4">
        <input
          ref={ref}
          id={inputId}
          name={name}
          type="file"
          accept={accept}
          disabled={disabled}
          onChange={handleChange}
          aria-describedby={field.describedBy}
          className="sr-only"
        />

        <button
          type="button"
          disabled={disabled}
          onClick={() => ref.current?.click()}
          className={clsx(
            "rounded-card border-2 border-solid bg-transparent p-[var(--upload-padding)]",
            "font-heading text-body-sm font-bold",
            "transition-[background-color,color] duration-[var(--duration-fast)] ease-brand",
            "disabled:cursor-not-allowed disabled:opacity-40",
            isInverse
              ? "border-oat-16 text-oat hover:bg-oat hover:text-ink"
              : "border-ink text-ink hover:bg-ink hover:text-oat",
          )}
        >
          {buttonLabel}
        </button>

        <span
          className={clsx(
            "font-sans text-body-sm",
            fileName
              ? isInverse
                ? "text-body-inverse"
                : "text-body"
              : isInverse
                ? "text-muted-inverse"
                : "text-muted",
          )}
        >
          {fileName || emptyLabel}
        </span>
      </div>

      {error ? (
        <p
          role="alert"
          className={clsx(
            "mt-2 font-sans text-body-sm font-semibold",
            isInverse ? "text-kowhai" : "text-ink",
          )}
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
