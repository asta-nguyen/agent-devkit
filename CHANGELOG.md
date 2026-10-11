# Changelog

## [Unreleased]

## [0.8.0] - 2026-10-11

### Changed

- Summarize plans in chat before approval or a planning-only result: goal,
  scope/impact, ordered tasks, verification, documentation, and risks/decisions,
  with artifact links and a clear approval action. Repair handoffs still return
  to their caller without an extra approval presentation.
- Call the next skill directly after approval instead of asking the user to
  retype a skill name; stop only at gates, questions, user-only actions, or a
  stalled fix loop.
- Separate route handoffs from repair handoffs: a skill called to fix another
  skill's input (such as `plan-feature` from `estimate-feature`) returns to its
  caller, and no skill starts implementation unless the user asked for it.
  A repair `plan-feature` returns right after self-review, skipping the
  estimate call and approval request; equivalent repairs preserve the gate,
  while material revisions record the change and reset it to pending.
  A directly invoked `estimate-feature`
  presents its own result.
- Update acceptance scenarios 1, 2, 15, 18, and 22 to the automatic handoff and
  change-folder workflow.
- End every stop or handoff with a `Next / Waiting on / Done when` block.
- Track progress per task in `tasks.md` with `Progress: todo | done` and
  `Result:`; `implement-task` marks a task done only after its check passes,
  and handoffs name the current task. Revising a plan keeps existing task
  progress; open plans written before this field get it backfilled from
  current source and a fresh check before work resumes.
- Replace the `using-devkit` routing map and bug classification with one
  task-flow table (Spike, bug question, exact change, Bounded feature, Bounded
  bug, Architectural), mirrored in both guides.
- Architectural work gets one joint approval: `brainstorm-feature` writes
  `design.md` (and any `delta.md`), calls `plan-feature` to write `tasks.md`,
  and the user approves them together. A new `tasks.md` gate is only
  `Status: pending | approved`; `Required`/`not-required` remain for legacy
  plans and older open `tasks.md`. Re-approval is needed only for material
  changes to scope, behavior, interfaces, schemas, or risk.
- Planning and estimation can use written designs before joint approval,
  labeling planned assumptions as pending approval without treating them as
  existing source. Architectural draft folders stay unindexed until approval;
  Bounded and bug-fix folders are indexed when created.
- Clear, small changes must meet four objective conditions; anything else is
  Bounded and needs a chat-design approval.
- Replace the hard "two reviews then stop" limit: in-scope failures are fixed
  and rerun until a blocker repeats with no new information, three fix
  attempts fail, the fix needs out-of-scope work, or a user decision is needed.
- Keep the user flow to understand → implement → review and finish.
  Implementation automatically updates affected documentation in existing
  wikis; Task updates uses task scope, diff, and caller evidence without a
  separate page-selection gate or whole-wiki inventory.
- Move the safe, resumable delta merge into document-wiki before final review.
  Missing required task coverage blocks completion; archive only moves and
  relinks after code and documentation checks pass. No wiki is created during
  a code task when docs/llm/ is absent.
- Replace obsolete README and Vietnamese guide charts with the current flow,
  tables, and examples; remove their unused PNG/SVG assets.

### Fixed

- Check approval, lifecycle, and persisted decisions before any new-project
  bootstrap writes application source.
- Nested debugging returns fix/check evidence to implementation instead of
  trying to final-review or archive an unfinished parent plan.
- Code-task context setup does not create a wiki unless wiki setup was requested.
- Equivalent revisions preserve approval and show the plan summary without
  asking for another approval.

## [0.7.1] - 2026-10-11

### Fixed

- Resume an archive when the wiki already matches its delta but the merge
  marker is missing, or when only some delta blocks have merged. Leave
  conflicting wiki blocks untouched for review.
- Make final review reports state the result, missing check, and next action
  with a clear owner; remove the repeated wiki-impact report after implementation.

## [0.7.0] - 2026-10-10

### Added

- Track plan execution with `Execution: open | complete`; final review marks a
  plan complete, and follow-up work routes through `brainstorm-feature`.
