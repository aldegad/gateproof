# Gateproof Full Security Check

## Executive Summary

`examples/demo-api/` is a small Express API, but it exposes several high-confidence exploit paths that would make it unsafe to deploy even in a low-trust internal environment. The most serious problems are unauthenticated admin data exposure, blind SSRF, hardcoded and weak credential handling, and a CI workflow that can leak a production secret from `pull_request_target`.

This target is useful precisely because the file set is small: the risk is not hypothetical or buried in edge cases. The highest-severity issues are visible in the main request handlers and deployment config, and an attacker would not need advanced access to exploit them.

## Highest-Risk Findings

### MOD-APP-01 Object-level authorization enforcement

- Severity: Critical
- Evidence:
  - unauthenticated admin user enumeration in [server.js](/Users/soohongkim/Documents/workspace/personal/gateproof/examples/demo-api/src/server.js)
  - `GET /admin/users` returns `Object.values(USERS)` with no auth check
- Why it matters:
  - the admin route fully bypasses all auth and exposes user records directly
  - this is a direct authorization failure, not just a missing hardening layer
- Fastest acceptable remediation:
  - require authenticated admin authorization on `/admin/users`
  - move the admin surface behind private routing or strong gateway controls

### MOD-APP-03 SSRF and outbound request trust control

- Severity: Critical
- Evidence:
  - `/preview?url=` performs `fetch(targetUrl)` on attacker-controlled input in [server.js](/Users/soohongkim/Documents/workspace/personal/gateproof/examples/demo-api/src/server.js)
- Why it matters:
  - user-controlled outbound fetch creates SSRF and trust-boundary risk
  - an attacker can probe internal services or metadata endpoints from the server context
- Fastest acceptable remediation:
  - enforce URL validation and destination allowlists
  - block private and link-local address ranges
  - add egress restrictions where possible

### MOD-SUP-02 CI/CD trust boundary protection

- Severity: Critical
- Evidence:
  - `pull_request_target` is enabled in [deploy.yml](/Users/soohongkim/Documents/workspace/personal/gateproof/examples/demo-api/ci/deploy.yml)
  - `PROD_API_KEY` is echoed in the workflow log in [deploy.yml](/Users/soohongkim/Documents/workspace/personal/gateproof/examples/demo-api/ci/deploy.yml)
- Why it matters:
  - CI/CD trust boundaries are weak and a production secret can be exposed from an untrusted pull request context
- Fastest acceptable remediation:
  - remove privileged secret exposure from `pull_request_target`
  - split trusted deploy steps from untrusted PR validation

### MOD-DAT-01 Secret exposure prevention

- Severity: High
- Evidence:
  - `JWT_SECRET` falls back to `"demo-secret-change-me"` in [auth.js](/Users/soohongkim/Documents/workspace/personal/gateproof/examples/demo-api/src/auth.js)
  - plaintext credentials are committed in [auth.js](/Users/soohongkim/Documents/workspace/personal/gateproof/examples/demo-api/src/auth.js)
- Why it matters:
  - hardcoded credentials and a known fallback signing key collapse trust in authentication and token integrity
- Fastest acceptable remediation:
  - remove committed credentials
  - require managed secret injection and fail closed when it is missing

## Findings By Security Theme

### Authentication and Session

- `MOD-AUT-01`: High
  - no strong admin authentication boundary exists for the admin surface
- `MOD-AUT-02`: High
  - JWTs live for 7 days and there is no visible revocation strategy
- `MOD-AUT-03`: High
  - `/login` has no throttling or brute-force resistance

### Application and Authorization

- `MOD-APP-01`: Critical
  - the admin route is fully unauthenticated and supports admin user enumeration
- `MOD-APP-03`: Critical
  - SSRF is directly visible through `/preview`
- `MOD-APP-02`: Medium
  - no obvious injection sink is shown, but input handling is weak overall

### Secrets and Data Protection

- `MOD-DAT-01`: High
  - source-controlled secret fallback and embedded credentials
- `MOD-DAT-02`: High
  - login request bodies are logged and can leak submitted passwords
- `MOD-DAT-03`: High
  - passwords are stored and compared in plaintext

### Supply Chain and Delivery

- `MOD-SUP-02`: Critical
  - `pull_request_target` plus production secret echo creates a clear secret leakage path
- `MOD-SUP-01`: Medium
  - no visible dependency pinning or scanning controls are shown

### Operations and Resilience

- `MOD-OPS-03`: High
  - `admin.demo.example.com` routes the admin surface publicly in [ingress.yaml](/Users/soohongkim/Documents/workspace/personal/gateproof/examples/demo-api/config/ingress.yaml)
- `MOD-OPS-01`: Medium
  - logs exist, but they capture unsafe auth data instead of useful secure telemetry

## Likely Exploit Paths

1. An internet user hits `/admin/users` and retrieves the full in-memory user list because the route has no authorization check.
2. The attacker uses `/preview?url=` to trigger SSRF toward internal services or metadata endpoints.
3. A pull request triggers `pull_request_target`, and the workflow prints `PROD_API_KEY` directly into CI logs.
4. If `JWT_SECRET` is not explicitly set, the fallback signing key allows predictable token forgery.
5. Weak committed passwords plus no login throttling make brute-force and credential stuffing trivial.

## KISA Coverage vs Real Risk

- A KISA-style review would correctly complain about secret handling, logging hygiene, and exposed admin surfaces.
- The deeper problem is that several issues are directly exploitable with very little attacker effort:
  - the authorization failure is live on the admin route
  - the SSRF path is one request away
  - the CI workflow can leak a production secret
- So even if someone reduced this to a checklist conversation, the practical risk remains severe.

## Recommended Remediation Order

1. Remove or protect `/admin/users` with authenticated admin authorization and private exposure controls.
2. Fix the CI workflow so untrusted pull requests cannot access or print production secrets.
3. Remove hardcoded credentials and the JWT fallback secret; rotate any exposed values.
4. Add SSRF protections for `/preview`, including allowlists and private-range blocking.
5. Stop logging login request bodies and add login abuse controls.
