# Gateproof Status

Last updated: 2026-03-30

## Current state

Gateproof is in early public MVP state.

What already exists:

- 2 canonical skills
  - `gateproof:kisa-check`
  - `gateproof:full-security-check`
- hybrid install flow for Codex and Claude
- detailed KISA-oriented core controls
- detailed modern full-security core controls
- a demo target and paired example reports
- validation, install, and doctor scripts
- runnable baseline eval script for fixture-backed expectations
- report scoring mode for grading freeform skill outputs against case assertions
- artifact manifest and batch scoring flow for saved skill reports
- captured-run workflow with metadata and replayable scoring
- direct Codex and Claude adapter script for report generation

What this means in practice:

- the project is good enough to explain the product direction
- the project is useful for guided review workflows
- the project is not yet a fully automated scanner or evidence collector

## Scope snapshot

### KISA track

Coverage is strongest in:

- account and admin access controls
- service exposure and baseline hardening
- encryption and secret handling
- logging and auditability
- patching and operational hygiene

Coverage is weaker in:

- environment-specific infrastructure checks
- network-device and appliance-style controls
- cloud-provider-specific evidence collection
- automated audit artifact generation

### Full-security track

Coverage is strongest in:

- authentication and session review
- authorization and object-level access control
- secret exposure and data handling
- CI/CD and supply-chain trust boundaries
- public exposure and abuse resistance

Coverage is weaker in:

- framework-specific exploit guidance by stack
- container and Kubernetes depth checks
- cloud IAM and tenant-isolation nuance
- runtime attack simulation and active testing

## Quality posture

Today Gateproof should be understood as:

- a structured review system
- a skill package with reusable control language
- a foundation for future evals and report generation

Today Gateproof should not be understood as:

- an official KISA tool
- a complete ASVS implementation
- a production-grade autonomous remediation engine

## Trust assets

The project now includes:

- [README.md](./README.md)
- [RESEARCH.md](./RESEARCH.md)
- [DEVELOPMENT.md](./DEVELOPMENT.md)
- [examples/demo-api/README.md](./examples/demo-api/README.md)
- [docs/demo-reports/skill-comparison.md](./docs/demo-reports/skill-comparison.md)
- [fixtures/README.md](./fixtures/README.md)
- [evals/README.md](./evals/README.md)

## Known gaps

- eval runner is still deterministic baseline logic at its core
- report scoring is concept-based and intentionally lightweight, not a full semantic evaluator
- direct model adapters exist, but they still benefit from prompt tuning and output normalization
- live generation may still need prompt tuning or output normalization before reports are consistently score-perfect
- no machine-generated evidence collection from live targets
- no versioned coverage matrix against complete KISA or ASVS catalogs
- no stack-specific variants for Node, Java, Python, Go, Rails, or Spring

## Near-term next steps

- add more fixtures with clean, ambiguous, and intentionally risky states
- add stack-specific guidance packs for common web frameworks
- add release-gate report templates for PRs and deployment reviews
