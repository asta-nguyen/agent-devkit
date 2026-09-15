# agent-devkit 0.4.2

This release makes workflow state and review evidence explicit across
brainstorming, planning, implementation, and verification.

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
- Adds `EVALS.md` scenario 25 for workflow state and review evidence.

## Verification

- `npm test` passed with the plugin smoke checks.
- `git diff --check` passed.
- Scenario 25 passed in fresh sessions against a disposable repository.
