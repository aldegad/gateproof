# Full Security Review Checklist

Use this checklist to drive practical reviews.

## Application layer

- authentication flow weaknesses
- broken or missing authorization checks
- injection and unsafe input handling
- unsafe file handling and path traversal
- SSRF and outbound request trust
- deserialization and code-execution risks
- insecure session and cookie handling

## Data and secret handling

- secrets committed, leaked, over-shared, or weakly scoped
- sensitive data exposure in logs or responses
- poor encryption choices or weak key handling
- backup, export, or snapshot exposure

## Platform and deployment

- admin surfaces reachable from the public internet
- weak reverse-proxy or ingress policy
- missing rate limits or abuse controls
- cloud IAM over-permissioning
- unsafe defaults in storage, queues, or functions

## SDLC and supply chain

- dependency risk without update or review flow
- missing provenance, lockfiles, or integrity checks
- unsafe CI/CD trust boundaries
- build secrets overexposed to jobs or contributors
- release process lacks approval or rollback safety

## Detection and resilience

- logging exists but does not answer incident questions
- no alert ownership for high-risk failures
- no visibility for auth abuse, privilege changes, or data export
- no operational plan for rapid containment or secret rotation

## Reporting rule

For each serious finding, try to state:

- what an attacker needs
- what they gain
- what control should have stopped it
- what the fastest acceptable fix is
