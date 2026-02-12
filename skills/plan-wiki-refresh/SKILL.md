---
name: plan-wiki-refresh
description: Plan a small, source-grounded update to a project LLM wiki. Use after a wiki design is approved or when code, tests, manifests, Git history, or supplied sources change and the affected wiki pages need to be identified before editing.
---

# Plan Wiki Refresh

Create an evidence-first plan before editing a non-trivial wiki update.

1. Read `docs/llm/INDEX.md`, `docs/llm/AGENTS.md`, the changed sources, and
   every wiki page likely to be affected.
2. Use `ingest-wiki-sources` if a required source is unavailable.
3. Write tasks small enough to complete and verify independently. Each task
   states:

   ```text
   Files: <wiki pages to create or update>
   Evidence: <source paths, commits, or URLs>
   Change: <specific claim, link, or index/log update>
   Verify: <link/source/staleness check>
   ```

4. Put source-page edits before `INDEX.md` and `LOG.md`; never plan index-only
   changes for undocumented claims.
5. Hand the plan to `refresh-llm-wiki`. After execution, use
   `review-and-verify`.

Prefer one page update over a broad rewrite. If the plan needs more than a few
pages, group it into small batches and stop at an explicit review checkpoint.
