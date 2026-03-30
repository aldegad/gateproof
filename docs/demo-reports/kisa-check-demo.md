# Demo Report: gateproof:kisa-check

Target:
- `examples/demo-api/`

## Summary

This target would likely struggle in a Korea-oriented readiness review because several basic control families are either weakly evidenced or clearly failing:

- privileged admin exposure
- weak secret handling
- sensitive logging behavior
- weak authentication controls

## Critical Gaps

### KISA-ACC-03 Password policy and credential strength
- Judgement: Fail
- Evidence seen:
  - plaintext demo passwords in [auth.js](../../examples/demo-api/src/auth.js)
- Why:
  - no evidence of strong credential policy or hashed password storage

### KISA-ACS-01 Public admin surface minimization
- Judgement: Fail
- Evidence seen:
  - public `admin.demo.example.com` host in [ingress.yaml](../../examples/demo-api/config/ingress.yaml)
  - unauthenticated `/admin/users` route in [server.js](../../examples/demo-api/src/server.js)

### KISA-ENC-02 Secrets externalized from source code
- Judgement: Fail
- Evidence seen:
  - fallback secret in [auth.js](../../examples/demo-api/src/auth.js)

### KISA-LOG-04 Sensitive data exclusion or masking in logs
- Judgement: Fail
- Evidence seen:
  - login request body logging in [server.js](../../examples/demo-api/src/server.js)

## Findings By Control Area

### Account and identity
- `KISA-ACC-01`: Partial
  - direct admin isolation is not evident
- `KISA-ACC-03`: Fail
  - weak credential storage and no visible policy
- `KISA-ACC-04`: Fail
  - no visible login throttling or lockout

### Access control and exposure
- `KISA-ACS-01`: Fail
  - public admin host and route exposure
- `KISA-ACS-02`: Partial
  - no evidence of tight least-privilege scoping
- `KISA-ACS-03`: Partial
  - some ingress separation exists, but no restrictive boundary is shown

### Encryption and secrets
- `KISA-ENC-01`: Partial
  - ingress exists, but explicit transport-security requirements are not evidenced
- `KISA-ENC-02`: Fail
  - hardcoded fallback secret remains in source

### Logging and auditability
- `KISA-LOG-01`: Partial
  - auth events are logged, but in a low-quality and unsafe way
- `KISA-LOG-04`: Fail
  - request body logging may capture credentials

### Hardening and patch hygiene
- `KISA-HRD-01`: Fail
  - unnecessary public admin path remains enabled
- `KISA-HRD-04`: Partial
  - CI file exists, but secure vulnerability response readiness is not evidenced

## Evidence Seen

- source code for login, JWT, and admin routes
- ingress configuration exposing public hosts
- CI workflow with production secret usage

## Missing Evidence

- MFA or stronger admin auth evidence
- patch/update ownership
- retention and review ownership for logs
- formal account lifecycle or privilege model

## Recommended Next Steps

1. Remove hardcoded secret fallback and move all secrets to managed runtime injection.
2. Put `/admin/*` behind private access and strong admin auth.
3. Stop logging credential-bearing request bodies.
4. Add login abuse controls and clear account policy evidence.

