# Captured Runs

This directory stores saved Gateproof report captures.

Each capture folder should contain:

- `report.md`
- `metadata.json`
- `score.txt`

The capture flow is meant for real skill outputs produced by Codex or Claude.

In practice this directory may contain:

- reference captures copied from checked-in demo reports
- session captures produced by the current agent session

Once a report is captured here, it can be re-scored later with `npm run evals:captures`.
