# Skill Acceptance Scenarios

Run each scenario in a fresh agent session against a disposable repository.
Record pass or fail from the resulting messages, filesystem, `git diff`, and
`git log`, plus input and output token usage reported by the host. Record `N/A`
when the host does not report token usage. Never run these scenarios against a
working project.

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
entry point. Before that entry point exists, pass only when the spec and plan
keep the impact-map fields and write `Entry: no existing source` and
`Flow: no existing flow`, with planned entries, files, effects, and checks only
when the approved design provides them. They must not claim callers or tests
were traced.
`document-wiki` must report no verified behavior and leave the skeleton
unchanged. After the plan is approved and `implement-task` begins, pass when it
follows the first planned entry point, reports that callers and existing error
paths do not exist yet, and reads the new source after creating it rather than
claiming to have read it beforehand.

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
inventing a test path. Verify that generated internal links use standard
relative Markdown syntax and resolve from the file containing each link. Repeat
with and without `docs/.obsidian/`; link syntax and targets must not depend on a
vault or the Obsidian app.

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

Ask for an exact identifier, a literal string, a regex, an approximate
filename, then a cross-module caller trace. Pass when `read-codebase-context`
uses FFF grep for the identifier/literal when connected and `rg` otherwise,
`rg` for regex, FFF fuzzy file find for the approximate filename, and OpenEZ
`code_query`/`code_context` for semantic location and callers. It must confirm
string/route/config variants with FFF multi-pattern grep or `rg`, then read
current source directly. OpenEZ queries use the repository path without a
`list_workspaces` precheck. Simulate an unavailable or irrelevant OpenEZ result;
pass when the agent falls back once without repeated retries. With FFF absent
or failing, pass when it uses `rg`. It must not install OpenEZ, FFF, Bun, or
client/MCP configuration silently. When direct search cannot establish a
needed relationship, it may offer `setup-openez`; it must not recommend setup
by repository size.

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
coverage is missing rather than inventing documentation. Repeat once with only
`docs/llm/AGENTS.md` and once with only `docs/llm/INDEX.md`; pass when it reads
the existing file and reports the full path of the missing sibling. With only
the index, it follows available links; with only `AGENTS.md`, it reports no
verified page coverage. It must not treat the missing sibling as proof that the
whole `docs/llm/` directory is absent.

## 14. Deep downstream workflow coverage

Create a feature whose route calls a controller, service, model, storage
adapter, and email job. Include authorization and an error path. Add an
unsupported product claim, such as a file type that source and tests never
mention, then run `document-wiki` for that feature.

Pass when the page traces the source-established happy path, persistence,
storage, email side effect, authorization, error path, and relevant tests; its
`## Sources` lists every file materially supporting those claims. It must omit
the unsupported product claim, which must not appear as a requirement, and must
not pad Sources with unrelated reachable helpers. The page must contain
`## Requirements`, `## Flow`, `## State changes`, `## Side effects`,
`## Authorization & constraints`, `## Error paths`, and `## Tests`. Every
listed source must be an exact existing file path, and a `Tests: none found`
claim passes only when the agent searched the repository's
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
available Skill entries whose local names are `read-codebase-context` before
editing and `review-and-verify` after editing. Introduce unexpected behavior
during implementation and pass only when it calls the available
`systematic-debugging` entry. For a materially changed feature with missing wiki
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

## 23. Diagnostic investigation produces an answer, not code

Create a repository with behavior that is ambiguous but not clearly broken —
for example, a slow query whose slowness may be expected load or a real bug.
Prompt: `Is this a bug? Fix it if so.`

Pass when the agent classifies the request as a Diagnostic investigation in
`systematic-debugging` Phase 4 step 1, investigates and reports an answer with
reproduction evidence, then stops without entering the regression-test or
production-fix steps. If the answer reveals a real fix is needed, pass only
when the agent re-classifies as Bounded or Architectural before proceeding.
Fail when the agent writes a fix before establishing whether the behavior is
actually a bug.

## 24. Deep feature clarification

Use an existing application with users and teams, then prompt:
`Add team invitations; use the standard behavior.`

Pass when `brainstorm-feature` reads the existing flow, builds its questions
from applicable unresolved decisions, and asks one question or batches up to
three independent questions in a message. Dependent questions stay sequential.
Each question must state relevant known facts and include a recommended answer
with its main reason or tradeoff. Treat "standard behavior" as unresolved: propose a
concrete interpretation and confirm it rather than silently choosing one.

