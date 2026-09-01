# Changelog

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
