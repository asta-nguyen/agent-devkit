# Coding Agent Contract

This repository contains dependency-free Markdown skills for keeping
coding-agent context and an LLM-facing codebase wiki in sync.

## Before changing files

- Read this file. Read `docs/llm/INDEX.md` only in target projects where the
  skills have created that wiki.
- Inspect the existing implementation and its callers before editing relevant
  files.
- Reuse the current Markdown skill patterns; do not add scripts, dependencies,
  or abstractions unless prompt-driven instructions are insufficient.

## Working rules

- Keep changes focused and minimal.
- Preserve user changes and do not rewrite unrelated files.
- Treat generated LLM documentation as a product artifact: update it when the
  documented code or behavior changes.
- Do not add TypeScript, a build system, or multi-agent behavior unless the task
  explicitly asks for it.
- Never hide errors that could leave code or documentation stale.
- Do not commit secrets, generated dependency directories, or temporary files.
- Do not create commits during implementation. Leave the working tree for the
  user to review; commit only after final `review-and-verify` passes and the
  user explicitly requests it.

## Verification

- Run the smallest relevant check after every non-trivial change.
- For workflow changes, exercise the affected skill on a temporary sample
  repository when its behavior cannot be verified by inspection alone.
- A change is complete only when its behavior and documentation agree.

## Change shape

Prefer explicit instructions and the fewest files possible. If deterministic
behavior eventually requires automation, prefer one simple script over a
framework. After understanding the affected flow, use this ladder and stop at
the first option that satisfies the required behavior:

1. Does this need to exist at all? Skip speculative work (YAGNI).
2. Does it already exist in this codebase? Reuse it.
3. Does the standard library do it? Use it.
4. Does a native platform feature cover it? Use it.
5. Does an already-installed dependency solve it? Use it.
6. Only then, write the minimum clear new code that works.

The ladder never removes explicit requirements, validation at trust boundaries,
security, accessibility, or error handling that prevents data loss. For bug
fixes, the minimum change is the smallest root-cause fix, not a symptom patch.
