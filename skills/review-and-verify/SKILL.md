---
name: review-and-verify
description: Use after implementing a feature, refreshing wiki pages, or before declaring a task complete.
---

# review-and-verify

## Iron Law

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

If you have not run the verification command in this message, you cannot
claim it passes. "Should work" is not evidence. "Looks correct" is not
evidence. Previous runs are not evidence.

## Verification gate

Before claiming any status or expressing satisfaction:

1. **Identify** — what command proves this claim?
2. **Run** — execute the full command (fresh, complete)
3. **Read** — full output, check exit code, count failures
4. **Verify** — does output confirm the claim?
   - If no: state actual status with evidence
   - If yes: state claim with evidence
5. **Only then** — make the claim

Before final completion, run every repository-mandated full verification
command documented in `AGENTS.md`, manifests, or CI configuration. Targeted
checks are useful during implementation but do not replace this final gate. If
no full command is established, report that limitation explicitly.

## Claims vs evidence

| Claim | Requires | Not sufficient |
|---|---|---|
| Tests pass | Test command output: 0 failures | Previous run, "should pass" |
| Build succeeds | Build command: exit 0 | Linter passing, logs look good |
| Bug fixed | Test original symptom: passes | Code changed, assumed fixed |
| Requirements met | Line-by-line checklist vs spec | Tests passing alone |
| Wiki updated | Source paths exist, links resolve | "Page edited" |

## Diff review

Review the diff for:

- **Correctness** — logic matches the approved design
- **Stale documentation** — wiki pages or comments that contradict new behavior
- **Accidental scope** — changes outside the approved plan
- **Missing error handling** — edge cases, error paths, cleanup

For wiki changes, also verify: source paths exist, `## Sources` entries are
real, internal Obsidian wikilinks resolve, `INDEX.md` links resolve, and no
placeholder text remains.

## Receiving code review

When receiving feedback from a reviewer or user:

1. **Read** the complete feedback without reacting
2. **Understand** — restate the requirement in your own words or ask
3. **Verify** — check against codebase reality before implementing
4. **Evaluate** — is the suggestion technically sound for this codebase?
5. **Respond** — technical acknowledgment or reasoned pushback
6. **Implement** — one item at a time, test each

Never respond with performative agreement ("You're absolutely right!",
"Great point!"). State the fix or push back with technical reasoning. If
feedback is unclear, ask for clarification on all unclear items before
implementing any.

Push back when: suggestion breaks existing functionality, reviewer lacks
full context, violates YAGNI, or conflicts with architectural decisions.

## Red flags

| Thought | Reality |
|---|---|
| "Should work now" | Run the verification command |
| "I'm confident" | Confidence is not evidence |
| "Linter passed" | Linter is not compiler or test suite |
| "Partial check is enough" | Partial proves nothing |
| "Just this once" | No exceptions |

## Report

Report any remaining limitation explicitly. A task is complete only when
code, documentation, and verification output agree.

Leave the verified working tree for the user to review and commit. If the user
explicitly requests a commit, create it only after this final verification gate
passes; never commit known failing or unverified work.
