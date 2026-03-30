---
name: gateproof:kisa-check
description: Review a codebase or deployment target with a KISA-oriented compliance lens. Use when the goal is Korean audit readiness, control-gap mapping, evidence gathering, and pass/partial/fail style reporting.
---

# Gateproof KISA Check

Gateproof repo is installed at:

```text
__GATEPROOF_REPO__
```

Use this skill when the user wants a Korea-oriented security check that maps well to KISA-style audit expectations.

## Objective

Focus on:

- account and privilege controls
- access control and network exposure
- encryption and secret handling
- logging, monitoring, and audit evidence
- service hardening and patching

Do not pretend this is a full modern security review. This skill is intentionally scoped to local compliance readiness and gap reporting.

## Workflow

1. Detect the target surface.
   - app source
   - server or VM config
   - cloud deployment config
   - operational documents
2. Read the KISA references under `references/`.
3. Score findings as:
   - Pass
   - Partial
   - Fail
   - N/A
4. Produce a concise readiness report with:
   - summary
   - critical gaps
   - evidence observed
   - missing evidence
   - remediation priority

## Output expectations

Write the report in this shape:

```markdown
# Gateproof KISA Check

## Summary

## Critical Gaps

## Findings By Control Area

## Evidence Seen

## Missing Evidence

## Recommended Next Steps
```

## References

- `references/kisa-baseline.md`
- `references/report-template.md`
- `references/evidence-patterns.md`
