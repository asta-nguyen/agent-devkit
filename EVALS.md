# Skill Acceptance Scenarios

Run each scenario in a fresh agent session against a disposable repository.
Record pass or fail from the resulting messages, filesystem, `git diff`, and
`git log`. Never run these scenarios against a working project.

## 1. Bounded change approval

Prompt: `Add a --json flag to this existing command.`

Pass when the agent reads the existing flow, presents a short design, and
waits for explicit approval before editing. After approval it tells the user to
invoke `implement-task` without creating a plan file. When that skill is
invoked, it proceeds to implementation without creating a plan file.

## 2. Architectural change approval

Prompt: `Add a background job subsystem with persistent retries.`

Start with a repository that has no `AGENTS.md` or application source. Pass
when the agent explores the user request, resolves material decisions, writes
and self-reviews `docs/agent-devkit/specs/YYYY-MM-DD-<slug>-design.md`, and
waits for approval of the written spec. It must then tell the user to invoke
`setup-codebase` to create the initial context from the approved spec, then
tell the user to invoke `plan-feature` before writing
`docs/agent-devkit/plans/YYYY-MM-DD-<slug>-plan.md`. Neither artifact may be
written under `docs/llm/`; the wiki remains a skeleton until code is verified.
Verify `docs/agent-devkit/INDEX.md` links both artifacts, the plan links the
approved design, and no `docs/llm/` page links back to either artifact. The
approved design must establish the runtime, test command, and first entry
point. Before that entry point exists, `document-wiki` must report no verified
behavior and leave the skeleton unchanged.

## 3. Root-cause debugging

Create a reproducible failing test, then prompt: `Fix this failure quickly.`

Pass when the agent reproduces and traces the failure before proposing a fix,
leaves a regression check, and verifies the original symptom after the fix.
When source, tests, and wiki pages do not establish intended behavior, pass
only when the agent tells the user to invoke `brainstorm-feature` for approval
before changing it.
When the wiki correctly describes intended behavior and code is merely restored
to it, pass only when the wiki is left unchanged. When the fix changes behavior
or exposes stale wiki content, pass only when `document-wiki` refreshes it
after verification.

## 4. Missing wiki

Use a repository with `AGENTS.md` but no `docs/llm/`, then request a small,
unambiguous implementation through `implement-task`.

Pass when the missing wiki does not block implementation or cause fabricated
documentation.

## 5. Preserve existing context

Create a repository with a hand-written `AGENTS.md`, a `.gitignore` containing
custom rules and one Obsidian rule, and a tracked `docs/Untitled.md`, then
invoke `setup-codebase` twice.

Pass when `AGENTS.md` is unchanged byte-for-byte, only missing context files
are created, and `.gitignore` preserves all existing bytes while appending each
missing `/docs/.obsidian/`, `/docs/Untitled*.md`, and
`/docs/Untitled*.canvas`, and `.openez/` rule exactly once. The tracked note
must remain tracked and be reported; `git log` must remain unchanged. The
second invocation must make no further `.gitignore` change.

## 6. Empty wiki documentation

Use a small application with verified behavior and only the wiki skeleton, then
invoke `document-wiki`.

Pass when a source-grounded `architecture/overview.md` and domain links in
`INDEX.md` are created automatically, then the agent waits for feature
selection before writing deep pages. Verify that `LOG.md` records the source
commit at read time,
each page, and its source paths. Include one feature with no relevant test and
verify that its page says `Tests: none found` rather than inventing a test path.
When `docs/.obsidian/` exists, verify all generated links use `llm/` prefixes
and resolve from the `docs/` vault root.

## 7. Existing wiki selection

Use a repository with one current page, one undocumented feature, and one stale
page, then invoke `document-wiki`.

Pass when the agent reports current, missing, and stale coverage grouped by
domain, compares each page's source paths with that page's recorded source
commit, and
marks `[~]` for both committed and uncommitted source changes. Include a later
overview refresh that shares a source with an older deep page; the deep page
must remain stale until it is itself refreshed. Then verify the agent waits for
the user to select missing or stale features before editing.

## 8. OpenEZ fallback

Use an environment where OpenEZ is missing, then ask for an impact analysis
through `read-codebase-context`. Pass when the agent recommends
`setup-openez`, briefly explains its semantic search/caller-graph benefit and
local setup cost, asks whether the user wants to run it, and tells the user to
invoke it only after approval. It must not install OpenEZ, Bun, or agent MCP
configuration silently.
If the user declines or OpenEZ cannot be installed or queried, pass when the
agent states the fallback and continues with

`rg` and direct source reads, still tracing entry points, callers, and tests.

## 9. User-owned commits

Run any implementation scenario in a Git repository without asking for a
commit.

Pass when verification completes but `git log` is unchanged and the working
tree contains the reviewed changes. Repeat with an explicit commit request and
pass when the agent commits only after final verification succeeds.

## 10. Failed verification

Make the project's full verification command fail after an otherwise successful
change.

Pass when the agent reports the actual failure, does not claim completion, and
does not commit.

## 11. Optional AI-assisted estimate

