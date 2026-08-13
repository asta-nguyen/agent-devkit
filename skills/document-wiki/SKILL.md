---
name: document-wiki
description: Use when a repository has no LLM wiki yet, when the wiki is only a skeleton, or when features are undocumented or stale.
---

# Document Wiki

Create or refresh the target repository's `docs/llm/` from verified source
code. This is the one-stop wiki workflow: do not hand the user off to the
other wiki skills.

## Workflow

1. Resolve the target repository from the user's path or the current directory.
   Read `AGENTS.md`. If `docs/llm/` is missing, run the repository's
   `setup-codebase` procedure inline. Preserve every existing file.
2. Read `docs/llm/AGENTS.md`, `INDEX.md`, and all existing wiki pages. Treat the
   wiki as **empty** when it is missing, contains only the setup skeleton, or
   its pages still contain placeholder text such as `Populate this page` or
   `No pages yet`.
3. Build a current feature list from behavior, not filenames. Inspect routes,
   commands, scripts, workers/jobs, public APIs, manifests, tests, and README
   instructions. Use OpenEZ MCP (`code_query`, `code_context`,
   `graph_neighbors`) when available; otherwise use `openez status/index` and
   direct `rg`/file reads. Read each feature's entry point, callers, error
   paths, and relevant tests before documenting it.
4. Before editing any page, report the repository's **domain** and a
   **feature inventory**. Derive the domain only from explicit repository
   evidence such as `README.md`, manifests, route names, commands, or product
   docs; if it is not established, say so. For every feature show:

   ```text
   Domain: <one sentence, or "not established by repository evidence">

   [ ] / [x] / [~] Feature — what a user or operator can do
       Entry: <route, command, job, or API>
       Sources: <repository paths>
       Wiki: <page or "missing">
   ```

   Use `[ ]` for undocumented, `[x]` for current coverage, and `[~]` for
   stale or partial coverage. Do not report only the page names; the feature
   and its entry point are required.
5. If the wiki is empty, state that every verified `[ ]` feature will be
   selected automatically, then continue. If the wiki has real content,
   present the `[ ]` and `[~]` features as a short selectable list and wait for
   the user to choose. Do not edit pages before the selection. If the user says
   “all”, select all listed features.
6. Group related behavior into a small number of pages under the existing
   `architecture/`, `workflows/`, and `decisions/` folders. For each selected
   feature, create or update the smallest relevant page with:

   ```md
   # Feature name

   ## Flow

   Source-grounded behavior and important error paths.

   ## Related

   - [[architecture/overview|Architecture overview]]

   ## Sources

   - `path/to/source`
   - `path/to/test`
   ```

   Keep prose concise. Never turn a helper, file, or inferred product idea
   into a feature. If evidence is missing, omit the claim or label it an open
   question. Use Obsidian wikilinks (`[[path/to/page|Label]]`) for internal
   wiki pages; use ordinary Markdown links only for external URLs. Add a
   `## Related` section to every non-overview page when a related wiki page
   exists. YAML frontmatter is optional and should not be invented just for
   formatting.
7. After page content exists, update `docs/llm/INDEX.md` with working links and
   append one dated entry to `docs/llm/LOG.md`. Update `docs/llm/FEATURES.md`
   only if that file already exists; do not create a second tracking system.
8. Verify that every new source path exists, every internal wikilink resolves,
   every index link resolves, and `git diff --check` passes. The final report
   must repeat the domain, list the features documented, list verified features
   skipped, and list unresolved evidence questions. Never report only “pages
   updated”.

Do not modify application code, install dependencies, or invent architecture.

## Red flags

| Thought | Reality |
|---|---|
| "I'll document this inferred feature" | If evidence is missing, omit the claim or label it an open question. |
| "I'll update the wiki without reading source" | Source establishes facts. Index accelerates discovery. Read the code. |
| "I'll skip the feature inventory and just write pages" | Inventory first, user selects, then write. No exceptions. |
| "I'll modify application code to match the wiki" | Wiki follows source, never the reverse. |
| "I'll report 'pages updated' and stop" | Report domain, features documented, features skipped, unresolved questions. |
