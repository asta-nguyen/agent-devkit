---
name: setup-codebase
description: Bootstrap missing repository context for coding agents. Use when a project lacks AGENTS.md, CLAUDE.md, or docs/llm/; inspect available repository evidence and write only the missing, project-specific context files.
---

# Setup Codebase

Create context with repository-reading, not a static file template. Existing
context belongs to the project: never overwrite or shorten it.

1. Check the exact status of `AGENTS.md`, `CLAUDE.md`, and `docs/llm/`. Read
   every existing context file before writing anything.
2. If context is missing, inspect only enough evidence to ground it: `README*`,
   root/workspace manifests, task scripts, environment examples, CI/config,
   and top-level source layout. Do not install dependencies, start services, or
   infer facts from filenames alone.
3. Write only missing files from that evidence:

   - `AGENTS.md`: concise purpose, relevant layout, verified commands,
     explicit conventions/gotchas, and verification. Omit unknown sections.
   - `CLAUDE.md`: a short repository-specific pointer to `AGENTS.md`; include
     extra instructions only when local evidence establishes them.
   - `docs/llm/AGENTS.md`: evidence and maintenance rules for the wiki.
   - `docs/llm/INDEX.md` and `LOG.md`: an empty navigable entry point and an
     append-only log. Create `architecture/`, `workflows/`, and `decisions/`
     only when absent.

   Every claim must have a repository source. If evidence is insufficient,
   state an open question instead of inventing a rule.
4. Preserve existing files byte-for-byte. Do not restore from Git or edit a
   context file unless the user explicitly asks. Read back every created file
   before reporting it.
5. Use Obsidian wikilinks (`[[path/to/page|Label]]`) for internal wiki links,
   `## Sources` for evidence, and `## Related` when a related page exists.
   Do not document features here; `document-wiki` owns that.
6. Run `git diff --check`. Report distinct `created` and `kept` lists plus the
   evidence paths used.

Prompt contract:

```text
Inspect repository evidence. Create only missing context files with concise,
project-specific facts grounded in that evidence. Do not use a generic
template, overwrite existing context, infer commands/conventions, or claim a
file was created without reading it back. Report created, kept, evidence, and
git diff --check.
```
