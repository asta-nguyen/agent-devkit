---
name: design-wiki
description: Design a source-grounded project LLM wiki before creating or restructuring pages. Use when starting a wiki, changing its schema, adding a major documentation area, or when the desired wiki scope is ambiguous.
---

# Design Wiki

Do not create a broad wiki from an unexamined repository. Establish a small,
reviewable design first.

1. Read the root `AGENTS.md`, `docs/llm/AGENTS.md`, `docs/llm/INDEX.md`, and
   the relevant repository files.
2. State the wiki's audience, questions it should answer, source boundaries,
   and pages it needs. Reuse `architecture/`, `workflows/`, and `decisions/`
   unless the repository needs a different structure.
3. Present the design in short sections: scope, source rules, page tree, and
   maintenance workflow. Mark choices without evidence as decisions needing
   user approval.
4. Get approval before creating a new documentation area or changing the
   schema. For a small, already-specified addition, record the assumption and
   proceed.
5. Hand the approved change to `plan-wiki-refresh`.

Keep the design proportional: add a folder only when at least one source-backed
page belongs in it. The source code and Git history remain authoritative; the
wiki is a maintained view of them.
