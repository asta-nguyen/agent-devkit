---
name: implement-task
description: Implement a focused repository change while preserving LLM wiki coverage. Use when coding a feature or behavior change; trace the affected flow, make the smallest change, verify it, and add the feature to wiki coverage when it is new or materially changed.
---

# Implement Task

Before coding, read `AGENTS.md` and `docs/llm/INDEX.md`, trace the relevant
code path, and state the smallest change that satisfies the task. Reuse local
patterns, keep the diff focused, and leave one runnable check for non-trivial
logic. For a new or materially changed feature, invoke
`discover-wiki-features` after verification so it appears in coverage; then
follow `plan-wiki-refresh` and `refresh-llm-wiki` when the user selects it.
