---
name: implement-task
description: Implement a focused approved repository change while preserving LLM wiki coverage. Use after an approved feature plan, or for an unambiguous small fix; trace the affected flow, make the smallest change, verify it, and add new or materially changed features to wiki coverage.
---

# Implement Task

Before coding, read `AGENTS.md` and `docs/llm/INDEX.md`, trace the relevant
code path, and follow the approved `plan-feature` output. If no approved plan
exists and the change is not an unambiguous small fix, use `brainstorm-feature`
then `plan-feature`. Reuse local patterns, keep the diff focused, and leave one
runnable check for non-trivial logic. For a new or materially changed feature,
use `document-wiki` after verification to refresh its source-grounded coverage.
