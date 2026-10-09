---
name: review-and-verify
description: Use when a user asks to review the diff, check the work, run or verify tests or builds, confirm a bug or feature is complete, or before declaring implementation or documentation done.
---

# review-and-verify

## Iron Law

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

If you have not performed a fresh verification check in this message, you
cannot claim it passes. "Should work" is not evidence. "Looks correct" is not
evidence. Previous runs are not evidence.

## Verification gate

Before claiming any status or expressing satisfaction:

1. **Identify** — what command or repeatable manual procedure proves this claim?
2. **Run** — execute the command or perform the procedure (fresh, complete)
3. **Read** — check the full output or observed result, including failures
4. **Verify** — does the result confirm the claim?
   - If no: state actual status with evidence
   - If yes: state claim with evidence
5. **Only then** — make the claim

Before final completion, run every repository-mandated full verification
command documented in `AGENTS.md`, manifests, or CI configuration. Targeted
checks are useful during implementation but do not replace this final gate. If
no full command is established, report that limitation explicitly.

Before reviewing requirements, read the active spec and plan, including its
`## Decision Log`, plus any task-linked decision file. A persisted decision is
requirement evidence, but it does not override a pending approval gate;
conversation recall alone is not review evidence.
Only mark completion when this is the final review, every task is implemented,
and every required verification passes. Do not mark an old plan complete merely
because it was read.

- For a **legacy plan**, a passing final review adds or sets
  `Execution: complete` in `## Approval Gate`, or adds `## Completion` with
  `Execution: complete` when the plan has no `## Approval Gate`.
- For a **change folder**, a passing final review runs the archive procedure
  below: merge its `delta.md` into `docs/llm/` when present, then move the
  folder under `changes/archive/`. A change without `delta.md` skips the wiki
  merge and only moves the folder. A change has no `Execution` field.

Verify the edit or the archive before reporting `Status: pass`. If work or
required verification remains, leave the plan or change open and report the gap
under `Spec gaps`. Approval status alone is not completion evidence.

## Archive a change

Run this inside the change's branch, after the code checks pass and before any
commit. A change without `delta.md` skips steps 1-3 and runs only steps 4 and 5.
The change is complete only after step 5 passes: the wiki, the moved folder,
`docs/agent-devkit/INDEX.md`, and every rewritten link are verified.

1. **Check without editing.** Every `Evidence:` path in `Requirement:` and
   `Replacement:` blocks exists and supports its requirement in current source.
   `Baseline:` blocks are only compared with the wiki before merge; their
   `Evidence:` paths may name deleted files or outdated behavior and are not
   checked against current source. Every requirement ID's prefix is already
   registered in `## Requirement prefixes`; archive never registers one. Every
   target page that already exists uses `## Requirements`; a page that does not
   exist yet is valid only as an `ADDED` target in a registered domain. No
   `ADDED` ID appears in `## Retired requirement IDs`. No other open change
   folder visible in this branch targets the same ID in its `delta.md`.
2. **Decide merge state block by block.** Compare each delta block with
   `docs/llm/`. Before merge, an `ADDED` ID is absent and a `MODIFIED` or
   `REMOVED` wiki block equals its `Baseline:` exactly; after merge, `ADDED`
   `Requirement:` and `MODIFIED` `Replacement:` blocks match the wiki exactly and
   `REMOVED` IDs are absent and listed as retired. A `MODIFIED`/`REMOVED` block
   matching neither its baseline nor the after-merge state was changed by another
   branch: never overwrite or delete it. The `Merged into docs/llm/` marker is a
   trace, not the only evidence:
   - No marker and every block in the before-merge state: merge (step 3).
   - Marker present and every block in the after-merge state: skip to step 4.
   - Any other combination (some blocks merged, a marker without a full merge, a
     block in neither state): stop, report each block's state, and ask the user
     to reconcile. Never apply the whole delta a second time.
3. **Merge once.** Apply the delta, then add `Merged into docs/llm/: YYYY-MM-DD`
   under the `delta.md` title.
   - `ADDED`: insert the `Requirement:` block into `Page:` in ID order. For a new
     page, create it with every section of the `document-wiki` template; a
     section the change cannot support with source evidence states an open
     question naming the missing evidence, and the review reports
     `Wiki impact: yes` so `document-wiki` completes it. Add a link to the new
     page in `docs/llm/INDEX.md`.
   - `MODIFIED`: replace the wiki block that equals the `Baseline:` block with the
     `Replacement:` block.
   - `REMOVED`: delete the wiki block that equals the `Baseline:` block, append
     its ID to `## Retired requirement IDs`, and update or remove every link to
     its anchor.
   - For `ADDED` and `MODIFIED`, add each `Evidence:` path to the page's
     `## Sources`. After `MODIFIED` or `REMOVED`, drop a `## Sources` path only
     when no remaining claim on that page relies on it.
