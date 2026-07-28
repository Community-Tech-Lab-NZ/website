import { clsx } from "clsx";
import { Button } from "./Button";
import { Eyebrow, KnockText, WordKnockText } from "./Typography";

/* Closing call-to-action band.
 *
 * Used at the foot of every page. On the home page the padding and background
 * are stripped so it sits directly in the Ink section rather than reading as a
 * card inside one — pass `bare` for that.
 */

type CalloutBannerProps = {
  eyebrow?: string;
  title: string;
  note?: string;
  actionLabel?: string;
  actionHref?: string;
  tone?: "ink" | "oat";
  bare?: boolean;
  className?: string;
};

export function CalloutBanner({
  eyebrow,
  title,
  note,
  actionLabel,
  actionHref,
  tone = "ink",
  bare = false,
  className,
}: CalloutBannerProps) {
  const dark = tone === "ink";

  return (
    <div
      className={clsx(
        "flex flex-wrap items-center justify-between gap-6",
        !bare && [
          "rounded-card px-7 py-6",
          dark ? "bg-ink text-body-inverse" : "bg-oat text-body",
        ],
        className,
      )}
    >
      <div className="max-w-[var(--callout-measure)]">
        {eyebrow ? (
          <Eyebrow inverse={dark} className="mb-2">
            {eyebrow}
          </Eyebrow>
        ) : null}

        <KnockText
          className={clsx(
            "font-heading text-subhead font-bold",
            dark ? "text-heading-inverse" : "text-heading",
          )}
        >
          {title}
        </KnockText>

        {note ? (
          <WordKnockText
            as="div"
            className={clsx(
              "mt-2 font-sans text-body-sm",
              dark ? "text-muted-inverse" : "text-muted",
            )}
          >
            {note}
          </WordKnockText>
        ) : null}
      </div>

      {actionLabel ? (
        <Button variant={dark ? "primary" : "secondary"} size="md" href={actionHref}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