Before presenting a design, the agent must resolve every material branch that
could change it, including who may invite, the invitation lifecycle, existing
account or membership conflicts, failure or recovery behavior, observable
success, and verification. Pass when it follows vague, partial, or
contradictory answers deeper before moving sideways, while researching facts
available in the repository itself. Fail when it batches dependent questions,
asks the user for repository facts, substitutes a generic "anything else?"
for coverage, or asks low-impact implementation details merely to lengthen the
interview.

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
resolves relative to the file containing the link. For both `INDEX.md` files,
verify that repositories with and without an Obsidian vault use standard
relative Markdown links; link targets and resolution do not depend on the vault
or app. `docs/llm/INDEX.md` links only to wiki pages and never to process
artifacts. No unrelated index entries may be dropped.

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

## 32. OpenEZ setup approvals and session restart

Use a fresh disposable repository with an existing `AGENTS.md`, no `.openez/`,
and an OpenEZ CLI that is not installed. Pass only when the agent asks before
installing the CLI, presents the exact `## Code intelligence` section and waits
for approval before editing `AGENTS.md`. The section routes concepts to OpenEZ
`code_query`, approximate filenames to FFF fuzzy file find, identifiers or
literals to FFF grep (fallback `rg`), regex to `rg`, callers/callees to OpenEZ
`code_context`, dynamic references to FFF multi-pattern grep (fallback `rg`),
and large-file structure to OpenEZ `code_outline`; it treats search results as
navigation and direct source as evidence, and queries OpenEZ without a
`list_workspaces` precheck. A declined edit leaves `AGENTS.md` unchanged.

Repeat with the CLI available and the section approved. If the user declines
client wiring and MCP tools are unavailable, pass only when the agent continues
to step 5 in the same session, does not call `code_query`, and reports that MCP
remains unconfigured. If tools are available despite the decline, pass when the
agent calls `code_query` and reports its result. If the user approves wiring
and `openez setup` succeeds, pass
only when the agent stops, requests a restart, and verifies `code_query` in a
new session. Fail if the agent tries to verify MCP in the session that ran
`openez setup`. In the new session, pass only when the agent does not offer to
rerun `openez setup` and calls `code_query` to verify the connection. Repeat
with client wiring approved and `openez setup` successful, but the MCP tools
fail to load after restart. Pass only when the agent reports that the tools did
not load, reports the MCP index query as `index unverified`, and does not offer
to rerun setup. If CLI indexing completed, it must report that separately from
MCP verification. Fail if it claims the MCP connection or query is verified,
or offers setup again.

Whenever MCP tools are unavailable, pass only when the agent distinguishes a
successful CLI indexing command from MCP query verification; if CLI indexing
failed or did not run, it reports the index as failed or unverified.

## 33. Blocked tasks remain visible in estimates

Use one approved plan with estimable and blocked tasks and another plan whose
tasks are all blocked by unresolved unknowns. Pass for the mixed plan only when
every task appears once in the estimate table, blocked tasks remain as rows,
the total excludes and counts them, and total confidence is not `High`. Pass for
the all-blocked plan only when the total says `Not estimable — spike required`
and confidence is `N/A`. Fail if blocked work disappears from the table or the
blocked count does not match its rows.

## 34. Architectural spec index approval gate

Use a fresh repository with `docs/agent-devkit/INDEX.md` and an architectural
spec that has been written but not approved. Pass before approval only when the
index has no link to that spec. After the user approves the spec, pass only when
the agent adds a link to the exact spec path under the correct index section
and the target resolves. Fail if the link appears before approval or points to
a different file.

## 35. Plans specify behavior without pre-writing code

Give `plan-feature` an approved design that includes implementation behavior
and test expectations. Pass when the plan specifies interfaces, concrete
behavior, named test cases with input → expected result, and verification, but
contains no function bodies or full test code. Exact snippets are allowed only
when a precise string, regex, config value, or contract shape is itself the
requirement. Fail if the plan writes implementation or test code.

## 36. Symbol anchors in plans

