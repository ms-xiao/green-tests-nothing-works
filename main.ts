// green-tests-nothing-works — "Green Tests, Nothing Works: The Excuse Contest".
//
// The entry is a single-line excuse (1–139 characters) an AI agent gives
// for a test suite that is all green while the product does nothing.
// This program copies the finished line to the output directory, so both
// graded runs write identical bytes. Node 22, standard library only,
// no network.
//
// Run locally:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const ENTRY_NAME = "entry.txt";
const MAX_EXCUSE_CHARS = 139;
const target = join(outDir, ENTRY_NAME);

// Read as bytes so the copy below is byte-exact.
const source = readFileSync(join(here, ENTRY_NAME));
if (source.length === 0) throw new Error("entry.txt is empty");

const text = source.toString("utf8");
// The gate requires UTF-8 text: reject bytes that do not survive a
// decode/encode round trip instead of silently mangling them.
if (!Buffer.from(text, "utf8").equals(source)) {
  throw new Error("entry.txt is not valid UTF-8");
}
const charCount = validateEntry(text);

// Entry gates, kept in one place so the graded runs and the local
// checks agree on exactly what a valid entry looks like. Returns the
// entry's character count so the run can report it.
function validateEntry(candidate) {
  const charCount = [...candidate].length;
  if (charCount < 1 || charCount > MAX_EXCUSE_CHARS) {
    throw new Error(
      `excuse is ${charCount} characters, expected 1–${MAX_EXCUSE_CHARS}`,
    );
  }
  if (candidate.trim().length === 0) {
    throw new Error("excuse must not be only white space");
  }
  if (candidate.includes("\n") || candidate.includes("\r")) {
    throw new Error("excuse must be a single line with no breaks");
  }
  return charCount;
}

mkdirSync(outDir, { recursive: true });
writeFileSync(target, source);
verifyCopy(source, target);
process.stderr.write(
  `excuse OK: ${charCount} characters, ${source.length} bytes\n`,
);
process.stdout.write(text);

// Confirm the copy landed intact: same byte length, then same bytes.
function verifyCopy(expected, copiedPath) {
  const copied = readFileSync(copiedPath);
  if (copied.length !== expected.length) {
    throw new Error(
      `entry.txt copy is ${copied.length} bytes, expected ${expected.length}`,
    );
  }
  if (!copied.equals(expected)) {
    throw new Error("entry.txt copy mismatch");
  }
}
