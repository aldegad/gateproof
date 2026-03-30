# Demo Report: gateproof:full-security-check

Target:
- `examples/demo-api/`

## Executive Summary

This target contains multiple realistic exploit paths that go beyond simple compliance gaps.

Highest-risk themes:
- public admin data exposure
- SSRF-capable outbound fetch behavior
- weak secret handling and JWT trust
- unsafe CI/CD trust with production secret exposure

## Highest-Risk Findings

### MOD-APP-01 Object and admin authorization failure
- Severity: Critical
- Evidence:
  - unauthenticated `/admin/users` route in [server.js](../../examples/demo-api/src/server.js)
- Exploit path:
  - any internet user can enumerate user records through the public admin surface
- Fastest acceptable remediation:
  - require authenticated admin authorization and move admin route behind private access

### MOD-APP-03 SSRF and outbound request trust control
- Severity: High
- Evidence:
  - `/preview?url=` fetches attacker-controlled URLs in [server.js](../../examples/demo-api/src/server.js)
- Exploit path:
  - attacker can force requests to internal services, metadata endpoints, or trusted backends
- Fastest acceptable remediation:
  - add destination allowlists, private-IP blocking, and outbound egress controls

### MOD-DAT-01 Secret exposure prevention
- Severity: High
- Evidence:
  - `JWT_SECRET` fallback value in [auth.js](../../examples/demo-api/src/auth.js)
- Exploit path:
  - predictable or shared token signing key can enable forged session tokens
- Fastest acceptable remediation:
  - remove source fallback and fail closed if managed secret injection is missing

### MOD-SUP-02 CI/CD trust boundary protection
- Severity: Critical
- Evidence:
  - `pull_request_target` plus `PROD_API_KEY` exposure in [deploy.yml](../../examples/demo-api/ci/deploy.yml)
- Exploit path:
  - untrusted PR context can abuse privileged workflow execution or leak production secrets
- Fastest acceptable remediation:
  - eliminate privileged secret exposure on untrusted PR events and gate deploy paths

## Findings By Security Theme

### Authentication and session
- `MOD-AUT-01`: High
  - no stronger admin authentication boundary is visible
- `MOD-AUT-03`: High
  - no login abuse throttling is shown
- `MOD-AUT-04`: Medium
  - no recovery flow is shown, so reset posture cannot be trusted

### Application and authorization
- `MOD-APP-01`: Critical
  - admin route is openly reachable
- `MOD-APP-02`: Medium
  - no obvious SQL injection path is shown, but unsafe patterns are not yet ruled out
- `MOD-APP-03`: High
  - SSRF path is directly visible
- `MOD-APP-04`: Medium
  - no file-handling path shown, but path and content validation patterns are absent

### Secrets and data protection
- `MOD-DAT-01`: High
  - secret fallback in source
- `MOD-DAT-02`: High
  - login body logging risks credential and identity leakage
- `MOD-DAT-03`: Medium
  - JWT signing exists, but key management is weak

### Supply chain and delivery
- `MOD-SUP-02`: Critical
  - CI/CD trust boundary is unsafe
- `MOD-SUP-03`: High
  - artifact trust and provenance are not evidenced
- `MOD-SUP-04`: Medium
  - rollback and emergency release capability are not visible

### Operations and resilience
- `MOD-OPS-01`: Medium
  - logs exist, but not in a high-signal or safe form
- `MOD-OPS-03`: High
  - public exposure lacks credible abuse resistance

## Likely Exploit Paths

1. Public user enumeration through `/admin/users`
2. SSRF to internal services through `/preview`
3. Token forgery or weak trust from predictable JWT secret fallback
4. Secret exposure or malicious deployment path through insecure CI workflow

## KISA Coverage vs Real Risk

- A KISA-style review would correctly flag admin exposure, secret handling, and logging.
- A deeper review shows why the target is actively dangerous:
  - the admin route is directly exploitable
  - SSRF can become a pivot path
  - the CI workflow creates supply-chain and production-secret risk that many compliance-only reviews underweight

## Recommended Remediation Order

1. Remove or lock down `/admin/users`.
2. Fix the CI/CD workflow to remove privileged PR execution paths.
3. Remove hardcoded secret fallback and rotate any existing signing keys.
4. Add SSRF protections on outbound fetch behavior.
5. Remove credential-bearing request logging and add safer auth telemetry.

