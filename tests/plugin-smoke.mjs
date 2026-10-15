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

// One character cap per skill (design: 2026-10-14-skill-context-budget, cap
// table). Target = cap minus a reserve for approved follow-up additions; both
// are printed, and only the cap fails. Characters are bytes, as `wc -c` counts
// them. A skill missing from this map fails, so a new skill gets a deliberate
// cap. Set ENFORCE_CAPS to false only to report sizes while restructuring.
const ENFORCE_CAPS = true;
const SKILL_CAPS = {
  "using-devkit": { cap: 6000, target: 5900 },
  "read-codebase-context": { cap: 6000, target: 6000 },
  "brainstorm-feature": { cap: 11000, target: 11000 },
  "plan-feature": { cap: 11000, target: 10800 },
  "implement-task": { cap: 11000, target: 10200 },
  "document-wiki": { cap: 12000, target: 12000 },
  "review-and-verify": { cap: 12500, target: 11000 },
  "systematic-debugging": { cap: 10000, target: 10000 },
  "setup-codebase": { cap: 9500, target: 9500 },
  "estimate-feature": { cap: 6500, target: 6500 },
  "setup-openez": { cap: 6000, target: 6000 },
  "lean-audit": { cap: 3500, target: 3500 },
  "context-handoff": { cap: 4000, target: 3900 },
};
const ARCHITECTURAL_CHAIN = [
  "using-devkit",
  "read-codebase-context",
  "brainstorm-feature",
  "plan-feature",
  "implement-task",
  "document-wiki",
  "review-and-verify",
];
// Status values that look like skill names but are not.
const NON_SKILL_TOKENS = new Set(["not-applicable", "not-required"]);

const skillNames = fs.readdirSync(skillsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(skillsRoot, entry.name, "SKILL.md")))
  .map((entry) => entry.name);
const skillSet = new Set(skillNames);

function skillMarkdownFiles(name) {
  const dir = path.join(skillsRoot, name);
  const files = [path.join(dir, "SKILL.md")];
  const referencesDir = path.join(dir, "references");
  if (fs.existsSync(referencesDir)) {
    for (const file of fs.readdirSync(referencesDir).sort()) {
      if (file.endsWith(".md")) files.push(path.join(referencesDir, file));
    }
  }
  return files;
}

