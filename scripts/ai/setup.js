import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";

const AGENTS = `# Coding Agent Contract

Read this file before changing the repository. It is the canonical contract
for every coding agent.

## Before changing code

- Read this file and [docs/llm/INDEX.md](docs/llm/INDEX.md).
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

const INDEX = `# LLM Wiki

This directory contains the LLM-facing documentation for the repository.

Keep this index as the entry point and link to detailed pages from here.
`;

function ensureFile(targetDir, name, contents) {
  const file = resolve(targetDir, name);
  if (existsSync(file)) return false;
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, contents, "utf8");
  return true;
}

const targetDir = resolve(process.argv[2] ?? process.cwd());

try {
  if (!statSync(targetDir).isDirectory()) {
    throw new Error(`Not a directory: ${targetDir}`);
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const files = [
  ["AGENTS.md", AGENTS],
  ["CLAUDE.md", CLAUDE],
  ["docs/llm/INDEX.md", INDEX],
];
const results = files.map(([name, contents]) => ({
  name,
  created: ensureFile(targetDir, name, contents),
}));

for (const { name, created } of results) {
  console.log(`${created ? "created" : "kept"} ${relative(targetDir, resolve(targetDir, name))}`);
}
