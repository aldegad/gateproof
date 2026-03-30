# Gateproof KISA Check

## Summary

`examples/demo-api/` is not ready for a Korea-oriented audit or readiness review. The clearest blockers are public exposure of the admin surface, weak secret handling, unsafe login logging, and missing visible abuse controls around authentication. Even where some control intent exists, the technical evidence is weak or absent.

From a KISA-style perspective, this target would likely be judged as failing several core baseline families around access control, encryption and secret handling, account protection, and operational evidence quality.

## Critical Gaps

### KISA-ACS-01 Public admin surface minimization

- Judgement: Fail
- Evidence seen:
  - public `admin.demo.example.com` route in [ingress.yaml](/Users/soohongkim/Documents/workspace/personal/gateproof/examples/demo-api/config/ingress.yaml)
  - unauthenticated `/admin/users` endpoint in [server.js](/Users/soohongkim/Documents/workspace/personal/gateproof/examples/demo-api/src/server.js)
- Why:
  - the admin surface is publicly reachable and there is no strong gate in front of it

### KISA-ENC-02 Secrets externalized from source code

- Judgement: Fail
- Evidence seen:
  - `JWT_SECRET` fallback string in [auth.js](/Users/soohongkim/Documents/workspace/personal/gateproof/examples/demo-api/src/auth.js)
  - committed user passwords in [auth.js](/Users/soohongkim/Documents/workspace/personal/gateproof/examples/demo-api/src/auth.js)
- Why:
  - secrets and credential material are still embedded in source rather than fully externalized

### KISA-LOG-04 Sensitive data exclusion or masking in logs

- Judgement: Fail
- Evidence seen:
  - login request body logging in [server.js](/Users/soohongkim/Documents/workspace/personal/gateproof/examples/demo-api/src/server.js)
- Why:
  - submitted credential data can be written to logs, which is not acceptable baseline evidence handling

### KISA-ACC-04 Failed-login lockout or abuse throttling

- Judgement: Fail
- Evidence seen:
  - no visible lockout, throttling, or reverse-proxy abuse control around `/login` in [server.js](/Users/soohongkim/Documents/workspace/personal/gateproof/examples/demo-api/src/server.js)
- Why:
  - repeated authentication attempts appear largely unrestricted

## Findings By Control Area

### Account and identity

- `KISA-ACC-01`: Partial
  - direct privileged remote login controls are not evidenced in this sample
- `KISA-ACC-02`: Partial
  - admin and user roles exist, but privileged access boundaries are weak in practice
- `KISA-ACC-03`: Fail
  - weak committed passwords and no visible policy enforcement
- `KISA-ACC-04`: Fail
  - no visible failed-login throttling or lockout

### Access control and exposure

- `KISA-ACS-01`: Fail
  - public admin host plus unauthenticated admin route exposure
- `KISA-ACS-02`: Partial
  - least-privilege data access is partly modeled for `/api/users/:id`, but broad admin read access bypasses it
- `KISA-ACS-03`: Fail
  - ingress exposes both public and admin hosts to the same backend with no visible boundary control
- `KISA-ACS-04`: Partial
  - no clear sensitive file-permission model is shown, but the sample does not expose enough deployment detail for a stronger judgement

### Encryption and secret handling

- `KISA-ENC-01`: Fail
  - no visible TLS configuration is present in the ingress definition
- `KISA-ENC-02`: Fail
  - hardcoded secret fallback and committed credentials are present
- `KISA-ENC-03`: Partial
  - no meaningful evidence of at-rest protection is shown
- `KISA-ENC-04`: Partial
  - there is no credible evidence of secret rotation readiness

### Logging and auditability

- `KISA-LOG-01`: Partial
  - login activity is logged, but in an unsafe low-quality form
- `KISA-LOG-02`: Fail
  - privileged admin actions are reachable without a meaningful audited control boundary
- `KISA-LOG-03`: Partial
  - no retention or review ownership evidence is shown
- `KISA-LOG-04`: Fail
  - login request bodies can expose sensitive fields in logs

### Hardening and patch hygiene

- `KISA-HRD-01`: Fail
  - unnecessary public admin exposure remains enabled
- `KISA-HRD-02`: Partial
  - some route-level checks exist, but security defaults are weak overall
- `KISA-HRD-03`: Partial
  - a CI file exists, but secure patch or dependency hygiene is not evidenced
- `KISA-HRD-04`: Fail
  - CI workflow handling of production secret material is operationally unsafe

## Evidence Seen

- application authentication and authorization logic in source
- public ingress exposure for both API and admin hostnames
- login logging behavior
- CI workflow using `pull_request_target` with production secret handling

## Missing Evidence

- MFA or stronger admin authentication controls
- lockout, rate-limit, or reverse-proxy abuse controls
- TLS termination or HTTPS enforcement
- secret rotation procedure
- log retention, review ownership, or audit process
- dependency and patch management evidence

## Recommended Next Steps

1. Remove public exposure from the admin surface and require authenticated admin authorization for `/admin/users`.
2. Remove hardcoded credential material and require secure runtime secret injection.
3. Stop logging login request bodies and replace them with safer auth telemetry.
4. Add failed-login throttling or lockout controls around the authentication flow.
5. Separate trusted deployment workflows from untrusted pull request execution and stop exposing production secrets in CI logs.