function headingsOf(skill) {
  const headings = new Set();
  for (const file of skillMarkdownFiles(skill)) {
    let fence = null;
    for (const line of fs.readFileSync(file, "utf8").split("\n")) {
      const marker = line.match(/^\s*(`{3,}|~{3,})/)?.[1];
      if (fence) {
        if (marker && marker[0] === fence[0] && marker.length >= fence.length) fence = null;
      } else if (marker) fence = marker;
      else if (/^#{2,4} /.test(line)) headings.add(line.trimEnd());
    }
  }
  return headings;
}

function skillChecks() {
  const failures = [];
  const report = [];
  const skillHeadings = new Map(skillNames.map((name) => [name, headingsOf(name)]));

  for (const name of skillNames) {
    const skillDir = path.join(skillsRoot, name);
    const skillPath = path.join(skillDir, "SKILL.md");
    const content = fs.readFileSync(skillPath, "utf8");

    for (const file of skillMarkdownFiles(name)) {
      const rel = path.relative(repoRoot, file);
      const text = fs.readFileSync(file, "utf8");

      // (a) Skill names: every hyphenated backticked token is a skill.
      for (const [, token] of text.matchAll(/`([a-z][a-z0-9]*(?:-[a-z0-9]+)+)`/g)) {
        if (!skillSet.has(token) && !NON_SKILL_TOKENS.has(token)) {
          failures.push(`${rel}: \`${token}\` is not a skill name`);
        }
      }

      // (b) Cross-skill headings: `<skill>`'s `## Heading`.
      for (const [full, skill, hashes, heading] of
        text.matchAll(/`([a-z][a-z0-9-]*)`['\u2019]s\s+`(#{2,4}) ([^`]+)`/g)) {
        const target = skillHeadings.get(skill);
        const line = `${hashes} ${heading}`;
        if (!target) failures.push(`${rel}: ${full.replace(/\s+/g, " ")} names an unknown skill`);
        else if (!target.has(line)) failures.push(`${rel}: ${skill} has no heading "${line}"`);
      }

      // (c) references/ links resolve. A `../` link resolves from the file that
      // contains it (a link into another skill's references is allowed); a bare
      // `references/x.md` resolves from the skill directory.
      for (const [, referencePath] of text.matchAll(/(?:`|\()((?:\.\.\/)+[a-z0-9-]+\/references\/[^`)\s#]+\.md|references\/[^`)\s#]+\.md)(?:`|\)|#)/g)) {
        const target = referencePath.startsWith("../")
          ? path.join(path.dirname(file), referencePath)
          : path.join(skillDir, referencePath);
        if (!fs.existsSync(target)) failures.push(`${rel}: references missing file ${referencePath}`);
      }
    }

    // (d) description: starts with "Use when", 100-400 characters.
    const frontmatter = content.match(/^---\n([\s\S]*?)\n---/);
    const description = (frontmatter?.[1].match(/^description:\s*(.+)$/m)?.[1].trim() ?? "")
      .replace(/^(["'])(.*)\1$/, "$2");
    if (!description.startsWith("Use when")) failures.push(`${name}: description must start with "Use when"`);
    if (description.length < 100 || description.length > 400) {
      failures.push(`${name}: description is ${description.length} characters, expected 100-400`);
    }

    // (e) line and character caps.
    // Characters are bytes, as `wc -c` counts them.
    const lines = content.split("\n").length - (content.endsWith("\n") ? 1 : 0);
    const chars = Buffer.byteLength(content);
    const limits = SKILL_CAPS[name];
    if (lines > 500) failures.push(`${name}: ${lines} lines, expected at most 500`);
    if (!limits) failures.push(`${name}: missing from SKILL_CAPS in tests/plugin-smoke.mjs`);
    else if (chars > limits.cap && ENFORCE_CAPS) failures.push(`${name}: ${chars} characters, cap ${limits.cap}`);
    report.push({ name, lines, chars, limits });
  }
  for (const name of Object.keys(SKILL_CAPS)) {
    if (!skillSet.has(name)) failures.push(`SKILL_CAPS lists unknown skill ${name}`);
  }

  // (f) report characters per skill with cap and Target, plus the sums.
  const rows = [["skill", "chars", "cap", "target", "state"]];
  const sum = (names, key) => names.reduce((total, name) => total + (SKILL_CAPS[name]?.[key] ?? 0), 0);
  for (const { name, chars, limits } of report) {
    const state = !limits ? "NO CAP" : chars > limits.cap ? "over cap" : chars > limits.target ? "over target" : "ok";
    rows.push([name, String(chars), String(limits?.cap ?? "-"), String(limits?.target ?? "-"), state]);
  }
  const chainChars = report.filter(({ name }) => ARCHITECTURAL_CHAIN.includes(name)).reduce((t, r) => t + r.chars, 0);
  const totalChars = report.reduce((t, r) => t + r.chars, 0);
  rows.push(["Architectural chain", String(chainChars), String(sum(ARCHITECTURAL_CHAIN, "cap")), String(sum(ARCHITECTURAL_CHAIN, "target")), "sum"]);
  rows.push(["All skills", String(totalChars), String(sum(skillNames, "cap")), String(sum(skillNames, "target")), "sum"]);
  const widths = rows[0].map((_, index) => Math.max(...rows.map((row) => row[index].length)));
  console.log(rows.map((row) => row.map((cell, index) => cell.padEnd(widths[index])).join("  ")).join("\n"));

  assert.deepEqual(failures, [], `skill checks failed:\n${failures.join("\n")}`);
}

skillChecks();

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
