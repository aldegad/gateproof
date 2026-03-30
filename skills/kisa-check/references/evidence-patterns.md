# KISA Evidence Patterns

Use this reference to keep KISA-style reviews concrete.

## Evidence types to look for

- configuration files
- infrastructure as code
- CI/CD settings
- runtime environment variables
- access-control rules
- log retention settings
- screenshots or exported admin settings
- policy or operational documents

## Common evidence questions

### Identity and account control

- Are privileged accounts clearly separated from normal users?
- Is there evidence of password or MFA policy?
- Is shared-account usage prohibited or at least controlled?

### Access control

- Can you prove which admin surfaces are exposed?
- Is there evidence of network filtering, VPN, allowlists, or private-only access?
- Are storage and database permissions narrowly scoped?

### Encryption and secrets

- Is there evidence that secrets are externalized?
- Is transport protection visible from config, ingress, reverse proxy, or app settings?
- Is sensitive data storage or backup protection documented?

### Logging and audit

- Is logging enabled in a way that supports review and traceability?
- Are privileged or sensitive actions auditable?
- Is there evidence of retention, review, or alert ownership?

### Hardening and patching

- Can you show baseline hardening settings rather than assuming defaults?
- Is dependency or host patch cadence visible?
- Is unsupported software still present?

## Reporting rule

If a control may exist but cannot be evidenced from the available material, record:

- what you expected to see
- what you actually saw
- why the evidence is insufficient

