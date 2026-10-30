# Agent DevKit — Team Guide

> A set of Markdown playbooks that help coding agents work with discipline:
> read code before changing it, design before coding, and verify before claiming
> completion.

## Cheat sheet

The agent classifies each task and states the class; you can override it. You
approve once per route, and you review the diff and commit.

| Task | What the agent does | What you approve | Files produced |
|---|---|---|---|
| Spike or bug question | Investigates and reports evidence or a recommendation | A Spike: a nod on what it will try; a bug question: nothing | None (probe code stays throwaway) |
| Clear, small change | Checks impact, codes, checks, reviews | Nothing; it posts a notice | Code and tests; `delta.md` only if a wiki requirement changes |
| Bounded feature | Settles decisions, shows a short design in chat | The chat design | Code and tests; `delta.md` only if needed |
| Bounded bug | Reproduces, finds the root cause, fixes, reviews | Nothing, unless expected behavior is unclear | Regression check and fix; `delta.md` only if needed |
| Architectural feature or bug | Clarifies, writes `design.md` and `tasks.md` | One joint approval of `design.md`, `tasks.md`, and any `delta.md` | Change folder `docs/agent-devkit/changes/<name>/`, archived after final review |

Every stop ends with `Next / Waiting on / Done when`. Legacy specs and decision
files are historical; open legacy plans can still be revised and finished. New
work uses change folders.

---

## Table of Contents

