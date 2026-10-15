---
name: using-devkit
description: Use when starting work in a repository with agent-devkit installed, or when a request does not clearly map to a workflow skill.
---

# Using Devkit

Choose the owning workflow skill and follow its instructions. Read context
first: `read-codebase-context`, or `setup-codebase` on a first visit.

## Shared rules

- Name a new process artifact `YYYY-MM-DD-<issue-id>-<slug>` (before any type
  suffix) only when the task or a related artifact, including its filename,
  gives an issue ID; never infer one or rename an artifact.
- Link internally with relative Markdown links; convert legacy `[[...]]` links
  in any document you edit and report unresolvable targets.
- Never put process artifacts in or link them from `docs/llm/`.
- Commit or push only when the user explicitly asks (a commit only after final
  `review-and-verify` passes), within the repository's approval rules. One
  branch/PR per task; no locks or coordination tools. When resolving conflicts in
  `docs/agent-devkit/INDEX.md` or `docs/llm/INDEX.md`, keep every task link and
  verify all targets.

## Handoffs and stops

- Call the next skill directly; the user never retypes a skill name. Stop only
  for an approval gate, a user question, an action only the user can do, or a
  stalled fix loop (`implement-task`).
- Each route has one approval: the chat design (Bounded) or `design.md` +
  `tasks.md` (+ `delta.md`) together (Architectural). It authorizes
  implementation through final review; ask again only when scope, observable
  behavior, an interface, a schema, or risk changes materially. An instruction
  given before the approved files existed is not approval.
- A **route handoff** advances the work (design → plan → implement → review). A
  **repair handoff** fixes an artifact another skill needs; the repairing skill
  returns to its caller and never starts a route handoff.
- Stop where the user limited the request ("plan only"); never call
  `implement-task` without a request to implement.
- Implementation includes documentation: call `document-wiki`'s
  `## Task updates` when an existing wiki needs an in-scope update; stale or
  missing coverage blocks completion. Merge, archive, and relinking need no
  extra approval.
- Every turn that ends a skill, stops for the user, or hands off ends with:

  ```text
  Next: <skill or action, or none>
  Waiting on: agent | user — <exact approval, answer, or action needed>
  Done when: <observable result that completes the next step>
  ```

  `review-and-verify` keeps its own result block; its first three lines match.

## Change lifecycle

A change has a folder, `docs/agent-devkit/changes/<name>/`, only when it
produces a file (`design.md`, `tasks.md`, `delta.md`, `estimate.md`,
`decisions.md`, `handoff.md`); an Architectural change always has `design.md`
and `tasks.md`. Index a folder under `## Changes` in `docs/agent-devkit/INDEX.md`
when it is created, creating the heading if missing; `plan-feature` indexes an
Architectural folder only on joint approval.

- **Open:** revise files in place; `tasks.md`'s `## Approval Gate` records
  approval, not completion. Material changes reopen the gate.
- **Complete:** after final review passes, `review-and-verify` moves the folder
  to `changes/archive/<same name>/` and its link to `## Archived changes`. An
  archived change is history: add no requirements, tasks, or results, and start a
  new change for a follow-up.
- **Delta condition:** write `delta.md` only when a `docs/llm/`
  requirement needs `ADDED`, `MODIFIED`, or `REMOVED`; a domain with no page, no
  `docs/llm/`, or code restoring a documented requirement needs none. A delta
  targets only a `## Requirements` page: first convert a legacy
  `## Business rules` page with `document-wiki`'s
  `## Convert a legacy target page`.
- Earlier-version plans, specs, decision files, and `Required`/`Execution`
  gates are legacy: read `references/legacy.md` when you meet one.

## Task flows

Classify the task, state the class so the user can override it, then follow its
row. When in doubt take the heavier row; hidden complexity found later moves up,
never down.

| Task | Flow and owning skills |
|---|---|
| Spike or bug question ("can we…?", "is this a bug?") | Investigate → report evidence or a recommendation; no production code: `brainstorm-feature` (Spike), `systematic-debugging` (bug question) |
| Clear, small change (conditions below) | Impact check → code → review: `brainstorm-feature` → `implement-task` → `review-and-verify` |
| Bounded feature (any other change to an existing flow) | Settle decisions → chat design → approve → code → review: `brainstorm-feature` → `implement-task` → `review-and-verify` |
| Bounded bug | Reproduce → trace root cause → check fails → fix → check passes → review: `systematic-debugging` → `review-and-verify` |
| Architectural feature or bug | Clarify → `design.md` + `tasks.md` → **one joint approval** → code → review: `brainstorm-feature` → `plan-feature` → `implement-task` → `review-and-verify` |

- A clear, small change meets all four: the user named the exact change and file
  or symbol with an unambiguous result; the impact check keeps every caller,
  test, config, and wiki page in scope; it touches no public API, schema,
  dependency, CI, security boundary, or data-loss risk; it is not a bug.
  `brainstorm-feature` confirms; if any fails, use the Bounded feature row.
- A bounded bug changes no shared interface, contract, or component boundary;
  when its class is unclear, start with `systematic-debugging`, which moves
  architectural bugs up.

Other routes: `plan-feature` revises an open `tasks.md` or legacy plan (also for
a material decision found during implementation); `brainstorm-feature` revises
an open Bounded `delta.md`; `implement-task` resumes an approved change.
