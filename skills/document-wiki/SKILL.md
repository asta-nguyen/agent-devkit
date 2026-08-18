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
   `setup-codebase` procedure inline. Preserve every existing file. Before
   writing links, find the Obsidian vault root: use the nearest ancestor of
   `docs/llm/` containing `.obsidian/`. Internal wikilink targets are relative
   to that vault root. For example, with `docs/.obsidian/`, link to
   `docs/llm/architecture/overview.md` as `[[llm/architecture/overview|Architecture overview]]`.
   If no vault exists, retain the existing `docs/llm`-relative form.
2. Read `docs/llm/AGENTS.md`, `INDEX.md`, and all existing wiki pages. Treat the
   wiki as **empty** when it is missing, contains only the setup skeleton, or
   its pages still contain placeholder text such as `Populate this page` or
   `No pages yet`.
   If the repository has no application source, report that no verified behavior
   exists, preserve the skeleton, and stop. Do not create an overview, feature
   pages, or a `LOG.md` entry from proposed specs or plans.
3. Build a domain map and current feature list from behavior, not filenames.
   Inspect routes, commands, scripts, workers/jobs, public APIs, manifests,
   tests, and README instructions. Use OpenEZ MCP (`code_query`,
   `code_context`, `graph_neighbors`) when available; otherwise use `openez
   status/index` and direct `rg`/file reads. Group behavior by product domain
   such as authentication, billing, projects, or administration only when the
   repository evidence establishes that boundary. For the inventory, inspect
   enough evidence to establish each user-visible behavior and entry point;
   reserve the end-to-end trace for features selected in step 6.
4. Determine coverage before writing deep feature pages. Read every page's
   `## Sources`, then find the latest `LOG.md` entry that names that exact wiki
   page. In a Git repository, compare its source paths with that entry's source
   commit at read time
   using `git diff <commit> -- <source paths>` and inspect
   `git status --porcelain -- <source paths>` for uncommitted or untracked
   changes. Mark coverage `[~]` when either check reports a change, a page is
   partial, omits a material flow stage or source-established side effect, or
   its claims disagree with source. Never use an overview log entry
   to establish a deep page's freshness. If Git history or a page-specific log
   entry is unavailable, do not claim the page is current without re-reading its
   source. Report the repository's **domain map** and a **feature inventory**:

   ```text
   Domain: <name> — <scope, or "not established by repository evidence">

   [ ] / [x] / [~] Feature — what a user or operator can do
       Entry: <route, command, job, or API>
       Sources: <repository paths>
       Wiki: <page or "missing">
   ```

   Use `[ ]` for undocumented, `[x]` for current coverage, and `[~]` for stale
   or partial coverage. Do not report only page names; the domain, feature, and
   entry point are required.
5. Create or refresh the baseline map before deep documentation. If
   `architecture/overview.md` is missing or stale, create its folder and write
   the smallest source-grounded page containing the repository purpose, major
   entry points, a domain table, cross-domain dependencies, and `## Sources`.
   Update `INDEX.md` to link this overview and list every discovered domain.
   The baseline map is automatic even for an empty wiki; it is an orientation
   page, not permission to document every feature in depth.
6. Present `[ ]` and `[~]` features grouped by domain as a short selectable
   list and wait for the user to choose deep coverage. Apply this selection gate
   even when the wiki was empty. If the user says “all”, select all listed
   features.
7. Group selected behavior into the smallest set of evidence-backed categories.
   Use only categories that have a real page to contain:

   | Category | Use for |
   |---|---|
   | `architecture/` | Cross-cutting structure, boundaries, and API topology |
   | `domains/` | Domain concepts, state models, and business rules |
   | `workflows/` | User or operator flows across multiple components |
   | `integrations/` | Stripe, storage, email, and other external systems |
   | `operations/` | Jobs, cron, deployment, maintenance, and runbooks |
   | `decisions/` | Source-backed architectural decisions or existing ADRs |

   A page belongs in the category that best describes its primary subject; link
   related categories instead of duplicating the page. Create a folder only
   when writing its first real page; never create placeholder folders. For
   small repositories, `architecture/`, `decisions/` and `workflows/` may be sufficient.
   Before documenting each selected feature, trace it end to end:

   ```text
   entry point and inbound caller
   → service/use-case callees
   → persistence and state changes
   → storage/external adapters
   → jobs, events, email, and notifications
   → authorization, constraints, and error paths
   → relevant tests
   ```

   Continue until the source establishes the user-visible outcome and material
   side effects. Do not stop at a controller, but do not list unrelated helpers
   merely because they are reachable. Then create or update the smallest
   relevant page with:

   ```md
   # Feature name

   ## Flow

   Source-grounded happy path, state changes, external side effects, constraints,
   and important error paths.

   ## Related

   - [[architecture/overview|Architecture overview]]

   ## Sources

   - `path/to/source`
   - `path/to/test` (when a relevant test exists)
   ```

   `## Sources` must list every inspected file that materially supports the
   documented flow; do not pad it with unrelated paths. Keep prose concise.
   Never turn a helper, file, or inferred product idea
   into a feature. If evidence is missing, omit the claim or label it an open
   question. Use Obsidian wikilinks (`[[path/to/page|Label]]`) for internal
   wiki pages, with targets relative to the vault root determined in step 1;
   use ordinary Markdown links only for external URLs. Add a
   `## Related` section to every non-overview page when a related wiki page
   exists. YAML frontmatter is optional and should not be invented just for
   formatting. Never invent a test path; if a relevant search finds none, state
   `Tests: none found` instead.
8. Update `docs/llm/INDEX.md` with working links and append one structured entry
   to `docs/llm/LOG.md` after the baseline or selected pages change:

   ```md
   ## YYYY-MM-DD

   Source commit at read time: <git HEAD SHA, or "not a Git repository">

   - Page: <wiki page created or refreshed>
     Sources:
   - <source path checked for this page>
   ```

   This records the source snapshot used for freshness checks. It is not a
   commit created by the agent and does not imply the wiki changes were committed.

   Update `docs/llm/FEATURES.md` only if that file already exists; do not create
   a second tracking system.
9. Verify that every new source path exists, every internal wikilink resolves
   from the vault root, every index link resolves, and `git diff --check` passes. The final report
   must repeat the domain map, list the baseline and features documented, list
   verified features skipped, and list unresolved evidence questions. Never
   report only “pages updated”.

Do not modify application code, install dependencies, or invent architecture.
Do not document proposed specs or implementation plans here; `docs/llm/`
describes only verified current behavior grounded in source and tests.

## Red flags

| Thought | Reality |
|---|---|
| "I'll document this inferred feature" | If evidence is missing, omit the claim or label it an open question. |
| "I'll update the wiki without reading source" | Source establishes facts. Index accelerates discovery. Read the code. |
| "The controller shows the whole flow" | Trace downstream services, state changes, external adapters, jobs, and notifications to the user-visible outcome. |
| "Email or storage is just an implementation detail" | A source-established external side effect or state change is part of the workflow. Document it. |
| "The wiki is empty, so I can document every feature now" | Write the baseline map, then wait for deep-coverage selection. |
| "The source path exists, so the page is current" | Compare committed and working-tree changes with that page's recorded source commit. |
| "I'll add a plausible test path" | Document only tests found by evidence; otherwise state none found. |
| "I'll modify application code to match the wiki" | Wiki follows source, never the reverse. |
| "I'll report 'pages updated' and stop" | Report domain, features documented, features skipped, unresolved questions. |
