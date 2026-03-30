#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const requiredFiles = [
  ".claude-plugin/marketplace.json",
  "skills/kisa-check/SKILL.md",
  "skills/full-security-check/SKILL.md",
  "skills/kisa-check/references/control-model.md",
  "skills/kisa-check/references/core-controls.md",
  "skills/kisa-check/references/kisa-baseline.md",
  "skills/full-security-check/references/modern-baseline.md",
  ".claude/skills/gateproof-kisa-check/SKILL.md",
  ".claude/skills/gateproof-full-security-check/SKILL.md",
];

const errors = [];

for (const relativePath of requiredFiles) {
  const absolutePath = resolve(ROOT, relativePath);
  if (!existsSync(absolutePath)) {
    errors.push(`Missing required file: ${relativePath}`);
  }
}

for (const skillName of ["kisa-check", "full-security-check"]) {
  const content = readFileSync(resolve(ROOT, "skills", skillName, "SKILL.md"), "utf8");
  if (!content.includes("__GATEPROOF_REPO__")) {
    errors.push(`skills/${skillName}/SKILL.md must include __GATEPROOF_REPO__ placeholder`);
  }
}

const marketplace = readFileSync(resolve(ROOT, ".claude-plugin", "marketplace.json"), "utf8");
if (!marketplace.includes("./skills/kisa-check") || !marketplace.includes("./skills/full-security-check")) {
  errors.push("marketplace.json must expose both skills");
}

if (errors.length > 0) {
  process.stderr.write(`Validation failed with ${errors.length} issue(s):\n`);
  for (const error of errors) {
    process.stderr.write(`- ${error}\n`);
  }
  process.exit(1);
}

process.stdout.write("Gateproof skill validation passed.\n");
