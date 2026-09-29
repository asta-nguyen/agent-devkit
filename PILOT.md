# Agent DevKit — Pilot Plan & Evaluation

> Guide for running a pilot: duration, evaluation criteria, feedback collection,
> and the go/no-go decision.

---

## Contents

1. [Trial duration](#1-trial-duration)
2. [Trial preparation](#2-trial-preparation)
3. [Running the trial](#3-running-the-trial)
4. [Evaluation criteria](#4-evaluation-criteria)
5. [Evaluation form](#5-evaluation-form)
6. [Post-trial decision](#6-post-trial-decision)

---

## 1. Trial duration

### **2 weeks (10 working days)**

| Week | Goal |
|---|---|
| **Day 1** | Tech lead setup: install skills, run `setup-codebase`, and walk the team through `GUIDE.md` |
| **Week 1 (days 2–5)** | Team starts using DevKit for bug fixes and small tasks while learning the workflow |
| **Week 2 (days 6–10)** | Team continues real-world use, completes evaluation forms, and holds a final retrospective |

Two weeks should expose the team to several task types (bug fixes, small features,
and documentation) without losing momentum. The tech lead handles setup so the
team can focus on using the workflow.

---

## 2. Trial preparation

### Checklist before Day 1

- [ ] **Choose 1–3 pilot users** who use a coding agent daily.
- [ ] **Choose one target repository** the team actively works in.
- [ ] **Each pilot user records a baseline** before the trial:
      - Average active time to complete a task, excluding time waiting for a user or reviewer
      - User/reviewer wait time separately, if it can be measured
      - Number of bugs fixed by the agent without reading callers
      - Number of times the agent reported completion without verification
      - Satisfaction with agent output (1–5)
- [ ] **Create a shared channel or note** for the team to share feedback in real time.

### Notes for pilot users

```text
You will use agent-devkit for two weeks. The agent chooses a route based on the task:

- Small bug in an existing flow: systematic-debugging (investigate and fix)
  → review-and-verify. If investigation reveals an interface, contract, or
  architectural-boundary change, stop and switch to spec → plan before fixing.
- Small feature in an existing flow: brainstorm-feature (short design in chat)
  → approval → implement-task → review-and-verify. Do not create a spec or plan file.
- Architectural change: brainstorm-feature writes a spec
  → approval → plan-feature (approve the plan if its approval gate requires it)
  → implement-task → review-and-verify.

You do not need to memorize skill names—describe the task and the agent will route it.

After each task, record:
  - What was the task, and which route did the agent use? (bug / small feature / architecture / docs)
  - Active task time through review pass; record user/reviewer waiting time separately.
  - If the task used the wiki: active document-wiki time, number of wiki pages read,
    and number of source/test files read. Enter N/A if the task did not use the wiki.
  - Documentation conflicts: count and affected files (0 if none; N/A if the task
    did not touch documentation).
  - Did the agent follow approval gates and verify before reporting completion?
  - Were there any issues? Compared with before DevKit: better / worse / about the same?
```

---

## 3. Running the trial

### Day 1 — Tech lead setup

The tech lead does this once for the whole team:

```bash
# Install skills for all pilot users
npx skills add asta-nguyen/agent-devkit -a claude-code

# In the target repository, run setup-codebase to create context files
# (AGENTS.md, CLAUDE.md, docs/llm/ skeleton)
```

- OpenEZ is optional: use semantic/graph search only when a task needs code
  relationship lookup and the workspace index is healthy; otherwise continue
  with FFF or `rg`. Do not install OpenEZ based on repository line count.
- Walk the team through `GUIDE.md`.
- Restart agent sessions so the skill list reloads.

### Week 1 (Days 2–5) — Start using DevKit

Use DevKit for real team tasks: fix issues, handle small tasks, and build small
features.

| Activity | Suggested volume |
|---|---|
| Bug fixes (through `systematic-debugging`) | 1–2 bugs |
| Small features (bounded changes) | 1–2 tasks |
| `document-wiki` | Once, if there is a new feature |

**Do not change the team's normal workflow**—just add the DevKit workflow to it.

**End of Week 1:** Hold a 15-minute check-in:
- Did setup cause any problems?
- Is the workflow difficult to follow?
- Is the agent following approval gates?

### Week 2 (Days 6–10) — Real-world use and evaluation

Continue using DevKit for daily tasks and complete the evaluation form.

| Activity | Purpose |
|---|---|
| Continue fixing issues and adding features | Collect more data |
| Each pilot user completes the form (Section 5) | Gather structured feedback |
| Final retrospective (45 minutes) | Make the go/no-go decision |

**End-of-trial retrospective:**
- Was the agent more effective with DevKit?
- Which workflows were most useful? Which felt unnecessary?
- Were there times you wanted to skip a workflow? Why?

---

## 4. Evaluation criteria

### 4.1. Productivity

| Metric | How to measure | Compare with baseline |
|---|---|---|
| Active task time | Active work from task start to review pass; record user/reviewer wait time separately | Faster / same / slower |
| `document-wiki` time | Active time for each wiki run, excluding wait time | Record during the pilot |
| Wiki pages read | Count wiki files/pages actually opened for each wiki task | Record during the pilot |
| Source/test files read | Count source and test files actually opened for each wiki task | Record during the pilot |
| Documentation conflicts | Count conflicts and record affected files; enter 0 if none | Record during the pilot |
| Review rounds | Number of times a reviewer requests changes | Fewer / same / more |
| Bugs found after review | Bugs discovered after merge | Fewer / same / more |

During the pilot, collect data only; do not change the wiki-reading workflow. Revisit
that decision after the retrospective if the time or feedback indicates that wiki
reading slows tasks. Even if the scan approach changes later, mark `[x]` only after
reading current source/tests and verifying the page's claims in that run.

### 4.2. Agent output quality

After each task, mark each statement **Yes** or **No**:

- The agent read relevant code before editing.
- The agent waited for approval before coding.
- The agent verified the change before reporting completion.
- The agent avoided out-of-scope changes.

**Target:** At least 4/4 “Yes” answers for most tasks.

### 4.3. Developer experience

Rate each item from 1–5 (1 = poor, 5 = excellent):

- Is the agent easier to use with DevKit? `[1] [2] [3] [4] [5]`
- Does the workflow feel natural rather than cumbersome? `[1] [2] [3] [4] [5]`
- Do you trust the output more? `[1] [2] [3] [4] [5]`
- Do you want to keep using DevKit after the trial? `[1] [2] [3] [4] [5]`

**Most useful skills?** (choose up to 3)
**Least useful skills?** (choose 1–2)

### 4.4. Issues encountered

Record these during the trial:

- Did setup fail in any way?
- Which workflows conflicted with the team's habits?
- Did the agent ignore any skill instructions?
- Were there times you wanted to bypass a workflow? Why?

---

## 5. Evaluation form (template)

> Each pilot user completes this form at the end of Week 2. Copy it into Notion or Google Forms.

```markdown
# Agent DevKit Pilot — Individual Evaluation

**Name:** ____________________
**Role:** ____________________
**Number of tasks completed with DevKit:** ______

---

## A. Productivity

1. Average active time to complete a task BEFORE DevKit: ____ hours
   Average active time WITH DevKit: ____ hours
   → Difference: ____ (faster / slower / about the same)
   User/reviewer waiting time with DevKit: ____ hours (record separately; do not
   include it in active time; see the task log)

2. Average review rounds BEFORE DevKit: ____
   Average review rounds WITH DevKit: ____
   → Difference: ____

3. Bugs found after review BEFORE DevKit: ____
   Bugs found after review WITH DevKit: ____

Wiki workload (aggregate from task logs; enter N/A if no tasks used the wiki):
- Number of wiki tasks: ____
- Active time spent on document-wiki: ____ minutes
- Number of wiki pages/files read: ____
- Number of source/test files read: ____
- User/reviewer waiting time: ____ minutes (record separately; exclude from active time)
- Documentation conflicts: ____; affected files: ____

---

## B. Agent output quality

4. Did the agent read callers before editing?
   [ ] Always  [ ] Often  [ ] Sometimes  [ ] Rarely

5. Did the agent wait for approval before coding?
   [ ] Always  [ ] Sometimes skipped approval  [ ] Often skipped approval

6. Did the agent verify before reporting completion?
   [ ] Always  [ ] Sometimes  [ ] Often said “should work”

7. Did the agent make out-of-scope changes?
   [ ] No  [ ] 1–2 times  [ ] Frequently

---

## C. Developer experience (rate 1–5)

8. Was the agent easier or harder to use with DevKit?       [1] [2] [3] [4] [5]
9. Did the workflow feel natural or cumbersome?             [1] [2] [3] [4] [5]
10. Did you trust the agent's output more or less?          [1] [2] [3] [4] [5]
11. Do you want to keep using DevKit after the trial?       [1] [2] [3] [4] [5]

---

## D. Skill ranking

12. Most useful skills (choose up to 3):
    [ ] setup-codebase     [ ] setup-openez       [ ] read-codebase-context
    [ ] brainstorm-feature [ ] plan-feature       [ ] estimate-feature
    [ ] implement-task     [ ] systematic-debugging
    [ ] review-and-verify  [ ] document-wiki

13. Least useful skills (choose 1–2):
    [ ] setup-codebase     [ ] setup-openez       [ ] read-codebase-context
    [ ] brainstorm-feature [ ] plan-feature       [ ] estimate-feature
    [ ] implement-task     [ ] systematic-debugging
    [ ] review-and-verify  [ ] document-wiki

---

## E. Issues and suggestions

14. What was the biggest difficulty when using DevKit?
    _______________________________________________

15. Which workflow felt unnecessary or should be removed?
    _______________________________________________

16. Which workflow is missing or should be added?
    _______________________________________________

17. Other feedback:
    _______________________________________________
```

---

## Backlog to revisit after the pilot

These items are not being implemented now; promote them only if the pilot shows a
real need:

- **Monorepo support** — define boundaries between root/package-level
  `AGENTS.md` files, per-package wikis, and cross-package dependency tracing.
- **CI validation** — choose minimal validation for YAML frontmatter and internal
  links; avoid adding dependencies if GitHub Actions or native tooling is enough.
- **Subagent/parallel execution** — consider it only after measuring a bottleneck
  and agreeing on ownership, merge handling, verification evidence, and cost/context limits.

Discuss at the final retrospective: how often monorepos came up, how many
documentation/link errors occurred, and how many tasks actually benefited from
parallel execution.

## 6. Post-trial decision

### Final retrospective (1 hour)

**Attendees:** Pilot users + decision maker.

**Agenda:**

1. (10 min) Each pilot user summarizes their experience — 3 minutes per person
2. (15 min) Review evaluation forms and identify patterns
3. (15 min) Discuss productivity metrics — was there an improvement?
4. (10 min) Discuss edge cases — were there blockers?
5. (10 min) Make the go/no-go decision

### Decision framework

| Outcome | Criteria | Action |
|---|---|---|
| **GO — Roll out to the whole team** | Experience ≥ 3/5, productivity at or above baseline, and no blockers | Expand to the whole team and create an onboarding plan |
| **GO with conditions** | Experience ≥ 3/5, with 1–2 issues to fix | Fix the issues and run a short one-week trial with a larger group |
| **NO — Stop** | Experience < 3/5 or productivity drops significantly | Analyze the root cause and decide whether to iterate or stop |

### After a GO decision

- [ ] Create a team onboarding document based on `GUIDE.md` and pilot feedback.
- [ ] Install skills for the whole team.
- [ ] Run `setup-codebase` on the primary repositories.
- [ ] Assign one pilot user as a champion to help onboard the team.
- [ ] Check in after two weeks of rollout to catch issues early.

### After a NO decision

- [ ] Record the root cause (cumbersome workflow? Agent non-compliance? No value for the team?).
- [ ] Decide whether to iterate (change skills/workflow) or stop using DevKit.
- [ ] If iterating, plan changes and run another trial with a small group.

---

## Quick summary

```text
┌──────────────────────────────────────────────────────┐
│  TRIAL: 2 weeks, 1–3 people, 1 real repository       │
│                                                      │
│  Day 1: Tech lead setup (skills + setup-codebase)    │
│  Week 1: Team use — bug fixes, small tasks           │
│  Week 2: Real-world use + forms + retrospective      │
│                                                      │
│  MEASURE:                                            │
│    • Active task time; user/reviewer wait separately │
│    • document-wiki time, pages, source/test counts │
│    • Documentation conflict count                    │
│    • Review rounds and bugs found after review       │
│    • Workflow compliance (approval, verification)    │
│    • Developer experience (1–5) and skill ranking   │
│                                                      │
│  DECIDE:                                             │
│    GO / GO with conditions / NO                      │
│    Based on: productivity + experience + blockers    │
└──────────────────────────────────────────────────────┘
```
