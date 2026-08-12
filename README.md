# agent-devkit

Minimal Node.js workflow for giving coding agents a stable repository contract
and a refreshable LLM-facing codebase wiki.

## What it does

Coding agents need accurate, up-to-date context to work effectively. This
project provides a set of skills (Markdown playbooks) and small Node.js scripts
that:

1. **Bootstrap** a repository with agent-readable context files (`AGENTS.md`,
   `CLAUDE.md`, `docs/llm/` skeleton).
2. **Index** the codebase with OpenEZ so agents can trace callers, dependencies,
   and behavior without guessing.
3. **Plan and implement** features through a structured brainstorm → plan →
   implement → verify pipeline.
4. **Maintain** an LLM-facing wiki under `docs/llm/` that stays grounded in real
   source code — never fabricated.

## Skills

Skills are Markdown files under `skills/` that define repeatable workflows for
coding agents. Each skill has a `name`, `description`, and step-by-step
instructions.

### Bootstrap & context

| Skill | Purpose |
|---|---|
| `setup-codebase` | Create missing `AGENTS.md`, `CLAUDE.md`, and `docs/llm/` skeleton. Run once per repo. |
| `read-codebase-context` | Index the codebase with OpenEZ and trace code paths. Used before feature work or wiki generation. |

### Feature development

| Skill | Purpose |
|---|---|
| `brainstorm-feature` | Clarify an ambiguous feature request and produce a minimal design for approval. |
| `plan-feature` | Turn an approved design into small, ordered, verifiable implementation tasks. |
| `implement-task` | Execute an approved plan: trace code, make the smallest change, verify, then flag wiki coverage. |
| `review-and-verify` | Review a diff for correctness, stale docs, scope creep, and missing error handling. |

### Wiki lifecycle

| Skill | Purpose |
|---|---|
| `design-wiki` | Design the wiki structure (audience, page tree, source rules) before creating pages. |
| `discover-wiki-features` | Scan the codebase for user-meaningful features and match them to existing wiki coverage. |
| `plan-wiki-refresh` | Plan a small, evidence-first wiki update: which pages to touch and what sources back each claim. |
| `ingest-wiki-sources` | Gather the minimum evidence needed before writing a wiki page. Ask the user for missing sources. |
| `refresh-llm-wiki` | Write or update wiki pages from traced source code. Update `INDEX.md` and `LOG.md`. |

## Example workflows

### 1. Bootstrap a new repository

```
setup-codebase
  → creates AGENTS.md, CLAUDE.md, docs/llm/ skeleton
```

Run `node scripts/ai/setup.js [repo-path]` or follow the skill manually.

### 2. Implement a feature from scratch

```
brainstorm-feature        → clarify scope, get design approval
  ↓
plan-feature              → break design into ordered tasks
  ↓
implement-task            → code, verify, run checks
  ↓
review-and-verify         → review diff, catch stale docs
  ↓
discover-wiki-features    → flag new feature for wiki coverage
  ↓
plan-wiki-refresh         → plan which pages to create/update
  ↓
refresh-llm-wiki          → write source-grounded wiki pages
```

### 3. Refresh wiki after code changes

```
read-codebase-context     → index and trace changed code
  ↓
plan-wiki-refresh         → identify affected pages + evidence
  ↓
ingest-wiki-sources       → request missing sources if needed
  ↓
refresh-llm-wiki          → update pages, INDEX.md, LOG.md
  ↓
review-and-verify         → verify docs match code
```

### 4. Bootstrap a full project wiki

```
design-wiki               → define wiki scope and page tree
  ↓
discover-wiki-features    → list all features, mark coverage gaps
  ↓
plan-wiki-refresh         → batch pages into small update plans
  ↓
refresh-llm-wiki          → generate pages from source
```

## MVP scope

- `AGENTS.md` as the coding-agent contract.
- `docs/llm/` as the wiki entry point.
- JavaScript scripts for setup, refresh, and stale checks.
- OpenEZ is an optional local index for AI source discovery; it never replaces
  direct source/test inspection.
- No TypeScript, build system, or multi-agent orchestration yet.

The implementation is being built in the order described by the repository
contract and the files under `skills/`.
