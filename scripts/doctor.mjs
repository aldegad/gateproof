#!/usr/bin/env node

import { existsSync } from "node:fs";
import os from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SKILLS = [
  { skillName: "gateproof:kisa-check", installName: "gateproof-kisa-check" },
  { skillName: "gateproof:full-security-check", installName: "gateproof-full-security-check" }
];
const checks = [];

function resolveCodexHome() {
  return process.env.CODEX_HOME ? resolve(process.env.CODEX_HOME) : resolve(os.homedir(), ".codex");
}

function detectPrimaryAgent() {
  if (
    process.env.CODEX_HOME ||
    process.env.CODEX_SHELL ||
    process.env.CODEX_CI ||
    process.env.CODEX_THREAD_ID ||
    process.env.CODEX
  ) {
    return "codex";
  }

  return "claude";
}

function resolveSkillPath(agent, installName) {
  if (agent === "codex") {
    return resolve(resolveCodexHome(), "skills", installName, "SKILL.md");
  }

  return resolve(os.homedir(), ".claude", "skills", installName, "SKILL.md");
}

function check(name, ok, detail) {
  checks.push({ name, ok, detail });
}

check("repo", existsSync(ROOT), ROOT);
check("marketplace", existsSync(resolve(ROOT, ".claude-plugin", "marketplace.json")), ".claude-plugin/marketplace.json");
check(
  "project_local_kisa",
  existsSync(resolve(ROOT, ".claude", "skills", "gateproof-kisa-check", "SKILL.md")),
  ".claude/skills/gateproof-kisa-check/SKILL.md",
);
check(
  "project_local_full",
  existsSync(resolve(ROOT, ".claude", "skills", "gateproof-full-security-check", "SKILL.md")),
  ".claude/skills/gateproof-full-security-check/SKILL.md",
);

const activeAgent = detectPrimaryAgent();
for (const skill of SKILLS) {
  const installedPath = resolveSkillPath(activeAgent, skill.installName);
  check(`${activeAgent}_${skill.installName}`, existsSync(installedPath), `${skill.skillName} -> ${installedPath}`);
}

let failures = 0;
process.stdout.write("\n-- Gateproof Doctor --\n\n");
for (const item of checks) {
  const icon = item.ok ? "OK" : "MISSING";
  process.stdout.write(`${icon.padEnd(8)} ${item.name}  ${item.detail}\n`);
  if (!item.ok) {
    failures += 1;
  }
}

if (failures > 0) {
  process.stdout.write("\nRun `npm run skill:install -- --all` to install both skills for Codex and Claude.\n");
  process.exitCode = 1;
} else {
  process.stdout.write("\nAll checks passed.\n");
}
