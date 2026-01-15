# agent-devkit

Minimal Node.js workflow for giving coding agents a stable repository contract
and a refreshable LLM-facing codebase wiki.

## MVP scope

- `AGENTS.md` as the coding-agent contract.
- `docs/llm/` as the wiki entry point.
- JavaScript scripts for setup, refresh, and stale checks.
- No OpenEZ, TypeScript, build system, or multi-agent orchestration yet.

The implementation is being built in the order described by the repository
contract and the files under `skills/`.
