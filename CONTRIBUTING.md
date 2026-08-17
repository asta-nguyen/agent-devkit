# Contributing to Agent DevKit

Thank you for your interest in contributing! This repo contains prompt-driven
Markdown skills for coding agents — no scripts, no build system, no dependencies.

## License

By contributing, you agree that your contributions are licensed under the
[MIT License](./LICENSE).

## Before you start

- Read [`AGENTS.md`](./AGENTS.md) — it is the canonical contract for how code
  and documentation changes should be made in this repo.
- Read [`README.md`](./README.md) for the project overview and skill routing.
- Read the existing skill you want to modify **in full** before editing.

## What you can contribute

### Skills

Each skill lives at `skills/<name>/SKILL.md` with YAML frontmatter:

```yaml
---
name: my-skill
description: Use when <trigger condition>.
---
```

Guidelines:

- **Prompt-driven only.** No scripts, no dependencies, no build steps. The agent
  follows Markdown instructions directly.
- **Minimal and focused.** One skill = one workflow. Do not merge multiple
  workflows into a single skill.
- **Chain explicitly.** If a skill hands off to another, name it (e.g.
  `**REQUIRED SUB-SKILL:** Use review-and-verify`).
- **Red flags table.** End each skill with a table of common bad thoughts and
  why they are wrong. This is the established pattern across all skills.
- **No placeholders.** Every step must contain actual content an agent can
  follow. No "TBD", "TODO", or "fill in later".

### Documentation

- `GUIDE.md` — team-facing guide. Keep it in sync with skill behavior.
- `PILOT.md` — trial plan. Update when the evaluation process changes.
- `EVALS.md` — acceptance scenarios. Add a scenario when you add or materially
  change a skill.
- `README.md` — project overview. Update the skill list and routing guide when
  skills are added or retired.

### Bug fixes and improvements

- Follow the **implementation ladder** in `AGENTS.md` — stop at the first step
  that satisfies the requirement.
- Keep diffs focused on one logical change. Do not refactor unrelated code.
- Run the smallest relevant check after every non-trivial change.

## Pull request process

1. **Fork** the repository and create a branch from `main`.
2. **Make your change** following the guidelines above.
3. **Test your skill** on a disposable repository. Run the scenario from
   `EVALS.md` that covers the affected skill, or create a new scenario if none
   exists.
4. **Update documentation** if your change affects skill behavior:
   - `GUIDE.md` — update the skill summary table and any examples that reference
     the changed behavior.
   - `README.md` — update the routing guide if a skill is added, renamed, or
     retired.
   - `EVALS.md` — add or update the acceptance scenario.
5. **Open a PR** with a clear description:
   - What changed and why.
   - Which skill(s) or documentation are affected.
   - How you tested (which EVALS scenario, or what manual test you ran).

## Style conventions

- **Skills:** Markdown with YAML frontmatter. Step-by-step instructions, numbered
  lists, tables for red flags. No code blocks inside skill steps unless showing
  example output.
- **Documentation (`GUIDE.md`, `README.md`):** Plain English, short paragraphs,
  tables for skill overviews. Code blocks for commands and example output only.
- **No emojis** in skill files or documentation unless explicitly requested.

## Questions?

Open an issue with the `question` label, or start a discussion in the
`asta-nguyen/agent-devkit` GitHub repository.
