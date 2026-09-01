import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const agentDevkitSkillsDir = path.resolve(__dirname, "../../skills");

let bootstrapCache;

export const AgentDevkitPlugin = async () => {
  const getBootstrapContent = () => {
    if (bootstrapCache !== undefined) return bootstrapCache;

    const skillPath = path.join(agentDevkitSkillsDir, "using-devkit", "SKILL.md");
    if (!fs.existsSync(skillPath)) {
      bootstrapCache = null;
      return null;
    }

    const fullContent = fs.readFileSync(skillPath, "utf8");
    const content = fullContent.replace(/^---\n[\s\S]*?\n---\n/, "");
    const toolMapping = `**Tool Mapping for OpenCode:**
When skills request actions, use these OpenCode equivalents:
- Create or update todos → \`todowrite\`
- Dispatch a subagent → \`task\` with \`subagent_type: "general"\`
- Invoke a skill → OpenCode's native \`skill\` tool
- Read files → \`read\`
- Create, edit, or delete files → \`apply_patch\`
- Run shell commands → \`bash\`
- Search files → \`grep\`, \`glob\`
- Fetch a URL → \`webfetch\`

Use OpenCode's native \`skill\` tool to list and load skills.`;

    bootstrapCache = `<EXTREMELY_IMPORTANT>
AGENT-DEVKIT:ACTIVE
The agent-devkit bootstrap is already loaded. Do not load "using-devkit" again.

${content}

${toolMapping}
</EXTREMELY_IMPORTANT>`;
    return bootstrapCache;
  };

  return {
    config: async (config) => {
      config.skills = config.skills || {};
      config.skills.paths = config.skills.paths || [];
      if (!config.skills.paths.includes(agentDevkitSkillsDir)) {
        config.skills.paths.push(agentDevkitSkillsDir);
      }
    },

    "experimental.chat.messages.transform": async (_input, output) => {
      const bootstrap = getBootstrapContent();
      if (!bootstrap || !output.messages.length) return;

      const firstUser = output.messages.find((message) => message.info.role === "user");
      if (!firstUser || !firstUser.parts.length) return;
      if (firstUser.parts.some((part) => (
        part.type === "text" && part.text.includes("AGENT-DEVKIT:ACTIVE")
      ))) return;

      const firstPart = firstUser.parts[0];
      firstUser.parts.unshift({
        ...firstPart,
        type: "text",
        text: bootstrap,
      });
    },
  };
};
