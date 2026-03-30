Use `gateproof:full-security-check` on `examples/kisa-ready-service/` and produce a markdown report.

Requirements:

- optimize for real exploitability, but avoid inventing attack paths that the sample does not support
- highlight why this target is healthier than `examples/demo-api/`
- call out residual risk that still depends on deployment reality or deeper infrastructure review
- include file-based evidence where possible

Expected output shape:

1. Executive summary
2. Highest-risk findings
3. Findings by security theme
4. Likely exploit paths
5. KISA coverage vs real risk
6. Recommended remediation order
