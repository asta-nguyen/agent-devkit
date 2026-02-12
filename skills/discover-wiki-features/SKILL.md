---
name: discover-wiki-features
description: Discover source-backed application features that lack LLM wiki coverage. Use when bootstrapping a full project wiki, auditing documentation coverage, or presenting a selectable feature checklist in an agent UI before creating documentation.
---

# Discover Wiki Features

Use AI code reading to identify user-meaningful features and flows. Do not
classify files, folders, or every helper as a feature.

1. Read `AGENTS.md`, `docs/llm/AGENTS.md`, `INDEX.md`, existing wiki pages,
   entry points, routes/commands, relevant callers, and tests.
2. Build a feature list from behavior: what a user or developer can do, what
   starts the flow, and the source files that establish it.
3. Match each feature to an existing wiki page. Mark it:

   ```text
   [ ] undocumented
   [x] covered
   [~] stale or partial
   ```

4. Present the list in chat for the agent UI to render as selectable controls.
   Include a one-line summary and source paths for each feature. Do not create
   a custom UI or assume a checkbox protocol in a CLI.
5. Save the same list as `docs/llm/FEATURES.md` only after the user asks to
   persist coverage. Keep it source-linked and update it after documentation
   is created.
6. For selected items, use `plan-wiki-refresh`, then `refresh-llm-wiki`.

If a feature cannot be verified from accessible evidence, label it as an open
question and use `ingest-wiki-sources`; never list inferred behavior as fact.