- Write wiki feature pages as requirements with stable `<PREFIX>-<slug>` IDs,
  scenarios, and source evidence, registered in a `## Requirement prefixes`
  table in `docs/llm/INDEX.md`.
- Package each change to `docs/llm/` requirements as one folder under
  `docs/agent-devkit/changes/<folder>/` with `design.md`/`tasks.md`
  (Architectural) and a `delta.md` when a requirement needs `ADDED`,
  `MODIFIED`, or `REMOVED`; archive a verified delta into `docs/llm/`.
- Bundle a dependency-free requirements validator with `document-wiki` and
  run its valid and invalid wiki fixtures in `npm test`.

## [0.6.0] - 2026-10-04

### Fixed

- Align the repository wiki contract with relative Markdown links and require
  the shared context skill before implementation, with portable skill calls.
- Scope the plugin's development contract to the agent-devkit source repository.
- Add Devin's root SessionStart hook with an empty matcher and the shared
  bootstrap script; document local hook fail-open behavior.
- Select OpenEZ client wiring from CLI help or the client's official MCP docs,
  and identify the intended target branch for branch review.

### Documentation

- Add direct planning/resume routes and acceptance coverage for Devin bootstrap
  and consumer contract scope.

### Changed

- Rename the bug investigation-only category from Spike to Diagnostic
  investigation, distinct from the feasibility Spike in brainstorm-feature.
- Require approval before setup-openez installs its CLI or edits AGENTS.md;
  stop after client wiring and verify the connection in a new session.
- Require approval before setup-codebase adds Code intelligence to an existing
  AGENTS.md, and describe OpenEZ as optional for semantic or cross-module search.
- Remove temporary diagnostic logs before reporting an investigation result or
  entering Phase 4 in systematic-debugging.
- Make implement-task the single owner of the final review-and-verify run.
- Keep blocked estimate tasks as table rows and report them in the total.
- Index an architectural spec only after the user approves it.
- Keep execution plans at behavior and interface detail; `implement-task`
  writes function bodies and test code, and plan file lists use symbol anchors.
- Persist the shared impact map in specs and plans, refresh it between phases,
  and keep current source reads mandatory before edits.
- Anchor reusable impact maps to a verified commit and confirm their symbols
  across current callers; include staged and branch-committed changes in review.
- Route production handling for external or timing-dependent failures through
  debugging classification and verification gates.
- Allow the explicit-change lane only after exact scope and impact checks;
  batch independent brainstorming questions only.
- Centralize shared artifact naming and relative Markdown link rules, and make
  `review-and-verify` the sole owner of the wiki-impact result block.
- Move rare skill guidance into supporting reference files and smoke-check
  their paths; record host-reported input and output tokens in evals and pilots.
- Route code search through Locate → Expand → Confirm → Read; FFF is optional,
  identifiers use literal FFF grep when connected, and regex stays with `rg`.
- Trace diff callers with OpenEZ plus FFF multi-pattern grep or `rg`; record
  staged/unstaged coverage and scan untracked paths before closing caller gaps.
- Apply the caller-tracing procedure in systematic-debugging and lean-audit,
  and make document-wiki reuse the shared search table.
- Treat OpenEZ memory as a pointer to persisted decisions or handoffs; read the
  linked artifact before relying on it.
- Align setup guidance and documentation with the shared search flow; add
  optional FFF search installation guidance only to README and GUIDE files.
- Add search-routing and caller-tracing acceptance scenarios, including an
  `rg`-only fallback and executed temporary-repository results.
- Handle planned entries with no existing source in impact maps, plans,
  estimates, and implementation; persist refreshed maps to the active spec or
  plan.
- Report OpenEZ CLI indexing separately from MCP query verification, and mark
  the MCP index query unverified when tools are unavailable.
- Use standard relative Markdown links for internal docs regardless of vault or
  app availability. Resolve the LLM wiki index by its full path and continue
  when only one wiki entry file exists.
