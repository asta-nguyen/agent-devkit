---
name: refresh-llm-wiki
description: Use AI to trace source code and maintain source-grounded project LLM wiki pages. Use after selecting features for documentation, after a planned wiki refresh, or when source changes make an existing architecture, workflow, or decision page stale.
---

# Refresh LLM Wiki

Write wiki pages from evidence, not file-name heuristics.

1. Read `AGENTS.md`, `docs/llm/AGENTS.md`, `INDEX.md`, `LOG.md`, the plan,
   selected feature(s), and existing related pages.
2. Use `read-codebase-context`, then trace each selected flow through its real
   entry point, callers, behavior, error paths, and relevant tests. Use
   `ingest-wiki-sources` if evidence is unavailable.
3. Create or update only the relevant page under `architecture/`,
   `workflows/`, or `decisions/`. Use Obsidian-compatible Markdown:

   ```md
   # Feature name

   ## Flow

   ...

   ## Related

   - [[architecture/overview]]

   ## Sources

   - `path/to/source.js`
   - `path/to/source.test.js`
   ```

4. Update `INDEX.md` only after the page exists. Append `LOG.md` with the
   source paths and pages changed.
5. Update `FEATURES.md` when it exists: selected items become `[x]`; incomplete
   evidence remains `[~]` or an open question.
6. Run `review-and-verify` before declaring the refresh complete.

Keep generated prose concise. A page should explain a flow and point to its
evidence; it must not duplicate source code or invent undocumented decisions.
