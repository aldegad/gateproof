# Gateproof Development

## Local setup

Requirements:

- Node.js 20+
- npm 10+

Install and verify:

```bash
npm run skill:validate
npm run skill:install -- --all
npm run skill:doctor
npm run evals:run
npm run evals:artifacts
npm run artifacts:capture -- --from-manifest demo-api-full-security-report --capture-id demo-api-full-security-claude --engine claude --model sonnet
npm run evals:captures
npm run evals:score -- --eval evals/full-security-baseline.json --case high-risk-api-modern-risks --report docs/demo-reports/full-security-check-demo.md
```

## Repository structure

- `skills/`
  canonical skill sources
- `.claude/skills/`
  project-local Claude wrappers
- `.claude-plugin/`
  Claude plugin metadata
- `docs/demo-reports/`
  human-readable example outputs
- `examples/`
  intentionally imperfect sample targets
- `fixtures/`
  compact machine-readable target profiles
- `evals/`
  expected finding sets for repeatable quality checks
- `artifacts/`
  saved skill-output reports linked to eval cases
- `artifacts/captures/`
  concrete captured runs with saved report, metadata, and score output
- `prompts/`
  reusable prompt packs for producing comparable reports
- `scripts/`
  install, doctor, and validation tooling

## Editing skills

### KISA track

Main files:

- `skills/kisa-check/SKILL.md`
- `skills/kisa-check/references/control-model.md`
- `skills/kisa-check/references/core-controls.md`
- `skills/kisa-check/references/kisa-baseline.md`
- `skills/kisa-check/references/evidence-patterns.md`
- `skills/kisa-check/references/report-template.md`

### Full-security track

Main files:

- `skills/full-security-check/SKILL.md`
- `skills/full-security-check/references/control-model.md`
- `skills/full-security-check/references/core-controls.md`
- `skills/full-security-check/references/modern-baseline.md`
- `skills/full-security-check/references/review-checklist.md`
- `skills/full-security-check/references/kisa-vs-real-risk.md`

## Adding examples

Use `examples/` for realistic sample applications or deployment snippets.

Good example targets should:

- be small enough to understand quickly
- include a mix of obvious and non-obvious findings
- map to both skills in different ways
- avoid unsafe real credentials or live infrastructure details

## Adding fixtures

Use `fixtures/` for small, stable, machine-readable targets.

Each fixture should include:

- a short purpose
- the intended review mode
- a compact description of the target state
- known expected findings or expected clean areas

JSON is preferred so future validation scripts can parse it with no extra dependencies.

## Adding evals

Use `evals/` for expectations about what a good Gateproof review should surface.

An eval file should answer:

- which skill is being evaluated
- which fixture or example it applies to
- which findings must appear
- which overclaims should be avoided

The repo now includes a lightweight baseline evaluator via `npm run evals:run`.
It does not invoke an LLM.
Instead, it turns fixture signals into deterministic baseline findings and checks them against `mustFind` and `shouldAvoid` expectations.

## Validation rules

`npm run skill:validate` currently checks:

- required project files exist
- both canonical skills exist
- both Claude wrappers exist
- required reference documents exist
- trust-asset documents exist
- fixture and eval JSON files are valid

`npm run evals:run` currently checks:

- each eval set can be loaded
- each fixture can be evaluated by the matching skill baseline
- required findings appear
- forbidden overclaims do not appear

`npm run evals:score -- --eval <file> --case <caseId> --report <file>` currently checks:

- whether a freeform markdown or text report hits the required concepts for that case
- whether the report avoids selected overclaim patterns
- a simple percentage score based on matched concept assertions

`npm run evals:artifacts` currently checks:

- every report listed in `artifacts/report-manifest.json`
- eval and case linkage for each saved report artifact
- prompt-path and target-path references for reproducibility

`npm run artifacts:capture -- ...` currently does:

- copies a saved report into `artifacts/captures/<capture-id>/report.md`
- writes `metadata.json` and `score.txt`
- updates `artifacts/capture-index.json`
- immediately scores the captured report against its eval case

`npm run evals:captures` currently checks:

- every capture listed in `artifacts/capture-index.json`
- whether each captured report still satisfies its linked eval case

## Contribution expectations

Good contributions usually do one of these:

- improve a control definition
- add a realistic example target
- add a fixture and matching eval expectations
- reduce ambiguity in reporting language
- improve validation and trust assets

Less useful contributions usually:

- add large amounts of vague prose
- collapse the two review tracks into one
- claim framework coverage that the repo cannot actually support
