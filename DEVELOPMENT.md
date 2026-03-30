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

The current repo does not yet run these evals automatically, but the format is designed to make that possible.

## Validation rules

`npm run skill:validate` currently checks:

- required project files exist
- both canonical skills exist
- both Claude wrappers exist
- required reference documents exist
- trust-asset documents exist
- fixture and eval JSON files are valid

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
