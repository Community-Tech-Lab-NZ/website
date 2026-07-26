#!/usr/bin/env node
/**
 * Brand drift check.
 *
 * The @theme block in globals.css clears Tailwind's default namespaces, so
 * off-brand NAMED utilities (bg-blue-500, rounded-lg, shadow-lg) genuinely do
 * not compile. Arbitrary values are the remaining escape hatch: `p-[13px]` and
 * `bg-[#ff0000]` bypass the theme entirely and will render.
 *
 * This flags arbitrary values that carry a literal colour or length, which is
 * how the brand actually drifts. Token references like
 * `duration-[var(--duration-fast)]` are fine and expected, as are property-name
 * lists like `transition-[background-color,color]`.
 *
 * Run: pnpm check:brand
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const SRC = join(ROOT, "src");

// Arbitrary-value utilities: something-[...]
const ARBITRARY = /(?:^|[\s"'`])([a-z][a-z0-9]*(?:-[a-z0-9]+)*)-\[([^\]]+)\]/g;

// What counts as drift inside the brackets.
const LITERAL_COLOUR = /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(/i;
const LITERAL_LENGTH = /(?<![\w-])\d*\.?\d+(px|rem|em|vh|vw|ch|%)\b/;

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(tsx?|jsx?|css)$/.test(entry)) out.push(full);
  }
  return out;
}

const findings = [];

for (const file of walk(SRC)) {
  const text = readFileSync(file, "utf8");
  const lines = text.split("\n");

  lines.forEach((line, i) => {
    for (const match of line.matchAll(ARBITRARY)) {
      const [, utility, value] = match;

      // Token references are the sanctioned way to reach a value.
      if (value.includes("var(--")) continue;

      const isColour = LITERAL_COLOUR.test(value);
      const isLength = LITERAL_LENGTH.test(value);
      if (!isColour && !isLength) continue;

      findings.push({
        file: relative(ROOT, file),
        line: i + 1,
        utility,
        value,
        kind: isColour ? "colour" : "length",
      });
    }
  });
}

if (findings.length === 0) {
  console.log("✓ No brand drift. Every value comes from the token layer.");
  process.exit(0);
}

console.error(
  `\n✗ ${findings.length} arbitrary value${findings.length === 1 ? "" : "s"} bypassing the token layer:\n`,
);

for (const f of findings) {
  console.error(`  ${f.file}:${f.line}`);
  console.error(`    ${f.utility}-[${f.value}]  (literal ${f.kind})`);
}

console.error(`
The brand system is locked: four colours, an 8px spacing base derived from the
logo cursor block, and a fixed type scale. See brand-guide.md.

Use a token instead:
  bg-[#F0A81E]   ->  bg-kowhai
  p-[13px]       ->  p-3  (12px) or p-4 (16px)
  text-[15px]    ->  text-body-md

If a value genuinely has no token, add one to src/styles/tokens/ first so it
stays documented, then reference it as utility-[var(--your-token)].
`);

process.exit(1);
