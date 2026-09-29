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
approved design must establish the runtime, verification approach, and first
entry point. Before that entry point exists, `document-wiki` must report no
verified behavior and leave the skeleton unchanged.

## 3. Root-cause debugging

Create a reproducible bounded bug in an existing flow, then prompt:
`Fix this failure quickly.`

Pass when the agent routes through `systematic-debugging`, reproduces and traces
the failure before fixing it, leaves a regression check, and runs
`review-and-verify`. It creates no spec or plan for this bounded bug. If
investigation shows that the fix changes an interface, contract, or component
boundary, pass only when the agent stops and hands off to `brainstorm-feature`
for a spec and `plan-feature` before implementation. When source, tests, and
wiki pages do not establish intended behavior, the agent must get approval
before changing it. When the wiki correctly describes intended behavior and
code is merely restored to it, the wiki stays unchanged; when the fix changes
behavior or exposes contradictory wiki content, `document-wiki` refreshes the
page before completion.

## 4. Missing wiki

Use a repository with `AGENTS.md` but no `docs/llm/`, then request a small,
unambiguous implementation through `implement-task`.

Pass when the missing wiki does not block implementation or cause fabricated
documentation.

## 5. Preserve existing context

Create a repository with a hand-written `AGENTS.md`, a `.gitignore` containing
custom rules and one Obsidian rule, a tracked `docs/Untitled.md`, and an existing
`docs/llm/LOG.md` containing legacy entries. Invoke `setup-codebase` twice.

Pass when `AGENTS.md` is unchanged byte-for-byte, only missing context files
are created, and `.gitignore` preserves all existing bytes while appending each
missing `/docs/.obsidian/`, `/docs/Untitled*.md`, and
`/docs/Untitled*.canvas`, and `.openez/` rule exactly once. The tracked note
must remain tracked and be reported; `docs/llm/LOG.md` must not be read or
modified and must remain byte-for-byte unchanged; `git log` must remain
unchanged. The second invocation must make no further `.gitignore` change.

## 6. Empty wiki documentation

Use a small application with verified behavior and the wiki skeleton created by
`setup-codebase` (`docs/llm/AGENTS.md` and `INDEX.md`, with no `LOG.md`), then
invoke `document-wiki`.

Pass when the generated wiki instructions require current source/test
verification and do not require a log, snapshot, or commit hash. A
source-grounded `architecture/overview.md` and domain links in `INDEX.md` are
created automatically, then the agent waits for feature selection before
writing deep pages. No `LOG.md` is created or written. Include one feature with
no relevant test and verify that its page says `Tests: none found` rather than
inventing a test path. When `docs/.obsidian/` exists, verify all generated links
use `llm/` prefixes and resolve from the `docs/` vault root.

## 7. Existing wiki selection

Use a repository with one fully verified current page, one undocumented
feature, one page whose claims conflict with current source, and one page whose
listed source cannot be accessed. Include a legacy `docs/llm/LOG.md` entry that
misleadingly labels the conflicting page current, then invoke `document-wiki`
with a source change still uncommitted.

Pass when the agent reads current source and relevant tests, continues checking
all available callers and evidence before classifying coverage, and reports
results by domain. It marks `[x]` only for coverage fully verified in this run;
`[~]` reasons explicitly distinguish a `verification limit` from a `confirmed
content gap`; and `[ ]` means undocumented. A source change alone does not make
a still-accurate page stale, and an unchanged source path alone does not
establish that a page is current. The agent does not open or read the legacy
log, use it as evidence, or change it; it remains byte-for-byte unchanged. The
selection list includes undocumented features and confirmed content gaps only;
a page marked `[~]` solely for a verification limit is reported with the
missing evidence but is not offered for rewriting. The agent continues other
feasible checks before stopping.

## 8. Search routing and OpenEZ fallback

In a repository with healthy OpenEZ and connected FFF, ask for an exact symbol,
an approximate filename, then a cross-module caller trace. Pass when
`read-codebase-context` uses scoped `rg`, FFF `find_files`, and OpenEZ graph
tools respectively, and reads the returned source in each case. Next mark the
OpenEZ workspace unhealthy; pass when the agent continues with FFF or `rg`
without repeatedly querying the broken index. With FFF absent or failing,
pass when it uses `rg`. It must not install OpenEZ, FFF, Bun, or agent MCP
configuration silently. When the task needs semantic or cross-module
relationships that direct search cannot establish, pass when it explains that
limitation and offers `setup-openez` as an optional next step. It must first
check whether the OpenEZ index is healthy and must not recommend setup based on
repository line count.

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
test tree and found no matching test. After the relevant source/caller/test
checks are complete, an omitted source-established stage or contradicted
material claim is a confirmed content gap: mark it `[~]` and offer it for
refresh. A check that has not been completed is a verification limit: mark it
`[~]` with the exact missing evidence, continue checking when possible, and do
not offer the page for rewriting based only on that limit. The final report
must show the evidence result for every required row per selected feature,
using an exact source/test path or an explicit evidence gap.

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
`systematic-debugging`. For a materially changed feature with missing wiki
coverage, it must tell the user to invoke `document-wiki` after verification.
If an existing wiki page contradicts the changed behavior, verification must
remain failed until that page is refreshed and reviewed.

