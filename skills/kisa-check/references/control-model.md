# Gateproof KISA Control Model

Use this model to keep `gateproof:kisa-check` findings consistent.

## Control ID format

Format:

```text
KISA-<DOMAIN>-<NUMBER>
```

Examples:

- `KISA-ACC-01`
- `KISA-ACS-03`
- `KISA-ENC-04`

## Domain codes

| Domain | Code | Meaning |
|------|------|---------|
| Account and identity | `ACC` | account safety, password, admin identity, MFA-adjacent controls |
| Access control and exposure | `ACS` | network reachability, admin surface exposure, privilege boundaries |
| Encryption and secret handling | `ENC` | transport security, secret externalization, protected storage |
| Logging and auditability | `LOG` | traceability, reviewability, retention, privileged action logging |
| Hardening and patch hygiene | `HRD` | secure defaults, unnecessary service removal, patch posture |

## Review rule

For each control:

1. Ask the control question directly.
2. Look for technical evidence first.
3. Record the missing evidence explicitly if proof is absent.
4. Use `Pass`, `Partial`, `Fail`, or `N/A`.

## Reporting rule

Always report:

- control ID
- control title
- judgement
- short rationale
- evidence seen
- evidence missing
- next action

