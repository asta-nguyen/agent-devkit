---
name: setup-codebase
description: Bootstrap repository context for coding agents. Use when entering a repository that may lack AGENTS.md, CLAUDE.md, or docs/llm/; create the missing agent contract and wiki skeleton without analyzing source code or inferring project behavior.
---

# setup-codebase

Bootstrap repository context before coding:

1. Run `node setup.js [repo-path] [--wiki=full|placeholder]` from this skill's
   directory, or `node <path-to-skills>/setup-codebase/setup.js` from anywhere.
2. Create the root `AGENTS.md` when it is missing. Treat it as the canonical
   contract; do not infer project-specific commands or conventions.
3. Create a root `CLAUDE.md` when it is missing;
   make it reference `AGENTS.md` instead of duplicating instructions.
4. Create `docs/llm/AGENTS.md`, `INDEX.md`, `LOG.md`, and the
   `architecture/`, `workflows/`, and `decisions/` folders when missing.
5. Use `--wiki=full` (recommended and default) to seed empty pages for the AI
   wiki workflow. The pages must not claim source-derived facts until
   `document-wiki` analyzes the relevant code and documents.
   Use `--wiki=placeholder` to create only the wiki schema and folders.
6. Leave existing context files untouched and report `kept` versus `created`.

The generated wiki uses Obsidian wikilinks (`[[path/to/page|Label]]`) for
internal pages, a `## Sources` section for evidence, and `## Related` on pages
with related wiki content. Do not rewrite existing wiki files just to convert
their link style; let `document-wiki` update selected pages.

Generate only repository-specific context. Do not copy policies, preferences,
roadmaps, or workflows from the agent environment into the target repository
unless local evidence shows they apply.
