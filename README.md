# agent-devkit

Minimal prompt-driven workflow for giving coding agents a stable repository
contract and a refreshable LLM-facing codebase wiki.

## What it does

Coding agents need accurate, up-to-date context to work effectively. This
project provides a set of prompt-driven skills (Markdown playbooks) that:

1. **Bootstrap** a repository with agent-readable context files (`AGENTS.md`,
   `CLAUDE.md`, `docs/llm/` skeleton) by following the `setup-codebase` skill.
2. **Index** the codebase with OpenEZ so agents can trace callers, dependencies,
   and behavior without guessing.
3. **Plan and implement** features through a structured brainstorm → plan →
   implement → verify pipeline.
4. **Debug** systematically — find root cause before fixing.
5. **Maintain** an LLM-facing wiki under `docs/llm/` that stays grounded in real
   source code — never fabricated.

## Skills

Skills are prompt-driven Markdown playbooks under `skills/`. Each skill has a
`name`, `description`, and step-by-step instructions. No scripts — the agent
follows the instructions directly.

## Using the skills

Skills are portable folders, not application dependencies. To use them, make
the `skills/<name>/` folder visible to the agent's skill loader, then invoke
the skill by name or ask for the task it describes. `SKILL.md` is the required
file; `agents/openai.yaml` only adds Codex/OpenAI UI metadata.

For a project that discovers repository-local skills from `.agents/skills`,
run this from the target project and replace the source path with this clone:

```bash
mkdir -p .agents/skills
cp -R /path/to/agent-devkit/skills/. .agents/skills/
find .agents/skills -name SKILL.md -print
```

### Install with Agent Skills CLI

This repository follows the open Agent Skills layout: each skill is a
`skills/<name>/SKILL.md` with YAML frontmatter containing `name` and
`description`. No `skill.json` is required.

Install all skills into Claude Code with:

```bash
npx skills add asta-nguyen/agent-devkit -a claude-code
```

Install one skill when only a focused capability is needed:

```bash
npx skills add asta-nguyen/agent-devkit --skill estimate-feature -a claude-code
```

The public repository is currently `asta-nguyen/agent-devkit`; the shorthand
`asta/agent-devkit` is not the repository's current GitHub path.

Copy the whole set because the workflow skills reference each other. Treat the
copies as managed files: do not customize them in the target project. Updating
overwrites same-named skills, and retired skill folders must be removed manually.
Start a fresh agent session after copying so its skill list is reloaded.

The shortest routing guide is:

```text
setup-codebase                         # first visit to a repo missing context
setup-openez                           # recommended semantic index for non-trivial repos
read-codebase-context                  # understand code before changing it
document-wiki                          # document existing app features
brainstorm-feature → plan-feature      # architectural work: save spec then plan
estimate-feature                       # optional per-task AI-assisted estimate
implement-task → review-and-verify     # review, fix blockers once, review again
systematic-debugging                   # investigate before fixing bugs
```

OpenEZ is a separate code-intelligence MCP service. Install/index a repository
and wire the clients you use, then restart those clients so their MCP tools are
loaded:

```bash
openez init <repo-path>
openez index <repo-path>
openez setup codex                  # or claude / opencode
```

Skills may prefer OpenEZ MCP tools when present, but must keep a direct-source
fallback. A plugin is optional: use one when you want to distribute a skill,
MCP server, and optional UI together; a shared `SKILL.md` folder is enough for
the workflow itself.

### Bootstrap & context

| Skill | Purpose |
|---|---|
| `setup-codebase` | Create missing `AGENTS.md`, `CLAUDE.md`, and `docs/llm/` skeleton. Run once per repo. |
| `setup-openez` | Install, initialize, index, and verify OpenEZ MCP connection for a repository. |
| `read-codebase-context` | Query OpenEZ and trace code paths. Used before feature work or wiki generation. |

### Feature development

| Skill | Purpose |
|---|---|
| `brainstorm-feature` | Classify task (spike/bounded/architectural), clarify scope, get design approval. |
| `plan-feature` | Save an approved architectural plan under `docs/agent-devkit/plans/` with bite-sized, verifiable tasks. |
| `estimate-feature` | Optionally estimate every completed plan task in AI-assisted engineering hours. |
| `implement-task` | Execute an approved plan: trace code, make the smallest change, verify, then flag wiki coverage. |
| `systematic-debugging` | Find root cause before fixing. Four phases: investigate → analyze → hypothesize → implement. |
| `review-and-verify` | Iron Law: no completion claims without fresh evidence. Diff review, code review reception, red flags. |

### Wiki lifecycle

| Skill | Purpose |
|---|---|
| `document-wiki` | Build a source-grounded domain baseline, then let the user choose missing or stale feature coverage. |

Deep pages use evidence-backed folders only when needed: `architecture/` for
system structure, `domains/` for state and business rules, `workflows/` for
user/operator flows, `integrations/` for external systems, `operations/` for
jobs/cron/deployment, and `decisions/` for source-backed decisions. Small repos
may need only `architecture/` and `workflows/`; empty folders are never created.

## Example workflows

### 1. Bootstrap a new repository

```
setup-codebase
  → creates AGENTS.md, CLAUDE.md, docs/llm/ skeleton
  → ignores local Obsidian artifacts and .openez index data
```

Invoke `setup-codebase` in an agent session; it reads repository evidence and
creates only missing, project-specific context files. It also appends missing
`/docs/.obsidian/`, `/docs/Untitled*.md`, `/docs/Untitled*.canvas`, and
`.openez/` rules to `.gitignore` without untracking existing files.

### 2. Implement a feature from scratch

```
brainstorm-feature        → clarify scope, get design approval
  ↓
docs/agent-devkit/specs/  → save approved architectural design
  ↓
setup-codebase            → new projects only: create initial contract
  ↓
plan-feature              → save ordered plan under docs/agent-devkit/plans/
  ↓
estimate-feature          → optional: save per-task ranges under docs/agent-devkit/estimates/
  ↓
implement-task            → code, verify, run checks
  ↓
review-and-verify         → pass/fail report with evidence and blockers
  ↓
fix blockers once, then review again; stop if still failing
  ↓
document-wiki             → refresh documentation for the changed feature
```

### 3. Debug a bug

```
systematic-debugging      → investigate root cause, fix, regression test
  ↓
review-and-verify         → verify fix, check for regressions
```

### 4. Document an existing app

```
setup-codebase             → create the missing wiki skeleton
  ↓
document-wiki              → create or refresh the domain baseline map;
                              then choose missing/stale feature coverage
```

## License

MIT — see [LICENSE](./LICENSE).