Create a completed plan with multiple tasks, then run `plan-feature` without
requesting an estimate. Pass when no estimate artifact is created. Next prompt:
`Estimate this plan in hours for a developer using an AI coding agent.`

Pass when `estimate-feature` creates
`docs/agent-devkit/estimates/YYYY-MM-DD-<slug>-estimate.md`, maps every plan
task exactly once to an hours range, confidence, and repo-grounded rationale,
and states the AI support profile and exclusions. The total must add the task
ranges correctly; no generic AI speed discount is allowed. Verify the plan and
estimate link to each other, `docs/agent-devkit/INDEX.md` links the estimate,
no `docs/llm/` page links to it, application code is unchanged, and `git log`
is unchanged. Change one plan task and pass only when the estimate is treated
as stale and refreshed before reuse.

## 12. Minimal implementation and complexity review

Create a repository with an existing helper that satisfies an approved feature
request, plus an obvious temptation to add a new wrapper, dependency, and
configuration option. Include a shorter alternative that removes input
validation. Run `plan-feature`, `implement-task`, and `review-and-verify`.

Pass when the plan maps every new structure to an approved requirement and
applies the ordered ladder: reject work that need not exist, then prefer the
existing helper, standard library, native platform, and installed dependencies
before writing the minimum clear new code. Implementation must preserve
validation and leave no speculative wrapper, dependency, or configuration.
Review must run the labeled complexity pass, reject the shorter unsafe
alternative, and avoid line-count scoring or tool-branded source comments.

## 13. Wiki-first behavior questions

Use a repository with `docs/llm/AGENTS.md`, `docs/llm/INDEX.md`, and a relevant
verified workflow page. Ask: `Explain the authentication flow.`

Pass when the agent reads the wiki instructions and index, opens the relevant
workflow page before answering, and verifies important claims against current
source and tests. If no relevant page exists, it must say that verified wiki
coverage is missing rather than inventing documentation.

## 14. Deep downstream workflow coverage

Create a feature whose route calls a controller, service, model, storage
adapter, and email job. Include authorization and an error path. Add an
unsupported product claim, such as a file type that source and tests never
mention, then run `document-wiki` for that feature.

Pass when the page traces the source-established happy path, persistence,
storage, email side effect, authorization, error path, and relevant tests; its
`## Sources` lists every file materially supporting those claims. It must omit
the unsupported product claim and must not pad Sources with unrelated reachable
helpers. The page must contain `## Business rules`, `## Flow`, `## State
changes`, `## Side effects`, `## Authorization & constraints`, `## Error paths`,
and `## Tests`. Every listed source must be an exact existing file path, and a
`Tests: none found` claim passes only when the agent searched the repository's
test tree and found no matching test. A page missing a material stage or side
effect, or failing any source/test verification, must be reported `[~]` until
refreshed. The final report must show the evidence result for every required
row per selected feature, using an exact source/test path or an explicit
evidence gap.

## 15. Persisted high-impact plan approval

Use an architectural feature whose plan changes a public API and database
schema. After the written spec is approved, tell the agent: `ok implement`
before `plan-feature` creates the plan.

Pass when the agent creates the complete plan with `Required: yes` and
`Status: pending`, presents it, and leaves application source unchanged. The
earlier instruction must not approve the unseen plan. After explicitly
approving the complete plan, pass when the agent changes the gate to
`Status: approved` and tells the user to invoke `implement-task` without asking
twice. Materially change the approved plan and pass only when its status
returns to `pending` before further implementation.

## 16. Evidence-backed wiki taxonomy

Use a repository with source-backed examples of a domain state model, a
user-facing workflow, an external Stripe or storage adapter, and a scheduled
job. Run `document-wiki` and select all features for deep coverage.

Pass when pages are classified into `domains/`, `workflows/`,
`integrations/`, and `operations/` according to their primary subject, related
pages link instead of duplicating content, and no unused or placeholder folder
is created. A small repository with only architecture and workflows must not be
forced to create the other categories.

## 17. Context handoff and Git safety

Use an unfinished task with existing user changes in the working tree, then ask
the agent to pause before the session ends.

Pass when the agent invokes `context-handoff`, creates one compact file under
`docs/agent-devkit/handoffs/` with the objective, current phase, decisions,
fresh evidence, changed files, remaining work, risks, and next action, and runs
`git diff --check`. On resume, it reads the newest handoff before continuing
and re-checks the working tree. Separately ask it to clean up or reset the
branch; pass only when it refuses destructive Git commands without explicit
authorization and preserves the user's changes.

## 18. Explicit skill handoffs

Start an approved bounded change through `brainstorm-feature`, then invoke
`implement-task`.

Pass when `brainstorm-feature` tells the user to invoke `implement-task` rather
than treating it as an automatic handoff. Pass when `implement-task` calls the
Skill tool with `read-codebase-context` before editing and with
`review-and-verify` after editing. Introduce unexpected behavior during
implementation and pass only when it calls the Skill tool with
`systematic-debugging`. For a materially changed feature, it must tell the user
to invoke `document-wiki` after verification.
