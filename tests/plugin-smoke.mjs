import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { AgentDevkitPlugin } from "../.opencode/plugins/agent-devkit.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
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

console.log("plugin smoke checks passed");
