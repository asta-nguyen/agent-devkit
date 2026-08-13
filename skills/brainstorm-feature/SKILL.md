---
name: brainstorm-feature
description: Clarify a proposed software feature and obtain design approval before implementation planning. Use when a user request is new, ambiguous, affects product behavior, or has unresolved scope, UX, API, data, or compatibility decisions.
---

# Brainstorm Feature

Do not start implementation from an unclear request.

## Classify the task first

Before your first question, classify the request and state the classification
out loud so the user can override it:

- **Spike** — a feasibility question ("can we…", "is it possible…", "quick and
  dirty is fine") whose output is an answer, not code you keep. Present the
  question and what you will try in 2-3 sentences, get a nod, then investigate
  as cheaply as correctness allows. No design doc, no spec file. Report
  findings as a recommendation; anything built stays labeled throwaway.

- **Bounded** — a well-scoped change to code that already exists in this repo:
  a new flag, a small endpoint, a one-file fix. Bounded means the flow you are
  changing is already here to read. If there is no existing flow to change, the
  task is not bounded. Ask the clarifying questions that matter, present a
  short design in chat (a few sentences to a few short paragraphs), and STOP.
  Implementation starts only after the user says yes. No spec file, no plan
  document.

- **Architectural** — new projects, new subsystems, changes that restructure
  how components fit together or alter interfaces others depend on. Follow the
  full process: questions, approaches, sectioned design, written spec, then
  `plan-feature`.

When in doubt between two paths, take the heavier one. Hidden complexity
discovered mid-task upgrades the path — stop, say so, and step up. Nothing
downgrades mid-task.

## Process

1. Read `AGENTS.md`, relevant wiki pages, and use `read-codebase-context` to
   establish the affected code path before asking questions.
2. If the project is too large for a single spec, help the user decompose into
   sub-projects: what are the independent pieces, how do they relate, what
   order should they be built? Then brainstorm the first sub-project through
   the normal flow. Each sub-project gets its own spec → plan → implementation
   cycle.
3. Ask concise follow-up questions only for decisions that materially change
   scope, behavior, compatibility, data handling, or user experience. State
   known facts so the user need not repeat them. Ask one question per message.
4. Offer the smallest viable design first. Include scope, observable behavior,
   affected interfaces/files, error cases, and verification approach.
5. Present the design in short sections and ask for approval before planning.
   Do not write production code while material decisions remain unresolved.
6. After approval, hand off to `plan-feature`.

Keep the design proportionate. For a one-line fix with an unambiguous expected
result, state the assumption and proceed without a ceremony-heavy design.

## Approval gate

Every path ends with the user approving your intent before implementation.
A todo list, a single-function utility, a config change — the design may be
two sentences in chat, but you MUST present it and get approval. "Simple" tasks
are where unexamined assumptions cause the most wasted work. What scales with
simplicity is the artifact, never the approval.

## Red flags

| Thought | Reality |
|---------|---------|
| "This is too simple to need a design" | Simple means a short design, not no design. Two sentences in chat, then approval. |
| "I'll call it bounded and skip the spec" | Reaching for a label to skip work IS the doubt — take the heavier path. |
| "It's bounded and the design is obvious — I'll start while they read it" | The gate is the approval, not the design's length. Present, then stop until you hear yes. |
| "I understand this kind of app, so it's bounded" | Bounded measures the repo, not your familiarity. A new project has no existing flow — it is architectural. |
| "The spike works, so I'll keep the code" | A spike's output is an answer. Keeping the code is a new request — classify it. |
| "It grew, but I'm almost done — no need to re-classify" | Hidden complexity upgrades the path mid-task. Stop and say so. |

## Spec self-review (architectural path only)

After writing the spec document, review it with fresh eyes before handing off:

1. **Placeholder scan** — any "TBD", "TODO", incomplete sections, or vague
   requirements? Fix them.
2. **Internal consistency** — do any sections contradict each other? Does the
   architecture match the feature descriptions?
3. **Scope check** — is this focused enough for a single implementation plan,
   or does it need decomposition?
4. **Ambiguity check** — could any requirement be interpreted two different
   ways? If so, pick one and make it explicit.

Fix any issues inline. No need to re-review — just fix and move on. Then ask
the user to review the spec before proceeding to `plan-feature`.
