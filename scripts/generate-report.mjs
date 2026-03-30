#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const REPORT_MANIFEST = resolve(ROOT, "artifacts", "report-manifest.json");
const GENERATION_DIR = resolve(ROOT, "artifacts", "generated");
const CAPTURE_SCRIPT = resolve(ROOT, "scripts", "capture-report.mjs");

const skillPaths = {
  "gateproof:kisa-check": "skills/kisa-check/SKILL.md",
  "gateproof:full-security-check": "skills/full-security-check/SKILL.md",
};

function parseArgs(argv) {
  const args = { _: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (!value.startsWith("--")) {
      args._.push(value);
      continue;
    }

    const key = value.slice(2);
    const nextValue = argv[index + 1];
    if (!nextValue || nextValue.startsWith("--")) {
      args[key] = true;
      continue;
    }

    args[key] = nextValue;
    index += 1;
  }
  return args;
}

function loadJson(absolutePath) {
  return JSON.parse(readFileSync(absolutePath, "utf8"));
}

function toRepoRelative(absolutePath) {
  return relative(ROOT, absolutePath).split(sep).join("/");
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function readManifestEntry(artifactId) {
  const manifest = loadJson(REPORT_MANIFEST);
  const entry = (manifest.reports ?? []).find((candidate) => candidate.artifactId === artifactId);
  if (!entry) {
    throw new Error(`Artifact ${artifactId} was not found in artifacts/report-manifest.json.`);
  }
  return entry;
}

function defaultModelForEngine(engine) {
  if (engine === "codex") {
    return "gpt-5.4";
  }
  if (engine === "claude") {
    return "sonnet";
  }
  throw new Error(`Unsupported engine: ${engine}`);
}

function buildConfig(args) {
  if (!args.engine) {
    throw new Error("Missing required option: --engine codex|claude");
  }

  const manifestEntry = args["from-manifest"] ? readManifestEntry(args["from-manifest"]) : null;
  const artifactId = args["artifact-id"] ?? manifestEntry?.artifactId;
  const skill = args.skill ?? manifestEntry?.skill;
  const evalPath = args.eval ?? manifestEntry?.eval;
  const caseId = args.case ?? manifestEntry?.case;
  const target = args.target ?? manifestEntry?.target;
  const prompt = args.prompt ?? manifestEntry?.prompt;
  const captureId =
    args["capture-id"] ??
    slugify(`${args["from-manifest"] ?? args["artifact-id"] ?? "report"}-${args.engine}`);
  const output = args.output ?? `artifacts/generated/${captureId}.md`;

  for (const [key, value] of Object.entries({ artifactId, skill, eval: evalPath, case: caseId, target, prompt })) {
    if (!value) {
      throw new Error(`Missing required option: ${key}`);
    }
  }

  const skillPath = skillPaths[skill];
  if (!skillPath) {
    throw new Error(`No canonical skill path configured for ${skill}.`);
  }

  return {
    engine: args.engine,
    model: args.model ?? defaultModelForEngine(args.engine),
    effort: args.effort ?? null,
    artifactId,
    skill,
    skillPath,
    eval: evalPath,
    case: caseId,
    target,
    prompt,
    captureId,
    output,
    dryRun: Boolean(args["dry-run"]),
    noCapture: Boolean(args["no-capture"]),
  };
}

function composePrompt(config) {
  const promptBody = readFileSync(resolve(ROOT, config.prompt), "utf8").trim();
  const canonicalSkillPath = config.skillPath;

  return [
    `Work inside the repository at ${ROOT}.`,
    `Target path: ${config.target}`,
    `Canonical Gateproof skill: ${canonicalSkillPath}`,
    `Required Gateproof skill name: ${config.skill}`,
    "Read the canonical skill file and follow its workflow and output structure.",
    "Inspect the target directly from the filesystem rather than guessing.",
    "Limit filesystem reads to the target path, the canonical skill file, related Gateproof references, and files directly cited as evidence.",
    "Do not inspect unrelated directories if they are not needed for the report.",
    "Produce only the final markdown report.",
    "Do not wrap the entire report in code fences.",
    "Do not add commentary before or after the report.",
    "",
    "Prompt pack instructions:",
    promptBody,
  ].join("\n");
}

function ensureParentDir(relativePath) {
  mkdirSync(dirname(resolve(ROOT, relativePath)), { recursive: true });
}

function runCodex(config, promptText) {
  ensureParentDir(config.output);

  execFileSync(
    "codex",
    [
      "exec",
      "-C",
      ROOT,
      "-s",
      "read-only",
      "-m",
      config.model,
      ...(config.effort ? ["-c", `model_reasoning_effort="${config.effort}"`] : []),
      "-o",
      resolve(ROOT, config.output),
      "-",
    ],
    {
      cwd: ROOT,
      input: promptText,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    },
  );
}

function runClaude(config, promptText) {
  ensureParentDir(config.output);

  const stdout = execFileSync(
    "claude",
    [
      "-p",
      "--permission-mode",
      "bypassPermissions",
      "--output-format",
      "text",
      "--model",
      config.model,
      "--add-dir",
      ROOT,
      ...(config.effort ? ["--effort", config.effort] : []),
      promptText,
    ],
    {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  writeFileSync(resolve(ROOT, config.output), stdout.trimEnd() + "\n", "utf8");
}

function runEngine(config, promptText) {
  if (config.engine === "codex") {
    runCodex(config, promptText);
    return;
  }

  if (config.engine === "claude") {
    runClaude(config, promptText);
    return;
  }

  throw new Error(`Unsupported engine: ${config.engine}`);
}

function runCapture(config) {
  execFileSync(
    process.execPath,
    [
      CAPTURE_SCRIPT,
      "--artifact-id",
      config.artifactId,
      "--skill",
      config.skill,
      "--eval",
      config.eval,
      "--case",
      config.case,
      "--source",
      config.output,
      "--target",
      config.target,
      "--prompt",
      config.prompt,
      "--engine",
      config.engine,
      "--model",
      config.model,
      "--capture-id",
      config.captureId,
    ],
    {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
}

const args = parseArgs(process.argv.slice(2));
const config = buildConfig(args);
const promptText = composePrompt(config);

if (config.dryRun) {
  process.stdout.write("# Gateproof report generation plan\n");
  process.stdout.write(`- engine: ${config.engine}\n`);
  process.stdout.write(`- model: ${config.model}\n`);
  if (config.effort) {
    process.stdout.write(`- effort: ${config.effort}\n`);
  }
  process.stdout.write(`- artifact: ${config.artifactId}\n`);
  process.stdout.write(`- skill: ${config.skill}\n`);
  process.stdout.write(`- target: ${config.target}\n`);
  process.stdout.write(`- prompt: ${config.prompt}\n`);
  process.stdout.write(`- output: ${config.output}\n`);
  process.stdout.write(`- capture: ${config.noCapture ? "disabled" : config.captureId}\n`);
  process.stdout.write(`- prompt_preview: ${promptText.slice(0, 600).trim()}...\n`);
  process.exit(0);
}

mkdirSync(GENERATION_DIR, { recursive: true });
runEngine(config, promptText);

if (!existsSync(resolve(ROOT, config.output))) {
  throw new Error(`Expected generated report was not written: ${config.output}`);
}

if (!config.noCapture) {
  runCapture(config);
}

process.stdout.write("# Gateproof report generation\n");
process.stdout.write(`- engine: ${config.engine}\n`);
process.stdout.write(`- model: ${config.model}\n`);
if (config.effort) {
  process.stdout.write(`- effort: ${config.effort}\n`);
}
process.stdout.write(`- artifact: ${config.artifactId}\n`);
process.stdout.write(`- output: ${config.output}\n`);
process.stdout.write(`- captured: ${config.noCapture ? "no" : config.captureId}\n`);