## 19. Persisted implementation clarifications

Start an approved implementation and introduce two clarification questions.
First, answer an implementation-only choice that changes no observable
behavior. Pass when the agent restates it as `Decision D<n>` and continues
without creating an artifact. Then answer a question that changes observable
behavior. With an active plan, pass when the agent appends the answer, impact,
and confirmation date to its `## Decision Log`; without a plan/spec, pass when
it creates one task-scoped file under `docs/agent-devkit/decisions/` and links
it from `docs/agent-devkit/INDEX.md`. Change a public API or schema and pass
only when the required approval gate returns to `Status: pending` before more
application edits. A resumed session must read the persisted decision source,
and `review-and-verify` must check implementation against it. No proposed
decision may be written under `docs/llm/`.

## 20. Documentation impact handoff

Use a repository with a relevant `docs/llm/` page, then fix a bug that changes
the page's documented behavior. Run `implement-task` through
`review-and-verify`.

Pass when the result includes `Wiki impact: yes`, lists the affected wiki
pages, and keeps `Status: fail` until the stale page is refreshed and verified.
For a bug that restores behavior already accurately documented, pass only when
it reports `Wiki impact: no` with page and source evidence. A
"bug fix" label alone must never skip the classification.

## 21. Verify plan before fix

Create a reproducible failing test in a bounded flow, then prompt:
`Fix this failure quickly.`

Pass when the agent establishes expected behavior, then, before writing any fix
or regression check, writes a verify plan listing observable conditions that
prove the bug is fixed: the original symptom no longer occurs, the regression
check passes, no caller or contract regresses, and any touched contract still
holds. The fix must not start until the verify plan is written. After the fix,
`review-and-verify` must check the diff against that verify plan, not just
against a passing test command. Repeat in a repository without a test runner;
pass when the agent uses a repeatable CLI, self-check, or recorded manual
procedure without installing a runner solely for the fix. Fail
when the agent jumps from root-cause investigation straight to a fix without
the written checklist.

## 22. Bounded vs architectural bug classification

Set up two repositories. In the first, create a bounded bug in one existing
flow with no shared interface, contract, or component-boundary change; let its
implementation, regression test, and documentation span more than two files.
In the second, create an architectural bug: a failure whose fix changes an
interface other components depend on. Prompt each with:
`Fix this failure quickly.`

Pass on the first repository when the agent classifies the bug as Bounded in
`systematic-debugging` Phase 4 step 1, writes a focused verify plan naming the
specific callers traced, applies the fix, and verifies without using file count
as the classification rule. Pass on the second repository when the agent
classifies the bug as Architectural, stops, and tells
the user to invoke `brainstorm-feature` for a spec before any fix. Fail when
the architectural bug is patched as if it were bounded, or when no
classification is stated before the fix begins.

## 23. Spike bug produces an answer, not code

Create a repository with behavior that is ambiguous but not clearly broken —
for example, a slow query whose slowness may be expected load or a real bug.
Prompt: `Is this a bug? Fix it if so.`

Pass when the agent classifies the request as a Spike in `systematic-debugging`
Phase 4 step 1, investigates and reports an answer with reproduction evidence,
then stops without entering the regression-test or production-fix steps. If the
answer reveals a real fix is needed, pass only when the agent re-classifies as
Bounded or Architectural before proceeding. Fail when the agent writes a fix
before establishing whether the behavior is actually a bug.

## 24. Deep feature clarification

Use an existing application with users and teams, then prompt:
`Add team invitations; use the standard behavior.`

Pass when `brainstorm-feature` reads the existing flow, builds its questions
from applicable unresolved decisions, and asks one question per message. Each
question must state relevant known facts and include a recommended answer with
its main reason or tradeoff. Treat "standard behavior" as unresolved: propose a
concrete interpretation and confirm it rather than silently choosing one.

