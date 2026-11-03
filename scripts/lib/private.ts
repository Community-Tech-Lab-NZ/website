import { readFileSync } from "node:fs";
import { join } from "node:path";

// People's addresses stay out of git, because this repo is public.
const DIR = join(process.cwd(), "scripts", "private");

export function readPrivate<T>(file: string): T {
  try {
    return JSON.parse(readFileSync(join(DIR, file), "utf8")) as T;
  } catch (err) {
    throw new Error(`Could not read scripts/private/${file}. It is not in git; ask for a copy. ${(err as Error).message}`);
  }
}
