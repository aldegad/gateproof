# Gateproof Full Security Core Controls

This file defines the first detailed modern security control set for `gateproof:full-security-check`.

The goal is to give the skill a practical and high-signal review spine that reflects OWASP, ASVS, and NIST SSDF instincts without pretending to be a verbatim copy of those standards.

## Authentication and session

### MOD-AUT-01 Strong admin authentication boundary

Point-in-time question:
- Are administrative and highly sensitive actions protected by stronger authentication than normal user flows?

Expected evidence:
- MFA requirements
- re-auth or step-up auth for privileged actions
- SSO or identity-provider enforcement

Code or config clues:
- admin auth middleware
- IdP policy
- privileged route guards

Severity:
- Critical: privileged actions are reachable with weak or single-factor auth
- High: stronger auth exists but is inconsistently enforced
- Medium: risk exists but scope is narrow
- Low: control is present and credible

### MOD-AUT-02 Session invalidation and lifecycle control

Point-in-time question:
- Are sessions rotated, expired, and invalidated appropriately after login, logout, and privilege changes?

Expected evidence:
- session middleware config
- token TTL settings
- logout invalidation behavior

Code or config clues:
- cookie settings
- token refresh policy
- session store behavior

Severity:
- Critical: stale or reusable sessions can preserve elevated access
- High: weak expiry or inconsistent invalidation
- Medium: lifecycle mostly works but has edge-case gaps
- Low: session lifecycle is robust

### MOD-AUT-03 Login abuse throttling and account attack resistance

Point-in-time question:
- Is the authentication surface resistant to brute force, credential stuffing, and token guessing?

Expected evidence:
- rate limiting
- IP or device throttling
- lockout or challenge escalation

Code or config clues:
- auth gateway settings
- WAF or reverse-proxy rules
- application rate-limit middleware

Severity:
- Critical: authentication can be abused at scale with little resistance
- High: some resistance exists but is easy to bypass
- Medium: controls exist but are shallow
- Low: auth abuse resistance is credible

### MOD-AUT-04 Password reset and recovery safety

Point-in-time question:
- Is account recovery resistant to enumeration, takeover, and replay abuse?

Expected evidence:
- reset token TTL
- anti-enumeration behavior
- secure recovery flow design

Code or config clues:
- reset endpoints
- email or SMS recovery logic
- token issuance and storage

Severity:
- Critical: reset flow enables easy account takeover
- High: major weaknesses in reset token or identity verification
- Medium: smaller but real reset-flow risks
- Low: reset and recovery are defensible

## Application and authorization

### MOD-APP-01 Object-level authorization enforcement

Point-in-time question:
- Are object, record, or tenant boundaries enforced on every sensitive read and write path?

Expected evidence:
- per-request ownership checks
- role- and resource-aware authz
- tenant scoping in data access paths

Code or config clues:
- controller or route authorization checks
- ORM filters
- missing ownership predicates

Severity:
- Critical: attackers can read or write other users' or tenants' data
- High: authz exists but key paths are missing checks
- Medium: authz mostly works but edge paths remain weak
- Low: object-level authz is consistently enforced

### MOD-APP-02 Injection resistance for queries and commands

Point-in-time question:
- Are SQL, NoSQL, template, shell, or interpreter injection paths prevented by design?

Expected evidence:
- parameterized queries
- safe command execution
- template escaping and input validation

Code or config clues:
- string-built queries
- shell execution with user input
- unsafe eval-like behavior

Severity:
- Critical: user-controlled input reaches dangerous interpreters directly
- High: significant injection paths are plausible
- Medium: smaller or partially constrained injection risk
- Low: strong injection resistance is visible

### MOD-APP-03 SSRF and outbound request trust control

Point-in-time question:
- Can user-controlled input trigger outbound requests to sensitive internal or external targets?

Expected evidence:
- destination allowlists
- URL validation
- egress controls

Code or config clues:
- URL fetch endpoints
- webhook or import features
- metadata-service reachability

Severity:
- Critical: SSRF can reach internal control planes or sensitive services
- High: SSRF is plausible with limited constraints
- Medium: some validation exists but trust is still weak
- Low: outbound request trust is well controlled

### MOD-APP-04 File upload, download, and path handling safety

Point-in-time question:
- Are file flows protected against traversal, unsafe upload content, or unintended disclosure?

Expected evidence:
- content-type and extension validation
- storage isolation
- path normalization

Code or config clues:
- direct filesystem joins
- permissive upload handlers
- predictable or exposed storage paths

Severity:
- Critical: upload or path handling can lead to code execution or major data exposure
- High: unsafe file handling with realistic abuse paths
- Medium: partial controls with meaningful residual risk
- Low: file handling appears well defended

## Secrets and data protection

### MOD-DAT-01 Secret exposure prevention

Point-in-time question:
- Are secrets protected from source control, logs, client bundles, and over-broad runtime exposure?

Expected evidence:
- secret manager use
- scoped runtime injection
- secret scanning or review process

Code or config clues:
- committed keys
- frontend-exposed secrets
- logs or config dumps containing credentials

Severity:
- Critical: active secrets are exposed or trivially recoverable
- High: secrets are weakly controlled or widely distributed
- Medium: secret handling is mostly good with notable exceptions
- Low: secret hygiene is solid

### MOD-DAT-02 Sensitive data minimization and masking

Point-in-time question:
- Is sensitive or personal data minimized, masked, and excluded from unsafe outputs?

Expected evidence:
- data classification or masking rules
- logging redaction
- response filtering

