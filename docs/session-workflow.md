# Gateproof Session Workflow

Gateproof is designed to be used by the agent you are already talking to.

That means the normal flow is:

1. ask the current Codex or Claude session to use `gateproof:kisa-check` or `gateproof:full-security-check`
2. have that same session produce a markdown report
3. save the report to a repo path
4. capture and score the saved report with the local Gateproof scripts

## Why this is the default workflow

The skill already exists for the current agent.
Re-invoking a second external CLI agent from inside the repo is usually worse for this use case because:

- it starts a fresh session with less context
- it can drift into unnecessary repo exploration
- it is slower and less stable than the current interactive agent

Gateproof therefore treats external CLI re-entry as non-primary.

## Recommended flow

### 1. Run the skill in the current session

Example asks:

- `Use gateproof:kisa-check on examples/demo-api/ and write a markdown report.`
- `Use gateproof:full-security-check on examples/demo-api/ and prioritize real exploit paths.`

### 2. Save the report to the repo

Good locations:

- `docs/demo-reports/<name>.md`
- `artifacts/captures/<capture-id>/report.md`

### 3. Register and score the report

Example:

```bash
npm run artifacts:capture -- --from-manifest demo-api-full-security-report --source docs/demo-reports/my-full-security-run.md --capture-id my-full-security-run --engine session --model current-agent
```

Then:

```bash
npm run evals:captures
```

## Optional second pass

If you want a sanity check, use a sub-agent from the same session, not a totally separate external CLI workflow.

That second pass is useful for:

- checking whether the first report missed a key issue
- checking whether the first report overclaimed
- comparing KISA-style output and full-security output on the same target

## What the scripts are for

- `npm run artifacts:capture`
  records a saved report, writes metadata, and scores it
- `npm run evals:artifacts`
  scores checked-in reference reports
- `npm run evals:captures`
  scores captured runs

The scripts are for scoring and bookkeeping.
The main report authoring step is the current agent session itself.
