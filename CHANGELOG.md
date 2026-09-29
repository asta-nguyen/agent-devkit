# Changelog

## [Unreleased]

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
