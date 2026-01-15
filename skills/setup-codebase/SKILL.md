# setup-codebase

Create the minimum repository context needed by a coding agent:

1. Add or update the repository `AGENTS.md` contract.
2. Create `docs/llm/` and its `INDEX.md` entry point.
3. Preserve existing content and report conflicts instead of overwriting it.

The implementation belongs in `scripts/ai/setup.js`.
