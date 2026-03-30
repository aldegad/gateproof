# Skill Comparison: KISA Check vs Full Security Check

This note explains why Gateproof keeps two skills instead of collapsing everything into one.

Target used for comparison:
- [examples/demo-api](../../examples/demo-api/README.md)

Related demo reports:
- [KISA demo report](./kisa-check-demo.md)
- [Full security demo report](./full-security-check-demo.md)

## What the KISA-oriented skill is best at

- audit readiness framing
- evidence-oriented pass/partial/fail reporting
- highlighting baseline control gaps in a Korea-facing way
- keeping the report usable for compliance and internal approval conversations

## What the full-security skill is best at

- surfacing exploit paths
- showing how an attacker would chain weaknesses
- identifying modern application, CI/CD, and cloud risks
- prioritizing fixes by real-world impact

## Same target, different emphasis

### gateproof:kisa-check

Main question:
- "Will this likely pass a Korean-style control review?"

Example emphasis:
- admin exposure as a control failure
- hardcoded secret as a secret-management failure
- unsafe logging as an audit and data-protection failure

### gateproof:full-security-check

Main question:
- "How does this get broken in practice?"

Example emphasis:
- unauthenticated admin route as a direct data exposure path
- SSRF endpoint as an internal pivot
- CI/CD workflow as a production-secret and supply-chain risk

## Why both matter

If you only run the KISA-oriented review:
- you may know you have a gap, but not why it is exploitable right now

If you only run the full-security review:
- you may understand the real risks, but miss the reporting shape needed for a local audit or internal approval process

Gateproof is designed to keep both answers available on purpose.

