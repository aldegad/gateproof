#!/usr/bin/env node

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const REPORT_MANIFEST = resolve(ROOT, "artifacts", "report-manifest.json");
const CAPTURE_INDEX = resolve(ROOT, "artifacts", "capture-index.json");

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

function buildConfig(args) {
  const manifestEntry = args["from-manifest"] ? readManifestEntry(args["from-manifest"]) : null;

  const config = {
    artifactId: args["artifact-id"] ?? manifestEntry?.artifactId,
    skill: args.skill ?? manifestEntry?.skill,
    eval: args.eval ?? manifestEntry?.eval,
    case: args.case ?? manifestEntry?.case,
    source: args.source ?? manifestEntry?.report,
    target: args.target ?? manifestEntry?.target,
    prompt: args.prompt ?? manifestEntry?.prompt,
    engine: args.engine ?? "manual",
    model: args.model ?? "unspecified",
    captureId: args["capture-id"] ?? slugify(`${args["from-manifest"] ?? args["artifact-id"] ?? "capture"}-${args.engine ?? "manual"}`),
  };

  for (const key of ["artifactId", "skill", "eval", "case", "source"]) {
    if (!config[key]) {
      throw new Error(`Missing required option: ${key}`);
    }
  }

  return config;
}

function scoreCapturedReport({ evalPath, caseId, reportPath }) {
  const runnerPath = resolve(ROOT, "scripts", "run-evals.mjs");

  try {
    const stdout = execFileSync(
      process.execPath,
      [runnerPath, "--score-report", "--eval", evalPath, "--case", caseId, "--report", reportPath],
      {
        cwd: ROOT,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    );

    return {
      passed: true,
      output: stdout,
    };
  } catch (error) {
    return {
      passed: false,
      output: `${error.stdout ?? ""}${error.stderr ?? ""}`.trim(),
    };
  }
}

function updateCaptureIndex(captureRecord) {
  const index = existsSync(CAPTURE_INDEX)
    ? loadJson(CAPTURE_INDEX)
    : { indexVersion: 1, captures: [] };

  const captures = index.captures ?? [];
  const nextCaptures = captures.filter((entry) => entry.captureId !== captureRecord.captureId);
  nextCaptures.push(captureRecord);
  nextCaptures.sort((left, right) => left.captureId.localeCompare(right.captureId));

  writeFileSync(
    CAPTURE_INDEX,
    `${JSON.stringify({ indexVersion: 1, captures: nextCaptures }, null, 2)}\n`,
    "utf8",
  );
}

const args = parseArgs(process.argv.slice(2));
const config = buildConfig(args);

const sourcePath = resolve(ROOT, config.source);
if (!existsSync(sourcePath)) {
  throw new Error(`Source report not found: ${config.source}`);
}

const captureDir = resolve(ROOT, "artifacts", "captures", config.captureId);
mkdirSync(captureDir, { recursive: true });

const capturedReportPath = resolve(captureDir, "report.md");
copyFileSync(sourcePath, capturedReportPath);

const capturedReportRelative = toRepoRelative(capturedReportPath);
const scoreResult = scoreCapturedReport({
  evalPath: config.eval,
  caseId: config.case,
  reportPath: capturedReportRelative,
});

const scorePath = resolve(captureDir, "score.txt");
writeFileSync(scorePath, `${scoreResult.output.trim()}\n`, "utf8");

const metadata = {
  captureId: config.captureId,
  artifactId: config.artifactId,
  skill: config.skill,
  eval: config.eval,
  case: config.case,
  source: config.source,
  report: capturedReportRelative,
  target: config.target ?? null,
  prompt: config.prompt ?? null,
  engine: config.engine,
  model: config.model,
  capturedAt: new Date().toISOString(),
  passed: scoreResult.passed,
  scoreOutput: toRepoRelative(scorePath),
};

const metadataPath = resolve(captureDir, "metadata.json");
writeFileSync(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`, "utf8");

updateCaptureIndex(metadata);

process.stdout.write(`# Gateproof capture\n`);
process.stdout.write(`- capture: ${config.captureId}\n`);
process.stdout.write(`- artifact: ${config.artifactId}\n`);
process.stdout.write(`- report: ${capturedReportRelative}\n`);
process.stdout.write(`- metadata: ${toRepoRelative(metadataPath)}\n`);
process.stdout.write(`- score: ${toRepoRelative(scorePath)}\n`);
process.stdout.write(`- status: ${scoreResult.passed ? "PASS" : "FAIL"}\n`);

if (!scoreResult.passed) {
  process.exit(1);
}
