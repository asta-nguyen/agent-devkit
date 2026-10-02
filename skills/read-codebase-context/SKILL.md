---
name: read-codebase-context
description: Use when preparing to change or plan code in an unfamiliar repository, or when asked to explain code, trace a flow, find callers, dependencies, or tests, identify affected files, or assess change impact.
---

# Read Codebase Context

Choose tools by purpose; current source and tests establish facts.

When the active spec or plan has an `## Impact map`, first check whether it has
`Verified at: <full commit SHA>`. Verify that commit exists and is an ancestor
of `HEAD` with `git cat-file -e <sha>^{commit}` and
`git merge-base --is-ancestor <sha> HEAD`. If the SHA is missing, unavailable,
or not an ancestor (for example, after a rebase), discard the map for
navigation and trace the current flow below. Do the same when no commit
existed at map creation.

For a valid SHA, run `git status --short` and
`git diff --name-only <verified-sha>` to find committed, staged, and unstaged
tracked changes since the map; add untracked paths from `git status --short`.
Re-trace changed and newly touched paths, then always run Confirm for every
entry-point and implementation symbol in the map across the current repository
using FFF multi-pattern grep or `rg`. Read current source for every file to
edit and every newly found caller. The map guides navigation, not evidence.

1. If `docs/llm/AGENTS.md` and `INDEX.md` exist, read both and open the relevant
   linked page. If none exists, report no verified wiki coverage and continue.
2. Search in this order: **Locate → Expand → Confirm → Read**. Each tool is
   optional; use the fallback when it is unavailable, fails, or returns
   irrelevant results. Do not retry a failed tool repeatedly.

   | Stage | Need | Tool |
   |---|---|---|
   | Locate | Concept or behavior | OpenEZ `code_query` with `path: <repo root>` |
   | Locate | Approximate filename | FFF fuzzy file find (`find_files`); fallback `rg --files` |
   | Locate | Identifier or literal | FFF grep (`grep`); fallback scoped `rg` |
   | Locate | Regex | `rg` |
   | Expand | Callers and callees | OpenEZ `code_context` at 1–2 hops |
   | Confirm | Dynamic or registration references | FFF multi-pattern grep (`multi_grep`), fallback `rg`; search symbol, string, route, config key, camelCase/snake_case variants |
   | Read | Large-file structure | OpenEZ `code_outline`, then read needed current-source ranges; fallback `rg` and direct reads |

   FFF grep is literal; regex uses `rg`. Pass `maxResults` to FFF and
   `maxTokens` (about 1,500–3,000) to OpenEZ only when supported by the schema.
   Search/index results are navigation; read current source for evidence.

3. Query OpenEZ directly with the repo path; never require `list_workspaces`
   first. On unavailable, error, not indexed, or irrelevant results, fall back
   once to FFF/`rg` and direct reads. Mention `setup-openez` only when direct
   search cannot establish a needed relationship; never recommend it by repo
   size or install/configure tools silently.
4. OpenEZ lines and callers are hints. For `git status --short` paths, get
   positions from FFF/`rg` plus a direct read, or call OpenEZ
   `index_workspace` (`mode: "incremental"`) for the already-registered
   current workspace and re-query; `setup-openez` owns new registration.
   `memory_recall` with 1–3 task keywords may locate decisions or
   handoffs; use `maxTokens` if supported and read the file before relying on it.
   After persisting a decision, optionally write only its title and file path to
   memory; never make memory the sole record.
5. Read the entry point, returned implementation(s), direct callers, and
   downstream callees until the source establishes persistence and external
   boundaries. Inspect state changes, storage/external adapters, jobs, events,
   email/notifications, authorization, error paths, and relevant tests. Record
   an impact map:

   ```text
   Entry: <file + symbol>
   Flow: <caller → implementation → dependency>
   State changes: <persistence or "none found">
   External effects: <storage/job/event/email/notification or "none found">
   Change candidates: <files likely to modify>
   Verification: <tests/checks to run>
   Verified at: <output of `git rev-parse HEAD`, or "no commit exists">
   ```

6. Never fabricate a file impact list from index results or memory alone.

The local `.openez/` directory is derived index data. Keep it out of source
documentation and version control unless the target repository explicitly
chooses otherwise.
