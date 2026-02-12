---
name: ingest-wiki-sources
description: Gather the minimum evidence needed for a project wiki update. Use before creating or refreshing an LLM wiki page when source files, tickets, designs, logs, external documents, or decisions may be missing; inspect accessible repository evidence first, then explicitly request only the unavailable material needed to make grounded claims.
---

# Ingest Wiki Sources

Ground every wiki claim in an accessible source. Treat source code, tests,
manifests, issue links, design documents, and user-provided files as evidence;
do not treat conversation memory as a source.

1. Read `AGENTS.md`, `docs/llm/INDEX.md`, and the target wiki page if it
   exists. Search the repository for the required evidence first.
2. List the facts the page must establish and the evidence found for each.
3. If evidence is unavailable, ask for the smallest useful set of sources in
   this format:

   ```text
   Need: <file, link, or artifact>
   Why: <claim or decision it verifies>
   Preferred form: <path, URL, export, or pasted excerpt>
   ```

4. Ask one compact batch, grouped by purpose. Do not ask for files already
   available locally, and do not request a full repository when specific files
   are enough.
5. After sources arrive, record their paths or stable URLs in the page's
   `sources` frontmatter/list, then hand off to `refresh-llm-wiki`.

If no source can establish a claim, label it as an open question or omit it.
Never infer a product decision, architecture detail, or behavior solely to
complete a wiki page.
