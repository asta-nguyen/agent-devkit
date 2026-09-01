---
name: using-devkit
description: Use at the start of every task in a repo with agent-devkit installed, including feature work, bug fixes, reviews, documentation, estimates, or unfamiliar requests. Also use when deciding which devkit skill to run.
---

# Using Devkit

Choose the owning workflow skill, then follow that skill's instructions.

## Priority rule

**Read context before changing code.** Run `read-codebase-context` (or
`setup-codebase` on a first visit) before any edit.

## Routing map

| Task type | Skill |
|---|---|
| First visit to a repo missing context | `setup-codebase` |
| Build a semantic index for a non-trivial repo | `setup-openez` |
| Understand code before changing it | `read-codebase-context` |
| Checkpoint unfinished work before pausing | `context-handoff` |
| Document existing app features | `document-wiki` |
| Architectural feature or bug | `brainstorm-feature` → `plan-feature` → `implement-task` → `review-and-verify` |
| Per-task AI-assisted estimate (optional) | `estimate-feature` |
| Implement, then review and verify | `implement-task` → `review-and-verify` |
| Bounded or spike bug | `systematic-debugging` |

Run skills in the listed order when a task spans several. The arrow (`→`)
marks a required handoff: the left skill's output feeds the right one.

### Bug classification

A "fix issue A" request is not one shape. Use the vocabulary owned by
`brainstorm-feature` and enforced during `systematic-debugging`:

- **Spike bug** — the real question is "is this actually a bug?" or "what is
  happening?" Route to `systematic-debugging` for an evidence-backed answer.
- **Bounded bug** — the fix stays within an existing flow without changing a
  shared interface, contract, or component boundary. Route to
  `systematic-debugging`.
- **Architectural bug** — the fix changes a shared interface, contract, or
  component boundary, or spans multiple components. Route through the full
  architectural workflow in the table.

When the type is not yet clear from the request, route to
`systematic-debugging`; it classifies after investigation (Phase 4 step 1) and
hands off to `brainstorm-feature` if the bug turns out to be architectural.

This skill routes only. Do not use it without the full devkit skill set.

## Red flags

| Thought | Reality |
|---|---|
| "It's just a quick fix, skip the skill" | Quick fixes still touch callers and contracts. `read-codebase-context` first, every time. |
| "Routing is overhead, I'll just start editing" | Improvising skips context and verification; the devkit skills exist to enforce both. |
| "I can fold `review-and-verify` into `implement-task`" | They are separate for a reason: the implementer is not its own reviewer. |
| "I'll classify after I start fixing" | Classification decides the route. Classify before routing; re-classify only upgrades to the heavier path mid-task. |
