# Gateproof KISA Core Controls

This file defines the first detailed KISA-oriented control set for `gateproof:kisa-check`.

The goal is not to replicate every official KISA document line-by-line. The goal is to give the skill a concrete and repeatable Korea-oriented control mapping that can be extended over time.

## Account and identity

### KISA-ACC-01 Root or administrator direct remote login restriction

Point-in-time question:
- Is direct remote login for root or equivalent administrator accounts restricted?

Expected evidence:
- SSH, RDP, bastion, SSO, VPN, or PAM configuration
- admin access policy or operational notes

Code or config clues:
- `sshd_config`
- jump-host or bastion setup
- cloud access gateways

Judgement:
- Pass: direct privileged login is blocked or tightly mediated
- Partial: restrictions exist but broad exceptions remain
- Fail: direct privileged remote login is generally allowed
- N/A: platform does not expose this access path

### KISA-ACC-02 Privileged account separation

Point-in-time question:
- Are privileged accounts separated from normal user identities and service identities?

Expected evidence:
- admin role definitions
- IAM or RBAC policies
- service-account inventory

Code or config clues:
- IAM configuration
- RBAC manifests
- local group membership

Judgement:
- Pass: admin, user, and service identities are clearly separated
- Partial: some separation exists but boundaries are weak
- Fail: shared or overloaded privileged identities are common
- N/A: no privileged identity layer is present

### KISA-ACC-03 Password policy and credential strength

Point-in-time question:
- Is there evidence of minimum credential strength and password policy enforcement?

Expected evidence:
- password policy config
- identity provider policy
- onboarding or security standard document

Code or config clues:
- PAM or local password policy
- IdP password settings
- directory service policy exports

Judgement:
- Pass: strong policy is enforced by configuration
- Partial: policy exists but technical enforcement is incomplete
- Fail: weak or no credential policy is visible
- N/A: password-based auth is not used

### KISA-ACC-04 Failed-login lockout or abuse throttling

Point-in-time question:
- Are failed-login attempts rate-limited, locked out, or otherwise controlled?

Expected evidence:
- lockout policy
- rate-limit config
- auth gateway rules

Code or config clues:
- PAM lockout settings
- reverse-proxy rate limits
- application auth middleware

Judgement:
- Pass: repeated auth abuse is technically constrained
- Partial: some throttling exists but is weak or uneven
- Fail: repeated login attempts are largely unrestricted
- N/A: interactive authentication is not in scope

## Access control and exposure

### KISA-ACS-01 Public admin surface minimization

Point-in-time question:
- Are admin interfaces kept off the public internet or strongly restricted?

Expected evidence:
- allowlists
- private ingress rules
- VPN or zero-trust access requirements

Code or config clues:
- ingress config
- security groups
- reverse-proxy allow rules

Judgement:
- Pass: admin surfaces are private or tightly gated
- Partial: exposed but partially restricted
- Fail: admin endpoints are publicly reachable with weak controls
- N/A: there is no admin interface

### KISA-ACS-02 Least-privilege access to data stores and storage

Point-in-time question:
- Are database and storage permissions limited to the minimum needed?

Expected evidence:
- role grants
- storage policies
- service-account scoping

Code or config clues:
- SQL grants
- cloud IAM policies
- bucket policies

Judgement:
- Pass: permissions are narrowly scoped and role-based
- Partial: privilege scoping exists but is broader than necessary
- Fail: broad or shared high-privilege access is common
- N/A: no data store or protected storage is in scope

### KISA-ACS-03 Internal network segmentation or boundary control

Point-in-time question:
- Is there evidence of segmentation or boundary control between sensitive systems?

Expected evidence:
- subnet boundaries
- firewall rules
- private networking design

Code or config clues:
- VPC/subnet layout
- host firewall rules
- mesh or service-network policy

Judgement:
- Pass: sensitive services are bounded by explicit network controls
- Partial: some segmentation exists but is inconsistent
- Fail: flat or overly permissive east-west exposure is visible
- N/A: architecture is too small for segmentation to apply

### KISA-ACS-04 File and configuration access restrictions

Point-in-time question:
- Are sensitive files and configuration paths protected from broad read/write access?

Expected evidence:
- filesystem permissions
- deployment ownership model
- config-management boundaries

Code or config clues:
- Unix permission bits
- Kubernetes secret mounts
- app config location and ownership

Judgement:
- Pass: sensitive paths are restricted to required identities
- Partial: some sensitive paths are restricted but others are loose
- Fail: broad write or read access to sensitive files is visible
- N/A: no such files are present

## Encryption and secret handling

### KISA-ENC-01 Transport encryption enabled for sensitive traffic

Point-in-time question:
- Is sensitive traffic protected with HTTPS, TLS, VPN, or equivalent secure transport?

Expected evidence:
- ingress or reverse-proxy TLS config
- service mesh policy
- secure transport requirement docs

Code or config clues:
- certificate config
- HTTPS redirects
- TLS listener or gateway settings

Judgement:
- Pass: sensitive traffic is consistently protected in transit
- Partial: encryption exists but exceptions or downgrade paths remain
- Fail: sensitive transport is exposed without adequate encryption
- N/A: no networked sensitive path is in scope

### KISA-ENC-02 Secrets externalized from source code

Point-in-time question:
- Are secrets externalized rather than hardcoded in source or committed configs?

Expected evidence:
- secret manager usage
- environment variable injection
- deployment secret references

Code or config clues:
- `.env` handling
- vault or secret-manager integrations
- committed API keys or tokens

