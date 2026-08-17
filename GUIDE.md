# Agent DevKit — Team Guide

> A set of Markdown playbooks that help coding agents work with discipline:
> read code before changing it, design before coding, and verify before claiming
> completion.

---

## Table of Contents

1. [Why agent-devkit?](#1-why-agent-devkit)
2. [Installation](#2-installation)
3. [The 10 Skills](#3-the-10-skills)
4. [Standard Workflow — Idea to Production](#4-standard-workflow--idea-to-production)
5. [Real Examples](#5-real-examples)
6. [Tips & Best Practices](#6-tips--best-practices)
7. [FAQ](#7-faq)

---

## 1. Why agent-devkit?

Coding agents (Claude Code, Codex, OpenCode, and others) are powerful but
often make predictable mistakes:

- **Changing code before understanding it** — callers are not read, causing
  hidden regressions.
- **Claiming completion without verification** — "should work" is not evidence.
- **Scope creep** — the agent adds features nobody requested.
- **Stale documentation** — wiki pages no longer match the code.

Agent-devkit addresses this with **prompt-driven skills**. Each skill is a
`SKILL.md` playbook containing a repeatable process the agent follows. There
are no scripts, dependencies, or build steps in the workflow itself.

**Result:** the agent works like a disciplined engineer — design → approval →
implementation → verification → documentation.

---

## 2. Installation

### Option 1: Agent Skills CLI (recommended)

```bash
# Install all skills into Claude Code
npx skills add asta-nguyen/agent-devkit -a claude-code

# Or install one specific skill
npx skills add asta-nguyen/agent-devkit --skill estimate-feature -a claude-code
```

> **Note:** The GitHub repository is `asta-nguyen/agent-devkit` (not
> `asta/agent-devkit`).

### Option 2: Manual copy (for projects that discover `.agents/skills`)

```bash
# From the target project directory:
mkdir -p .agents/skills
cp -R /path/to/agent-devkit/skills/. .agents/skills/
find .agents/skills -name SKILL.md -print
```

### Option 3: OpenEZ (recommended for non-trivial repositories)

OpenEZ is a local code index that provides semantic search, graph traversal,
and caller analysis through MCP. It helps agents find symbols, callers,
dependencies, and cross-module flows faster; source code and tests remain the
source of truth.

Setup requires Bun and the OpenEZ CLI, creates local index data in `.openez/`
(already covered by `.gitignore`), and may take time for large repositories:

```bash
openez init <repo-path>
openez index <repo-path>
openez setup codex    # or claude / opencode
```

After setup, **restart the agent** so MCP tools are loaded.

OpenEZ is **optional but recommended** for non-trivial repositories. When
running `setup-codebase` or `read-codebase-context`, if OpenEZ is not detected,
the agent explains the benefits and cost, then asks whether to run
`setup-openez`:

```text
OpenEZ was not detected.
It helps the agent find symbols and trace callers/dependencies faster.
Setup requires Bun + the OpenEZ CLI and creates a local `.openez/` index.

Do you want to set up OpenEZ for this repository?
Recommendation: Yes for non-trivial repositories.
```

If the user chooses **Yes**, the agent runs `setup-openez`, indexes the
repository, and verifies MCP. If the user chooses **No**, skills use `rg` and
direct file reads; the workflow is not blocked. Skills never install
dependencies or change MCP configuration silently.

### After installation

- **Restart the agent session** so the skill list is reloaded.
- **Do not customize** skill files in the target project. Updates overwrite
  same-named skills; retired skill folders must be removed manually.
- Copy **all** skills because they reference one another in the workflow chain.

---

## 3. The 10 Skills

### Bootstrap & Context

| Skill | When to use | Summary |
|---|---|---|
| `setup-codebase` | The repo lacks `AGENTS.md`, `CLAUDE.md`, or `docs/llm/` | Reads repository evidence and creates context files. Creates only missing files. |
| `setup-openez` | The user agrees to use OpenEZ or the index is stale | Installs, indexes, and verifies the OpenEZ MCP connection. |
| `read-codebase-context` | Before design, planning, or wiki work that needs affected files, callers, and tests | Prefers OpenEZ, asks about setup when missing, reads source directly, and records an impact map. |

### Feature Development

| Skill | When to use | Summary |
|---|---|---|
| `brainstorm-feature` | A new, ambiguous request or a request that changes product behavior | Classifies Spike / Bounded / Architectural, asks clarifying questions, presents a design, and requires approval before coding. |
| `plan-feature` | After design approval and before a non-trivial feature | Turns the design into an ordered execution plan. Each task has Files / Interfaces / Change / Verify. |
| `estimate-feature` | When a PM or BA explicitly requests an estimate | Estimates an hours range for each plan task with confidence and rationale. Runs only when requested. |
| `implement-task` | An approved bounded design or an approved architectural plan exists | Traces code, applies the 6-step implementation ladder, verifies each non-trivial change, and flags wiki coverage. |
| `systematic-debugging` | Any technical issue: bug, test failure, build failure, or performance problem | Four phases: Investigate → Analyze → Hypothesis → Implement. Never fixes before root-cause investigation. |
| `review-and-verify` | After implementation and before claiming completion | Enforces **NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE**. Reviews the diff, runs checks, and performs a complexity pass. |

### Wiki Lifecycle

| Skill | When to use | Summary |
|---|---|---|
| `document-wiki` | The repo has no LLM wiki, only a skeleton, or missing/stale feature docs | Builds a domain map from source, creates the baseline overview, waits for feature selection, and writes deep pages. Every claim needs a source path. |

---

## 4. Standard Workflow — Idea to Production

```text
┌─────────────────────────────────────────────────────────────┐
│  NEW REQUEST                                                 │
│                                                              │
│  ┌──────────────────────┐                                    │
│  │ brainstorm-feature   │  Classify + clarify + design       │
│  └──────────┬───────────┘                                    │
│             │                                                │
│     ┌───────┴───────┐                                        │
│     ▼               ▼                                        │
│  Spike          Bounded / Architectural                      │
│  (answer)           │                                        │
│                ┌────┴────────┐                               │
│                ▼             ▼                               │
│           Bounded       Architectural                        │
│           (chat design)    │                                 │
│                │     ┌─────┴──────┐                          │
│                │     ▼            ▼                          │
│                │  setup-codebase  write spec                 │
│                │     │            │                          │
│                │     │     plan-feature                      │
│                │     │            │                          │
│                │     │     estimate-feature (optional)       │
│                │     │            │                          │
│                └─────┴────────────┘                          │
│                        │                                     │
│                        ▼                                     │
│                 implement-task                              │
│                        │                                     │
│                        ▼                                     │
│                 review-and-verify                           │
│                        │                                     │
│                        ▼                                     │
│                 document-wiki                               │
│                        │                                     │
│                        ▼                                     │
│                   USER COMMITS                              │
└─────────────────────────────────────────────────────────────┘
```

### Quick routing

```text
setup-codebase                         # first visit to a repo missing context
setup-openez                           # setup after the user agrees to use OpenEZ
read-codebase-context                  # understand code before changing it
document-wiki                          # document existing features
brainstorm-feature → plan-feature      # architectural work: spec → plan
estimate-feature                       # optional: AI-assisted estimate
implement-task → review-and-verify     # implement and check
systematic-debugging                   # investigate before fixing a bug
```

---

## 5. Real Examples

### Example 1: Bootstrap a new repository

**Situation:** The team has a new repo with no `AGENTS.md` or agent context.

**Action:** Open an agent session in the repo and type:

```text
setup-codebase
```

**The agent will:**

1. Check `AGENTS.md`, `CLAUDE.md`, `docs/llm/`, and `.gitignore` to see what
   exists and what is missing.
2. Read the README, package manifests, CI config, source layout, and other
   evidence.
3. Create **only** missing files. Every claim must have a source:
   - `AGENTS.md` — purpose, layout, commands, conventions, and gotchas
   - `AGENTS.md` `## Documentation` — `docs/llm/INDEX.md` entry point and
     wiki-first rules for behavior and workflow questions
   - `CLAUDE.md` — a short pointer to `AGENTS.md`
   - `docs/llm/` skeleton — `AGENTS.md`, `INDEX.md`, and `LOG.md`
4. Append missing `.gitignore` rules for Obsidian and OpenEZ without untracking
   already-tracked files.
5. If OpenEZ is missing, explain the benefit and cost, then ask whether to run
   `setup-openez`. Never install it silently.
6. Report created, updated, kept, tracked artifacts, and evidence paths.

**Sample result:**

```text
Created:
  - AGENTS.md
  - CLAUDE.md
  - docs/llm/AGENTS.md
  - docs/llm/INDEX.md
  - docs/llm/LOG.md

Updated:
  - .gitignore (appended .openez/ and Obsidian rules)

Kept:
  - README.md (already existed)

Evidence:
  - README.md, package.json, .github/workflows/ci.yml
```

---

### Example 2: Add a small feature (bounded change)

**Situation:** Add a `--json` flag to an existing command.

**Prompt:**

```text
Add a --json flag to this existing command.
```

**The agent will:**

1. Read `AGENTS.md` and relevant wiki pages.
2. Use `read-codebase-context` to trace the current command, callers, and
   tests.
3. Classify the task as **Bounded** (small change to existing code).
4. Present a short design in chat:

   ```text
   Design: Add --json flag to `process` command.
   - When --json is passed, output JSON instead of table format.
   - Reuse existing formatter module (src/formatters/json.ts).
   - Add test in tests/process.test.ts.
   ```

5. **STOP** and wait for explicit approval.
6. After approval, run `implement-task` → `review-and-verify`.

**No spec file or plan file is created.** A short chat design is enough.

---

### Example 3: Build a large feature (architectural change)

**Situation:** Add a background job subsystem with persistent retries.

**Prompt:**

```text
Add a background job subsystem with persistent retries.
```

**The agent will:**

1. Classify the request as **Architectural** (a new subsystem affecting
   multiple components).
2. Ask clarifying questions, one per message:
   - "Which job queue: Redis, database, or in-memory?"
   - "Retry policy: exponential backoff or fixed interval?"
   - "Do we need a job monitoring dashboard?"
3. Present a design covering scope, architecture, interfaces, error cases, and
   verification.
4. After design approval, write the spec at
   `docs/agent-devkit/specs/2026-08-17-bg-jobs-design.md`.
5. Self-review the spec for placeholders, consistency, scope, and ambiguity.
6. Wait for user approval of the written spec.
7. If the repo lacks `AGENTS.md`, run `setup-codebase` first.
8. Run `plan-feature` and write
   `docs/agent-devkit/plans/2026-08-17-bg-jobs-plan.md` with ordered tasks.
9. Run `estimate-feature` only if the user requests an estimate.
10. Run `implement-task` for each plan task.
11. Run `review-and-verify` for diff review, tests, and the complexity pass.
12. Run `document-wiki` to refresh the wiki for the new feature.

**Artifact structure:**

```text
docs/
  agent-devkit/
    INDEX.md                          # links all artifacts
    specs/
      2026-08-17-bg-jobs-design.md    # approved design
    plans/
      2026-08-17-bg-jobs-plan.md      # execution plan
    estimates/                         # optional
      2026-08-17-bg-jobs-estimate.md
  llm/                                # source-grounded, verified wiki
    AGENTS.md
    INDEX.md
    LOG.md
    architecture/
      overview.md
    workflows/
      background-jobs.md              # after implementation
```

---

### Example 4: Debug a bug

**Situation:** A test fails and needs a fast, reliable fix.

**Prompt:**

```text
Fix this failure quickly.
```

**The agent follows `systematic-debugging`:**

**Phase 1 — Investigate:**

- Read the complete error message, stack trace, line numbers, and paths.
- Reproduce the failure by running the test.
- Inspect `git diff` and recent changes.
- Trace the data flow to find where the bad value originates.

**Phase 2 — Analyze:**

- Find similar working code in the same codebase.
- List every difference between the working and broken paths.

**Phase 3 — Hypothesis:**

- State one specific hypothesis: "The root cause is X because Y."
- Test it minimally with one variable at a time.
- If it fails, form a new hypothesis instead of stacking fixes.

**Phase 4 — Implement:**

- Write a regression test that reproduces the symptom.
- Verify the test fails (red).
- Apply the smallest root-cause fix.
- Verify the test passes (green).
- Run the full test suite.
- Run `review-and-verify`, then `document-wiki` if behavior changed.

**Red flags — stop and return to Phase 1:**

```text
"Quick fix for now, investigate later"     → NO
"Just try changing X and see"              → NO
"Add multiple changes, run tests"          → NO
"It's probably X, let me fix that"         → NO
```

---

### Example 5: Document an existing application

**Situation:** The repo has working code but no agent wiki.

**Prompt:**

```text
document-wiki
```

**The agent will:**

1. Read `AGENTS.md` and check `docs/llm/` (if missing, run `setup-codebase`
   inline).
2. Identify the Obsidian vault root if `.obsidian/` exists.
3. Read all existing wiki pages.
4. Build a domain map from **behavior** (routes, commands, APIs, and tests),
   not filenames.
5. Create `architecture/overview.md` as the baseline map automatically.
6. Present a feature inventory:

   ```text
   Domain: Authentication — login, register, password reset

   [ ] Login — user signs in with email + password
       Entry: POST /api/auth/login
       Sources: src/auth/login.ts, tests/auth.test.ts
       Wiki: missing

   [x] Register — user creates a new account
       Entry: POST /api/auth/register
       Sources: src/auth/register.ts, tests/auth.test.ts
       Wiki: docs/llm/workflows/register.md

   [~] Password reset — user requests a password reset
       Entry: POST /api/auth/reset
       Sources: src/auth/reset.ts
       Wiki: docs/llm/workflows/password-reset.md (stale — source changed)
   ```

7. **WAIT** for the user to select features for deep coverage.
8. Write pages for selected features. Every page has `## Sources` with real
   paths.
9. Update `INDEX.md` and append to `LOG.md`.
10. Verify source paths exist, wikilinks resolve, and `git diff --check` passes.

---

### Example 6: Estimate effort for a plan

**Situation:** A plan exists and the PM asks, "How long will it take?"

**Prompt:**

```text
Estimate this plan in hours for a developer using an AI coding agent.
```

**The agent follows `estimate-feature`:**

1. Read the plan, design, wiki, source, and tests.
2. State the AI support profile: the agent inspects and edits code, writes and
   runs tests, and updates docs; the developer reviews and resolves product
   decisions.
3. Estimate every task:

   ```markdown
   | Plan task          | Hours | Confidence | Basis and risks                    |
   |--------------------|-------|------------|------------------------------------|
   | Task 1: DB schema  | 1-2h  | High       | Simple migration, existing pattern |
   | Task 2: Job worker | 3-5h  | Medium     | New pattern, retry logic complex   |
   | Task 3: API        | 2-3h  | High       | Similar to existing endpoints      |
   | Task 4: Tests      | 2-4h  | Medium     | Integration test setup needed      |
   ```

4. Save at `docs/agent-devkit/estimates/YYYY-MM-DD-<slug>-estimate.md`.
5. Link the estimate ↔ plan ↔ `INDEX.md`.
6. **Do not** apply a generic "AI is 50% faster" discount.
7. **Do not** edit application code or commit.

---

## 6. Tips & Best Practices

### For team leads and PMs

- **Run `setup-codebase` first** when onboarding a repo into the agent workflow.
- **Copy all skills** because they chain together. Do not copy individual
  skills unless you know exactly what you need.
- **Restart the agent session** after installing skills so the skill list reloads.
- **Do not customize skill files** in the target project. Updates overwrite them.
- **OpenEZ is optional but valuable** for large repositories; semantic search is
  much faster and more useful for callers than plain grep.

### For developers

- **Always run `brainstorm-feature`** before coding a new feature. Even when the
  request seems clear, the agent should classify it and present a design.
- **The approval gate is mandatory.** The agent must STOP and wait for you to
  say "yes" before implementation.
- **Do not ask for a commit** until `review-and-verify` passes. The agent leaves
  the working tree for you to review and commit.
- **When debugging, do not push the agent to "fix it quickly."**
  `systematic-debugging` avoids guess-and-check thrashing.
- **The `docs/llm/` wiki contains verified behavior only.** Proposed specs and
  plans belong in `docs/agent-devkit/`.

### For agents (rules embedded in the skills)

- **Iron Law (`review-and-verify`):** NO COMPLETION CLAIMS WITHOUT FRESH
  VERIFICATION EVIDENCE.
- **Iron Law (`systematic-debugging`):** NO FIXES WITHOUT ROOT CAUSE
  INVESTIGATION FIRST.
- **Every claim needs a source path.** Filenames alone are not evidence.
- **Existing context belongs to the project.** Do not overwrite it without asking.
- **Minimal change:** the smallest clear diff that satisfies approved behavior;
  do not refactor unrelated code.

### Implementation ladder (6 steps)

When planning or implementing, the agent applies this ladder and **stops at the
first step that satisfies the requirement**:

| Step | Question | Action |
|---|---|---|
| 1 | Does it need to exist? (YAGNI) | Skip it if no approved requirement needs it. |
| 2 | Does it already exist in the codebase? | Reuse the existing module, helper, type, or pattern. |
| 3 | Does the standard library do it? | Use the standard library. |
| 4 | Does a native platform feature cover it? | Use the platform feature. |
| 5 | Does an installed dependency solve it? | Use that dependency. |
| 6 | Only then | Write the minimum clear new code that works. |

> **The ladder never removes:** explicit requirements, validation at trust
> boundaries, security, accessibility, or error handling that prevents data
> loss. Minimal means the smallest implementation that remains correct, not the
> smallest implementation that weakens a boundary.
>
> The ladder appears in `AGENTS.md`, `implement-task`, and `plan-feature`; all
> three use the same six steps.

`review-and-verify` also runs a **complexity pass** using the labels `delete:`,
`reuse:`, `stdlib:`, `native:`, `yagni:`, and `shrink:` to find unnecessary
complexity.

---

## 7. FAQ

### Q: Which agents can use these skills?

Skills are Markdown playbooks. Any agent that can read `SKILL.md` from
`.agents/skills/` or through the skills CLI can use them. They have been tested
with Claude Code; Codex and OpenCode can also use them through `.agents/skills/`.

### Q: Is OpenEZ required?

**No.** OpenEZ is optional but recommended for non-trivial repositories. When
it is missing, the skills explain its value and setup cost, ask whether the
user wants to set it up, and fall back to `rg` plus direct source reads if the
user declines or the environment cannot support it.

### Q: Can skill files be edited for a specific project?

**Not recommended.** Skills are managed files; updates overwrite same-named
files. If customization is needed, fork the repo and maintain the fork.

### Q: Does the agent commit code automatically?

**No.** The agent leaves the working tree for the user to review and commit.
It commits only when the user explicitly asks, and only after
`review-and-verify` passes.

### Q: What is the difference between `docs/llm/` and `docs/agent-devkit/`?

| `docs/llm/` | `docs/agent-devkit/` |
|---|---|
| Wiki — **verified** behavior from source | Process artifacts — specs, plans, and estimates |
| The agent reads it to understand the code | The agent creates it during design and planning |
| Never links to specs or plans | Links to wiki pages read as context |
| Owned by `document-wiki` | Owned by `brainstorm-feature`, `plan-feature`, and `estimate-feature` |

### Q: How do I know whether the wiki is stale?

`document-wiki` checks each page's `## Sources` and compares its recorded source
commit with `git diff <commit> -- <source paths>`. If a source changed, the
page is marked `[~]` (stale).

### Q: How many skills are there? Can I add a new one?

There are currently 10 skills. Add a new skill by creating
`skills/<name>/SKILL.md` with YAML frontmatter (`name`, `description`) and
step-by-step instructions. Read this repo's `AGENTS.md` for conventions.

---

## Quick Reference Card

```text
┌─────────────────────────────────────────────────────────────┐
│  FIRST TIME:  setup-codebase → setup-openez (ask first)      │
│                                                             │
│  NEW FEATURE: brainstorm → (plan) → implement → verify      │
│                                                             │
│  BUG:         systematic-debugging → review-and-verify      │
│                                                             │
│  DOCUMENT:    document-wiki                                 │
│                                                             │
│  ESTIMATE:    estimate-feature (only when asked)            │
│                                                             │
│  IRON LAWS:                                                 │
│    • No completion without fresh verification               │
│    • No fixes without root cause investigation              │
│    • No claims without source evidence                      │
│    • No commits until review-and-verify passes              │
└─────────────────────────────────────────────────────────────┘
```