- Migrate resolvable legacy wikilinks across `docs/llm/` during wiki work and
  block completion when any remain or a target is unresolved; resolve legacy
  targets from the existing wiki root before writing relative Markdown links.
- Route new and ambiguous features by their Spike, Bounded, or Architectural
  classification.

## [0.5.0] - 2026-09-29

### Changed

- Base wiki freshness on current source and tests verified in the current run,
  distinguish verification limits from confirmed content gaps, and keep legacy
  log files out of the freshness workflow.
- Stop wiki work when existing agent instructions conflict with the current-source
  and no-log contract, and ask the user to resolve the conflict.
- Clarify bounded bug, small feature, and architectural workflows, including
  repeatable non-test-runner verification and approval gates.
- Add team Git, issue-linked artifact naming, and shared-index conflict guidance;
  make OpenEZ use depend on search needs and index health rather than repository size.

### Documentation

- Update acceptance scenarios for wiki verification, instruction conflicts,
  issue-linked artifacts, shared-index conflicts, and pilot measurements.
- Update the pilot guide with explicit routes, active-time measurements, wiki
  reading counts, documentation conflicts, and user-wait separation.

## [0.4.3] - 2026-09-15

### Changed

- Capture missing repository conventions from declared configuration and
  repeated code, with explicit approval, provenance, and one-source storage.
- Enforce matching conventions during implementation and review, including
  scoped precedence and `path:line` evidence for violations.
- Add `lean-audit`, a standalone read-only whole-repository simplicity audit
  with ranked, evidence-backed `delete`, `stdlib`, `native`, `yagni`, and
  `shrink` findings.
- Carry approved global constraints and edge cases from brainstorming through
  plans, implementation, and verification.
- Allow session-only technical rulings for reversible, behavior-equivalent
  implementation details while preserving approval gates for consequential
  decisions.
- Require precise review evidence and a failing `cannot verify` verdict when
  required evidence is unavailable.

### Documentation

- Added acceptance scenario 25 for workflow state and review evidence.
- Added acceptance scenario 26 for convention capture and enforcement.
- Added acceptance scenario 27 for whole-repository simplicity audits.

## [0.4.2] - 2026-09-15

### Changed

- Carry approved global constraints and edge cases from brainstorming through
  plans, implementation, and verification.
- Allow session-only technical rulings for reversible, behavior-equivalent
  implementation details while preserving approval gates for consequential
  decisions.
- Require precise review evidence and a failing `cannot verify` verdict when
  required evidence is unavailable.

### Documentation

- Added acceptance scenario 25 for workflow state and review evidence.

## [0.4.1] - 2026-09-12

### Changed

- Deepened `brainstorm-feature` clarification with an adaptive decision tree,
  recommended answers with trade-offs, and follow-up handling for vague or
  contradictory decisions.

### Documentation

- Added acceptance scenario 24 for deep feature clarification.

## [0.4.0] - 2026-09-01

### Added

- Added native packaging for Codex, Claude Code, Cursor, Devin CLI, and
  OpenCode.
- Added dependency-free smoke checks for shared plugin bootstrap behavior.

### Fixed

- Emit Cursor's required `additional_context` hook response.
- Prevent OpenCode bootstrap collisions with other plugins.
- Resolve cross-skill calls in both namespaced plugins and direct installs.

## [0.2.0] - 2026-08-25

### Changed

- Clarified skill handoffs so reusable skills use explicit Skill tool calls and
  user-controlled workflow transitions ask the user to invoke the next skill.
- Updated feature, planning, debugging, and setup guidance to follow the
  explicit handoff contract.

### Documentation

- Updated the team guide and acceptance scenarios for explicit skill handoffs.

## [0.1.0] - 2026-01-24

### Changed

- Initial release.
- Clarified skill handoffs so reusable skills use explicit Skill tool calls and
  user-controlled workflow transitions ask the user to invoke the next skill.
- Updated feature, planning, debugging, and setup guidance to follow the
  explicit handoff contract.

### Documentation

- Updated the team guide and acceptance scenarios for explicit skill handoffs.
