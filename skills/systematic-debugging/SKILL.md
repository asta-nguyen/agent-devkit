---
name: systematic-debugging
description: Use for any technical issue — test failures, bugs, unexpected behavior, performance problems, build failures. Especially when under time pressure or previous fixes did not work.
---

# Systematic Debugging

## Iron Law

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

If you have not completed Phase 1, you cannot propose fixes. Symptom fixes
are failure.

## When to use

Use for any technical issue: test failures, bugs, unexpected behavior,
performance problems, build failures, integration issues.

**Especially when:**
- Under time pressure (emergencies make guessing tempting)
- "Just one quick fix" seems obvious
- Previous fix did not work
- You do not fully understand the issue

**Do not skip when:**
- Issue seems simple (simple bugs have root causes too)
- You are in a hurry (rushing guarantees rework)

## The four phases

You must complete each phase before proceeding to the next.

### Phase 1: Root cause investigation

**Before attempting any fix:**

1. **Read error messages carefully** — do not skip past errors or warnings.
   Read stack traces completely. Note line numbers, file paths, error codes.
2. **Reproduce consistently** — can you trigger it reliably? What are the
   exact steps? If not reproducible, gather more data; do not guess.
3. **Check recent changes** — `git diff`, recent commits, new dependencies,
   config changes, environmental differences.
4. **Gather evidence in multi-component systems** — when a system has
   multiple components (API → service → database), add diagnostic logging
   at each component boundary before proposing fixes. Log what enters and
   exits each layer. Run once to see where it breaks.
5. **Trace data flow** — where does the bad value originate? What called
   this with the bad value? Keep tracing up until you find the source. Fix
   at the source, not at the symptom.

### Phase 2: Pattern analysis

1. **Find working examples** — locate similar working code in the same
   codebase. What works that is similar to what is broken?
2. **Compare against references** — if implementing a pattern, read the
   reference implementation completely. Do not skim.
3. **Identify differences** — list every difference between working and
   broken, however small. Do not assume "that can't matter".
4. **Understand dependencies** — what settings, config, environment, or
   assumptions does this need?

### Phase 3: Hypothesis and testing

1. **Form a single hypothesis** — state clearly: "I think X is the root
   cause because Y". Be specific.
2. **Test minimally** — make the smallest possible change to test the
   hypothesis. One variable at a time. Do not fix multiple things at once.
   Revert experimental code changes after observing the result so Phase 4
   starts from the failing baseline.
3. **Verify before continuing** — did it work? Yes → Phase 4. No → form a
   new hypothesis. Do not add more fixes on top.
4. **When you do not know** — say "I don't understand X". Do not pretend.
   Ask for help or research more.

### Phase 4: Implementation

1. **Establish expected behavior.** Use source, tests, and current wiki pages.
   If they do not establish the intended behavior, stop and use
   `brainstorm-feature` to get the user's approval before changing behavior.
2. **Write a regression test** that reproduces the original symptom.
3. **Verify the test fails** without the fix (red).
4. **Apply the fix.**
5. **Verify the test passes** (green).
6. **Run the full test suite** to check for regressions.
7. **REQUIRED SUB-SKILL:** Use `review-and-verify` to review the diff and run
   fresh verification. Use `document-wiki` after verification only when the
   fix changes observable behavior or reveals stale wiki documentation. Do not
   update the wiki when it already correctly describes the intended behavior
   and the fix only restores code to that behavior.
8. Do not create commits during debugging. Even when the user requests a
   commit, wait until final `review-and-verify` passes.

## Red flags — stop and return to Phase 1

If you catch yourself thinking:

- "Quick fix for now, investigate later"
- "Just try changing X and see if it works"
- "Add multiple changes, run tests"
- "It's probably X, let me fix that"
- "I don't fully understand but this might work"
- Proposing solutions before tracing data flow
- "One more fix attempt" (when already tried 2+)
- Each fix reveals a new problem in a different place

**All of these mean: stop. Return to Phase 1.**

If 3+ fixes have failed, question the architecture. The pattern is wrong,
not the implementation.

## Rationalizations

| Excuse | Reality |
|---|---|
| "Issue is simple, don't need process" | Simple issues have root causes too. Process is fast for simple bugs. |
| "Emergency, no time for process" | Systematic debugging is faster than guess-and-check thrashing. |
| "Just try this first, then investigate" | First fix sets the pattern. Do it right from the start. |
| "Multiple fixes at once saves time" | Cannot isolate what worked. Causes new bugs. |
| "I see the problem, let me fix it" | Seeing symptoms is not understanding root cause. |
| "One more fix attempt" (after 2+ failures) | 3+ failures = architectural problem. Question the pattern. |

## When process reveals "no root cause"

If systematic investigation reveals the issue is truly environmental,
timing-dependent, or external:

1. Document what you investigated.
2. Implement appropriate handling (retry, timeout, error message).
3. Add monitoring/logging for future investigation.

But: 95% of "no root cause" cases are incomplete investigation.
