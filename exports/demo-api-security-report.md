# Gateproof Security Assessment Report

## Target

- Project: `examples/demo-api/`
- Assessment tracks:
  - `gateproof:kisa-check`
  - `gateproof:full-security-check`
- Assessment style: session-native review based on the current repository state

## Executive Summary

`examples/demo-api/` is not suitable for either Korean audit readiness or practical production deployment in its current state. The KISA-oriented review found multiple baseline failures around exposed admin access, secret handling, login protection, logging hygiene, and operational trust boundaries. The deeper security review confirmed that several of those gaps are not paperwork issues but directly exploitable weaknesses.

The most serious risks are an unauthenticated admin data exposure path, an SSRF sink exposed through user-controlled outbound fetch, hardcoded credential material, and a CI workflow that can leak a production secret from an untrusted `pull_request_target` context. These issues are visible in a very small file set, so they should be treated as immediate engineering blockers rather than theoretical hardening opportunities.

## Format Recommendation

This report package includes two formats because they serve different audiences.

- PDF is the best final delivery format for leadership, reviewers, and audit conversations.
- CSV is the best working format for engineering follow-up, ownership assignment, and remediation tracking in Excel.

If only one format is chosen, PDF is the better default for sharing. If the goal is execution tracking, use the CSV alongside it.

## Key Findings

| Track | Control | Status | Severity | Core issue |
| --- | --- | --- | --- | --- |
| KISA | `KISA-ACS-01` | Fail | High | Public admin surface and unauthenticated admin route exposure |
| KISA | `KISA-ENC-02` | Fail | High | Secrets and credential material committed in source |
| KISA | `KISA-LOG-04` | Fail | High | Login request bodies can leak sensitive data into logs |
| KISA | `KISA-ACC-04` | Fail | Medium | No visible throttling or failed-login lockout |
| Full Security | `MOD-APP-01` | Open | Critical | Admin data is exposed without authorization |
| Full Security | `MOD-APP-03` | Open | Critical | SSRF through attacker-controlled `/preview?url=` |
| Full Security | `MOD-SUP-02` | Open | Critical | `pull_request_target` workflow can leak `PROD_API_KEY` |
| Full Security | `MOD-DAT-01` | Open | High | Weak fallback JWT secret and plaintext credentials |

## KISA Readiness View

The KISA-oriented assessment indicates that the service would likely fail a baseline readiness discussion without substantial remediation. The main blockers are not subtle.

### Failing controls

1. `KISA-ACS-01` Public admin surface minimization
   - `admin.demo.example.com` is publicly routed in `config/ingress.yaml`
   - `/admin/users` is reachable without a visible authorization gate in `src/server.js`
2. `KISA-ENC-02` Secrets externalized from source code
   - `JWT_SECRET` falls back to a known string in `src/auth.js`
   - user passwords are committed in source in `src/auth.js`
3. `KISA-LOG-04` Sensitive data exclusion or masking in logs
   - login request bodies are logged in `src/server.js`
4. `KISA-ACC-04` Failed-login lockout or abuse throttling
   - no visible throttling, lockout, or reverse-proxy abuse control exists around `/login`

### Missing evidence

- stronger admin authentication such as MFA
- TLS enforcement evidence in ingress
- secret rotation readiness
- audit log retention and review ownership
- dependency and patch hygiene evidence

## Practical Security View

The deeper security review shows that the target has multiple direct exploit paths. These are not "documentation gaps"; they represent live attacker opportunities.

### Highest-risk issues

1. `MOD-APP-01` Object-level authorization enforcement
   - `GET /admin/users` returns the full user list without an authorization check
2. `MOD-APP-03` SSRF and outbound request trust control
   - `/preview?url=` performs `fetch(targetUrl)` on attacker input
3. `MOD-SUP-02` CI/CD trust boundary protection
   - the workflow runs on `pull_request_target`
   - `PROD_API_KEY` is echoed in CI logs
4. `MOD-DAT-01` Secret exposure prevention
   - hardcoded credentials and a weak fallback JWT secret undermine authentication integrity

### Likely exploit paths

1. An internet user calls `/admin/users` and retrieves the in-memory user list.
2. The attacker submits a crafted `/preview?url=` request to probe internal services.
3. An untrusted pull request leaks a production secret through workflow logs.
4. If the runtime secret is not set, forged JWTs become plausible because of the known fallback key.

## Recommended Remediation Order

1. Remove public admin exposure and enforce authenticated admin authorization on `/admin/users`.
2. Eliminate privileged secret exposure from the CI workflow and split trusted deploy steps from untrusted PR validation.
3. Remove committed credentials, require runtime secret injection, and rotate any exposed values.
4. Add SSRF protections for `/preview`, including destination allowlists and private-range blocking.
5. Stop logging login request bodies and add abuse controls such as throttling or lockout.

## Source Reports

- KISA session report: `docs/demo-reports/kisa-check-session.md`
- Full security session report: `docs/demo-reports/full-security-check-session.md`
- Captured KISA report: `artifacts/captures/demo-api-kisa-session/report.md`
- Captured full security report: `artifacts/captures/demo-api-full-security-session/report.md`
