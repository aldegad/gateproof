#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const requiredFiles = [
  ".claude-plugin/marketplace.json",
  "STATUS.md",
  "RESEARCH.md",
  "DEVELOPMENT.md",
  "skills/kisa-check/SKILL.md",
  "skills/full-security-check/SKILL.md",
  "skills/kisa-check/references/control-model.md",
  "skills/kisa-check/references/core-controls.md",
  "skills/kisa-check/references/kisa-baseline.md",
  "skills/full-security-check/references/control-model.md",
  "skills/full-security-check/references/core-controls.md",
  "skills/full-security-check/references/modern-baseline.md",
  ".claude/skills/gateproof-kisa-check/SKILL.md",
  ".claude/skills/gateproof-full-security-check/SKILL.md",
  "fixtures/README.md",
  "fixtures/kisa-ready-app/target.json",
  "fixtures/high-risk-api/target.json",
  "evals/README.md",
  "evals/kisa-baseline.json",
  "evals/full-security-baseline.json",
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

for (const directoryName of ["fixtures", "evals"]) {
  const directoryPath = resolve(ROOT, directoryName);
  const jsonFiles = readdirSync(directoryPath, { recursive: true })
    .filter((entry) => typeof entry === "string" && entry.endsWith(".json"))
    .map((entry) => resolve(directoryPath, entry));

  for (const jsonFile of jsonFiles) {
    try {
      JSON.parse(readFileSync(jsonFile, "utf8"));
    } catch (error) {
      errors.push(`Invalid JSON in ${jsonFile.replace(`${ROOT}/`, "")}: ${error.message}`);
    }
  }
}

if (errors.length > 0) {
  process.stderr.write(`Validation failed with ${errors.length} issue(s):\n`);
  for (const error of errors) {
    process.stderr.write(`- ${error}\n`);
  }
  process.exit(1);
}

process.stdout.write("Gateproof skill validation passed.\n");
