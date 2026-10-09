# agent-devkit 0.7.0

This release adds a source-grounded requirements wiki, change folders, and an
archive workflow. A bundled validator checks published wiki requirements,
links, IDs, and evidence paths.

## Changes

- Describe verified behavior in `docs/llm/` with stable requirement IDs,
  `SHALL` statements, scenarios, and source/test evidence.
- Keep new work in one change folder. After final review, merge its delta into
  the wiki when present and move the folder to `changes/archive/`.
- Bundle the dependency-free wiki validator with `document-wiki`; run it after
  wiki edits and before archiving a merged delta.
- Include valid and invalid wiki fixtures in the plugin smoke test. The
  validator can also be run from an installed skill folder against a project.
- Add a detailed Vietnamese team guide with workflow and artifact diagrams.

## Verification

- `npm test` passes the plugin smoke checks, including validator fixtures.
- `git diff --cached --check` passes for the staged release.
