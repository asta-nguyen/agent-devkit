# Contributing to Agent DevKit

Thank you for your interest in contributing! This repo contains prompt-driven
Dependency-free Markdown skills for coding agents, plus small standard-library
adapters for optional native plugin bootstrap.

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

- **Prompt-driven workflow.** The agent follows Markdown instructions directly;
  the dependency-free wiki validator under `document-wiki` enforces published
  requirement format and links. No build step or new dependency is required.
- **Minimal and focused.** One skill = one workflow. Do not merge multiple
  workflows into a single skill.
- **Progressive disclosure.** Reference files beside `SKILL.md` are a
  sanctioned exception to fewest-files when they keep rarely used branches out
  of every invocation. Keep them within the skill folder and smoke-check each
  mentioned `references/...` path.
- **Chain explicitly.** Name and call the next skill directly. Repair handoffs
  return to their caller; only the owning route performs final review/archive.
- **Red flags.** Include only rationalizations the skill body does not already
  answer; omit the section when its rows would repeat body rules.
- **No placeholders.** Every step must contain actual content an agent can
  follow. No "TBD", "TODO", or "fill in later".

### Documentation

- `GUIDE.md` — team-facing guide. Keep it in sync with skill behavior.
- `PILOT.md` — trial plan. Update when the evaluation process changes.
- `EVALS.md` — acceptance scenarios. Add a scenario when you add or materially
  change a skill.
- `README.md` and `README.vi.md` — project overview, skill list, and routing.
  Keep both languages and both GUIDE files consistent with current behavior.
- `CHANGELOG.md` and `RELEASE_DESCRIPTION.md` — release scope and fresh
  verification evidence. Distinguish manual walkthroughs from fresh host runs.

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

## Preparing a release

1. Update package.json, the four platform plugin manifests, and the Claude and
   Cursor marketplace plugin versions together. Marketplace files with no
   version field keep their current schema.
2. Move release changes from Unreleased into a dated version section and
   update RELEASE_DESCRIPTION.md for that version. Refresh README/README.vi,
   GUIDE/GUIDE.vi, PILOT, and acceptance scenarios for changed behavior.
3. Run `npm test` for plugin loading, reference paths, version consistency,
   release headers, and wiki validator fixtures. Run `git diff HEAD --check`.
   When wiki content changed, also run the installed document-wiki validator
   on the actual target repository and check claims against source.
4. Record which acceptance scenarios ran, how they ran, and what remains
   unverified. Do not describe a manual artifact walkthrough as a fresh host
   session. Final review must pass before declaring release readiness.
5. Leave the working tree for user review. Release preparation does not
   authorize a commit, tag, push, or publication.

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
