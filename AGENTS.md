# Coding Agent Contract

This repository builds a small, dependency-free Node.js workflow for keeping
coding-agent context and an LLM-facing codebase wiki in sync.

## Before changing code

- Read this file and [`docs/llm/INDEX.md`](docs/llm/INDEX.md).
- Inspect the existing implementation and its callers before editing.
- Reuse the current Node.js and Markdown patterns; do not add a dependency or
  abstraction unless the standard library and existing code are insufficient.

## Working rules

- Keep changes focused and minimal.
- Preserve user changes and do not rewrite unrelated files.
- Treat generated LLM documentation as a product artifact: update it when the
  documented code or behavior changes.
- Do not add OpenEZ, TypeScript, a build system, or multi-agent behavior to the
  MVP unless the task explicitly asks for it.
- Never hide errors that could leave code or documentation stale.
- Do not commit secrets, generated dependency directories, or temporary files.

## Verification

- Run the smallest relevant check after every non-trivial change.
- For workflow changes, test setup, refresh, and stale detection on a temporary
  sample repository.
- A change is complete only when its behavior and documentation agree.

## Change shape

Prefer one simple script and explicit files over a framework. If a limitation
is deliberate, document the ceiling next to the code with a `ponytail:` comment
and name the upgrade path.
