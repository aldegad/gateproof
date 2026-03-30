# KISA vs Real Risk

Use this comparison note when a target looks compliant on paper but still exposes meaningful risk.

## Typical cases

- secrets externalized but weakly scoped or over-shared
- TLS enabled but session, authz, or SSRF controls are weak
- logging enabled but detection quality is poor
- password policy exists but MFA and device trust are missing
- patching appears current but supply-chain or CI/CD trust is weak

## Reporting rule

When this happens, explicitly call it out:

- "Likely acceptable for baseline compliance review"
- "Still risky under modern threat models because ..."

