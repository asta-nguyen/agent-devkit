---
name: implement-task
description: Use after the user approves a bounded change or an approved feature plan exists and code changes are ready to begin.
---

# Implement Task

## Before coding

1. Read `AGENTS.md` and, when it exists, `docs/llm/INDEX.md` for project
   conventions and affected wiki pages. A missing wiki must not block work.
2. If application source exists, trace the relevant code path using
   `read-codebase-context` or direct file reads. Understand callers, data flow,
   and error paths before editing. For a source-less new project, read the
   approved spec and plan, then create the first planned entry point; state that
   callers and existing error paths do not exist yet.
3. Follow the approved `plan-feature` output when one exists. Read its
   `## Approval Gate` before editing application code:
   - `Required: yes` proceeds only with `Status: approved`. Missing or `pending`
     status means stop and request approval of the complete plan.
   - `Required: no` proceeds with `Status: not-required`.
   - For a legacy plan with no gate, inspect its impact. Public API, data schema,
     dependency, CI, or broad file changes require approval before proceeding.

   Approval given before the plan existed does not satisfy a required gate.
   Without a plan, require an approved bounded design from `brainstorm-feature`;
   otherwise use `brainstorm-feature` before editing.
4. After tracing the real flow, apply this implementation ladder in order and
   stop at the first option that satisfies the approved behavior:

   1. Does this need to exist at all? Skip speculative work (YAGNI).
   2. Does it already exist in this codebase? Reuse the module, helper, type, or
      pattern.
   3. Does the standard library do it? Use it.
   4. Does a native platform feature cover it? Use it.
   5. Does an already-installed dependency solve it? Use it.
   6. Only then, write the minimum clear new code that works.

   Do not use minimalism to remove explicit requirements, trust-boundary
   validation, security, accessibility, or error handling that prevents data
   loss.

## During implementation

1. Reuse local patterns. Keep the diff focused on one logical change.
2. Make the smallest change that satisfies the task. Do not refactor
   unrelated code.
3. If you hit a bug or unexpected behavior, switch to `systematic-debugging`.
   Do not guess-and-check.
4. Run the smallest relevant check after each non-trivial change.
5. Do not create commits during implementation. Even when the user requests a
   commit, wait until final `review-and-verify` passes.

## After implementation

1. **REQUIRED SUB-SKILL:** Use `review-and-verify` to review the diff, run fresh
   verification, and confirm no stale documentation.
2. If the review result is `Status: fail`, fix only the listed blockers, run
   the smallest relevant check, and repeat `review-and-verify` once. If the
   second review still fails, stop and report the remaining blockers; do not
   claim completion.
3. For a new or materially changed feature, use `document-wiki` after
   verification to refresh its source-grounded coverage.

## Red flags

| Thought | Reality |
|---|---|
| "I'll fix this bug while I'm here" | Scope creep. File a separate task. |
| "The change is obvious, no need to trace callers" | Obvious changes break callers you did not read. |
| "I'll skip the check, it's a small change" | Small changes break things. Run the check. |
| "I'll verify at the end" | Verify after each non-trivial change. Catch errors early. |
| "Removing this guard makes the diff smaller" | Smaller is not simpler when it weakens a protected boundary. |
| "The spec was approved, so the plan must be approved" | A required execution-plan gate is separate and must say `Status: approved`. |
