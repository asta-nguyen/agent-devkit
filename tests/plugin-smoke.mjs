import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { AgentDevkitPlugin } from "../.opencode/plugins/agent-devkit.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const validatorPath = path.join(repoRoot, "skills/document-wiki/scripts/validate-llm-wiki.mjs");
const skillsRoot = path.join(repoRoot, "skills");
for (const entry of fs.readdirSync(skillsRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const skillDir = path.join(skillsRoot, entry.name);
  const skillPath = path.join(skillDir, "SKILL.md");
  if (!fs.existsSync(skillPath)) continue;
  const content = fs.readFileSync(skillPath, "utf8");
  for (const [, referencePath] of content.matchAll(/`(references\/[^`\s]+\.md)`/g)) {
    assert.ok(
      fs.existsSync(path.join(skillDir, referencePath)),
      `${entry.name} references missing file ${referencePath}`,
    );
  }
}

const runHook = (env = {}) => JSON.parse(execFileSync(
  process.execPath,
  [path.join(repoRoot, "hooks/session-start.js")],
  { cwd: "/", encoding: "utf8", env: { ...process.env, ...env } },
));

const claude = runHook();
assert.match(claude.hookSpecificOutput.additionalContext, /name: using-devkit/);

const cursor = runHook({ CURSOR_PLUGIN_ROOT: repoRoot });
assert.match(cursor.additional_context, /name: using-devkit/);
assert.equal(cursor.hookSpecificOutput, undefined);

const devinHooks = JSON.parse(fs.readFileSync(path.join(repoRoot, "hooks.json"), "utf8"));
const devinStart = devinHooks.hooks.SessionStart;
assert.equal(devinStart.length, 1);
assert.equal(devinStart[0].matcher, "");
assert.equal(devinStart[0].hooks.length, 1);
const hookFixture = fs.mkdtempSync(path.join(os.tmpdir(), "devkit-hook-"));
try {
  const pluginPath = path.join(hookFixture, "plugin with spaces");
  fs.symlinkSync(repoRoot, pluginPath, "dir");
  const devin = JSON.parse(execFileSync("/bin/sh", ["-c", devinStart[0].hooks[0].command], {
    cwd: "/",
    encoding: "utf8",
    env: { ...process.env, CURSOR_PLUGIN_ROOT: "", CLAUDE_PLUGIN_ROOT: pluginPath },
  }));
  assert.equal(devin.systemMessage, "AGENT-DEVKIT:ACTIVE");
  assert.equal(devin.hookSpecificOutput.hookEventName, "SessionStart");
  assert.equal(devin.hookSpecificOutput.additionalContext, claude.hookSpecificOutput.additionalContext);
} finally {
  fs.rmSync(hookFixture, { recursive: true, force: true });
}

const plugin = await AgentDevkitPlugin();
const config = {};
await plugin.config(config);
await plugin.config(config);
assert.equal(config.skills.paths.length, 1);

const output = {
  messages: [{
    info: { role: "user" },
    parts: [{ type: "text", text: "<EXTREMELY_IMPORTANT>another plugin</EXTREMELY_IMPORTANT>" }],
  }],
};
await plugin["experimental.chat.messages.transform"]({}, output);
assert.match(output.messages[0].parts[0].text, /AGENT-DEVKIT:ACTIVE/);
assert.equal(output.messages[0].parts.length, 2);
await plugin["experimental.chat.messages.transform"]({}, output);
assert.equal(output.messages[0].parts.length, 2);

const releaseVersion = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8")).version;
const escapedReleaseVersion = releaseVersion.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const versionFiles = [
  "package.json",
  ".codex-plugin/plugin.json",
  ".claude-plugin/plugin.json",
  ".cursor-plugin/plugin.json",
  ".devin-plugin/plugin.json",
];
for (const file of versionFiles) {
  assert.equal(JSON.parse(fs.readFileSync(path.join(repoRoot, file), "utf8")).version, releaseVersion, file);
}
for (const file of [
  ".claude-plugin/marketplace.json",
  ".cursor-plugin/marketplace.json",
]) {
  assert.equal(JSON.parse(fs.readFileSync(path.join(repoRoot, file), "utf8")).plugins[0].version, releaseVersion, file);
}
assert.match(
  fs.readFileSync(path.join(repoRoot, "CHANGELOG.md"), "utf8"),
  new RegExp(`^## \\[${escapedReleaseVersion}\\] - \\d{4}-\\d{2}-\\d{2}$`, "m"),
);
assert.match(
  fs.readFileSync(path.join(repoRoot, "RELEASE_DESCRIPTION.md"), "utf8"),
  new RegExp(`^# agent-devkit ${escapedReleaseVersion}$`, "m"),
);

function writeWikiFixture(root, { index, pages = {}, files = {} }) {
  const wikiRoot = path.join(root, "docs/llm");
  fs.mkdirSync(wikiRoot, { recursive: true });
  fs.writeFileSync(path.join(wikiRoot, "INDEX.md"), index);
  for (const [name, content] of Object.entries(pages)) fs.writeFileSync(path.join(wikiRoot, name), content);
  for (const [name, content] of Object.entries(files)) {
    const target = path.join(root, name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  }
}

function runWikiValidator(root) {
  const result = spawnSync(process.execPath, [validatorPath, root], { encoding: "utf8" });
  assert.equal(result.error, undefined, result.error?.message);
  return { status: result.status, output: `${result.stdout}${result.stderr}` };
}

function wikiIndex({ prefixes = "| PAY | Payments |", retired = "", extraLinks = "" } = {}) {
  const fencedExample = "```md\n[missing](fenced-example.md)\n[[legacy]]\n```\n";
  return `# Codebase Wiki\n\n## Requirement prefixes\n\n| Prefix | Domain |\n| --- | --- |\n${prefixes}\n\n## Retired requirement IDs\n\n${retired}\n\n## Pages\n\n[Payments](payments.md#payments) · [refund](payments.md#pay-refund-cap) · [Payments][payments] · [external](https://example.com)\n\n[wrapped]\n(payments.md#payments)\n\n[payments]: payments.md#payments\n${extraLinks}\n${fencedExample}`;
}

function requirement(id, { evidence = "src/refund.mjs", scenario = "complete" } = {}) {
  const scenarioLines = scenario === "complete"
    ? "- GIVEN a captured payment\n- WHEN a refund is requested\n- THEN the request is checked"
    : "- GIVEN a captured payment\n- WHEN a refund is requested";
  const evidenceLine = evidence.split(", ").map((file) => `\`${file}\``).join(", ");
  return `### ${id}\n\nThe system SHALL check the refund request.\n\n#### Scenario: refund checked\n\n${scenarioLines}\n\nEvidence: ${evidenceLine}\n\n`;
}

function validatorFixtureChecks() {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "devkit-wiki-validator-"));
  try {
    const emptyRoot = path.join(fixture, "empty");
    writeWikiFixture(emptyRoot, { index: "# Codebase Wiki\n" });
    const empty = runWikiValidator(emptyRoot);
    assert.equal(empty.status, 0, empty.output);
    assert.match(empty.output, /0 errors/);

    const noIndexRoot = path.join(fixture, "no-index");
    fs.mkdirSync(path.join(noIndexRoot, "docs/llm"), { recursive: true });
    const noIndex = runWikiValidator(noIndexRoot);
    assert.equal(noIndex.status, 1, noIndex.output);
    assert.match(noIndex.output, /required wiki index does not exist/);

    const symlinkRoot = path.join(fixture, "symlink");
    writeWikiFixture(symlinkRoot, { index: "# Codebase Wiki\n" });
    const linkedPage = path.join(symlinkRoot, "docs/llm/linked.md");
    const externalPage = path.join(symlinkRoot, "outside.md");
    fs.writeFileSync(externalPage, "# Outside\n");
    fs.symlinkSync(externalPage, linkedPage, "file");
    const symlink = runWikiValidator(symlinkRoot);
    assert.equal(symlink.status, 1, symlink.output);
    assert.match(symlink.output, /symbolic links under docs\/llm\//);

    const sources = "## Sources\n\n- `src/refund.mjs`\n- `tests/refund.test.mjs`\n";
    const files = { "src/refund.mjs": "export {};\n", "tests/refund.test.mjs": "assert.ok(true);\n" };
    const validRoot = path.join(fixture, "valid");
    writeWikiFixture(validRoot, {
      index: wikiIndex(),
      pages: {
        "payments.md": `# Payments\n\n## Requirements\n\n${requirement("PAY-refund-cap", { evidence: "src/refund.mjs, tests/refund.test.mjs" })}${sources}`,
        "LOG.md": "[missing](legacy-target.md)\n",
      },
      files,
    });
    const valid = runWikiValidator(validRoot);
    assert.equal(valid.status, 0, valid.output);
    assert.match(valid.output, /0 errors, 0 warnings/);

    const warningRoot = path.join(fixture, "warning");
    writeWikiFixture(warningRoot, {
      index: wikiIndex(),
      pages: {
        "payments.md": `# Payments\n\n## Requirements\n\n${requirement("PAY-refund-cap")}${requirement("PAY-refund-capture")}\n${sources}`,
      },
      files,
    });
    const warning = runWikiValidator(warningRoot);
    assert.equal(warning.status, 0, warning.output);
    assert.match(warning.output, /WARNING .*near-duplicate requirement slug/);
    assert.match(warning.output, /0 errors, 1 warning/);

    const invalidRoot = path.join(fixture, "invalid");
    const invalidRequirements = [
      requirement("PAY-refund-cap"),
      requirement("PAY-dup"),
      requirement("PAY-dup"),
      requirement("PAY-retired"),
      requirement("INV-unregistered"),
      requirement("PAY-zeta"),
      requirement("BILL-alpha"),
      requirement("PAY-outside", { evidence: "../outside.mjs" }),
      requirement("PAY-missing", { evidence: "src/missing.mjs" }),
      requirement("PAY-bad-format", { scenario: "missingThen" }),
      requirement("PAY-Upper-Slug"),
    ].join("");
    writeWikiFixture(invalidRoot, {
      index: wikiIndex({
        prefixes: "| PAY | Payments |\n| PAY | Duplicate |\n| BILL | Payments |\n| BAD-LOWER | |",
        retired: "- `PAY-retired`",
        extraLinks: "[missing](missing.md#nope) · [bad anchor](payments.md#missing) · [process](../agent-devkit/specs/missing.md) · [[legacy]] · [ghost][ghost]\n",
      }),
      pages: {
        "payments.md": `# Payments\n\n## Requirements\n\n${invalidRequirements}${sources}\n### PAY-outside-section\n`,
        "duplicate.md": `# Duplicate\n\n## Requirements\n\n${requirement("PAY-refund-cap")}${sources}`,
      },
      files,
    });
    const invalid = runWikiValidator(invalidRoot);
    assert.equal(invalid.status, 1, invalid.output);
    assert.match(invalid.output, /ERROR docs\/llm\/INDEX\.md:\d+:/);
    assert.match(invalid.output, /ERROR docs\/llm\/payments\.md:\d+:/);
    for (const expected of [
      /invalid requirement ID\/heading/,
      /requirement-shaped heading outside ## Requirements/,
      /duplicate requirement ID PAY-dup/,
      /duplicate requirement ID PAY-refund-cap; first defined in docs\/llm\/duplicate\.md/,
      /retired requirement ID is reused: PAY-retired/,
      /unregistered requirement prefix: INV/,
      /repeated prefix: PAY/,
      /repeated domain: Payments/,
      /malformed prefix registry row/,
      /a Requirements page must use only one prefix/,
      /requirements are not sorted by ID/,
      /Evidence path escapes the repository root/,
      /Evidence path does not exist: src\/missing.mjs/,
      /Evidence path is not listed in ## Sources/,
      /scenario needs a THEN line/,
      /Markdown link target does not exist: missing.md/,
      /Markdown link anchor not found: payments.md#missing/,
      /must not link to process artifacts/,
      /legacy \[\[\.\.\.\]\] links are not allowed/,
      /undefined Markdown reference link: ghost/,
    ]) assert.match(invalid.output, expected);
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
}

validatorFixtureChecks();

console.log("plugin smoke checks passed");
