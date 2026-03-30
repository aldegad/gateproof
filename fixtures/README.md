# Gateproof Fixtures

Fixtures are small, stable, machine-readable target profiles.

They are not meant to be full applications.
They exist so Gateproof can evolve toward repeatable evaluation.

Current fixtures:

- `fixtures/kisa-ready-app/target.json`
  a mostly clean service that should score well on KISA basics
- `fixtures/high-risk-api/target.json`
  a deliberately risky service profile that should trigger multiple findings

Fixture fields are intentionally simple:

- `fixtureId`
- `intent`
- `targetType`
- `signals`
- `expectedStrengths`
- `expectedGaps`

These files are early building blocks for future automated evaluation.