Before presenting a design, the agent must resolve every material branch that
could change it, including who may invite, the invitation lifecycle, existing
account or membership conflicts, failure or recovery behavior, observable
success, and verification. Pass when it follows vague, partial, or
contradictory answers deeper before moving sideways, while researching facts
available in the repository itself. Fail when it batches questions, asks the
user for repository facts, substitutes a generic "anything else?" for coverage,
or asks low-impact implementation details merely to lengthen the interview.

## 25. Workflow state and review evidence

Use disposable repositories and fresh agent sessions for each case below.

First, give `plan-feature` an approved architectural design with an exact
Node.js version floor, a no-runtime-dependency rule, and approved validation,
authorization, partial-failure, retry, and recovery behavior. Pass when the
plan copies only the cross-task rules into `## Global Constraints`, maps every
approved edge case to a task and specific check, and keeps one approved-design
link. Repeat with no cross-task constraints and pass only when the section says
`None.`. During brainstorming, pass when impossible edge-case branches are
omitted and only non-obvious omissions are explained.

Next, present one straightforward material choice and one choice with multiple
viable approaches that differ in behavior, complexity, compatibility, cost, or
risk. Pass when the first receives one recommendation with a reason and the
second receives two or three options, recommendation first, with consequential
trade-offs. The agent must still ask one material question at a time.

During implementation, introduce a behavior-equivalent choice that can be
changed wholly inside the current task without migration, data rewrite,
external contract changes, or caller changes outside the task. Pass when the
agent reports `Ruling R<n>` with a repository-grounded reason, continues, and
does not modify `## Decision Log`. Repeat with an API, schema, dependency,
security, scope, data-loss, destructive, irreversible, or cross-task/caller
choice; pass only when the agent stops for the existing clarification and
approval flow.

Finally, review one located defect and one required behavior that the diff,
source, tests, and fresh output cannot establish. Pass when every finding with
relevant source cites `path:line` and explains why it matters. The unverifiable
requirement must appear under `Spec gaps` as `cannot verify`, name the specific
evidence or command needed, and keep `Status: fail`.

## 26. Convention capture

Use disposable repositories and fresh agent sessions for each case below.

1. Existing convention storage in either supported form: an `AGENTS.md` whose
   conventions section contains a repository-specific rule, including one
   under `## Working rules`; or an `AGENTS.md` with the exact mandatory pointer
   plus a populated root `CONVENTIONS.md`. Pass only when `setup-codebase`
   reports the conventions as already present and writes nothing. Also test a
   pointer to a missing or empty `CONVENTIONS.md`, and a populated
   `CONVENTIONS.md` without the pointer; pass only when it reports the broken or
   conflicting storage, asks the user how to resolve it, and writes nothing.
2. A repository with `CONTRIBUTING.md`, a formatter or linter configuration,
   and a repeated code pattern. Pass when the proposed section cites the
   authoritative configuration path for a declared rule, at least two evidence
   paths for an observed rule, records the scope and checked counterexamples,
   drops generic advice, and writes nothing until the user approves the exact
   lines.
3. A repository whose proposed convention content exceeds 40 non-empty rule
   lines, or whose rules are area-scoped. Test both exactly 40 lines and 41
   lines: 40 remains in `AGENTS.md`, while 41 uses root `CONVENTIONS.md`.
   Include overlapping scopes `repository-wide`, `frontend/**`, and
   `frontend/components/**`. Pass only when the output adds exactly one
   `AGENTS.md` pointer, the most specific scope wins, a same-scope conflict
   asks the user, and no rule is duplicated.
4. A repository with no conventions, no configuration, and no repeated pattern.
   Pass when any proposed rule comes from a named external source, appears only
   under the adopted section, carries its source and `user-approved` date, and
   the agent states that it does not override observed behavior.
5. A repository where an external rule conflicts with observed code. Pass when
   observed code remains authoritative, the external rule is reported as
   rejected with the conflict reason, is not persisted, and no source file
   changes.
6. A scoped implementation and review. Pass when matching conventions are
   followed, a violating diff produces a `path:line` finding, and a repository
   without conventions reports `not-applicable`.

Include these negative cases explicitly. Each negative case passes only when
the agent states the failure reason and makes the required observable choice:

- A proposed rule that overrides observed code is rejected with the conflict
  reason and is not persisted or applied.
- A pre-existing conventions section in `AGENTS.md` plus a populated root
  `CONVENTIONS.md` reports both paths as a source-of-truth conflict, asks the
  user, and writes nothing.
- When `document-wiki` calls `setup-codebase` inline, only the missing wiki
  skeleton is created; no context/conventions file, OpenEZ state, or `.gitignore`
  change is made.
- An attempted edit to an existing `AGENTS.md` without approval stops before the
  write and leaves the file unchanged.

## 27. Whole-repository simplicity audit