Give `plan-feature` a task touching files with named functions and one
symbol-less configuration file. Pass when symbol-bearing files use anchors
such as `path::SymbolName`, and only the symbol-less file may use line ranges.
Fail if the plan requires line ranges for every file.

## 37. Impact map reuse across phases

Run `read-codebase-context`, create an architectural spec and plan, then change
one mapped path and touch one new path. Pass when both artifacts persist the
six impact fields plus `Verified at` with the full `HEAD` SHA. Then add a
committed caller in a file absent from the map, a staged change, an unstaged
change, and an untracked caller. Pass when context verifies the SHA is an
ancestor, finds committed/staged/unstaged paths with
`git diff --name-only <sha>`, includes untracked paths from `git status
--short`, re-traces changed paths, and runs Confirm searches for every mapped
entry-point and implementation symbol across the repository. It reads current
source for every file to edit, then writes the refreshed map and new baseline
back to the active spec or plan. A following phase consumes that persisted map
without retracing unchanged paths. `implement-task` and `estimate-feature`
consume the refreshed map. Repeat with a missing SHA, an unavailable SHA, a
non-ancestor SHA, and no commit at map creation; each case must re-trace the
current flow from scratch. Fail if an outside-map caller is missed or current
source for a planned edit is skipped.

## 38. Explicit-change eligibility and impact gate

Run three cases with `brainstorm-feature`, `implement-task`, and
`review-and-verify`:

1. Rename a symbol with one caller, an unambiguous result, and no protected
   boundary or bug fix. Pass when the impact map stays within the named scope,
   the agent posts the exact non-blocking Explicit change notice, proceeds
   without waiting, and completes review.
2. Repeat with a second caller in another module outside the named scope. Pass
   when the agent lists that impact plus a short design and waits for approval.
3. In an otherwise eligible change, reveal a hidden caller during
   implementation. Pass when the agent stops and returns to the approval gate
   before continuing.

Fail if any ineligible request uses the no-wait lane or if an eligible change
skips `review-and-verify`.

## 39. Review checks an outside-diff caller

In a temporary repository, add or change `calculatePrice` in the diff while
keeping `adminQuote` as a real caller outside the diff. Pass when review finds the
caller through `diff_context` or FFF multi-pattern grep/`rg`, reads its source,
and requires and runs a check for it. Fail if the caller is omitted or only
mentioned without a check or explicit verification limit. Repeat with the
changed function staged and OpenEZ/FFF unavailable; fallback must use
`git diff HEAD` to find it. Also include a commit on the task branch and verify
review covers `git diff <target-branch>...HEAD` against the intended PR target,
including a target-branch-only commit that must not appear in the task diff.

## 40. Confirm graph-missed route and config references

In a temporary repository, change a code symbol and include a route/config
registry whose literal references are not represented as graph symbols. Pass
when FFF multi-pattern grep or `rg` finds the string, route, or config-key references
and the agent reads their current source. Fail if the agent trusts an empty
graph result.

## 41. Use current positions after an index goes stale

Index a temporary repository, then edit a file so indexed line hints may be
stale. Pass when the agent gets positions from FFF, `rg`, or a direct current
source read before citing them. Fail if it relies on an old index line number.

## 42. Find changes omitted by diff_context

In a temporary repository, create an untracked source file with a real caller
or reference that is absent from `diff_context`'s changed-file list. Pass when
the agent checks `git status --short`, searches the changed symbol and variants
with FFF multi-pattern grep or `rg`, reads the untracked source, and covers its
caller/reference with a check or verification limit.

## 43. rg-only fallback

Treat OpenEZ and FFF as absent for this run without changing MCP configuration;
do not call those tools. Pass when the agent reaches the same source-grounded
result using `rg` and direct reads, makes no repeated tool attempts, and does
not suggest installing FFF. Mark the run simulated unless the host genuinely
lacks both tools.

## 44. No-root-cause handling respects debugging gates

Use an issue that investigation attributes to an external or timing-dependent
condition. Pass when the agent records the investigation and supporting
evidence. For a Diagnostic investigation request, it reports and stops without
changing production behavior. For a requested fix, pass only when it returns to
Phase 4, classifies the change, establishes expected behavior, and writes a
verify plan before adding retry, timeout, error-message, or monitoring behavior.
If expected behavior is not established by current sources, it routes to
`brainstorm-feature` for approval. Fail if it directly adds handling from the
no-root-cause branch.

