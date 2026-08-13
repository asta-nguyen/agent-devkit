---
name: writing-skills
description: Use when creating or editing a skill for AI agents — defining a repeatable workflow, technique, or discipline. Covers structure, discovery optimization, anti-patterns, and quality checks.
---

# Writing Skills

A skill is a reusable playbook that teaches an agent how to execute a
repeatable process. Skills are not narratives or one-off solutions.

## When to create a skill

**Create when:**
- The technique was not intuitively obvious
- It applies across projects, not just one repo
- Others (or future agent sessions) would benefit

**Don't create for:**
- One-off solutions
- Standard practices well-documented elsewhere
- Project-specific conventions (put in `AGENTS.md`)
- Mechanical constraints enforceable by tooling

## SKILL.md structure

```markdown
---
name: skill-name-with-hyphens
description: Use when [specific triggering conditions and symptoms]
---

# Skill Name

## Overview
Core principle in 1-2 sentences.

## When to use
Bullet list of symptoms and situations.
When NOT to use.

## Process / Pattern
Step-by-step instructions or before/after comparison.

## Quick reference
Table or bullets for scanning.

## Red flags (if discipline skill)
Table of rationalizations and reality.

## Common mistakes
What goes wrong + fixes.
```

## Skill Discovery Optimization (SDO)

### Description = WHEN to use, NOT WHAT it does

The description must only describe triggering conditions. Do NOT summarize
the skill's process or workflow — agents will follow the description
instead of reading the full skill.

```yaml
# BAD: summarizes workflow — agents follow this shortcut
description: Use when executing plans - dispatches subagent per task with review between tasks

# GOOD: triggering conditions only
description: Use when executing implementation plans with independent tasks
```

**Rules:**
- Start with "Use when..."
- Include specific symptoms, situations, contexts
- Third person
- Under 500 characters
- Never summarize the workflow

### Keyword coverage

Use words an agent would search for:
- Error messages: "Hook timed out", "ENOTEMPTY"
- Symptoms: "flaky", "hanging", "stale"
- Synonyms: "timeout/hang/freeze", "cleanup/teardown"
- Tool names: actual commands, library names

### Descriptive naming

- Verb-first, active voice: `writing-skills` not `skill-creation`
- Gerunds work for processes: `creating-skills`, `debugging-with-logs`
- Name by what you DO or core insight: `root-cause-tracing` not `debugging-techniques`

## Match the form to the failure

Before writing guidance, classify the baseline failure:

| Baseline failure | Right form | Wrong form |
|---|---|---|
| Skips rule under pressure | Prohibition + rationalization table + red flags | Soft guidance ("prefer...") |
| Output has wrong shape | Positive recipe: state what output IS | Prohibition list ("don't X") |
| Omits required element | Structural: REQUIRED field in template | Prose reminders |
| Conditional behavior | Conditional on observable predicate | Unconditional rule + exemptions |

**No nuance clauses.** "Don't X unless it matters" reopens negotiation.
Express a real exception as its own conditional on an observable predicate.

## Bulletproofing discipline skills

Skills that enforce discipline need to resist rationalization. Agents find
loopholes under pressure.

1. **Close every loophole explicitly** — don't just state the rule, forbid
   specific workarounds.
2. **Address spirit vs letter** — add: "Violating the letter of the rules
   is violating the spirit of the rules."
3. **Build rationalization table** — every excuse agents make goes in:
   `| Excuse | Reality |`
4. **Create red flags list** — self-check signals: "If you catch yourself
   thinking X, stop."

## Anti-patterns

| Anti-pattern | Why bad |
|---|---|
| Narrative ("In session 2025-10-03, we found...") | Too specific, not reusable |
| Multi-language dilution (example.js + .py + .go) | Mediocre quality, maintenance burden |
| Code in flowcharts | Can't copy-paste, hard to read |
| Generic labels (helper1, step3) | No semantic meaning |
| Summarizing workflow in description | Agents follow shortcut, skip full skill |

## Token efficiency

Skills load into agent context. Every token counts.

- Keep skills under 500 words when possible
- Cross-reference other skills instead of repeating
- Compress examples to minimal viable illustration
- Don't explain what's obvious from the command (`--help` exists)

## Quality checklist

Before deploying a skill:

- [ ] Name uses only letters, numbers, hyphens
- [ ] Description starts with "Use when..." — triggers only, no workflow summary
- [ ] Keywords throughout for search (errors, symptoms, tools)
- [ ] Clear overview with core principle
- [ ] One excellent example (not multi-language)
- [ ] Quick reference table for scanning
- [ ] Common mistakes section
- [ ] Red flags table (if discipline skill)
- [ ] No narrative storytelling
- [ ] Supporting files only for heavy reference or reusable tools
- [ ] Under 500 words (or justified exception)
