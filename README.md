# Gateproof

Gateproof is a hybrid Codex and Claude skill package for two different security jobs:

- `gateproof:kisa-check` for Korea-oriented KISA-style compliance and readiness reviews
- `gateproof:full-security-check` for deeper security reviews that combine KISA context with OWASP, ASVS, NIST SSDF, and infrastructure hardening guidance

## Why this exists

Many teams need two things at the same time:

- a review that helps them pass Korean security and audit expectations
- a review that reflects modern security practice instead of stopping at checklist compliance

Gateproof keeps those concerns separate on purpose.

## 한국어

Gateproof는 보안 점검을 두 갈래로 나눕니다.

- `gateproof:kisa-check`
  - 한국형 심사, 감사, 납품, 내부 통과 문맥에 맞는 점검
- `gateproof:full-security-check`
  - 실제 공격 가능성과 현대 보안 통제를 더 깊게 보는 점검

핵심 아이디어는 단순합니다.

- "국내 기준상 통과 가능한가?"
- "실제로 안전한가?"

이 둘은 겹치지만 완전히 같지 않습니다.
Gateproof는 그 차이를 숨기지 않고, 아예 별도 스킬로 분리합니다.

## Skill model

### 1. gateproof:kisa-check

Use this when the goal is:

- KISA-oriented readiness
- Korean enterprise or public-sector audit prep
- documenting gaps in a format that maps well to local compliance conversations

Primary lens:

- KISA CII-style control families
- account, access, logging, encryption, hardening, patching
- evidence collection and pass/partial/fail style reporting

### 2. gateproof:full-security-check

Use this when the goal is:

- real application and platform security depth
- engineering review before production
- catching practical exploit paths and missing modern controls

Primary lens:

- OWASP Top 10
- OWASP ASVS
- NIST SSDF
- secrets, CI/CD, authz, session, cloud, supply-chain, and logging risks

## What each skill actually checks

| Skill | Main question | Typical outputs |
|------|---------------|-----------------|
| `gateproof:kisa-check` | "Will this likely satisfy Korean audit or compliance expectations?" | pass/partial/fail style findings, evidence gaps, readiness summary |
| `gateproof:full-security-check` | "How could this realistically be exploited or fail under a modern threat model?" | risk-ranked findings, exploit paths, missing controls, remediation order |

## Methodology split

### KISA-oriented track

Primary sources and instincts:

- KISA-style control families
- audit evidence and operational proof
- configuration and policy readiness
- controlled pass/partial/fail reporting

### Full-security track

Primary sources and instincts:

- OWASP Top 10
- OWASP ASVS
- NIST SSDF
- CI/CD and supply-chain review
- cloud, secrets, session, authz, abuse, and detection quality

## When to use which

- Use `gateproof:kisa-check` when the user says things like:
  - "Can we pass security review?"
  - "Check this against KISA expectations."
  - "We need a Korea-facing audit readiness pass."
- Use `gateproof:full-security-check` when the user says things like:
  - "Do a real security review."
  - "What would an attacker go after first?"
  - "What are we missing beyond compliance?"

## Hybrid support

This repo is designed to support both:

- Claude plugin installation via `.claude-plugin/marketplace.json`
- Codex skill installation via `npm run skill:install`

The `skills/` directory contains the canonical skill sources.
The `.claude/skills/` directory contains project-local wrappers for quick repo-local use.
Installed global skill folders use `gateproof-kisa-check` and `gateproof-full-security-check` to avoid name collisions.

## Quick start

```bash
npm run skill:install
npm run skill:doctor
npm run skill:validate
```

After install, the two intended skill names are:

- `gateproof:kisa-check`
- `gateproof:full-security-check`

## Example prompts

```text
Use gateproof:kisa-check on this repository and tell me what would likely block a Korean audit.
```

```text
Use gateproof:full-security-check on this API service and prioritize the top real-world risks.
```

## Repository layout

```text
gateproof/
├── .claude-plugin/
│   └── marketplace.json
├── .claude/
│   └── skills/
│       ├── gateproof-kisa-check/
│       └── gateproof-full-security-check/
├── scripts/
│   ├── install.mjs
│   ├── doctor.mjs
│   └── validate-skills.mjs
└── skills/
    ├── kisa-check/
    └── full-security-check/
```

## Positioning

Gateproof does not claim to be an official KISA product.
It is an independent open-source skill set that helps teams separate:

- "Will we likely pass the local gate?"
- "Are we actually secure?"

## Roadmap

- enrich KISA control mappings with more concrete evidence prompts
- add fuller OWASP ASVS review guidance by application layer
- add deployment and cloud review references
- add report templates for pull-request reviews and release gates
