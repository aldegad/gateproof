# Demo API

This is a deliberately imperfect sample target for Gateproof demos.

It is designed to show the difference between:

- `gateproof:kisa-check`
- `gateproof:full-security-check`

## Intentional issues

- weak secret handling
- public admin exposure
- weak authz patterns
- SSRF-prone fetch behavior
- over-broad CI/CD trust
- logging of sensitive data

The sample is illustrative only. It is not meant to run as-is in production.

