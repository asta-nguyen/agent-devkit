---
name: implement-task
description: Use after an approved feature plan exists, or for an unambiguous small fix requiring code changes.
---

# Implement Task

## Before coding

1. Read `AGENTS.md` and `docs/llm/INDEX.md` for project conventions and
   affected wiki pages.
2. Trace the relevant code path using `read-codebase-context` or direct
   file reads. Understand callers, data flow, and error paths before
   editing.
3. Follow the approved `plan-feature` output. If no approved plan exists
   and the change is not an unambiguous small fix, use `brainstorm-feature`
   then `plan-feature`.

## During implementation

1. Reuse local patterns. Keep the diff focused — one logical change per
   commit.
2. Make the smallest change that satisfies the task. Do not refactor
   unrelated code.
3. If you hit a bug or unexpected behavior, switch to `systematic-debugging`.
   Do not guess-and-check.
4. Run the smallest relevant check after each non-trivial change.

## After implementation

1. Hand off to `review-and-verify` — review the diff, run fresh
   verification, and confirm no stale documentation.
2. For a new or materially changed feature, use `document-wiki` after
   verification to refresh its source-grounded coverage.

## Red flags

| Thought | Reality |
|---|---|
| "I'll fix this bug while I'm here" | Scope creep. File a separate task. |
| "The change is obvious, no need to trace callers" | Obvious changes break callers you did not read. |
| "I'll skip the check, it's a small change" | Small changes break things. Run the check. |
| "I'll verify at the end" | Verify after each non-trivial change. Catch errors early. |
