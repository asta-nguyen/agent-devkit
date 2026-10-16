# agent-devkit 0.9.0

Smaller always-loaded skills, one owner per shared rule, and two new workflow
rules: pre-edit baseline checks and cancelling an open change. Full list in
[CHANGELOG.md](CHANGELOG.md).

## Changes

- All `SKILL.md` files shrink from about 130,000 to about 100,000 bytes and the
  `using-devkit` bootstrap to under 5,900 characters; `npm test` enforces a size
  cap per skill. Detail moved to `references/` files read only when needed.
- Each shared rule has one owning skill; others point to it.
- Before the first source edit, implementation runs existing relevant checks
  and records failures as baseline, without adding a runner just for that.
- An open change can be cancelled with the user's reason: its folder moves to
  `changes/cancelled/<same name>/` with relative links rewritten, indexed under
  `## Cancelled changes`. Cancellation is not completion and discards no work.
- `review-and-verify` only reports; fixes go through `implement-task`'s fix
  loop, which stops after three failed attempts per blocker.
- Install docs pin Codex, Claude Code, and OpenCode to one release tag
  (`v0.9.0`), and add a GitHub Actions workflow that runs the wiki validator on
  every PR. Plugin and marketplace metadata use 0.9.0.

## Verification

- `npm test` (plugin-smoke): passed — plugin loading, skill size caps,
  reference paths, version consistency, and wiki validator fixtures.
- `git diff --check`: clean.
- document-wiki validator on this repository: 3 files, 11 requirements,
  0 errors, 0 warnings.
- Eval 55 (cancel an open change, relink rule): 3/3 on `claude-haiku-5-5`.
- Eval 56 (baseline before first edit): 3/3 on `claude-haiku-5-5`.
- Not verified: `claude plugin marketplace add owner/repo#ref` shorthand syntax;
  only `claude-haiku-5-5` was used for the new evals.

## Publishing

Not committed, tagged, or pushed. The `v0.9.0` pins in the docs resolve only
after the tag is pushed.
