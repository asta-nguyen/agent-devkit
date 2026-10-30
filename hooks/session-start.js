#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillPath = path.join(__dirname, "..", "skills", "using-devkit", "SKILL.md");

// Only a missing path means "no saved progress"; any other I/O error must reach the caller.
const orMissing = (fn, empty) => {
  try {
    return fn();
  } catch (error) {
    if (error.code === "ENOENT") return empty;
    throw error;
  }
};
const read = (file) => orMissing(() => fs.readFileSync(file, "utf8"), null);
const list = (dir, dirs) => orMissing(() => fs.readdirSync(dir, { withFileTypes: true })
  .filter((entry) => (dirs ? entry.isDirectory() : entry.isFile()))
  .map((entry) => entry.name)
  .sort(), []);
const clip = (text) => (text.length > 100 ? `${text.slice(0, 97)}...` : text);
const section = (text, heading) =>
  text.match(new RegExp(`^## ${heading}\\s*\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, "m"))?.[1];

const changeLine = (dir, name) => {
  const tasks = read(path.join(dir, "tasks.md"));
  const next = section(read(path.join(dir, "handoff.md")) ?? "", "Next action")
    ?.split("\n").find((line) => line.trim());
  let line = `- ${name}:`;
  if (tasks) {
    const gate = section(tasks, "Approval Gate")?.match(/^Status:\s*([\w-]+)/m)?.[1] ?? "unknown";
    const items = tasks.split(/^### Task /m).slice(1)
      .map((task) => ({ title: clip(task.split("\n")[0]), done: /^Progress:\s*done/m.test(task) }));
    const todo = items.filter((item) => !item.done);
    line += ` plan ${gate}; ${items.length - todo.length}/${items.length} tasks done;`;
    line += todo.length
      ? ` current: Task ${todo[0].title}${todo[1] ? `; next: Task ${todo[1].title}` : ""}${todo.length > 2 ? `; +${todo.length - 2} pending` : ""}`
      : " all tasks done, awaiting final review";
  } else {
    line += " open change, no tasks.md (Bounded design)";
  }
  return next ? `${line}\n  handoff Next action: ${clip(next.trim())}` : line;
};

const status = (root) => {
  const base = path.join(root, "docs", "agent-devkit");
  const open = list(path.join(base, "changes"), true)
    .filter((name) => name !== "archive")
    .map((name) => changeLine(path.join(base, "changes", name), name));
  // ponytail: standalone handoffs have no resolve state, so show the newest 3 forever; add a done marker if noisy
  const loose = list(path.join(base, "handoffs"), false)
    .filter((name) => name.endsWith(".md")).slice(-3).reverse()
    .map((name) => `- ${name.slice(0, -3)}: ${clip(read(path.join(base, "handoffs", name))?.match(/^# Handoff:\s*(.+)/m)?.[1] ?? "")}`);
  if (!open.length && !loose.length) return "AGENT-DEVKIT STATUS: no saved progress (chưa có tiến độ được lưu).";
  return [
    "AGENT-DEVKIT STATUS (informational): report this to the user; do not resume, edit code, or call implement-task until they ask.",
    ...open,
    ...(loose.length ? ["Standalone handoffs (no resolve state, newest 3):", ...loose] : []),
  ].join("\n");
};

if (process.argv.includes("--status")) {
  // On demand only: scans the shell's cwd, prints plain text, never reads stdin.
  try {
    process.stdout.write(`${status(process.cwd())}\n`);
  } catch (error) {
    // ponytail: one unreadable file fails the whole scan; report per change if that hides too much
    process.stderr.write(`agent-devkit status failed: ${error.message}\n`);
    process.exitCode = 1;
  }
} else {
  try {
    // SessionStart never scans; it only tells the agent the exact command (this version's path) to run on request.
    const additionalContext = `${fs.readFileSync(skillPath, "utf8")}\nProgress overview is on request only, never at session start: when the user asks for task progress or status, run \`node "${fileURLToPath(import.meta.url)}" --status\` from the project root (read-only) instead of opening every tasks.md; open one only for task-level detail.\n`;
    const output = process.env.CURSOR_PLUGIN_ROOT
      ? { additional_context: additionalContext }
      : {
          systemMessage: "AGENT-DEVKIT:ACTIVE",
          hookSpecificOutput: {
            hookEventName: "SessionStart",
            additionalContext,
          },
        };
    process.stdout.write(JSON.stringify(output));
  } catch (error) {
    process.stderr.write(`agent-devkit bootstrap failed: ${error.message}\n`);
    process.exitCode = 1;
  }
}
