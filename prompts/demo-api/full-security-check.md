Use `gateproof:full-security-check` on `examples/demo-api/` and produce a markdown report.

Requirements:

- optimize for real exploitability and modern security depth
- prioritize authorization failures, SSRF, secrets, CI/CD trust, and abuse resistance
- explain likely exploit paths, not just checklist gaps
- include severity and remediation order
- include concrete evidence references to files when possible
- avoid claiming issues that are not supported by the provided target

Expected output shape:

1. Executive summary
2. Highest-risk findings
3. Findings by security theme
4. Likely exploit paths
5. KISA coverage vs real risk
6. Recommended remediation order
