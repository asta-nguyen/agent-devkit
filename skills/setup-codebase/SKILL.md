---
name: setup-codebase
description: Bootstrap repository instructions for coding agents. Use when entering a repository that may lack AGENTS.md, CLAUDE.md, or docs/llm/; create AGENTS.md as the canonical contract, make CLAUDE.md reference it, and preserve existing files.
---

# setup-codebase

Bootstrap the minimum repository context needed by a coding agent:

1. Run `node scripts/ai/setup.js [repo-path]`.
2. Create `AGENTS.md` when it is missing. Treat it as the canonical contract.
3. Create `CLAUDE.md` when it is missing with a link to `AGENTS.md`; do not
   duplicate the contract there.
4. Create `docs/llm/INDEX.md` when it is missing.
5. Leave existing files untouched and report what was skipped.

The implementation is `scripts/ai/setup.js`. Use it on a temporary sample
repository before applying it to a real project.
