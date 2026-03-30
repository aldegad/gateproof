#!/usr/bin/env node

import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SKILLS = [
  { sourceName: "kisa-check", installName: "gateproof-kisa-check" },
  { sourceName: "full-security-check", installName: "gateproof-full-security-check" }
];

function log(message) {
  process.stdout.write(`[gateproof:install] ${message}\n`);
}

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

function resolveSkillBase(agent) {
  if (agent === "codex") {
    return resolve(resolveCodexHome(), "skills");
  }

  return resolve(os.homedir(), ".claude", "skills");
}

function parseArgs(argv) {
  const result = {
    installAllAgents: false,
    alsoCodex: false,
    alsoClaude: false,
  };

  for (const arg of argv) {
    if (arg === "--all" || arg === "--all-agents") {
      result.installAllAgents = true;
    } else if (arg === "--also-codex") {
      result.alsoCodex = true;
    } else if (arg === "--also-claude") {
      result.alsoClaude = true;
    }
  }

  return result;
}

function resolveTargets(flags) {
  const targets = new Set([detectPrimaryAgent()]);

  if (flags.installAllAgents) {
    targets.add("codex");
    targets.add("claude");
  }
  if (flags.alsoCodex) {
    targets.add("codex");
  }
  if (flags.alsoClaude) {
    targets.add("claude");
  }

  return [...targets];
}

function stampSkillMarkdown(filePath) {
  if (!existsSync(filePath)) {
    return;
  }

  const content = readFileSync(filePath, "utf8");
  writeFileSync(filePath, content.replaceAll("__GATEPROOF_REPO__", ROOT));
}

function installSkill(agent, skill) {
  const source = resolve(ROOT, "skills", skill.sourceName);
  const destination = resolve(resolveSkillBase(agent), skill.installName);
  mkdirSync(resolveSkillBase(agent), { recursive: true });
  cpSync(source, destination, { recursive: true });
  stampSkillMarkdown(resolve(destination, "SKILL.md"));
  log(`Installed ${skill.installName} from ${skill.sourceName} to ${destination} (${agent})`);
}

const flags = parseArgs(process.argv.slice(2));
const targets = resolveTargets(flags);

for (const agent of targets) {
  for (const skill of SKILLS) {
    installSkill(agent, skill);
  }
}

log(`Done. Installed skills: ${SKILLS.map((skill) => skill.installName).join(", ")}`);