4. **Verify the wiki.** Every block is in the after-merge state, every page
   created by the merge is linked from `docs/llm/INDEX.md`, and the requirement
   checks in `document-wiki` pass on every changed page. If this review changed
   `docs/llm/`, run the wiki validator as described below before moving the
   folder. On failure, do not move
   the folder, report the failing item, and keep `Status: fail`; fix the wiki,
   code, or `delta.md` (updating `docs/llm/` to match a changed delta) and rerun
   `review-and-verify`, which starts again at step 1.
5. **Move and relink.** Before moving, compute every link that will change:
   relative links inside the folder's files that point outside it, and links
   anywhere in the repository that point into it, found by searching all files,
   including ignored `docs/` paths. Rewrite links in `docs/agent-devkit/`
   (including the `docs/agent-devkit/INDEX.md` entry, which moves from
   `## Changes` to `## Archived changes`) and links in files this change already
   modifies. A link from `docs/llm/` into a change folder breaks the wiki
   boundary and fails the review. For any other file, stop before moving and
   report the file and link for the user to decide. Confirm every new target will
   exist after the move. Then move the folder to `changes/archive/<same name>/`,
   rewrite those links, and verify they resolve. If any link check fails, move
   the folder back to `changes/`, undo only this archive's link edits, keep
   `Status: fail`, and report the broken links.

After a rebase that touches `docs/llm/` or the change folder, run
`review-and-verify` again; an earlier pass does not count.

## Git safety invariants

- Treat existing working-tree changes as user-owned. Inspect `git status
  --short` and the relevant diff before changing or discarding anything.
- Never run `git reset --hard`, `git clean -fd`/`-xdf`, `git checkout -- <path>`,
  `git restore` that overwrites work, or broad delete commands to remove user
  changes unless the user explicitly authorizes the exact target and command.
- Never force-push or rewrite remote history without an explicit request naming
  the remote, branch, and intended rewrite. A request to finish, clean up, or
  fix the branch is not authorization.
- Prefer recoverable actions: inspect first, edit with the repository's normal
  tools, and leave commits and remote operations to the user unless explicitly
  requested.

## Claims vs evidence

| Claim | Requires | Not sufficient |
|---|---|---|
| Tests pass | Test command output: 0 failures | Previous run, "should pass" |
| Build succeeds | Build command: exit 0 | Linter passing, logs look good |
| Bug fixed | Repeat original symptom check: passes | Code changed, assumed fixed |
| Requirements met | Line-by-line checklist vs spec, plan, and persisted decisions | Tests passing alone |
| Wiki updated | Source paths exist, links resolve | "Page edited" |

## Diff review

### Trace changed callers

With OpenEZ, call `diff_context` using `staged: true` to isolate staged changes,
`ref` to compare a selected ref, or neither option for the working-tree view;
record changed symbols and callers. A temporary sample run observed that
`staged: true` reported staged changes, while the default working-tree view
included staged and unstaged tracked changes. It did not list untracked files
as changed-file entries, although its graph did surface an indexed untracked
caller. Treat this as observed coverage, not a guarantee for other hosts.

Always run `git status --short` and search changed symbols plus string, route,
config-key, and case variants with FFF multi-pattern grep or `rg`; include new
and untracked paths. This closes gaps when `diff_context` omits untracked files
or graph edges. Without OpenEZ, when `HEAD` exists derive tracked symbols from
`git diff HEAD` (staged and unstaged changes); when no commit exists, use both
`git diff --cached` and `git diff`. For a branch review, also include
`git diff <target-branch>...HEAD` so committed branch changes are reviewed.
Use the PR's target branch, or the branch the task is intended to merge into;
the three-dot comparison uses its merge-base with `HEAD`. If that target cannot
be established from repository or PR evidence, ask instead of assuming it. Read
untracked files listed by `git status --short` directly, then find callers with
FFF multi-pattern grep or `rg`. Read every listed caller. For large diffs, call
OpenEZ `index_workspace` (`mode: "incremental"`) only on the current
repository's already-registered workspace before querying.

Review the diff for:

