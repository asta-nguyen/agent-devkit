# LLM Wiki Instructions

This directory is the generated, LLM-facing view of the repository. The source
code, manifests, tests, and Git history remain the source of truth.

## Workflow

1. Read `INDEX.md` before adding or changing a page.
2. Ground every claim in a repository path, commit, issue, or supplied source.
3. Update the affected page, `INDEX.md`, and append an entry to `LOG.md`.
4. Mark unsupported claims as open questions; do not infer missing decisions.

## Page shape

Use a short `## Sources` section with repository-relative paths or stable URLs.
Keep architecture in `architecture/`, repeatable processes in `workflows/`,
and durable decisions in `decisions/`.
