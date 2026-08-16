---
name: plan-feature
description: Use after feature design approval and before coding a non-trivial feature, behavior change, API change, or cross-file implementation.
---

# Plan Feature

Turn an approved design into a short execution plan before editing code. Save
the plan at `docs/agent-devkit/plans/YYYY-MM-DD-<slug>-plan.md`, creating the
folder only when writing the plan. Plans are process artifacts, never wiki
pages under `docs/llm/`.

## Process

1. Read the approved design, `AGENTS.md`, and related wiki pages. If application
   source exists, use `read-codebase-context` to inspect affected source,
   callers, and tests. Otherwise map planned files and interfaces from the
   approved design; state that callers and tests do not exist yet.
2. Map out which files will be created or modified and what each one is
   responsible for. Design units with clear boundaries. Follow existing
   patterns; do not unilaterally restructure.
3. Split the work into small, ordered tasks. Each task must state:

   ```text
   Files: <paths to change, with line ranges for modifications>
   Interfaces: <what this task consumes from earlier tasks and produces for later ones>
   Change: <observable behavior or implementation>
   Verify: <smallest relevant test/check>
   ```

   For cross-file work, also list `Files inspected, no change` so the plan
   distinguishes evidence from guesses.

4. **Bite-sized steps within each task.** Each step is one action:
   - Write the failing test
   - Run it to verify it fails
   - Write the minimal implementation
   - Run the tests to verify they pass

   For a source-less new project, the first task bootstraps the runtime and
   test command approved in the design before this red-green loop. State the
   exact setup and verification commands. If the approved design does not
   establish them, return to `brainstorm-feature`; do not invent a toolchain.

5. Put contract/data changes before their callers; put tests beside the
   behavior they verify. Do not add tasks for speculative abstractions.
6. End every plan with `**REQUIRED SUB-SKILL:** Use review-and-verify`. If the
   feature is new or changes user-visible behavior, include `document-wiki`
   after verification.
7. Save the complete plan at the required path. Include `## Approved design`
   with a link to the exact approved design. Add that plan link to the design's
   `## Execution` section, then add both artifacts to
   `docs/agent-devkit/INDEX.md` (`## Designs` and `## Plans`). When an Obsidian
   vault exists, targets are relative to its root (for a `docs/` vault:
   `[[agent-devkit/specs/...|Design]]` and `[[agent-devkit/plans/...|Plan]]`);
   otherwise use relative Markdown links. Do not link from `docs/llm/` to
   either artifact. Ask for confirmation on a plan that changes public APIs,
   data schemas, dependencies, CI, or more than a small set of files. Otherwise
   hand off to `implement-task`.
8. Do not include commit steps. If the user requests a commit, leave that action
   until after the final `review-and-verify` task passes.

## No placeholders

Every step must contain the actual content an engineer needs. These are
plan failures — never write them:

- "TBD", "TODO", "implement later", "fill in details"
- "Add appropriate error handling" (without specifying what)
- "Write tests for the above" (without actual test code)
- "Similar to Task N" (repeat the code — tasks may be read out of order)
- Steps that describe what to do without showing how
- References to types or functions not defined in any task

## Self-review

After writing the complete plan, review it against the approved design:

1. **Spec coverage** — can you point to a task that implements each
   requirement from the design? List any gaps.
2. **Placeholder scan** — search for any pattern from the "No placeholders"
   section above. Fix them.
3. **Type consistency** — do function names, parameter types, and property
   names used in later tasks match what was defined in earlier tasks?
4. **Artifact links** — do the index, design, and plan links resolve? Does the
   design link only to wiki pages actually read as context?

Fix any issues inline. No need to re-review — just fix and move on.

## Red flags

| Thought | Reality |
|---|---|
| "I'll figure out the details during implementation" | Plan must contain actual content. No placeholders. |
| "This task is small enough to skip the template" | Every task states Files, Change, Verify. No exceptions. |
| "I'll add tests in a separate task later" | Tests go beside the behavior they verify. Same task. |
| "The plan is obvious from the design" | Obvious to you ≠ obvious to the implementing agent. Write it out. |

Plans are execution artifacts, not essays. Prefer the fewest tasks that
make the sequence and verification unambiguous.
