# agent-devkit 0.4.1

This release improves how `brainstorm-feature` clarifies ambiguous work before
design and implementation.

## Changes

- Builds an internal decision tree from the intended user, problem, success
  criteria, scope, permissions, data lifecycle, interfaces, failure recovery,
  rollout, and verification needs.
- Asks one material question at a time, with known facts and a recommended
  answer plus its main trade-off.
- Follows vague, partial, or contradictory answers with a concrete
  clarification instead of silently choosing an interpretation.
- Avoids asking for repository facts or low-impact implementation details that
  the agent can discover or that do not affect the design.
- Adds `EVALS.md` scenario 24 for deep feature clarification.

## Verification

- `npm test` passed with the plugin smoke checks.
- `git diff --check` passed.
- The updated skill was exercised against a disposable repository and produced
  a concrete recommendation before asking for confirmation.
