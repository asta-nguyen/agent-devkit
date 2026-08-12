import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, relative, resolve } from "node:path";

const AGENTS = `# Coding Agent Contract

Read this file before changing the repository. It is the canonical contract
for every coding agent.

## Before changing code

- Read this file and \`docs/llm/INDEX.md\`.
- Inspect the relevant code and its callers before editing.
- Reuse existing patterns and dependencies before adding new ones.

## Working rules

- Keep changes focused and minimal.
- Preserve user changes and do not rewrite unrelated files.
- Update relevant LLM documentation when code or behavior changes.
- Do not commit secrets, generated dependency directories, or temporary files.

## Verification

- Run the smallest relevant check after each non-trivial change.
- Do not declare the task complete while code and documentation disagree.
`;

const CLAUDE = `# Claude Code instructions

Read and follow [AGENTS.md](AGENTS.md). It is the canonical repository
contract; do not duplicate or override its rules here.
`;

function wikiAgents() {
  return `# LLM Wiki Instructions

This directory is the LLM-facing view of the repository. Source code,
manifests, tests, and Git history remain the source of truth.

## Workflow

1. Read \`INDEX.md\` before changing a page.
2. Ground every claim in a repository path, commit, issue, or supplied source.
3. Update the affected page, \`INDEX.md\`, and append an entry to \`LOG.md\`.
4. Mark unsupported claims as open questions; do not infer missing decisions.

## Page shape

Use Obsidian wikilinks (\`[[path/to/page|Label]]\`) for internal pages and a
short \`## Sources\` section with repository-relative paths or stable URLs.
Add \`## Related\` when a page has related wiki content. Keep architecture in
\`architecture/\`, repeatable processes in \`workflows/\`, and durable decisions
in \`decisions/\`.
`;
}

function wikiIndex(repo, mode) {
  return `# LLM Wiki

LLM-facing, source-linked context for \`${basename(repo)}\`.

## Architecture

${mode === "full" ? "- [[architecture/overview|Overview]] — AI-maintained repository overview.\n" : "- No pages yet. Use \`document-wiki\` after sources are available.\n"}
## Workflows

${mode === "full" ? "- [[workflows/setup-codebase|Setup codebase]] — AI-maintained setup workflow.\n" : "- No pages yet. Use \`document-wiki\` after sources are available.\n"}
## Decisions

Add durable, source-backed decisions under \`decisions/\`.

## Activity

- [Log](LOG.md) — append-only record of wiki maintenance.
`;
}

function wikiLog() {
  return `# Wiki Log

Append wiki maintenance in this format:

## [YYYY-MM-DD] <operation> | <summary>

- Sources: <repository paths or URLs>
- Updated: <wiki pages>
`;
}

function overviewPlaceholder(repo) {
  return `# ${basename(repo)} Architecture Overview

Populate this page with \`document-wiki\` after it reads the relevant
source code, tests, manifests, and existing documentation.

## Sources

- Open question: sources have not been ingested yet.
`;
}

function setupPlaceholder() {
  return `# Setup Codebase

Populate this page with \`document-wiki\` after it traces the repository's
actual setup flow and verifies the supporting sources.

## Related

- [[architecture/overview|Architecture overview]]

## Sources

- \`AGENTS.md\`
- \`docs/llm/AGENTS.md\`
`;
}

function relativePath(repo, file) {
  return relative(repo, file).replaceAll("\\", "/") || ".";
}

function isDirectory(file) {
  try {
    return statSync(file).isDirectory();
  } catch {
    return false;
  }
}

function ensureDirectory(repo, folder) {
  const target = resolve(repo, folder);
  if (existsSync(target)) return;
  mkdirSync(target, { recursive: true });
  console.log(`created ${relativePath(repo, target)}/`);
}

function ensureFile(repo, file, contents) {
  const target = resolve(repo, file);
  if (existsSync(target)) {
    console.log(`kept ${relativePath(repo, target)}`);
    return;
  }
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, contents, "utf8");
  console.log(`created ${relativePath(repo, target)}`);
}

const args = process.argv.slice(2);
const wikiOption = args.find((arg) => arg.startsWith("--wiki="));
const wikiMode = wikiOption?.slice("--wiki=".length) ?? "full";
const repoArg = args.find((arg) => !arg.startsWith("--"));

if (!new Set(["full", "placeholder"]).has(wikiMode)) {
  console.error("Usage: node setup.js [repo-path] [--wiki=full|placeholder]");
  process.exit(1);
}

const repo = resolve(repoArg ?? process.cwd());
if (!isDirectory(repo)) {
  console.error(`Not a directory: ${repo}`);
  process.exit(1);
}

ensureFile(repo, "AGENTS.md", AGENTS);
ensureFile(repo, "CLAUDE.md", CLAUDE);
ensureDirectory(repo, "docs/llm/architecture");
ensureDirectory(repo, "docs/llm/workflows");
ensureDirectory(repo, "docs/llm/decisions");
ensureFile(repo, "docs/llm/AGENTS.md", wikiAgents());
ensureFile(repo, "docs/llm/INDEX.md", wikiIndex(repo, wikiMode));
ensureFile(repo, "docs/llm/LOG.md", wikiLog());
if (wikiMode === "full") {
  ensureFile(repo, "docs/llm/architecture/overview.md", overviewPlaceholder(repo));
  ensureFile(repo, "docs/llm/workflows/setup-codebase.md", setupPlaceholder());
}
