/* Every organisation that applied, as supplied on 23 September.
 *
 * ALL SIXTEEN ARE HERE, including the three that were chosen. They carry
 * `chosen: true` and are filtered out by the decline script rather than being
 * absent, so that its guard can assert they are not in its segment. A roster with
 * them already removed cannot prove anything about them.
 *
 * `firstName` is what Resend substitutes into the greeting. It is the contact's
 * first name as given, except where noted.
 *
 * NAMES ARE AS THE ORGANISATION WROTE THEM, with two corrections that are
 * typography rather than fact: "Whakatipu Reforestation TRust" and the double
 * space in the Dark Sky row. Both are chosen rows and neither is mailed, so the
 * corrections only affect what gets printed to the console.
 *
 * Shared with the Showcase Hui invite, which goes to all sixteen.
 */
import { readPrivate } from "./private";

export type Applicant = {
  org: string;
  firstName: string;
  email: string;
  chosen?: true;
  note?: string;
};

// Addresses live in scripts/private, which git ignores: this repo is public.
export const APPLICANTS: Applicant[] = readPrivate("applicants.json");
