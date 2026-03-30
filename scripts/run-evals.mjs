#!/usr/bin/env node

import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const skillEngines = {
  "gateproof:kisa-check": evaluateKisaFixture,
  "gateproof:full-security-check": evaluateFullSecurityFixture,
};

function loadJson(relativePath) {
  return JSON.parse(readFileSync(resolve(ROOT, relativePath), "utf8"));
}

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

function normalizeText(value) {
  return value
    .toLowerCase()
    .replace(/[`*_#>[\\\]()]/g, " ")
    .replace(/[^a-z0-9:/?+.-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function includesText(haystack, needle) {
  return haystack.some((entry) => entry.includes(needle));
}

function includesPattern(haystack, patternSet) {
  return patternSet.anyOf.some((pattern) => haystack.includes(normalizeText(pattern)));
}

function evaluateKisaFixture(fixture) {
  const findings = [];
  const notes = [];
  const signals = fixture.signals ?? {};

  if (signals.adminRootLoginDisabled) {
    findings.push("Admin remote access is constrained.");
  } else {
    findings.push("Remote administrator access is insufficiently constrained.");
  }

  if (signals.secretsInSource === false) {
    findings.push("Secrets are not embedded in source control.");
  } else if (signals.hardcodedJwtFallback) {
    findings.push("Secrets handling does not meet baseline expectations.");
  }

  if (signals.auditLogForAdminActions) {
    findings.push("Admin activity is auditable.");
  }

  if (signals.publicAdminSurface === false) {
    notes.push("Administrative interfaces are not obviously exposed to the public internet.");
  } else if (signals.adminRoutePublic) {
    findings.push("Public admin surface increases audit risk.");
  }

  if (signals.loginBodyLogged) {
    findings.push("Sensitive logging behavior needs remediation.");
  }

  if (signals.passwordPolicyDocumented) {
    notes.push("Password policy evidence exists but still depends on implementation proof.");
  }

  if (signals.patchCadenceDefined) {
    notes.push("Patch cadence appears defined, though supporting evidence still matters.");
  }

  if (fixture.fixtureId === "kisa-ready-app") {
    notes.push("Residual risk depends on deployment details and evidence depth.");
  }

  return { findings, notes };
}

function evaluateFullSecurityFixture(fixture) {
  const findings = [];
  const notes = [];
  const signals = fixture.signals ?? {};

  if (signals.objectLevelAuthorizationMissing) {
    findings.push("Object-level authorization risk or missing authorization checks.");
  }

  if (signals.outboundUrlFetchUserControlled) {
    findings.push("User-controlled outbound fetch creates SSRF or trust-boundary risk.");
  }

  if (signals.ciPullRequestTargetWithSecrets) {
    findings.push("CI or delivery pipeline trust boundaries are weak.");
  }

  if (signals.hardcodedJwtFallback) {
    findings.push("Secret management is weak and can collapse trust boundaries across environments.");
  }

  if (signals.adminRoutePublic) {
    findings.push("Public administrative exposure increases exploitability and attacker reach.");
  }

  if (signals.loginBodyLogged) {
    findings.push("Sensitive request data may leak through logs or downstream observability tooling.");
  }

  if (fixture.fixtureId === "kisa-ready-app") {
    findings.push("The baseline looks healthier than the high-risk fixture.");
    findings.push("Residual risk depends on deployment details not present in the fixture.");
  }

  if (signals.mfaForAdmins) {
    notes.push("Administrative authentication posture appears stronger than the risky fixture baseline.");
  }

  return { findings, notes };
}

function collectEvalFiles() {
  return readdirSync(resolve(ROOT, "evals"))
    .filter((entry) => entry.endsWith(".json"))
    .sort();
}

function runCase(skill, testCase) {
  const fixture = loadJson(testCase.target);
  const evaluator = skillEngines[skill];

  if (!evaluator) {
    throw new Error(`No evaluator for skill ${skill}`);
  }

  const output = evaluator(fixture);
  const allText = [...output.findings, ...output.notes];

  const missing = testCase.mustFind.filter((expected) => !includesText(allText, expected));
  const avoided = testCase.shouldAvoid.filter((forbidden) => includesText(allText, forbidden));

  return {
    fixtureId: fixture.fixtureId,
    findings: output.findings,
    notes: output.notes,
    missing,
    avoided,
    passed: missing.length === 0 && avoided.length === 0,
  };
}

function scoreReportCase(reportText, testCase) {
  const normalized = normalizeText(reportText);
  const assertions = testCase.reportAssertions ?? [];
  const avoids = testCase.reportShouldAvoid ?? [];

  const matched = assertions.filter((assertion) => includesPattern(normalized, assertion));
  const missing = assertions
    .filter((assertion) => !includesPattern(normalized, assertion))
    .map((assertion) => assertion.id);
  const forbidden = avoids.filter((assertion) => includesPattern(normalized, assertion)).map((assertion) => assertion.id);

  const totalChecks = assertions.length;
  const passedChecks = matched.length;
  const score = totalChecks === 0 ? 1 : passedChecks / totalChecks;

  return {
    matched: matched.map((assertion) => assertion.id),
    missing,
    forbidden,
    score,
    passed: missing.length === 0 && forbidden.length === 0,
  };
}

function printBaselineSummaries(summaries, totalCases, failedCases) {
  for (const summary of summaries) {
    process.stdout.write(`\n# ${summary.evalSet} (${summary.skill})\n`);
    for (const testCase of summary.cases) {
      process.stdout.write(`- ${testCase.passed ? "PASS" : "FAIL"} ${testCase.caseId} [fixture=${testCase.fixtureId}]\n`);
      if (testCase.findings.length > 0) {
        process.stdout.write("  findings:\n");
        for (const finding of testCase.findings) {
          process.stdout.write(`  - ${finding}\n`);
        }
      }
      if (testCase.notes.length > 0) {
        process.stdout.write("  notes:\n");
        for (const note of testCase.notes) {
          process.stdout.write(`  - ${note}\n`);
        }
      }
      if (testCase.missing.length > 0) {
        process.stdout.write("  missing:\n");
        for (const item of testCase.missing) {
          process.stdout.write(`  - ${item}\n`);
        }
      }
      if (testCase.avoided.length > 0) {
        process.stdout.write("  forbidden_matches:\n");
        for (const item of testCase.avoided) {
          process.stdout.write(`  - ${item}\n`);
        }
      }
    }
  }

  process.stdout.write(`\nGateproof eval summary: ${totalCases - failedCases}/${totalCases} cases passed.\n`);
}

function runBaselineEvals() {
  const summaries = [];
  let totalCases = 0;
  let failedCases = 0;

  for (const evalFile of collectEvalFiles()) {
    const evalSet = loadJson(resolve("evals", evalFile));
    const cases = [];

    for (const testCase of evalSet.cases) {
      totalCases += 1;
      const result = runCase(evalSet.skill, testCase);
      if (!result.passed) {
        failedCases += 1;
      }

      cases.push({
        caseId: testCase.caseId,
        ...result,
      });
    }

    summaries.push({
      evalSet: evalSet.evalSet,
      skill: evalSet.skill,
      cases,
    });
  }

  printBaselineSummaries(summaries, totalCases, failedCases);

  if (failedCases > 0) {
    process.exit(1);
  }
}

function runReportScoring({ eval: evalPath, case: caseId, report }) {
  if (!evalPath || !report) {
    throw new Error("Report scoring requires --eval <path> and --report <path>.");
  }

  const evalSet = loadJson(evalPath);
  const reportText = readFileSync(resolve(ROOT, report), "utf8");

  if (!caseId && evalSet.cases.length !== 1) {
    throw new Error("Report scoring requires --case <caseId> when an eval set contains multiple cases.");
  }

  const testCase = caseId
    ? evalSet.cases.find((candidate) => candidate.caseId === caseId)
    : evalSet.cases[0];

  if (!testCase) {
    throw new Error(`Case ${caseId} was not found in ${evalPath}.`);
  }

  const result = scoreReportCase(reportText, testCase);

  process.stdout.write(`# Report scoring (${evalSet.skill})\n`);
  process.stdout.write(`- eval: ${evalSet.evalSet}\n`);
  process.stdout.write(`- case: ${testCase.caseId}\n`);
  process.stdout.write(`- report: ${report}\n`);
  process.stdout.write(`- status: ${result.passed ? "PASS" : "FAIL"}\n`);
  process.stdout.write(`- score: ${Math.round(result.score * 100)}%\n`);

  if (result.matched.length > 0) {
    process.stdout.write("matched:\n");
    for (const item of result.matched) {
      process.stdout.write(`- ${item}\n`);
    }
  }

  if (result.missing.length > 0) {
    process.stdout.write("missing:\n");
    for (const item of result.missing) {
      process.stdout.write(`- ${item}\n`);
    }
  }

  if (result.forbidden.length > 0) {
    process.stdout.write("forbidden_matches:\n");
    for (const item of result.forbidden) {
      process.stdout.write(`- ${item}\n`);
    }
  }

  if (!result.passed) {
    process.exit(1);
  }
}
const args = parseArgs(process.argv.slice(2));

if (args["score-report"]) {
  runReportScoring(args);
} else {
  runBaselineEvals();
}