- **Correctness** — logic matches the approved design and persisted decisions
- **Stale documentation** — wiki pages or comments that contradict new behavior
- **Accidental scope** — changes outside the approved plan
- **Missing error handling** — edge cases, error paths, cleanup
- **Protected boundaries** — trust-boundary validation, security,
  accessibility, and data-loss prevention remain intact
- **Conventions** — changed code follows the recorded rules in `AGENTS.md` or
  `CONVENTIONS.md` whose scope matches the changed files; the most specific
  matching scope wins. Cite `path:line` for a violation and why it matters.
  When no conventions are recorded, report this item as `not-applicable` and do
  not fail the review.

Compare implementation and fresh evidence with every approved edge case in the
spec and plan. Report every blocker, non-blocker, spec gap, and complexity
finding with `path:line` when relevant source exists, the observed problem, and
why it matters. A bare filename is not actionable evidence.

When required behavior cannot be established from the diff, source, tests, or
fresh command output, record it under `Spec gaps` as:

```text
cannot verify <requirement> — needs <specific evidence or command>
```

An unverifiable required behavior keeps the review status at `fail`.

For any review that changes `docs/llm/`, locate the installed
`document-wiki/SKILL.md` in the same skill set and run
`node "<document-wiki-skill-directory>/scripts/validate-llm-wiki.mjs" "<target-repository-root>"`
using absolute paths. If the script is missing, cannot run, or reports errors,
keep `Status: fail`; never substitute a run against the devkit source repository.
For wiki changes, also verify: source paths exist, `## Sources` entries are
real, internal relative Markdown links resolve from their containing files,
`INDEX.md` links resolve, and no placeholder text remains. Also scan
`docs/llm/` for legacy `[[...]]` links. If a task updates the wiki, completion
requires the full `document-wiki` migration; report missing or ambiguous
targets, and fail the wiki check while any legacy wikilink remains.

For changed pages with `## Requirements`, name the requirement format owned by
`document-wiki` and fail on: an ID that appears elsewhere in `docs/llm/`; a page
using more than one prefix; a prefix missing from `## Requirement prefixes` or
repeated in it; an `Evidence:` path that does not exist or is missing from
`## Sources`; a requirement anchor link that does not resolve; or two
requirements of one prefix describing the same behavior. Internal link checks
include anchors for requirement links.

Before the final result, classify wiki impact even for a bug fix. If the change
alters documented behavior or leaves a relevant page incomplete, use `yes` and
list the pages for a `document-wiki` handoff. Use `no` only after inspecting
the relevant page and source evidence. Use `not-applicable` when the repository
does not maintain `docs/llm/`, or `unknown` when the impact cannot be
established. An existing page that contradicts the changed behavior is a
blocker: keep `Status: fail` until that page is refreshed and verified. Missing
coverage for new behavior remains a `Wiki impact: yes` handoff. In the result
block's `Evidence`, name the check for every listed caller. If a caller has no
check, state `Verification limit: <caller> — <reason>` there.

## Complexity pass

Review the diff for behavior-preserving simplifications. Report each finding
with a file reference and one of these labels:

- `delete:` dead code or flexibility with no approved requirement
- `reuse:` duplicated behavior already present in the repository
- `stdlib:` custom code replaced by a named standard-library feature
- `native:` dependency or custom code replaced by the platform
- `yagni:` abstraction, configuration, or extension point with no current use
- `shrink:` a smaller clear implementation with the same behavior and checks

Fix an in-scope finding before completion; otherwise report it as remaining
work. If none exist, state that the pass found none. Do not produce a line-count
score: fewer lines are useful only when approved behavior, readability, and
protected boundaries remain intact.

## Review result

End every review with this exact result block:

```md
Status: pass | fail
Evidence: <commands run and relevant results>
Blockers: <required fixes, or none>
Non-blockers: <optional findings, or none>
Spec gaps: <missing spec, plan, or persisted-decision requirements, or none>
Wiki impact: yes | no | not-applicable | unknown
Wiki pages: <paths, or none>
Wiki action: <invoke document-wiki / no update needed / limitation>
```

Use `fail` when any blocker or spec gap remains. A passing verification command
does not override a failed requirements or diff review.

## Receiving code review

When reviewing external feedback, read `references/receiving-code-review.md`
before continuing.

## Report

Report any remaining limitation explicitly. A task is complete only when the
result block says `Status: pass` and code, documentation, and verification
output agree. Leave failed blockers for the implementer to fix; do not silently
turn them into non-blockers.

Leave the verified working tree for the user to review and commit. If the user
explicitly requests a commit, create it only after this final verification gate
passes; never commit known failing or unverified work.
