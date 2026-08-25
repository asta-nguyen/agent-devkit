---
name: release-versioning
description: Use when the user explicitly asks to prepare a release, inspect changes since the last release, update CHANGELOG.md, bump package.json, or check a release tag.
---

# Release Versioning

Prepare release metadata from repository evidence. A release is not complete
until the change summary, package version, changelog heading, and Git tag check
agree.

## Process

1. Read `AGENTS.md`, `package.json`, and the existing `CHANGELOG.md` if it
   exists. Inspect `git status --short`, `git diff HEAD`, and the latest tag
   with `git describe --tags --abbrev=0`. If no tag exists, use the current
   package version as the baseline and report that no tag was found.
2. Establish the release scope from Git. Read commits and the complete diff
   since the baseline, and inspect any untracked files reported by
   `git status` because `git diff` does not include them. If unrelated user
   changes are mixed into the worktree, stop and ask which changes belong in
   the release. Do not infer release notes from conversation memory.
3. Check the current package version and existing tags. Stop on invalid
   SemVer, a package/tag version mismatch, or an existing tag for the proposed
   version.
4. Select the next version from the observed changes:
   - `PATCH` for documentation-only changes, wording fixes, and internal bug
     fixes with no contract change.
   - `MINOR` for a new skill or backward-compatible workflow capability.
   - `MAJOR` for an incompatible public contract. For a `0.x` package, do not
     infer a `1.0.0` release; ask the user to confirm it.
   If the user supplied an exact version, use it and report any SemVer impact
   mismatch before editing.
5. Update only release metadata:
   - Change only `version` in `package.json`.
   - Create `CHANGELOG.md` when missing, or prepend a dated release section
     while preserving existing entries. Use `Added`, `Changed`, `Fixed`, and
     `Documentation` only when a category has evidence.
   - Write concise notes that map to actual changed files or commits. Never
     invent user-visible behavior.
6. Verify the candidate:
   - Parse `package.json` and confirm its version matches the changelog heading.
   - Confirm `git tag --list "v<version>"` returns no existing tag.
   - Run `git diff --check` and the repository's required verification command.
   - Re-read the final `package.json`, changelog section, and release diff.
7. Report the candidate version, evidence, files changed, checks passed, and
   the exact tag name `v<version>`. Do not commit, create tags, push, or change
   application code. The user owns those final Git operations.

## Red flags

| Thought | Reality |
|---|---|
| "The version is obvious from the conversation" | Git changes and the current package version are authoritative. |
| "Just bump patch to avoid deciding" | The version must reflect the observed compatibility impact. |
| "The changelog can describe the intended feature" | Release notes describe verified changes, not proposals. |
| "Creating the tag finishes the workflow" | Tagging is a user-owned Git operation after review. |
