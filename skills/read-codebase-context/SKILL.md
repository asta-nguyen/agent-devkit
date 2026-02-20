---
name: read-codebase-context
description: Index and trace repository code before feature design, planning, impact analysis, or wiki generation. Use when a task needs accurate affected files, callers, tests, dependencies, or behavior; prefer OpenEZ graph queries and bootstrap its local index when it is unavailable or stale.
---

# Read Codebase Context

Use OpenEZ to locate context, then read the returned source directly. The index
and memory accelerate discovery; current source code and tests establish facts.

1. Check whether `openez` is available and run `openez status .`.
2. If OpenEZ or its local workspace index is missing, bootstrap it:

   ```bash
   npm install -g @openez-graph/cli
   openez init .
   ```

   If Bun is missing, explain that OpenEZ requires Bun 1.1+ and ask the user to
   authorize/install it before continuing. Do not run `openez setup <agent>`:
   the repository's own `AGENTS.md` remains the instruction source of truth.

3. Before a non-trivial feature plan, refresh the index with `openez index .`.
4. Query the requested behavior with `code_query` or `code_context`; traverse
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

The local `.openez/` directory is derived index data. Keep it out of source
documentation and version control unless the target repository explicitly
chooses otherwise.
