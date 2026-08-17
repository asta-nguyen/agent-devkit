---
name: setup-codebase
description: Use when a project lacks AGENTS.md, CLAUDE.md, or docs/llm/ — missing agent-readable context files.
---

# Setup Codebase

Create context with repository-reading, not a static file template. Existing
context belongs to the project: never overwrite or shorten it.

1. Check the exact status of `AGENTS.md`, `CLAUDE.md`, `docs/llm/`, and
   `.gitignore`. Read every existing context file before writing anything. If
   the repository has no application source and an approved design exists
   under `docs/agent-devkit/specs/`, read that design before writing context.
2. If context is missing, inspect only enough evidence to ground it: `README*`,
   root/workspace manifests, task scripts, environment examples, CI/config,
   top-level source layout, and any approved design from the previous step. Do
   not install dependencies, start services, or infer facts from filenames
   alone.
3. Write only missing files from that evidence:

   - `AGENTS.md`: concise purpose, relevant layout, verified commands,
     explicit conventions/gotchas, and verification. Omit unknown sections.
     For a source-less new project, the approved design establishes intended
     purpose and planned layout only; do not claim unimplemented behavior or
     commands as verified.
     If a `skills/` or `.agents/skills` folder exists in the repository, add a `## Skills`
     section listing each skill by name with its `SKILL.md` path so every
     agent platform can discover them.
   - `CLAUDE.md`: a short repository-specific pointer to `AGENTS.md`; include
     extra instructions only when local evidence establishes them.
   - `docs/llm/`: always create the wiki skeleton (`AGENTS.md`, `INDEX.md`, and
     `LOG.md`). Create `architecture/`, `workflows/`, or `decisions/` only when
     `document-wiki` has a real page to place there; do not add placeholder
     pages just to preserve empty directories.

   Every claim must have a repository source. If evidence is insufficient,
   state an open question instead of inventing a rule.
4. If OpenEZ is available (`openez` command or MCP server), note it in
   `AGENTS.md` under a `## Code intelligence` section: mention that agents
   should prefer OpenEZ MCP tools (`code_query`, `code_context`,
   `graph_neighbors`) for semantic code questions, with direct file reads
   as fallback. Do not run `openez setup` — the project's `AGENTS.md`
   remains the instruction source of truth. If OpenEZ is not available,
   skip this section silently.
5. Keep local Obsidian and OpenEZ state out of Git. Create `.gitignore` when it
   is missing, or append only these missing lines without reordering,
   normalizing, or duplicating existing content:

   ```gitignore
   /docs/.obsidian/
   /docs/Untitled*.md
   /docs/Untitled*.canvas
   .openez/
   ```

   Check whether matching files are already tracked. If they are, report their
   paths; never run `git rm --cached` or otherwise untrack them.
6. Preserve existing context files byte-for-byte. The additive `.gitignore`
   update in step 5 is the only automatic edit to an existing file. Do not
   restore files from Git. Read back every created or changed file before
   reporting it.
7. Use Obsidian wikilinks (`[[path/to/page|Label]]`) for internal wiki links.
   When an ancestor of `docs/llm/` contains `.obsidian/`, targets must be
   relative to that vault root (for example, `[[llm/architecture/overview]]`
   for a `docs/` vault). Use `## Sources` for evidence and `## Related` when a
   related page exists.
   Do not document features here; `document-wiki` owns that.
8. Run `git diff --check`. Report distinct `created`, `updated`, and `kept`
   lists, tracked local artifacts, and the evidence paths used.

## Quick reference

| File | When to create | Key content |
|---|---|---|
| `AGENTS.md` | Missing | Purpose, layout, commands, conventions, gotchas, skills list |
| `CLAUDE.md` | Missing | Pointer to `AGENTS.md` + repo-specific instructions |
| `docs/llm/AGENTS.md` | Missing | Wiki evidence and maintenance rules |
| `docs/llm/INDEX.md` | Missing | Navigable entry point |
| `docs/llm/LOG.md` | Missing | Append-only change log |
| `docs/llm/architecture/overview.md` | Baseline map | Source-grounded repository orientation |
| `docs/llm/{architecture,workflows,decisions}/` | A real page needs the folder | Feature documentation folders |
| `.gitignore` | Setup | Add only missing local Obsidian and OpenEZ rules |

## Red flags

| Thought | Reality |
|---|---|
| "I'll use a generic template to save time" | Generic templates miss project-specific conventions. Read the repo. |
| "I'll overwrite this section, it looks outdated" | Existing context belongs to the project. Never overwrite without asking. |
| "I can infer this convention from the filename" | Filenames are not evidence. Read the source. |
| "I'll skip reading back the file I just created" | Read back every created file before reporting. |
| "I'll add features to AGENTS.md" | `document-wiki` owns features. `AGENTS.md` is conventions only. |
| "I'll untrack existing local artifacts" | Ignore rules are additive only. Report tracked files and leave Git ownership to the user. |

Prompt contract:

```text
Inspect repository evidence. Create only missing context files with concise,
project-specific facts grounded in that evidence. Do not use a generic
template, overwrite existing context, infer commands/conventions, or claim a
file was created without reading it back. If a skills/ folder exists, list all
skills in AGENTS.md. When a source-less project has an approved design, use it
only for intended purpose and planned layout. If OpenEZ is available, note it
in AGENTS.md. Add missing local Obsidian and OpenEZ rules to .gitignore without
untracking files. Report created, updated, kept, tracked artifacts, evidence,
and git diff --check.
```
