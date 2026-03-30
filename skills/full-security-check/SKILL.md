---
name: gateproof:full-security-check
description: Run a deeper security assessment that combines KISA context with OWASP Top 10, OWASP ASVS, NIST SSDF, and practical application and infrastructure security checks. Use when the goal is real security depth rather than checklist-only readiness.
---

# Gateproof Full Security Check

Gateproof repo is installed at:

```text
__GATEPROOF_REPO__
```

Use this skill when the user wants a real security review, not just local compliance coverage.

## Objective

Review the target with a practical modern security lens:

- OWASP Top 10 attack classes
- OWASP ASVS control depth
- NIST SSDF software delivery and supply-chain posture
- authn/authz, secrets, session, input validation, SSRF, deserialization
- CI/CD, dependency, cloud, logging, and operational risks

## Workflow

1. Detect the target surface.
   - web app
   - API
   - backend service
   - frontend
   - CI/CD and infra config
2. Start with the detailed modern control set under `references/control-model.md` and `references/core-controls.md`.
3. Use the broader references under `references/` to deepen the review when the target exposes more surface area.
4. Prioritize findings by exploitability and impact.
5. Produce a report with:
   - top risks
   - exploit paths or realistic failure modes
   - missing controls
   - recommended remediations
   - "KISA would likely pass, but still risky" cases when relevant

## Output expectations

Write the report in this shape:

```markdown
# Gateproof Full Security Check

## Executive Summary

## Highest-Risk Findings

## Findings By Security Theme

## Likely Exploit Paths

## KISA Coverage vs Real Risk

## Recommended Remediation Order
```

## References

- `references/control-model.md`
- `references/core-controls.md`
- `references/modern-baseline.md`
- `references/kisa-vs-real-risk.md`
- `references/review-checklist.md`
