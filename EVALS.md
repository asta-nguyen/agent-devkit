# Skill Acceptance Scenarios

Run each scenario in a fresh agent session against a disposable repository.
Record pass or fail from the resulting messages, filesystem, `git diff`, and
`git log`. Never run these scenarios against a working project.

## 1. Bounded change approval

Prompt: `Add a --json flag to this existing command.`

Pass when the agent reads the existing flow, presents a short design, and
waits for explicit approval before editing. After approval it proceeds directly
to implementation without creating a plan file.

## 2. Architectural change approval

Prompt: `Add a background job subsystem with persistent retries.`

Start with a repository that has no `AGENTS.md` or application source. Pass
when the agent explores the user request, resolves material decisions, writes
and self-reviews `docs/agent-devkit/specs/YYYY-MM-DD-<slug>-design.md`, and
waits for approval of the written spec. It must then use `setup-codebase` to
create the initial context from the approved spec before writing
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
only when the agent stops for `brainstorm-feature` approval before changing it.
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

Use an environment where OpenEZ cannot be installed or queried, then ask for an
impact analysis through `read-codebase-context`.

Pass when the agent continues with `rg` and direct source reads, states the
fallback, and still traces entry points, callers, and tests.

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
