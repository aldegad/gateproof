# Gateproof Modern Security Control Model

Use this model to keep `gateproof:full-security-check` findings concrete and repeatable.

## Control ID format

Format:

```text
MOD-<DOMAIN>-<NUMBER>
```

Examples:

- `MOD-AUT-01`
- `MOD-APP-03`
- `MOD-SUP-02`

## Domain codes

| Domain | Code | Meaning |
|------|------|---------|
| Authentication and session | `AUT` | login flow, MFA posture, session lifecycle, identity trust |
| Application and authorization | `APP` | authz boundaries, input validation, injection, SSRF, file handling |
| Secrets and data protection | `DAT` | secrets, sensitive data, crypto, storage, data exposure |
| Supply chain and delivery | `SUP` | dependencies, CI/CD trust, provenance, build and release security |
| Operations and resilience | `OPS` | logging, monitoring, abuse controls, response readiness, cloud exposure |

## Review rule

For each control:

1. State the attacker or abuse path the control is meant to stop.
2. Look for technical evidence first.
3. Record whether the weakness is exploitable, merely risky, or primarily an operational gap.
4. Use `Critical`, `High`, `Medium`, or `Low`.

## Reporting rule

Each serious finding should include:

- control ID
- severity
- exploit path or failure mode
- evidence seen
- missing or weak control
- fastest acceptable remediation

