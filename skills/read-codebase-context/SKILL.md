---
name: read-codebase-context
description: Use when a task needs accurate affected files, callers, tests, dependencies, or behavior — before feature design, planning, impact analysis, or wiki generation.
---

# Read Codebase Context

Use OpenEZ to locate context, then read the returned source directly. The index
and memory accelerate discovery; current source code and tests establish facts.

1. Check whether `openez` is available and run `openez status .`.
2. Treat OpenEZ as the preferred path for semantic discovery. If OpenEZ or its
   local workspace index is missing, explain that it is an optional local code
   index that helps agents find symbols, callers, dependencies, and
   cross-module flows faster through semantic search and graph queries; source
   and tests remain authoritative. Explain that setup requires Bun and the
   OpenEZ CLI, creates ignored `.openez/` index data, and may take time. Ask:
   `Do you want to set up OpenEZ for this repo? It is recommended for
   non-trivial codebases.` If the user agrees, use `setup-openez` and continue
   after its index/MCP verification. If the user declines, continue with the
   direct-source fallback. Never install the CLI, Bun, or an agent MCP
   configuration silently.

3. When OpenEZ is available, refresh the index with `openez index .` before a
   non-trivial feature plan.
4. When OpenEZ is available, query the requested behavior with `code_query` or
   `code_context`; traverse
   callers/callees with `graph_neighbors` when the flow crosses modules. Use
   `memory_recall` only for previously recorded decisions or patterns.
5. Read the entry point, returned implementation(s), direct callers, and
   relevant tests. Record an impact map:

   ```text
   Entry: <file + symbol>
   Flow: <caller → implementation → dependency>
   Change candidates: <files likely to modify>
   Verification: <tests/checks to run>
   ```

6. If OpenEZ cannot be installed or queried, use `rg` and direct file reads,
   state the fallback, and continue. Never fabricate a file impact list from
   index results or memory alone.

## Quick reference

| Need | Tool |
|---|---|
| Semantic code search | `code_query` |
| Symbol context (callers/callees) | `code_context` |
| Graph traversal across modules | `graph_neighbors` |
| Past decisions or patterns | `memory_recall` |
| Fallback (no OpenEZ) | `rg` + direct file reads |

## Red flags

| Thought | Reality |
|---|---|
| "I'll skip tracing callers, it's a small change" | Small changes break callers you did not read. |
| "The index is probably current" | Stale index returns wrong callers. Run `openez index .` if unsure. |
| "I'll fabricate the impact list from memory" | Memory is not evidence. Read the actual source. |
| "I don't need OpenEZ, I'll just grep" | Grep finds strings, not call graphs. Use OpenEZ when available. |

The local `.openez/` directory is derived index data. Keep it out of source
documentation and version control unless the target repository explicitly
chooses otherwise.
