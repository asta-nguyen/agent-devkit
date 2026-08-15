# Coding Agent Contract

This repository contains dependency-free Markdown skills for keeping
coding-agent context and an LLM-facing codebase wiki in sync.

## Before changing code

- Read this file. Read `docs/llm/INDEX.md` only in target projects where the
  skills have created that wiki.
- Inspect the existing implementation and its callers before editing.
- Reuse the current Markdown skill patterns; do not add scripts, dependencies,
  or abstractions unless prompt-driven instructions are insufficient.

## Working rules

- Keep changes focused and minimal.
- Preserve user changes and do not rewrite unrelated files.
- Treat generated LLM documentation as a product artifact: update it when the
  documented code or behavior changes.
- Do not add TypeScript, a build system, or multi-agent behavior to the MVP
  unless the task explicitly asks for it.
- Never hide errors that could leave code or documentation stale.
- Do not commit secrets, generated dependency directories, or temporary files.

## Verification

- Run the smallest relevant check after every non-trivial change.
- For workflow changes, exercise the affected skill on a temporary sample
  repository when its behavior cannot be verified by inspection alone.
- A change is complete only when its behavior and documentation agree.

## Change shape

Prefer explicit instructions and the fewest files possible. If deterministic
behavior eventually requires automation, prefer one simple script over a
framework.
