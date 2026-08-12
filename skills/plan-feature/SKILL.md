---
name: plan-feature
description: Create small, verifiable implementation tasks for an approved software feature. Use after feature design approval and before coding a non-trivial feature, behavior change, API change, or cross-file implementation.
---

# Plan Feature

Turn an approved design into a short execution plan before editing code.

1. Read the approved design, `AGENTS.md`, related wiki pages, and use
   `read-codebase-context` to inspect affected source, callers, and tests.
2. Split the work into small, ordered tasks. Each task must state:

   ```text
   Files: <paths to change>
   Change: <observable behavior or implementation>
   Verify: <smallest relevant test/check>
   ```

   For cross-file work, also list `Files inspected, no change` so the plan
   distinguishes evidence from guesses.

3. Put contract/data changes before their callers; put tests beside the behavior
   they verify. Do not add tasks for speculative abstractions.
4. Include a final `review-and-verify` task. If the feature is new or changes
   user-visible behavior, include `document-wiki` after verification.
5. Ask for confirmation on a plan that changes public APIs, data schemas,
   dependencies, CI, or more than a small set of files. Otherwise hand off to
   `implement-task`.

Plans are execution artifacts, not essays. Prefer the fewest tasks that make
the sequence and verification unambiguous.
