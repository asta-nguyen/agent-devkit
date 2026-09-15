# agent-devkit 0.4.3

This release makes repository conventions, workflow state, review evidence,
and whole-repository simplicity audits explicit across the coding workflow.

## Changes

- Carries exact cross-task rules into plans through `## Global Constraints`.
- Maps approved edge cases to implementation tasks and concrete verification.
- Allows session-only `Ruling R<n>` decisions for reversible,
  behavior-equivalent implementation details.
- Requires review findings to cite `path:line` and reports unverifiable
  requirements as failing `cannot verify` spec gaps.
- Calibrates spec and plan self-review against behavior, scope, correctness,
  and execution rather than stylistic preferences.
- Adds recommendation-depth and adaptive edge-case coverage to brainstorming.
- Captures repository conventions from local evidence with approval,
  provenance, and scoped enforcement.
- Adds standalone `lean-audit` for report-only, evidence-backed simplicity
  findings.
- Adds `EVALS.md` scenarios 25, 26, and 27 for the workflow improvements.

## Verification

- `npm test` passed with the plugin smoke checks.
- `git diff --check` passed.
- Scenarios 25, 26, and 27 passed in fresh sessions against disposable
  repositories.