Judgement:
- Pass: secrets are externalized and loaded securely
- Partial: most secrets are externalized but risky exceptions remain
- Fail: hardcoded credentials or committed secrets are present
- N/A: no secret-bearing configuration exists

### KISA-ENC-03 Protected storage or encryption for sensitive data at rest

Point-in-time question:
- Is there evidence that sensitive stored data or backups are protected at rest?

Expected evidence:
- storage encryption settings
- database encryption settings
- backup protection documentation

Code or config clues:
- storage-class encryption
- database flags
- backup repository controls

Judgement:
- Pass: sensitive stored data is clearly protected at rest
- Partial: protection exists but not consistently across systems
- Fail: no meaningful at-rest protection is visible
- N/A: no sensitive stored data is present

### KISA-ENC-04 Key or secret rotation readiness

Point-in-time question:
- Is there evidence that compromised secrets or keys can be rotated operationally?

Expected evidence:
- secret rotation procedure
- short-lived credential model
- managed key lifecycle settings

Code or config clues:
- IAM key lifetimes
- token issuance patterns
- automation for replacement

Judgement:
- Pass: rotation is supported and operationally realistic
- Partial: rotation is possible but manual, slow, or undocumented
- Fail: secrets appear static and difficult to rotate safely
- N/A: no relevant key or secret lifecycle exists

## Logging and auditability

### KISA-LOG-01 Authentication event logging

Point-in-time question:
- Are login successes, failures, and credential abuse signals logged?

Expected evidence:
- auth logs
- centralized log queries
- SIEM dashboard or retention config

Code or config clues:
- auth middleware logs
- identity provider audit logs
- OS auth logs

Judgement:
- Pass: auth events are logged and reviewable
- Partial: some auth events are logged but gaps remain
- Fail: auth activity is weakly logged or not reviewable
- N/A: no interactive auth path exists

### KISA-LOG-02 Privileged action auditability

Point-in-time question:
- Are privileged or security-sensitive actions traceable to an identity and event record?

Expected evidence:
- admin action logs
- change records
- audit trails tied to user or service identity

Code or config clues:
- admin controller logs
- infra change logs
- cloud audit events

Judgement:
- Pass: privileged actions are attributable and reviewable
- Partial: only some sensitive actions are captured
- Fail: privileged activity lacks usable traceability
- N/A: no privileged operations are exposed

### KISA-LOG-03 Log retention and review ownership

Point-in-time question:
- Is there evidence of retention and ownership for security-relevant logs?

Expected evidence:
- retention settings
- runbook ownership
- alert or review schedule

Code or config clues:
- log sink retention
- SIEM retention config
- ops docs for review cadence

Judgement:
- Pass: retention and ownership are both clear
- Partial: logs are retained but ownership or review is vague
- Fail: logs are ephemeral, unmanaged, or operationally ownerless
- N/A: logging is not in scope

### KISA-LOG-04 Sensitive data exclusion or masking in logs

Point-in-time question:
- Are secrets, credentials, or high-risk personal data excluded or masked in logs?

Expected evidence:
- logging policy
- redaction middleware
- sample logs

Code or config clues:
- logger configuration
- request/response logging filters
- exception traces containing secrets

Judgement:
- Pass: sensitive data is clearly filtered or masked
- Partial: most data is protected but risky exceptions remain
- Fail: logs expose secrets or sensitive user data
- N/A: no logging path is present

## Hardening and patch hygiene

### KISA-HRD-01 Unnecessary service or feature reduction

Point-in-time question:
- Are unnecessary services, endpoints, plugins, or admin features disabled?

Expected evidence:
- enabled-service inventory
- deployment feature flags
- runtime hardening notes

Code or config clues:
- service manifests
- disabled modules
- removed default endpoints

Judgement:
- Pass: unnecessary services are minimized
- Partial: some reduction exists but defaults remain exposed
- Fail: broad unused surface area remains enabled
- N/A: the platform is too minimal for this control

### KISA-HRD-02 Secure default configuration posture

Point-in-time question:
- Are security-relevant defaults explicitly hardened instead of left implicit?

Expected evidence:
- baseline config
- secure deployment defaults
- hardening documentation

Code or config clues:
- cookie flags
- debug mode settings
- directory listing or header exposure settings

Judgement:
- Pass: important defaults are explicitly hardened
- Partial: some defaults are hardened but gaps remain
- Fail: insecure defaults appear to be relied upon
- N/A: not applicable to the target

### KISA-HRD-03 Patch or dependency update visibility

Point-in-time question:
- Is there evidence that host, package, or framework updates are tracked and applied?

Expected evidence:
- dependency update process
- patch records
- scanning or upgrade workflow

Code or config clues:
- lockfile freshness
- dependency scanners
- host image update cadence

Judgement:
- Pass: patch and update posture is visible and active
- Partial: updates happen but are ad hoc or incomplete
- Fail: outdated or unsupported components are visible without control
- N/A: no mutable runtime surface exists

### KISA-HRD-04 Evidence of vulnerability response readiness

Point-in-time question:
- Is there an operational path to triage and fix discovered vulnerabilities?

Expected evidence:
- vulnerability workflow
- ticketing or severity handling
- release or hotfix process

Code or config clues:
- security advisory handling
- issue labels
- emergency release or patch notes

Judgement:
- Pass: the team can realistically triage and remediate security findings
- Partial: the process exists but is informal or weakly owned
- Fail: no credible vulnerability response path is visible
- N/A: not enough process surface is available to judge