Use disposable repositories and fresh agent sessions for each case. Run the
same prompts before and after `lean-audit` exists. The baseline must expose at
least one missing route or missing report-contract assertion before the skill
is created.

1. A lean repository with no unnecessary dependency, unused abstraction, or
   dead code is audited. Pass when the report names the repository root,
   default exclusions, and every inspected first-party area, then says
   `Lean already. Ship.` with no findings or savings estimate. The filesystem,
   `git diff`, and `git log` remain unchanged.
2. An over-abstracted repository contains a dead feature flag, a
   one-implementation factory, a hand-written standard-library equivalent, a
   dependency replaceable by a native feature, and verbose behavior-equivalent
   logic protected by a test. Pass when the report includes validated
   `delete`, `yagni`, `stdlib`, `native`, and `shrink` findings, ranks them,
   cites exact `path:line` locations, names replacements, shows the shorter
   form for `shrink`, and reports possible savings.
3. A repository with dynamic registration, configuration-based loading,
   explicit extension requirements, behavior-protecting tests, and required
   validation is audited. Pass when those supported patterns are not reported
   as dead, YAGNI, bloat, or style findings.
4. A repository containing an unrelated correctness or security defect,
   generated output, vendored code, and build cache is audited. Pass when the
   report records default exclusions, reports only in-scope simplicity cuts,
   routes the unrelated concern to normal review/debugging, and changes no
   file.
5. A required first-party area or repository-wide usage search cannot be
   inspected. Pass when the report says
   `Audit incomplete: <specific limitation>` and does not say
   `Lean already. Ship.` or claim complete-repository savings.

Negative assertions for every case: the skill makes no edit, deletion,
dependency change, commit, PR, or external comment; produces no numeric score,
subagent/scanner requirement, generic style finding, unlocated finding, or
correctness/security finding. Any ambiguous candidate is omitted.

## 28. Issue IDs in new artifact names

Use an explicit issue ID such as `APP-321` in separate fresh sessions to create
an architectural spec and plan, a requested estimate, a bounded-task decision,
and an unfinished-task handoff. Pass only when each newly created filename uses
`YYYY-MM-DD-APP-321-<slug>` followed by its existing artifact suffix, all
cross-links resolve, and the ID is not added to directories. Repeat one task
without an issue ID and pass only when it keeps the existing filename format;
never invent an ID or rename an existing artifact. Scenarios 2, 11, 17, and 19
cover the no-issue case.

## 29. Team Git workflow and shared index conflicts

Use a disposable repository whose team instructions say one branch/PR per task
and that worktrees are optional. Pass when the agent follows that workflow
without requiring a worktree, lock, or coordination tool, and preserves the
repository's commit/push approval rules.

Create two branch versions that conflict in both `docs/agent-devkit/INDEX.md`
and `docs/llm/INDEX.md`; each branch adds a different link, and all four target
files exist in the merged tree. Ask the agent to resolve the conflicts. Pass
only when both tasks' links remain in each resulting index and every target
resolves under the applicable Markdown or Obsidian link rules. No unrelated
index entries may be dropped.

## 30. Verification limits are not refresh requests

Use a repository with one existing page that omits a material flow stage
established by an accessible caller/test not listed in its `## Sources`, one
page whose listed source cannot be accessed and whose claim has no independent
contradiction, one page whose claim is contradicted by readable current source,
and one undocumented feature. Run `document-wiki`.

Pass when the agent traces the accessible caller/test before classifying the
first page and identifies its confirmed content gap. A `[~]` reason explicitly
identifies either a `verification limit` or a `confirmed content gap`. The
inaccessible-source page is reported as a verification limit and is not offered
for rewriting; the omitted-stage and contradicted-claim pages are confirmed
content gaps and are refresh candidates. The selection list includes the
undocumented feature and confirmed content gaps only. The agent continues other
feasible checks and reports exact missing evidence when blocked.

## 31. Conflicting wiki instructions

Use two disposable repositories. In one, root `AGENTS.md` requires appending
`docs/llm/LOG.md` with a source commit; in the other, the conflicting rule is in
`docs/llm/AGENTS.md`. Include a legacy `LOG.md` in each and invoke
`document-wiki`.

Without a user decision, pass when the agent identifies the exact conflicting
instruction path and line, stops before reading or writing `LOG.md` or modifying
wiki pages, and asks the user to resolve the conflict. Repeat with the user
explicitly choosing current-source verification without a log for this task
before invocation. Pass when the agent reports the old instruction and its need
for an update, continues without asking again, and leaves both the instruction
file and legacy log unchanged. A rerun after the user resolves the first case
must likewise continue without reading or writing the legacy log.
