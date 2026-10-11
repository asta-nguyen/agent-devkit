# agent-devkit 0.7.1

This patch clarifies final review reports and lets a change archive resume
when its wiki delta is already merged or only partly merged.

## Changes

- Verify wiki blocks and merge side effects before adding a missing
  `Merged into docs/llm/` marker.
- Apply only pending delta blocks during a partial merge. Stop when a wiki
  block conflicts with both the baseline and approved replacement.
- Start final review reports with the result, missing check, and next action,
  including who will perform it and what outcome passes.
- Remove the duplicate wiki-impact report from `implement-task`.

## Verification

- `npm test` passes the plugin smoke checks.
- Temporary sample repositories covered a fully merged wiki without a marker
  and a partial merge; both archived with valid links and wiki validation.
- `git diff --cached --check` passes for the staged release.