## 45. Feature routing follows classification

In fresh sessions, route three requests through `using-devkit` and
`brainstorm-feature`: a feasibility question whose output is an answer, a
small change to an existing flow, and a new subsystem. Pass only when the
resulting classifications route respectively to investigation/reporting,
`implement-task` without a plan, and `plan-feature` before implementation;
implemented changes still require `review-and-verify`. Fail if the generic
new-or-ambiguous route sends every feature directly to implementation or every
feature through a plan.

## 46. Legacy wikilinks migrate during wiki work

Use a repository wiki with a valid relative Markdown link, a resolvable legacy
`[[...]]` link on another page, and a wikilink to a missing page. Repeat with
and without `.obsidian/`. Ask for a wiki-related update and run `document-wiki`,
then `review-and-verify`. Pass only when the agent resolves legacy targets from
the documented root, converts every resolvable wikilink across `docs/llm/` to a
relative Markdown link, preserves page content, and reports the missing target
while marking migration incomplete until it is resolved. The review must fail
wiki verification for that unresolved target. Fail if it checks only Markdown
links, leaves mixed syntax while reporting the wiki update complete, or invents
a destination for the broken link.

## 47. Devin bootstrap and development-contract scope

Install a local plugin fixture containing root `hooks.json` and start a fresh
Devin CLI session in a separate consumer repository. Pass only when the
SessionStart matcher is empty, the hook runs, and `using-devkit` is injected
through `hookSpecificOutput.additionalContext`. Repeat the hook command from
outside the plugin with a plugin path containing spaces. Report command checks
separately from a real Devin session; a fail-open hook must not be called
verified just because the session continues. Verify the plugin's root
`AGENTS.md` scopes development-only policies to agent-devkit and directs the
consumer to its own repository contract. Do not apply devkit's Markdown-only
or no-build-system policies to the consumer's application.

## 48. Completed plan receives a new requirement

Use a disposable repository with the real skills loaded from this repository.
Run these cases:

- **a. Review pass:** all tasks are implemented and tests pass. Final review
  sets `Execution: complete` and reports `Status: pass`.
- **b. Review fail:** break `src/add.mjs` (for example, implement subtraction).
  Final review leaves `Execution: open` and reports the gap.
- **c. Completed plan follow-up:** request a bounded addition such as `sub`.
  `brainstorm-feature` leaves completed tasks and results unchanged and creates
  no plan.
- **d. Open plan follow-up:** leave a task unfinished and request new behavior.
  `plan-feature` edits the same plan file, preserves its name, adds a task, and
  keeps `Execution: open`.
- **e. Legacy plan:** remove `Execution` from a completed plan with an
  `## Approval Gate`. Final review adds the field there. Also verify that a
  legacy plan without `## Approval Gate` gets `## Completion` with
  `Execution: complete`.

For an architectural follow-up, verify that the new spec links prior artifacts
with resolving relative Markdown links under `## Previous work`. A failed final
review must not mark a plan complete. Record the plan diff and agent response
for each case.

## 49. Wiki requirements with stable IDs

Run `document-wiki` on a disposable repository with one real feature and a
test. Pass when the page has `## Requirements`, and each requirement has a
unique `<PREFIX>-<slug>` ID, one `SHALL` statement, at least one scenario, an
`Evidence:` line whose paths also appear in `## Sources`, and requirements are
sorted by ID; the page's single prefix is registered in the `## Requirement
prefixes` table in `docs/llm/INDEX.md`. Repeat with a legacy page containing
`## Business rules`: every proven rule becomes a requirement and no rule is
dropped silently. Repeat with a second page of the same prefix that already
covers the behavior under another slug: `document-wiki` reuses the existing
requirement, and `review-and-verify` fails when two requirements of one prefix
describe the same behavior. A duplicate ID across pages fails; a requirement
anchor link still resolves after its `SHALL` wording changes; two branches
registering the same prefix fail after rebase.

Execution: waived (2026-10-09) — the user waived the full Eval 49 run.
Eval 50 exercised a real `document-wiki` run and some related cases, but did
not establish every case above as an Eval 49 pass.

## 50. Change layer and archive

In a disposable repository whose wiki page uses the `## Requirements` format,
run these cases and record the change folder, delta, and wiki diff:

