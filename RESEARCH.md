# Gateproof Research Notes

## Why Gateproof is split in two

Gateproof is built around a simple observation:

- teams often need to satisfy local Korean review expectations
- teams also need a deeper modern security review that goes beyond checklist language

Those two jobs overlap, but they are not identical.
When a single tool pretends they are the same, users either get shallow "compliance-only" output or noisy "security theater" output that does not map to how local reviews are actually discussed.

Gateproof keeps the tracks separate on purpose.

## Track 1: KISA-oriented review

This track optimizes for:

- readiness conversations
- evidence-oriented reporting
- pass, partial, fail style control summaries
- admin, access, encryption, logging, and hardening basics

This is the right lens when the user cares about:

- audit preparation
- vendor review readiness
- internal approval gates
- Korean enterprise or public-sector style expectations

## Track 2: Full-security review

This track optimizes for:

- practical exploitability
- application and infrastructure depth
- threat-model-aware remediation order
- modern delivery and supply-chain risk

This is the right lens when the user cares about:

- what an attacker would actually do first
- whether the service is safe to ship
- whether controls hold up outside a checklist

## Methodology sources

Gateproof does not claim to reproduce any single framework in full.
Instead, it combines useful instincts from multiple sources.

### KISA-oriented inputs

- KISA-style control family thinking
- evidence and operational proof patterns
- configuration and account management expectations
- logging, encryption, patching, and access hygiene

### Full-security inputs

- OWASP Top 10 style risk framing
- OWASP ASVS style control depth
- NIST SSDF style secure delivery expectations
- modern secrets, CI/CD, cloud, and abuse-resistance practice

## Design principles

### 1. Separate "passing" from "being secure"

Both matter.
Neither should be hidden behind the other.

### 2. Prefer concrete control language over vague advice

Each skill should move toward:

- named controls
- review questions
- expected evidence
- clear decision criteria

### 3. Make trust visible

Good security tools are not trusted because they say "secure."
They are trusted because they expose:

- current scope
- current limits
- example outputs
- repeatable evaluation assets

### 4. Keep examples close to the product

Demo targets, fixtures, and expected findings live in the repo so contributors can see what "good output" means.

## Current limitations

- the control sets are curated MVP subsets, not complete framework mappings
- demo reports are written examples, not generated from an evaluator
- fixture and eval formats are stable enough to build on, but still early

## Why this looks more like a product repo than a prompt dump

The long-term goal is not just better prompts.
The long-term goal is a review system with:

- reusable methodology
- stable expectations
- testable sample targets
- inspectable outputs

That is why Gateproof now includes:

- examples
- demo reports
- fixtures
- eval definitions
- status and development documents
