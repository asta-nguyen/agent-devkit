#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillPath = path.join(__dirname, "..", "skills", "using-devkit", "SKILL.md");

try {
  const additionalContext = fs.readFileSync(skillPath, "utf8");
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