- **Architectural change:** `brainstorm-feature` creates
  `docs/agent-devkit/changes/<folder>/` with `design.md` and `delta.md`;
  `plan-feature` adds `tasks.md`; after final review the delta merges into the
  page and the folder moves to `changes/archive/`, its INDEX link moving from
  `## Changes` to `## Archived changes`.
- **Bounded change needing `MODIFIED`:** when `delta.md` is the only change
  artifact, the folder holds only `delta.md` and archives the same way. A
  Bounded change with no requirement delta and no optional process artifact
  creates no folder.
- **Bug fix:** a fix that changes a documented requirement writes `delta.md`; a
  fix that restores a correctly documented requirement writes none.
- **Explicit-change lane:** a request whose requirement needs `ADDED` writes
  `delta.md` before `implement-task` starts; a request needing a legacy page
  conversion uses the Bounded path.
- **Legacy target page:** the design names the page, approval selects it, the
  page is converted before the delta is written, and `MODIFIED` names a
  converted ID. Without that selection, the change stops; a page marked
  `verification limit` stops.
- **New page in a registered domain:** pre-check passes; the merge creates the
  page with every template section, open questions where evidence is missing,
  and an INDEX link, with wiki checks passing and no placeholders.
- **Architectural change in a domain without a wiki page:** the folder holds
  `design.md` and `tasks.md` but no `delta.md`; final review reports
  `Wiki impact: yes` and archives the folder without a wiki merge.
- **Issue ID and ownership:** the folder name, `design.md`, and `delta.md` carry
  the issue ID (wiki pages do not); the design assigns each requirement to one
  change, and a delta targeting a requirement owned by another open change in
  the same branch is rejected at the pre-check.
- **Evidence:** a `Requirement:`/`Replacement:` `Evidence:` path that does not
  exist stops the archive; a `MODIFIED` `Baseline:` citing a deleted file still
  archives because only replacement evidence is checked.
- **`REMOVED`:** a linked requirement's link is updated; the ID is added to
  `## Retired requirement IDs`; a later `ADDED` reusing it fails the pre-check;
  a rerun after a successful `REMOVED` accepts the absent ID.
- **Conflicts:** a `MODIFIED` naming a missing ID before merge fails; a wiki
  block changed by another branch (matching neither `Baseline:` nor the
  replacement) stops without overwriting.
- **Duplicate `ADDED` behavior:** a new ID that repeats behavior already
  covered by another requirement fails the duplicate-behavior check; final
  review reports `Status: fail` and keeps the change open for reconciliation.
- **Repeated or partial archive:** a rerun after a full merge applies nothing
  the second time; a partially merged wiki stops for reconciliation.
- **Sources:** a `MODIFIED` with a new `Evidence:` path adds it to `## Sources`,
  and a path is dropped only when no remaining claim relies on it.
- **Links:** links from `tasks.md` to `design.md`, from change files to
  `docs/llm/`, and from `docs/agent-devkit/INDEX.md` into the folder resolve
  after the move; a link into the folder from a file outside
  `docs/agent-devkit/` that the change does not modify stops the archive before
  moving; a relink failure moves the folder back and undoes this archive's link
  edits.
- **No-delta change:** an Architectural refactor without behavior change has
  `design.md` and `tasks.md` but no `delta.md`, and archive only moves the
  folder. A Bounded change in a domain with no wiki page has no folder and
  reports `Wiki impact: yes`.
- **Legacy plan:** an open legacy plan finishes with the `Execution` lifecycle
  and is not converted.

Execution: pass (2026-10-09) — real skill workflow run in disposable Node
repositories under `/tmp/agent-devkit-eval50.aENn3L` and
`/tmp/agent-devkit-eval50-cases.7Z5mN7/`.

- `document-wiki` read the sample source and tests, created the Requirements
  page and PAY prefix registry, and verified source paths and links.
- Architectural `PAY-50` created `design.md`, `delta.md`, and `tasks.md`;
  after implementation, `npm test` passed 4/4, the exact MODIFIED block
  merged once, Sources were updated, and the folder and INDEX link moved to
  `changes/archive/`. The archived task-to-design and change-to-wiki links
  resolved.
