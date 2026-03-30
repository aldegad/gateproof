# Gateproof Report Artifacts

This directory is for saved skill outputs.

The goal is simple:

- run a Gateproof skill on a known target
- save the resulting markdown report here
- score that report against a matching eval case

Current manifest:

- `artifacts/report-manifest.json`

Current checked-in example reports:

- `docs/demo-reports/kisa-check-demo.md`
- `docs/demo-reports/full-security-check-demo.md`

Why the manifest exists:

- it links a report file to the right eval file and case
- it records which skill should have produced the report
- it lets `npm run evals:artifacts` batch-score all known report artifacts

Recommended workflow:

1. Run `gateproof:kisa-check` or `gateproof:full-security-check` in the current agent session
2. Save the report as markdown under `artifacts/` or `docs/demo-reports/`
3. Add or update an entry in `artifacts/report-manifest.json`
4. Run `npm run artifacts:capture -- --from-manifest <artifactId> --source <report.md> --capture-id <name> --engine session --model current-agent`
5. Run `npm run evals:captures`

This is the bridge between human-written or LLM-written reports and repeatable repo quality checks.
