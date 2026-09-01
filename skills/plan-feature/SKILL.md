---
name: plan-feature
description: Use when feature design is approved and coding has not started for a non-trivial feature, behavior change, API change, or cross-file implementation.
---

# Plan Feature

Turn an approved design into a short execution plan before editing code. Save
the plan at `docs/agent-devkit/plans/YYYY-MM-DD-<slug>-plan.md`, creating the
folder only when writing the plan. Plans are process artifacts, never wiki
pages under `docs/llm/`.

## Process

1. Read the approved design, `AGENTS.md`, and related wiki pages. If application
   source exists, call the available Skill entry whose local name is
   `read-codebase-context` to inspect
   affected source,
   callers, and tests. Otherwise map planned files and interfaces from the
   approved design; state that callers and tests do not exist yet.
2. Map out which files will be created or modified and what each one is
   responsible for. Design units with clear boundaries. Follow existing
   patterns; do not unilaterally restructure. Before accepting a proposed unit,
   apply this minimal-design ladder in order and stop at the first option that
   satisfies the approved behavior:

   1. Does this need to exist at all? Remove work that no approved requirement
      needs (YAGNI).
   2. Does it already exist in this codebase? Reuse the module, helper, type, or
      pattern.
   3. Does the standard library do it? Use it.
   4. Does a native platform feature cover it? Use it.
   5. Does an already-installed dependency solve it? Use it.
   6. Only then, plan the minimum clear new code that works.

   Every new file, abstraction, dependency, or configuration value must map to
   an approved requirement. Minimal design must not remove explicit behavior,
   trust-boundary validation, security, accessibility, or error handling that
   prevents data loss.
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
   establish them, tell the user to invoke `brainstorm-feature`; do not invent
   a toolchain.

5. Put contract/data changes before their callers; put tests beside the
   behavior they verify. Do not add tasks for speculative abstractions.
6. End every plan by calling the available Skill entry whose local name is
   `review-and-verify`. If the
   feature is new or changes user-visible behavior, instruct the user to invoke
   `document-wiki` after verification.
7. Add this section to every plan:

   ```md
   ## Approval Gate

   Required: yes | no
   Reason: <public API, data schema, dependency, CI, broad file impact, or low-risk scope>
   Status: pending | approved | not-required

   ## Decision Log

   None.
   ```

   Set `Required: yes` when the plan changes public APIs, data schemas,
   dependencies, CI, or more than a small set of files; its initial status is
   always `pending`. Otherwise set `Required: no` and `Status: not-required`.
   Approval of the design/spec, including an instruction to implement given
   before this plan existed, never changes a required gate from `pending`.
8. Save the complete plan at the required path. Include `## Approved design`
   with a link to the exact approved design. Add that plan link to the design's
   `## Execution` section, then add both artifacts to
   `docs/agent-devkit/INDEX.md` (`## Designs` and `## Plans`). When an Obsidian
   vault exists, targets are relative to its root (for a `docs/` vault:
   `[[agent-devkit/specs/...|Design]]` and `[[agent-devkit/plans/...|Plan]]`);
   otherwise use relative Markdown links. Do not link from `docs/llm/` to
   either artifact.
9. Do not estimate effort in this skill. When the user explicitly requests an
   estimate, tell the user to invoke `estimate-feature` before presenting the
   approval gate; otherwise continue without an estimate. Estimation never
   authorizes implementation.
10. Present the complete plan, requested estimate when present, and approval
   gate. For
   `Required: yes`, stop without editing application code. After the user
   explicitly approves the complete plan, update `Status: pending` to
   `Status: approved` and tell the user to invoke `implement-task`; that
   approval is the gate, so do not ask again. If an approved plan changes
   materially, append the user-confirmed change to `## Decision Log`, reset its
   `Required` and `Reason` from the new impact, set required plans to
   `Status: pending`, and present them again. For
   `Required: no`, tell the user to invoke `implement-task` with
   `Status: not-required`.
11. Do not include commit steps. If the user requests a commit, leave that action
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
5. **Approval gate** — do impact and status match the required criteria? Is a
   required gate still pending until the complete plan is approved?
6. **Minimal design** — can any proposed file, abstraction, dependency, or
   configuration be removed or replaced by existing, standard-library, native,
   or already-installed behavior without weakening an approved requirement?
7. **Decision consistency** — does every persisted decision agree with the
   tasks and approval status? Material changes must leave the gate pending.

Fix any issues inline. No need to re-review — just fix and move on.

## Red flags

| Thought | Reality |
|---|---|
| "I'll figure out the details during implementation" | Plan must contain actual content. No placeholders. |
| "This task is small enough to skip the template" | Every task states Files, Change, Verify. No exceptions. |
| "I'll add tests in a separate task later" | Tests go beside the behavior they verify. Same task. |
| "The plan is obvious from the design" | Obvious to you ≠ obvious to the implementing agent. Write it out. |
| "We may need this abstraction later" | Future flexibility without an approved requirement is not a plan task. |
| "The user already said implement" | Before the plan exists, that approves planning only. A required gate waits for approval of the complete plan. |
| "I'll leave an approved status after changing the plan" | Material plan changes invalidate approval. Reset the gate to pending. |
| "The implementing agent can recover decisions from chat" | Persist user-confirmed behavior changes in the plan's Decision Log. |

Plans are execution artifacts, not essays. Prefer the fewest tasks that
make the sequence and verification unambiguous.
