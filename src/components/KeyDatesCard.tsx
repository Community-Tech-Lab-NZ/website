import { Card } from "./Card";
import { Timeline } from "./Timeline";
import { Eyebrow } from "./Typography";
import { TIMELINE } from "@/lib/navigation";

/* The "Key dates" card that rides beside the main column on four pages
 * (home, /developers, /organisations, /apply). One source for the
 * eyebrow-plus-timeline arrangement; anything extra a page hangs below the
 * dates — the who-can-apply note on /organisations — comes in as children. */

export function KeyDatesCard({ children }: { children?: React.ReactNode }) {
  return (
    <Card tone="light" accentRule>
      <Eyebrow className="mb-5">Key dates</Eyebrow>
      <Timeline steps={TIMELINE} />
      {children}
    </Card>
  );
}