1. [Why agent-devkit?](#1-why-agent-devkit)
2. [Installation](#2-installation)
3. [The 13 Skills](#3-the-13-skills)
4. [Standard Workflow — Idea to Production](#4-standard-workflow--idea-to-production)
5. [Real Examples](#5-real-examples)
6. [Requirement format](#6-requirement-format)
7. [Artifact catalog](#7-artifact-catalog)
8. [Tips & Best Practices](#8-tips--best-practices)
9. [FAQ](#9-faq)

*Tiếng Việt: [GUIDE.vi.md](GUIDE.vi.md)*

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
`SKILL.md` playbook containing a repeatable process the agent follows.
`document-wiki` bundles one dependency-free validator for published wiki
content; the workflow has no build step.

**Result:** the agent works like a disciplined engineer — design → approval →
implementation → verification → documentation.

---

## 2. Installation

### Option 1: Agent Skills CLI (default branch; unpinned)

```bash
# Install all skills into Claude Code
npx skills add asta-nguyen/agent-devkit -a claude-code
```

This follows the repository's default branch. For team installs that need a
fixed version, use the native plugin commands below and pin every client to the
same published release tag.

> **Note:** The GitHub repository is `asta-nguyen/agent-devkit` (not
> `asta/agent-devkit`).

### Option 2: Native plugin/config packaging

This repository includes native packaging for the supported clients:

- **Codex:** install with `codex plugin marketplace add` and
  `codex plugin add`.
- **Claude Code:** install with `claude plugin marketplace add` and
  `claude plugin install`.
- **Cursor:** import `.cursor-plugin/marketplace.json` through a team
  marketplace, or test locally from `~/.cursor/plugins/local/`.
- **Devin CLI:** install with `devin plugins install`.
- **OpenCode:** add the Git-backed plugin to the target project's
  `opencode.json`; `.opencode/plugins/agent-devkit.js` registers the canonical
  `skills/` tree and bootstraps `using-devkit`.

Each client reuses the canonical Markdown skills under `skills/`.

### Pin one release for the team

Use one published tag across clients. These examples use `v0.10.0`; replace it
in all three places with a release tag that contains the changes the team needs.

```bash
codex plugin marketplace add asta-nguyen/agent-devkit --ref v0.10.0
codex plugin add agent-devkit@agent-devkit
```

```bash
claude plugin marketplace add asta-nguyen/agent-devkit#v0.10.0
claude plugin install agent-devkit@agent-devkit --scope user
```

For OpenCode, set the plugin entry in `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "agent-devkit@git+https://github.com/asta-nguyen/agent-devkit.git#v0.10.0"
  ]
}
```

Change all configured refs together when the team upgrades; the per-client
commands are in [README — Upgrade](README.md#upgrade). Refreshing a marketplace
alone keeps its existing pin.

### Option 3: Manual copy (for projects that discover `.agents/skills`)

```bash
# From the target project directory:
mkdir -p .agents/skills
cp -R /path/to/agent-devkit/skills/. .agents/skills/
find .agents/skills -name SKILL.md -print
```

When installed this way, run the bundled wiki check from the target project
with `node .agents/skills/document-wiki/scripts/validate-llm-wiki.mjs .`.

To run the check on every pull request, add this workflow as
`.github/workflows/validate-llm-wiki.yml`. The `pull_request` trigger has no
path filter, so it runs for every PR. Keep its `ref` on the same DevKit release
tag the team uses.

```yaml
name: Validate LLM wiki

on:
  pull_request:

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: 22
      - uses: actions/checkout@v7
        with:
          repository: asta-nguyen/agent-devkit
          ref: v0.10.0
          path: .agent-devkit
      - name: Validate wiki
        run: node .agent-devkit/skills/document-wiki/scripts/validate-llm-wiki.mjs .
```

### Option 4: OpenEZ (optional semantic index)

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

OpenEZ is optional for semantic or cross-module questions; repository size or
index health is not a search-routing precondition. `read-codebase-context` and
`document-wiki` use this Locate → Expand → Confirm → Read flow:

| Stage | Need | Tool |
|---|---|---|
| Locate | Concept or behavior | OpenEZ `code_query` |
| Locate | Approximate filename | FFF fuzzy file find |
| Locate | Identifier or literal | FFF grep, falling back to `rg` |
| Locate | Regex | `rg` |
| Expand | Callers and callees | OpenEZ `code_context` (1–2 hops) |
| Confirm | Dynamic or registration references | FFF multi-pattern grep, falling back to `rg` |
| Read | Large-file structure and evidence | OpenEZ `code_outline`, then read current source directly |

They read current source as evidence and fall back when a tool fails, the
workspace is not indexed, or results are irrelevant. `setup-codebase` continues
with direct source reads. Mention `setup-openez` only when direct search cannot
establish a needed relationship; never install tools or change MCP
configuration silently.

### Optional: FFF search

FFF adds a background watcher that updates an in-memory content index when it
detects file changes, including uncommitted edits. It also provides
frecency-ranked fuzzy file find, multi-pattern grep in one call, and git-aware
annotations for modified, untracked, and staged files. See the [official FFF
README, MCP server section](https://github.com/dmtrKovalenko/fff).

It is useful in large repositories or monorepos with repeated searches,
approximate filename lookups, caller/reference sweeps during review or
lean-audit, or alongside OpenEZ for files changed after the last index. Costs
include RAM for the content index, a background watcher, per-client MCP
configuration, and a startup update check. For fff-mcp 0.11.0,
`--no-update-check` is documented by `fff-mcp --help`, not the README.

| OS | Install |
|---|---|
| macOS / Linux | <code>curl -L https://dmtrkovalenko.dev/install-fff-mcp.sh &#124; bash</code> |
| Windows (PowerShell) | <code>irm https://raw.githubusercontent.com/dmtrKovalenko/fff/main/install-mcp.ps1 &#124; iex</code> |
| macOS / Linux (Homebrew) | `brew install dmtrKovalenko/fff/fff-mcp`<br>`brew upgrade fff-mcp` for later updates |

Read the install script before piping it to a shell. Use an absolute binary path
for MCP registration because desktop clients may not inherit the shell `PATH`.
The one-line installer defaults to `$HOME/.local/bin/fff-mcp`, Homebrew to
`$(brew --prefix)/bin/fff-mcp`, and Windows prints the installed path. The
official Codex example is `codex mcp add fff -- "$(brew --prefix)/bin/fff-mcp"`;
it creates an entry like:

```toml
[mcp_servers.fff]
command = "/absolute/path/to/fff-mcp"
```

To skip the update check, add `args = ["--no-update-check"]` separately by
hand; the command above does not create it. For other clients, use their
official docs or the installer's printed wiring instructions rather than an
unverified snippet: [Claude Code](https://code.claude.com/docs/en/mcp),
[Cursor](https://docs.cursor.com/context/model-context-protocol),
[OpenCode](https://opencode.ai/docs/en/mcp-servers/), and
[Devin](https://docs.devin.ai/cli/extensibility/mcp/configuration). Restart
the client after setup.

In fff-mcp 0.11.0, tool names are `find_files`, `grep`, and `multi_grep`; the
FFF README calls them `fffind`, `ffgrep`, and `fff-multi-grep`. These are
version examples; use the connected server's tool list if names differ. Say
“FFF grep” for this capability; it uses literal identifiers, while regex stays
with `rg`. Do not copy a blanket “use FFF for any search” rule into
`CLAUDE.md` or `AGENTS.md`; devkit routing remains authoritative.

FFF is never required. Without it, skills use `rg` and reach the same results.

### After installation

- **Restart the agent session** so the skill list is reloaded.
- **Do not customize** skill files in the target project. Updates overwrite
  same-named skills; retired skill folders must be removed manually.
- Copy **all complete skill folders**, including their `references/` files,
  because skills chain together and load those supporting files when needed.
- **Check progress on request.** Run
  `node <plugin>/hooks/session-start.js --status` from the project root for a
  read-only text overview: each open change's approval gate, done/total tasks,
  current and next task, and handoff `Next action`, plus the newest three
  standalone handoffs, or "no saved progress". The `SessionStart` hook never
  scans; it only adds a line naming this command (OpenCode's plugin does not).

---

## 3. The 13 Skills

### Bootstrap & Context

| Skill | When to use | Summary |
|---|---|---|
| `using-devkit` | Starting work or deciding which workflow applies | Routes the task to the owning devkit skill; it does not replace that skill's process. |
| `setup-codebase` | The repo lacks context files or recorded repository conventions | Reads repository evidence, creates missing context files, and captures missing conventions only after user approval. |
| `setup-openez` | The user agrees to use OpenEZ or the index is stale | Gets approval before CLI install, existing `AGENTS.md` guidance, or client wiring; reports CLI indexing separately from MCP verification and marks an unavailable MCP query unverified. |
| `read-codebase-context` | Before design, planning, or wiki work that needs affected files, callers, and tests | Uses OpenEZ for concepts/callers, FFF for fuzzy filenames/literal references, `rg` for regex, then reads current source and records an impact map; after Locate, may dispatch one no-edit host subagent per independent question, in parallel within host limits. |
| `context-handoff` | A session must pause or is approaching its context limit | Saves a compact, source-grounded checkpoint (`handoff.md` in the change folder, or `docs/agent-devkit/handoffs/` outside a change) for the next session. |

### Feature Development

| Skill | When to use | Summary |
|---|---|---|
| `brainstorm-feature` | A new, ambiguous request or a request that changes product behavior | Classifies Spike / Bounded / Architectural, asks clarifying questions, and presents a design; routes Spike to investigation, Bounded to implementation, and Architectural through a change folder. Only eligible exact-scope changes skip waiting after impact checks. |
| `plan-feature` | Right after an architectural `design.md` is written, or to revise an open change | Writes `tasks.md` (the plan): behavior, interfaces, named test cases, verification, and progress, without function or test code; presents design and tasks for one joint approval. |
| `estimate-feature` | When a PM or BA explicitly requests an estimate | Estimates an hours range for each plan task with confidence and rationale. Runs only when requested. |
| `implement-task` | An approved bounded design or an approved architectural plan exists | Runs existing relevant checks before the first source edit, traces code, and verifies each non-trivial change; it does not add a runner just to record a baseline. |
| `systematic-debugging` | Any technical issue: bug, test failure, build failure, or performance problem | Investigates root cause, classifies the bug, writes a verify plan, then fixes bounded bugs or hands architectural bugs off for design. |
| `review-and-verify` | After implementation and before claiming completion | Enforces **NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE**. Reviews the diff, runs checks, performs a complexity pass, and may request an independent no-edit review when a spawn tool and exact diff target exist. |

### Auditing

| Skill | When to use | Summary |
|---|---|---|
| `lean-audit` | When the user requests a whole-repository over-engineering or bloat audit | Runs an independent, read-only audit that reports ranked, evidence-backed simplicity cuts; it does not apply fixes or replace `review-and-verify`. |

### Wiki Lifecycle

| Skill | When to use | Summary |
|---|---|---|
| `document-wiki` | Task documentation needs updating, or standalone wiki work is requested | Task updates selects affected behavior automatically in an existing wiki. Standalone wiki work inventories and waits for feature selection. Every claim needs source evidence. |

Deep pages use only categories established by evidence: `architecture/` for
system structure, `domains/` for state and requirements, `workflows/` for
user/operator flows, `integrations/` for external systems, `operations/` for
jobs/cron/deployment, and `decisions/` for source-backed decisions. Folders are
created only when a real page needs them.

---

## 4. Standard Workflow — Idea to Production

For you, the flow has three parts: **understand the task → implement → review
and finish**. Checks, documentation, delta merging, and archive are internal
work; you answer material questions and approve the solution when needed.

The agent classifies every task, states the class so you can override it, and
follows its row. You only step in at the approvals shown. After an approval
the agent calls the next skill itself, and every stop ends with a
`Next / Waiting on / Done when` block.

| Task | Flow |
|---|---|
| Spike or bug question ("can we…?", "is this a bug?") | Investigate → report a recommendation or evidence; no code |
| Clear, small change | Context + impact check → code → check → review |
| Bounded feature | Settle open decisions → **approve short chat design** → code → check → review |
| Bounded bug | Reproduce → trace root cause → check fails → fix → check passes → review |
| Architectural feature or bug | Clarify → write `design.md` + `tasks.md` → **one joint approval** → code → check each task → review |

- When in doubt, the heavier row wins; hidden complexity moves a task up,
  never down.
- A clear, small change must meet all four: you stated the exact change and
  result; the impact check keeps every caller, test, config, and wiki page in
  that scope; it touches no public API, schema, dependency, CI, security
  boundary, or data-loss risk; and it is not a bug. Otherwise it is Bounded.
- `design.md` explains the solution and behavior; `tasks.md` is the plan
  (steps, verification, progress). There is no separate plan file.
- Before the first source edit, implementation runs existing relevant tests or
  checks and records failures as baseline. If none exist, it records that; it
  does not add a test runner just to establish a baseline.
- Before approval, the agent summarizes the goal, scope/impact, ordered tasks,
  verification, documentation, and risks/open decisions in chat, with links to
  the detailed files. It states what approval permits; planning-only requests
  get the same summary without starting code.
- Code-task setup creates necessary context without creating a missing wiki.
  Approval and decisions are checked before new-project source creation.
  Debugging called inside implementation returns evidence to its caller;
  equivalent revisions keep approval without another approval request.
- One approval authorizes implementation through final review. The agent asks
  again only when scope, behavior, an interface, a schema, or risk changes
  materially. In-scope check failures are fixed and rerun. The agent stops when
  the same blocker remains after a fix attempt with no new information, after
  three failed attempts on one blocker (then it returns to `brainstorm-feature`),
  when a fix needs out-of-scope work, or when a decision is needed.
- Implementation updates documentation for affected behavior automatically
  when `docs/llm/` exists. It merges any delta before other content edits;
  final review verifies code and documentation, then archives and checks links.
  To cancel an open change, record the user's reason, move its folder to
  `changes/cancelled/<same name>/` with the archive's move-and-relink step
  (only links change), and list it under `## Cancelled changes`.
  Cancellation does not complete the change or discard code/Git work; follow-up
  starts a new change. Missing required coverage blocks completion. Without a
  wiki, skip updates without creating one. You review the diff and commit.
- `estimate-feature` runs before the joint approval only when you ask for an
  estimate; "estimate only" or "plan only" never starts implementation.
- Planning and estimation may use a written design with planned assumptions
  labeled `pending approval`. A repair returns to its caller, preserving the
  gate for equivalent edits and resetting it to `pending` for material changes.
  Architectural drafts enter the index only after joint approval.

### Quick routing

```text
using-devkit                          # choose the right workflow skill
setup-codebase                         # first visit to a repo missing context
setup-openez                           # setup after the user agrees to use OpenEZ
read-codebase-context                  # understand code before changing it
context-handoff                        # checkpoint unfinished work before pausing
document-wiki                          # document existing features
lean-audit                             # audit whole-repo simplicity; report only
brainstorm-feature → plan-feature      # architectural work: design → tasks.md → archive
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
3. Create **only** missing files. Before adding optional OpenEZ guidance to an
   existing `AGENTS.md`, show the exact section and wait for approval. Every
   claim must have a source:
   - `AGENTS.md` — purpose, layout, commands, conventions, and gotchas
   - `AGENTS.md` `## Documentation` — `docs/llm/INDEX.md` entry point and
     wiki-first rules for behavior and workflow questions
   - `CLAUDE.md` — a short pointer to `AGENTS.md`
   - `docs/llm/` skeleton — `AGENTS.md` and `INDEX.md`; preserve legacy
     `LOG.md` files without reading or updating them
4. Append missing `.gitignore` rules for Obsidian and OpenEZ without untracking
   already-tracked files.
5. If OpenEZ is missing, use direct source search. Mention optional
   `setup-openez` only when cross-module tracing remains difficult; never
   install it silently.
6. Report created, updated, kept, tracked artifacts, and evidence paths.

**Sample result:**

```text
Created:
  - AGENTS.md
  - CLAUDE.md
  - docs/llm/AGENTS.md
  - docs/llm/INDEX.md

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
6. After approval, call `implement-task` directly (no need to retype a skill
   name); it calls `review-and-verify` after implementation.

**No spec file or tasks file is created.** A short chat design is enough. When a
documented `docs/llm/` requirement needs `ADDED`, `MODIFIED`, or `REMOVED`,
`brainstorm-feature` writes a `delta.md` in a change folder before
implementation, and `review-and-verify` archives it.

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
3. Scan only applicable edge-case branches and explain non-obvious omissions.
   Recommend one clear solution when the choice is straightforward; present
   two or three options only when trade-offs matter.
4. Once decisions are settled, create the change folder
   `docs/agent-devkit/changes/2026-08-17-bg-jobs/` and write the design
   (scope, architecture, interfaces, error cases, verification) straight to
   `design.md`, plus `delta.md` for any documented requirement the change
   alters or adds. Self-review both.
5. Call `plan-feature`, which writes `tasks.md` beside `design.md` with ordered
   tasks. The tasks copy cross-task rules from the design into
   `## Global Constraints` and map each edge case to a task and verification
   check. `tasks.md` starts at `Status: pending`.
6. Run `estimate-feature` before the approval only if the user requested an
   estimate; an estimate never authorizes implementation.
7. Present `design.md`, `tasks.md`, and `delta.md` together and wait for one
   approval; revise the files in place until approved. An "ok implement" said
   before these files were presented does not count.
8. After approval, set `Status: approved` and link the folder in
   `docs/agent-devkit/INDEX.md`. If the repo lacks `AGENTS.md`, call
   `setup-codebase` first.
9. Call `implement-task`. It works through tasks in order,
    marking each `Progress: done` with a `Result:` once its `Verify` check
    passes, so any session can see where work stopped. It may record a
    session-only `Ruling R<n>` for a reversible,
    behavior-equivalent implementation detail; consequential choices still
    require user clarification or approval.
10. `implement-task` calls `review-and-verify` for diff review, tests, and the
    complexity pass. Findings cite `path:line`; unverifiable requirements fail
    under `Spec gaps` as `cannot verify` with the missing evidence named.
11. Before final review, implementation calls `document-wiki` Task updates
    to merge `delta.md` and finish affected documentation. Final review then
    checks both code and docs; archive only moves the folder and repairs links.

**Artifact structure:**

```text
docs/
  agent-devkit/
    INDEX.md                          # links all artifacts
    changes/
      2026-08-17-bg-jobs/
        design.md                     # approved design
        delta.md                      # ADDED / MODIFIED / REMOVED requirements
        tasks.md                      # execution tasks
        estimate.md                   # optional, when requested
        decisions.md                  # optional, persistent decisions
        handoff.md                    # optional, when work pauses
      archive/                        # completed changes
      cancelled/                      # cancelled changes, with reason in INDEX.md
    specs/ plans/ decisions/ estimates/   # legacy; open plans may be revised
    handoffs/                         # checkpoints outside a change
  llm/                                # source-grounded, verified wiki
    AGENTS.md
    INDEX.md
    architecture/
      overview.md
    operations/
      background-jobs.md              # updated before final review
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
- For staged changes, inspect `git diff HEAD`; for a branch review, include
  `git diff <target-branch>...HEAD` against the PR/task's intended target branch
  (the three-dot comparison uses the merge-base), then check untracked paths from
  `git status --short`.
- Trace the data flow to find where the bad value originates.

**Phase 2 — Analyze:**

- Find similar working code in the same codebase.
- List every difference between the working and broken paths.

**Phase 3 — Hypothesis:**

- State one specific hypothesis: "The root cause is X because Y."
- Test it minimally with one variable at a time.
- If it fails, form a new hypothesis instead of stacking fixes.

**Phase 4 — Implement:**

- Classify the bug as a Bug question, Bounded, or Architectural. A Bug
  question reports evidence and stops; an Architectural bug hands off to
  `brainstorm-feature`.
- For a Bounded bug, establish expected behavior from source, tests, and the
  current wiki.
- If investigation points to an environmental, timing-dependent, or external
  cause, record the evidence. A Bug question reports and stops. Any
  production handling returns to classification, expected-behavior, and verify
  plan gates; unresolved behavior goes to `brainstorm-feature` for approval.
- Write a verify plan before the regression check or production fix.
- Reproduce the symptom with an existing test or another repeatable check.
- Verify the check fails before the fix.
- Apply the smallest root-cause fix.
- Verify the same check passes after the fix.
- Run relevant existing tests and checks; do not set up a test runner solely
  for this fix.
- Run `review-and-verify`. Refresh any existing wiki page that contradicts the
  fix before claiming completion; automatically document missing task coverage
  before final review when the wiki exists.

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

1. Read root `AGENTS.md` and, if the wiki exists, `docs/llm/AGENTS.md`. If
   either conflicts with current-source verification or requires LOG/snapshot
   freshness, report the exact path and line. For such a conflict, continue
   without asking again when the user already chose the current-source/no-log
   workflow for this task; preserve the old instructions and report that they
   need an update. Without that decision, stop for user resolution. If the wiki
   is missing after this preflight, run `setup-codebase` inline.
2. Resolve each internal Markdown link relative to the file containing it.
   During wiki work, scan all `docs/llm/` pages for legacy `[[...]]` links and
   migrate every resolvable one. Resolve legacy targets from the nearest
   `.obsidian/` root when present, otherwise from `docs/llm/`; confirm the
   target file and write its new Markdown link relative to the source page.
   Report missing or ambiguous targets; do not claim the migration is complete
   while any legacy wikilink remains.
3. Read existing wiki content pages; do not open or use a legacy `LOG.md`.
4. Build a domain map from **behavior**, not filenames. For each selected
   feature, check an evidence matrix covering the entry/caller, use case, state
   changes, side effects, authorization and constraints, error paths, and
   relevant tests. Trace the feature through every established stage; a file
   inventory is baseline coverage, not deep documentation.
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
       Wiki: docs/llm/workflows/password-reset.md
       Reason: verification limit — Reset-token behavior has not been verified
               against current source/tests this run.
   ```

7. **WAIT** for the user to select undocumented `[ ]` features and `[~]` pages
   classified as confirmed content gaps for refresh. Keep verification-limit
   `[~]` pages in the report, but do not offer them for rewriting; continue
   feasible checks and report the exact missing evidence if blocked.
8. Write pages for selected features. Deep pages include `## Requirements`,
   `## Flow`, `## State changes`, `## Side effects`, `## Authorization &
   constraints`, `## Error paths`, and `## Tests`. Requirements use stable
   `<PREFIX>-<slug>` IDs, scenarios, and `Evidence:` paths; prefixes are
   registered in the `## Requirement prefixes` table in `INDEX.md`. Every
   `## Sources` entry is an exact existing file path; use `Tests: none found`
   only after searching the repository test tree.
9. Update `INDEX.md`; do not read or write `LOG.md`, and preserve any legacy
   log file unchanged.
10. Read current source/test files and compare page claims in this run; verify
    source paths exist, relative Markdown links resolve, test claims are
    supported, and `git diff --check` passes. Mark `[x]` only after sufficient
    checks. For `[~]`, label the reason `verification limit` or
    `confirmed content gap`; only confirmed gaps are offered for refresh.

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

4. Save it as `estimate.md` beside `tasks.md` in the change folder (a legacy
   plan keeps `docs/agent-devkit/estimates/YYYY-MM-DD-<slug>-estimate.md`).
5. Link the estimate from `tasks.md`; the change folder is already indexed.
6. **Do not** apply a generic "AI is 50% faster" discount.
7. **Do not** edit application code or commit.

---

## 6. Requirement format

Deep wiki pages describe verified behavior under `## Requirements` — legacy
pages may still show `## Business rules` until they are refreshed. Each
requirement looks like:

```md
### PAY-refund-cap

The system SHALL reject a refund larger than the remaining captured amount.

#### Scenario: over-refund rejected

- GIVEN a payment captured for 100
- WHEN a refund of 120 is requested
- THEN the refund is rejected with amount_exceeds_capture

Evidence: src/payments/refund.ts, test/refund.test.ts
```

Rules:

- The ID is `PREFIX-slug`: an uppercase domain prefix plus a lowercase
  kebab-case slug. The heading contains only the ID, so its anchor
  (`#pay-refund-cap`) stays stable when the wording changes.
- Exactly one `SHALL` sentence describing observable behavior, and at least
  one `#### Scenario:` with `GIVEN`/`WHEN`/`THEN`.
- One `Evidence:` line naming exact source and test paths; each path must
  exist and also appear in the page's `## Sources`.
- Requirements are sorted by ID, and each page uses a single prefix
  registered in the `## Requirement prefixes` table in `docs/llm/INDEX.md`.
- A removed ID is never reused; `docs/llm/INDEX.md` keeps the retired-ID
  list. A claim without source evidence is an open question, not a
  requirement.
- Requirements are never written from a proposal or unimplemented behavior.

`document-wiki` enforces this format when writing pages;
`review-and-verify` re-checks the invariants on changed wiki pages.

## 7. Artifact catalog

Every file and folder the devkit can create inside a target project. Nothing
is global or mandatory: each entry appears only when its condition holds.

| Path | Group | Appears when | Created by |
|---|---|---|---|
| `AGENTS.md` | context | Project contract (usually always present) | `setup-codebase` |
| `CLAUDE.md` | context | `setup-codebase` runs | `setup-codebase` |
| `CONVENTIONS.md` | context | Conventions worth storing separately | `setup-codebase` |
| `docs/agent-devkit/INDEX.md` | process | First process artifact exists | whichever skill creates it |
| `docs/agent-devkit/specs/` | process (legacy) | Approved architectural design (legacy work) | `brainstorm-feature` |
| `docs/agent-devkit/plans/` | process (legacy) | After spec approval (legacy work) | `plan-feature` |
| `docs/agent-devkit/decisions/` | process | Legacy decisions; read only, new decisions go to a change's `decisions.md` | none (legacy) |
| `docs/agent-devkit/estimates/` | process | User-requested estimate for a legacy plan | `estimate-feature` |
| `docs/agent-devkit/handoffs/` | process | Checkpoint for work outside an active change | `context-handoff` |
| `docs/agent-devkit/changes/<name>/` | process | Open change: Architectural has `design.md` and `tasks.md`, with `delta.md` only when needed; Bounded has `delta.md` only when needed. A Bounded change with no artifact has no folder. Optional `estimate.md` (when `tasks.md` exists), `decisions.md`, and `handoff.md` stay alongside them. | `brainstorm-feature`, `plan-feature`, `implement-task` |
| `docs/agent-devkit/changes/archive/<name>/` | process | `review-and-verify` archives a verified change | `review-and-verify` |
| `docs/agent-devkit/changes/cancelled/<name>/` | process | An open change is cancelled with a recorded reason; its folder moves with only links rewritten, and its INDEX link moves to `## Cancelled changes`. This does not mark work complete. | `using-devkit` |
| `docs/llm/AGENTS.md`, `INDEX.md` | wiki | Wiki skeleton is created | `setup-codebase` |
| `docs/llm/FEATURES.md` | wiki | Only updated if it already exists | `document-wiki` |
| `docs/llm/architecture/overview.md` | wiki | Baseline map | `document-wiki` |
| `docs/llm/{architecture,domains,workflows,integrations,operations,decisions}/` | wiki category | A real page belongs to the category | `document-wiki` |
| `.agents/skills/` | install | Host uses a local skills folder instead of a plugin | user |
| `.openez/` | local index | OpenEZ approved and set up | `setup-openez` |

Never create empty folders ahead of need: `INDEX.md` indexes process
artifacts once they exist, `LOG.md` is never created new, and `docs/llm/`
category folders appear only when a real page needs them.

## 8. Tips & Best Practices

### For team leads and PMs

- **Run `setup-codebase` first** when onboarding a repo, and rerun it when
  repository-specific conventions are not recorded.
- **Copy all complete skill folders**, including their `references/` files,
  because they chain together and load those supporting files when needed.
- **Restart the agent session** after installing skills so the skill list reloads.
- **Do not customize skill files** in the target project. Updates overwrite them.
- **OpenEZ is optional but valuable** for large repositories; semantic search is
  much faster and more useful for callers than plain grep.
- **Convention capture is code-first.** `setup-codebase` checks declared
  configuration, then repeated code, then web or general practice only when
  the repository has no signal; proposed lines require your approval.
- **Keep one convention source of truth.** `AGENTS.md` is the default; root
  `CONVENTIONS.md` is reserved for more than 40 non-empty rule lines or
  area-scoped rules and is linked by one mandatory pointer.

### For developers

- **Always run `brainstorm-feature`** before coding a new feature. Even when the
  request seems clear, the agent should classify it and present a design.
- **The approval gate is mandatory.** The agent must STOP and wait for you to
  say "yes" before implementation.
- **Architectural work has one persisted gate.** You approve `design.md` and
  `tasks.md` together; an earlier "ok" does not approve files you have not
  seen. After approval, `tasks.md` changes from `Status: pending` to
  `approved`; the agent must not ask twice.
- **User clarifications become explicit decisions.** Implementation-only
  choices stay in the current session. Observable behavior or requirement
  changes go into the change's `decisions.md` (creating and indexing the change
  folder when needed) or a legacy plan/spec `## Decision Log`. Material changes
  to `tasks.md` go back through `plan-feature`, which resets the approval to
  `pending`.
- **Plans carry approved constraints forward.** `## Global Constraints` copies
  cross-task rules from the design, or says `None.`; edge
  cases map to concrete tasks and checks.
- **Completed changes stay historical.** A change folder has no `Execution`
  field: `review-and-verify` archives it only after all tasks pass final
  review. Later requirements are new work: bounded changes need no folder,
  while architectural changes get a new change folder. An open change is
  revised in place and keeps its folder name. Legacy plans keep their
  `Execution` field and are read-only for new work.
- **Low-impact ambiguity does not stall implementation.** The agent may record
  a session-only technical ruling only when every viable choice is reversible
  within the current task and preserves observable behavior.
- **Use the team's normal Git workflow:** one task branch/PR per task; worktrees
  are optional. Existing commit and push approval rules still apply.
- **Include issue IDs in new process-artifact names** when provided: use
  `YYYY-MM-DD-<issue-id>-<slug>` before any existing type suffix for specs,
  plans, decisions, estimates, and handoffs. Without an ID, keep the existing
  format; never invent an ID or rename an existing file.
- **Resolve shared-index conflicts by keeping every task's links** in
  `docs/agent-devkit/INDEX.md` and `docs/llm/INDEX.md`, then verify every target.
- **Do not ask for a commit** until `review-and-verify` passes. The agent leaves
  the working tree for you to review and commit.
- **When debugging, do not push the agent to "fix it quickly."**
  `systematic-debugging` avoids guess-and-check thrashing.
- **The `docs/llm/` wiki contains verified behavior only.** Proposed specs and
  plans belong in `docs/agent-devkit/`.
- **Every implementation reports wiki impact.** A behavior-changing bug fix or
  feature uses `Wiki impact: yes` and lists affected pages. An existing page
  that contradicts the change blocks completion until `document-wiki`
  refreshes it; missing task coverage also blocks completion. Implementation
  calls Task updates automatically; standalone wiki work still needs selection. `no` requires inspected page
  and source evidence.
- **Review checks recorded conventions.** Matching scopes use the most specific
  rule; violations cite `path:line`, while repositories without conventions
  report `not-applicable`.

### For agents (rules embedded in the skills)

- **Iron Law (`review-and-verify`):** NO COMPLETION CLAIMS WITHOUT FRESH
  VERIFICATION EVIDENCE.
- **Iron Law (`systematic-debugging`):** NO FIXES WITHOUT ROOT CAUSE
  INVESTIGATION FIRST.
- **Every claim needs a source path.** Filenames alone are not evidence.
- **Every review finding needs precise evidence.** Cite `path:line` when source
  exists; otherwise report `cannot verify` and name the evidence still needed.
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

## 9. FAQ

### Q: Which agents can use these skills?

Skills are Markdown playbooks. Any agent that can read `SKILL.md` from
`.agents/skills/`, a native plugin/config entry, or the skills CLI can use them.
Shared bootstrap behavior and packaging metadata have local smoke checks.
End-to-end installation still depends on the installed Claude Code, Codex,
OpenCode, Cursor, or Devin client.

### Q: Is OpenEZ required?

**No.** Follow the Locate → Expand → Confirm → Read tool table above. OpenEZ
and FFF are optional; use `rg` when FFF is unavailable, and read current source
directly. Mention `setup-openez` only when direct search cannot establish a
needed relationship. Do not recommend it based on repository size.

### Q: Are unit tests required?

**No.** Every non-trivial change needs a meaningful verification check. Use
existing tests when they cover the behavior; projects without tests can use a
repeatable CLI, self-check, or recorded manual procedure. The workflow does
not require adding a unit-test runner. If required behavior cannot be
verified, report `cannot verify` instead of claiming completion.

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

### Q: How do I know whether wiki coverage is current?

`document-wiki` reads current source and relevant tests, then checks the page's
material claims. It marks `[x]` only after sufficient verification in that run.
A `[~]` reason is either a `verification limit` (checks incomplete or evidence
inaccessible; not a refresh candidate) or a `confirmed content gap` (completed
checks prove an omission or contradiction; a refresh candidate). A source
change alone does not make an accurate page stale.

### Q: How many skills are there? Can I add a new one?

There are currently 13 skills. Add a new skill by creating
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
│  BUG:         systematic-debugging → fix or hand off        │
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
