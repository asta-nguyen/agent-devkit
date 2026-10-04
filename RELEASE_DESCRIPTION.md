# agent-devkit 0.6.0

This release strengthens evidence-based planning, implementation, review, and
documentation workflows, adds optional FFF search guidance, and adds Devin
SessionStart bootstrapping.

## Changes

- Route feature requests through explicit Spike, Bounded, and Architectural
  classifications, with approval gates and handoffs that preserve the design.
- Keep plans at behavior and interface detail; persist and refresh impact maps,
  including planned entries where source does not exist yet.
- Trace callers and dynamic references across OpenEZ, FFF, and `rg`; treat
  search results as navigation and current source as evidence.
- Use relative Markdown links for internal docs, migrate resolvable legacy
  wikilinks during wiki work, and block completion on unresolved wiki links.
- Tighten setup, debugging, estimation, memory, and documentation workflows;
  move rarely used guidance into skill references.
- Add Devin's SessionStart hook and shared bootstrap; expand acceptance
  scenarios and record host-reported token usage.

## Verification

- `npm test` passed with the plugin smoke checks.
- `git diff --check` passed.
