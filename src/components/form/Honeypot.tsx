"use client";

/* The honeypot field both application forms carry: hidden from people,
 * tempting to bots. The route accepts any value and silently discards filled
 * submissions — see the antiSpam notes in schemas.ts for why rejecting at
 * validation would teach a bot which field to leave alone. */

export function Honeypot({
  id,
  value,
  onChange,
}: {
  /** Stable and unique per form — the label needs a real htmlFor. */
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div aria-hidden="true" className="absolute h-px w-px overflow-hidden opacity-0">
      <label htmlFor={id}>Website</label>
      <input
        id={id}
        name="website"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
