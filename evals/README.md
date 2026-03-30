# Gateproof Evals

Evals define what a good Gateproof review should catch.

They are intentionally lightweight right now.
The goal is to establish stable expected findings before building a full evaluator.

Current eval sets:

- `evals/kisa-baseline.json`
- `evals/full-security-baseline.json`

Each eval entry links:

- a skill
- a target fixture or example
- findings that should appear
- claims that should be avoided

This helps contributors improve the skills without drifting into vague or inflated output.