Code or config clues:
- full object logging
- PII leakage in error output
- verbose admin exports

Severity:
- Critical: sensitive data is broadly exposed
- High: repeated or scalable leakage risk
- Medium: localized but meaningful exposure
- Low: data handling is appropriately restrained

### MOD-DAT-03 Cryptographic safety and modern algorithm use

Point-in-time question:
- Are modern password hashing, token signing, and encryption practices in place?

Expected evidence:
- bcrypt/Argon2/PBKDF2 for passwords
- strong TLS and modern cipher configuration
- managed or documented key handling

Code or config clues:
- weak hashing
- custom crypto
- obsolete TLS or insecure key storage

Severity:
- Critical: clearly unsafe crypto undermines core protections
- High: important crypto choices are weak or obsolete
- Medium: crypto posture is mixed
- Low: modern crypto practice is visible

### MOD-DAT-04 Backup, export, and snapshot protection

Point-in-time question:
- Are backups, exports, dumps, and snapshots protected with equivalent care to production data?

Expected evidence:
- restricted backup access
- encrypted backups
- export auditability

Code or config clues:
- database dumps
- publicly exposed exports
- overly broad backup storage permissions

Severity:
- Critical: backups or exports create a direct major data-loss path
- High: backup protections are weak or incomplete
- Medium: backups are mostly protected with some gaps
- Low: backup and export controls are strong

## Supply chain and delivery

### MOD-SUP-01 Dependency risk visibility and response

Point-in-time question:
- Is there a working path to detect, prioritize, and update vulnerable dependencies?

Expected evidence:
- lockfiles
- dependency scanning
- upgrade workflow

Code or config clues:
- stale dependency trees
- no scanner config
- ignored advisories without rationale

Severity:
- Critical: known dangerous components persist without response path
- High: dependency response is weak or ad hoc
- Medium: some visibility exists but ownership is weak
- Low: dependency risk is actively managed

### MOD-SUP-02 CI/CD trust boundary protection

Point-in-time question:
- Are build and deployment workflows protected from untrusted code paths, secret theft, and unsafe promotion?

Expected evidence:
- environment protection rules
- restricted secrets in CI
- branch or release gating

Code or config clues:
- overly broad workflow triggers
- secrets exposed to untrusted PRs
- direct production deployment without controls

Severity:
- Critical: CI/CD can be abused to exfiltrate secrets or ship malicious code
- High: trust boundaries are weak in important places
- Medium: process is partially hardened
- Low: delivery trust is strong

### MOD-SUP-03 Build provenance and artifact trust

Point-in-time question:
- Can the team trust where built artifacts came from and what source produced them?

Expected evidence:
- reproducible or tracked build source
- artifact registry controls
- signing or provenance metadata

Code or config clues:
- unsigned artifacts
- manual handoffs
- untracked build sources

Severity:
- Critical: artifact origin cannot be trusted for sensitive releases
- High: provenance is weak or easy to tamper with
- Medium: partial trust signals exist
- Low: provenance controls are strong enough for the release model

### MOD-SUP-04 Release rollback and emergency patch readiness

Point-in-time question:
- Can the team rapidly contain or roll back a bad release or security issue?

Expected evidence:
- rollback path
- emergency release process
- owner and severity workflow

Code or config clues:
- deployment controls
- release documentation
- hotfix branch or procedure

Severity:
- Critical: no credible emergency containment path exists
- High: containment is slow or risky
- Medium: some path exists but is weakly practiced
- Low: release response readiness is good

## Operations and resilience

### MOD-OPS-01 High-signal security logging

Point-in-time question:
- Do logs answer real incident questions for auth abuse, privilege changes, data access, and suspicious failures?

Expected evidence:
- structured security logs
- event coverage for sensitive operations
- searchable aggregation

Code or config clues:
- sparse event logging
- no identity context in logs
- missing audit events for important actions

Severity:
- Critical: incident reconstruction would likely fail
- High: important security events are missing or weak
- Medium: logs exist but quality is mixed
- Low: logs provide useful security signal

### MOD-OPS-02 Detection ownership and alertability

Point-in-time question:
- Is there a real owner and response path for important security-relevant alerts?

Expected evidence:
- alert routing
- on-call ownership
- runbooks or escalation rules

Code or config clues:
- monitoring config
- SIEM alerts
- issue or pager routing

Severity:
- Critical: serious security failures are unlikely to trigger actionable response
- High: detection exists but ownership is weak
- Medium: coverage is uneven or low-confidence
- Low: alerting and ownership are credible

### MOD-OPS-03 Public exposure and abuse resistance

Point-in-time question:
- Are public-facing services protected by rate limits, WAF-like controls, or equivalent abuse barriers?

Expected evidence:
- rate-limit config
- bot or abuse controls
- ingress protection settings

Code or config clues:
- unlimited login or search requests
- no API throttling
- public admin or debug surfaces

Severity:
- Critical: exposed services are easy to abuse at scale
- High: major public surfaces lack meaningful resistance
- Medium: some controls exist but are shallow
- Low: abuse resistance is reasonably strong

### MOD-OPS-04 Vulnerability and incident response realism

Point-in-time question:
- Can the team realistically triage, contain, and remediate a discovered security issue?

Expected evidence:
- incident process
- severity model
- rotation procedure for keys or credentials

Code or config clues:
- security docs
- issue labels or runbooks
- response ownership traces

Severity:
- Critical: the team has no credible response path
- High: response path exists but would likely be slow or chaotic
- Medium: response capacity exists with notable gaps
- Low: incident and remediation readiness are practical
