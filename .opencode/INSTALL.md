# Installing agent-devkit for OpenCode

Add the Git-backed plugin to the target project's `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "agent-devkit@git+https://github.com/asta-nguyen/agent-devkit.git"
  ]
}
```

Restart OpenCode. The plugin registers the bundled `skills/` directory and
injects `using-devkit` into the first user message.

Verify the installation by asking OpenCode to list its skills or by running:

```bash
opencode debug skill
```

The plugin uses OpenCode's native `skill` tool for loading individual skills.
This adapter targets OpenCode 1.x. OpenCode V2 uses a separate plugin API and
will need a dedicated adapter when V2 becomes the supported release.
