import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { AgentDevkitPlugin } from "../.opencode/plugins/agent-devkit.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
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

const versionFiles = [
  "package.json",
  ".codex-plugin/plugin.json",
  ".claude-plugin/plugin.json",
  ".cursor-plugin/plugin.json",
  ".devin-plugin/plugin.json",
];
for (const file of versionFiles) {
  assert.equal(JSON.parse(fs.readFileSync(path.join(repoRoot, file), "utf8")).version, "0.4.0", file);
}
for (const file of [
  ".claude-plugin/marketplace.json",
  ".cursor-plugin/marketplace.json",
]) {
  assert.equal(JSON.parse(fs.readFileSync(path.join(repoRoot, file), "utf8")).plugins[0].version, "0.4.0", file);
}
assert.match(fs.readFileSync(path.join(repoRoot, "CHANGELOG.md"), "utf8"), /^## \[0\.4\.0\] - 2026-09-01/m);

console.log("plugin smoke checks passed");
