# agent-devkit 0.5.0

This release makes wiki freshness depend on current source and tests, and
clarifies how agents handle verification gaps, team workflows, and pilot
measurements.

## Changes

- Verify wiki claims against current source and tests in the current run instead
  of relying on commit snapshots or `LOG.md`; preserve legacy logs without
  reading or updating them.
- Distinguish verification limits from confirmed content gaps. Continue feasible
  checks, and offer refreshes only for confirmed omissions or contradictions.
- Detect conflicting root/wiki `AGENTS.md` instructions and ask the user to
  resolve them rather than silently following either policy.
- Clarify bounded bug, small feature, and architectural workflows while
  preserving approval and verification gates.
- Add team guidance for one branch/PR per task, issue IDs in new artifact names,
  and conflict-safe updates to shared indexes.
- Make OpenEZ optional based on code-search needs and index health, not
  repository size.
- Expand the pilot to track active task and wiki time, wiki pages and source/test
  files read, documentation conflicts, and user/reviewer wait time separately.

## Verification

- `npm test` passed with the plugin smoke checks.
- `git diff --check` passed.
