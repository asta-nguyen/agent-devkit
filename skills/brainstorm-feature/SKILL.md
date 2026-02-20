---
name: brainstorm-feature
description: Clarify a proposed software feature and obtain design approval before implementation planning. Use when a user request is new, ambiguous, affects product behavior, or has unresolved scope, UX, API, data, or compatibility decisions.
---

# Brainstorm Feature

Do not start implementation from an unclear request.

1. Read `AGENTS.md`, relevant wiki pages, and use `read-codebase-context` to
   establish the affected code path before asking questions.
2. Ask concise follow-up questions only for decisions that materially change
   scope, behavior, compatibility, data handling, or user experience. State
   known facts so the user need not repeat them.
3. Offer the smallest viable design first. Include scope, observable behavior,
   affected interfaces/files, error cases, and verification approach.
4. Present the design in short sections and ask for approval before planning.
   Do not write production code while material decisions remain unresolved.
5. After approval, hand off to `plan-feature`.

Keep the design proportionate. For a one-line fix with an unambiguous expected
result, state the assumption and proceed without a ceremony-heavy design.
