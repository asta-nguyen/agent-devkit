# agent-devkit 0.10.0

Prompt-guided no-edit subagent briefs for repository tracing and independent
diff review, updated per-client upgrade instructions, and evaluation records
for Codex, OpenCode, Devin CLI, and Claude Code. Full list in
[CHANGELOG.md](CHANGELOG.md).

## Changes

- `read-codebase-context` requests a source trace after Locate;
  `review-and-verify` can request an independent review when a host spawn tool
  and exact diff target are available. OpenCode uses `task` with
  `subagent_type: "explore"`. The parent verifies the result. No-edit briefs
  are prompts; they do not restrict host permissions.
- README and README.vi document checked upgrade paths for pinned and
  default-branch installs. Devin's direct install follows the default branch
  because that command has no tag option.
- Legacy plans, specs, decision files, and `Required`/`Execution` gates remain
  supported for existing artifacts. Their removal, originally scheduled for
  v0.10.0, is deferred with no replacement target version.

## Verification

- Actual-host subagent checks are recorded in [EVALS.md](EVALS.md). They are
  one-run smoke tests with explicit named-subagent prompts; they do not establish
  automatic dispatch or stability across runs.
- OpenCode 1.19.3 with a free DeepSeek model dispatched `explore`, returned the
  seeded finding, and left the fixture unchanged. The full final brief was
  exercised once.
- Codex CLI 0.163.0 emitted collaboration events in scenarios 57 and 58, but
  the captured JSONL did not expose spawn arguments; `fork_turns: "none"` and
  reviewer history isolation remain unverified.
- Devin CLI 3000.11.92, with parent model `swe-2-max` (Free), returned the
  seeded finding through a profile pinned to `swe-2-max`; the export does not
  identify a separate runtime model for the child.
- Claude Code 2.1.303 returned the seeded finding using `claude-haiku-5-5`, but
  the child also made an unsupported claim about the source it had read. No
  write tool was available, and the fixture stayed unchanged; parent
  verification remains necessary.
- `rtk npm test`: passed plugin smoke checks, version consistency, skill size
  limits, and reference validation. Node emitted a non-failing module-type
  warning for the OpenCode plugin.
- `rtk git diff HEAD --check`: clean.

## Publishing

Prepared for 0.10.0; not committed, tagged, pushed, or published. The package
is marked private, so npm publication is not the distribution path.
