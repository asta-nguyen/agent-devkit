# agent-devkit 0.8.0

The developer gives a task, answers material questions, and approves the
solution when needed. The agent runs understand → implement → review and
finish, including affected documentation in an existing wiki.

## Changes

- Automatic skill handoffs; Architectural work has one joint approval of
  design.md, tasks.md, and any delta.md. Tasks.md is the plan.
- A short chat plan summary covers goal, scope/impact, ordered tasks,
  verification, documentation, and risks/decisions before approval.
- Clarification reads source first and asks only unresolved material questions,
  with relevant edge cases mapped to tasks and verification.
- Task progress records checks/results; revisions preserve completed work and
  older plans backfill progress from current source and fresh checks.
- In-scope fixes continue while they make progress; stalled fixes and material
  scope/behavior changes stop for the necessary decision.
- Documentation updates automatically within task scope, including affected
  callers outside the diff. Delta merge remains resumable and happens before
  final review; archive only moves and relinks after verification.
- No wiki is silently created by a code task. Standalone wiki setup and feature
  selection remain separate workflows.
- Bootstrap waits for approval; nested debugging returns to implementation;
  equivalent plan revisions do not ask for approval again.
- English/Vietnamese README and guides describe the same workflow; plugin and
  marketplace metadata use 0.8.0.

## Verification

- `npm test` (plugin-smoke): passed — plugin loading, reference paths, version
  consistency, and wiki validator fixtures.
- `git diff HEAD --check`: clean.
- document-wiki validator on this repository: 3 files, 2 requirements,
  0 errors, 0 warnings.
- Eval 50 (change layer/archive): passed 2026-10-09 under the prior
  merge-at-archive attribution; the merge mechanics are unchanged.
- Evals 51–52 (next step, task documentation): manual artifact walkthroughs
  only; fresh host execution remains not run.

## Publishing

Committed and tagged v0.8.0 locally. Push and publication are not performed.
