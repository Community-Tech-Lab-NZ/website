import type { Resend } from "resend";

export type Member = { email: string; unsubscribed: boolean };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Every member of a segment, or every contact when segmentId is omitted. */
export async function listSegment(resend: Resend, segmentId?: string): Promise<Member[]> {
  const out: Member[] = [];
  let after: string | undefined;
  for (let page = 0; page < 100; page++) {
    const res = await resend.contacts.list({
      ...(segmentId ? { segmentId } : {}),
      limit: 100,
      ...(after ? { after } : {}),
    } as never);
    if (res.error) throw new Error(`Could not read contacts ${segmentId ?? ""}: ${res.error.message}`);
    const rows = res.data?.data ?? [];
    for (const c of rows) out.push({ email: c.email.toLowerCase(), unsubscribed: c.unsubscribed });
    if (!res.data?.has_more || !rows.length) break;
    after = rows[rows.length - 1].id;
  }
  return out;
}

/** Creates the segment if needed, adds and removes members until it holds
 *  exactly `intended`, then reads it back and throws if it does not. */
export async function syncSegment(
  resend: Resend,
  name: string,
  intended: Set<string>,
  firstNames: Map<string, string> = new Map(),
): Promise<void> {
  const segments = (await resend.segments.list()).data?.data ?? [];
  let segmentId = segments.find((s) => s.name === name)?.id;
  if (!segmentId) {
    const created = await resend.segments.create({ name });
    if (created.error || !created.data) throw new Error(`Could not create the segment: ${created.error?.message}`);
    segmentId = created.data.id;
    console.log(`\nSegment "${name}" created`);
  }

  const present = new Set((await listSegment(resend, segmentId)).map((m) => m.email));
  const toRemove = [...present].filter((e) => !intended.has(e));
  console.log(`\nRemoving ${toRemove.length} from "${name}"`);
  for (const email of toRemove) {
    await sleep(600);
    const removed = await resend.contacts.segments.remove({ email, segmentId });
    if (removed.error) throw new Error(`Could not remove ${email}: ${removed.error.message}`);
  }

  const toAdd = [...intended].filter((e) => !present.has(e));
  console.log(`Adding ${toAdd.length} to "${name}"`);
  for (const email of toAdd) {
    // Paced under Resend's request rate limit.
    await sleep(600);
    const added = await resend.contacts.segments.add({ email, segmentId });
    if (!added.error) continue;
    await sleep(600);
    const created = await resend.contacts.create({ email, firstName: firstNames.get(email), segments: [{ id: segmentId }] });
    if (created.error) throw new Error(`Could not add ${email}: ${added.error.message}; ${created.error.message}`);
  }

  // Intent above, reality here: the segment must hold exactly the intended set.
  const members = new Set((await listSegment(resend, segmentId)).map((m) => m.email));
  const missing = [...intended].filter((e) => !members.has(e));
  const unexpected = [...members].filter((e) => !intended.has(e));
  if (missing.length || unexpected.length) {
    throw new Error(
      `"${name}" does not match the intended audience. Nothing has been drafted.\n` +
        (missing.length ? `  Missing: ${missing.join(", ")}\n` : "") +
        (unexpected.length ? `  Unexpected: ${unexpected.join(", ")}\n` : ""),
    );
  }
  console.log(`Segment holds exactly the ${members.size} intended addresses\n`);
}