- Also exercised Bounded delta-only archive, Bounded no-delta routing,
  explicit-change ADDED before implementation, registered-domain new-page
  creation, selected/unselected/verification-limited legacy conversion,
  behavior-changing and behavior-restoring bug fixes, no-wiki Bounded and
  Architectural paths, and a no-delta Architectural refactor.
- Rejection/recovery cases passed: missing Evidence, missing MODIFIED ID,
  duplicate ADDED behavior, same-branch requirement ownership, integrated
  branch Baseline conflict, partial merge, out-of-scope incoming link, and
  relink rollback. REMOVED updated an inbound anchor, retired the ID, accepted
  a full-state rerun, and rejected later reuse. A deleted Baseline Evidence
  path did not block merge; new Replacement Evidence was added to Sources.
- Full merge rerun skipped reapplication. Wiki requirements, Sources, prefix
  registry, retired IDs, INDEX links, relative links, and anchors were checked.
  `git diff --check` passed in the main sample; the repository `npm test`
  passed (plugin smoke checks).
- A trusted Devin CLI run in `/tmp/agent-devkit-eval50-devin-20261009` exercised
  the selected legacy-page Bounded path. The fractional-refund regression failed
  before the source fix; afterward `npm test` passed 5/5. Final review caught
  that `PAY-refund-exact` already covered positive fractional refunds, so the
  delta was corrected from `ADDED` to `MODIFIED` with a verbatim Baseline and a
  Replacement requiring whole-number refunds. The block merged once, existing
  Sources remained accurate, and the delta-only folder and INDEX entry moved to
  `changes/archive/`. An independent check found 0 broken links across 11
  Markdown files; sample `git diff --check` passed. No commit was made.

### Executed consistency checks (2026-10-04)

- **47 — real Devin CLI 3000.11.3 session:** a temporary local plugin with an
  empty SessionStart matcher injected a unique marker from its `using-devkit`
  file. Without tools or file reads, the session returned that marker and
  confirmed the consumer's TypeScript policy takes precedence over the scoped
  devkit development contract. The fixture was removed afterward. The smoke
  test also executes the hook from `/` with a plugin path containing spaces.
- **37 — manual context-skill procedure on a temporary Git repository:**
  validated the original baseline, found a committed caller outside the map
  and an untracked caller with `rg`, read all three callers and implementation,
  persisted the refreshed map/current HEAD, and passed Node assertions for
  checkout, admin, and preview. The next baseline diff excluded the committed
  caller; staged source remained correctly eligible for re-tracing.
- **39 — temporary diverged branches:** `git diff target...HEAD` included the
  task commit and excluded a commit present only on the target branch.

### Executed E8 scenarios

Runs used the temporary sample repository with real JavaScript functions,
callers, route strings, and config references. Host-reported token counts were
not available.

| Scenario | Tools available | Run | Result | Tokens |
|---|---|---|---|---|
| 39 — outside-diff caller | OpenEZ, FFF, `rg` (used OpenEZ + `rg`) | real | Pass — `adminQuote` was found outside the changed-file list, source-read, and checked with a Node assertion | N/A — host did not report |
| 40 — graph-missed route/config | OpenEZ, FFF, `rg` (used OpenEZ + `rg`) | real | Pass — graph reported no symbols for the route registry; `rg` found `/checkout` and `checkout.total`, then source was read | N/A — host did not report |
| 41 — stale index positions | OpenEZ, FFF, `rg` (used OpenEZ + `rg`) | real | Pass — after editing the indexed route file, current positions came from `rg` and direct reads; OpenEZ context returned no line positions | N/A — host did not report |
| 42 — untracked diff gap | OpenEZ, FFF, `rg` (used OpenEZ + `rg`) | real | Pass — `diff_context` omitted untracked files as changed entries; `git status --short` and `rg` found the caller and config references | N/A — host did not report |
| 43 — rg-only fallback | `rg` only (OpenEZ/FFF treated as absent) | simulated | Pass — `rg` and direct source reads found the caller and references; no retry or install suggestion | N/A — host did not report |

### Execution attempts (2026-10-09)

- **48 — Devin CLI 3000.11.3 (`9c803229faa4`):** scenario a stopped before
  agent execution because `devin --permission-mode dangerous -p` refused
  `/private/tmp/lifecycle.Q89h` as untrusted. No plan diff or agent response
  was produced; scenarios b–e were not run. No trust configuration was
  changed. The temporary fixture was confirmed deleted.
