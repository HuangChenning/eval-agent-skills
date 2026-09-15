# Eval runner configuration

Run the runner with Node 18 or later:

```sh
node /path/to/eval-agent-skills/scripts/run-evals.mjs ./evals/skill-evals.json
```

The config is JSON. Paths are resolved relative to the config file. Each case gets a fresh directory under `outputDir/workspaces`, and its JSONL trace is stored in `outputDir/traces`.

```json
{
  "outputDir": "./artifacts/skill-evals",
  "activationPatterns": ["setup-demo-app", "SKILL.md"],
  "cases": [
    {
      "id": "explicit",
      "prompt": "Use the $setup-demo-app skill to create a demo app.",
      "shouldTrigger": true,
      "expectedCommands": ["npm install"],
      "expectedFiles": ["demo-app/package.json"],
      "maxCommands": 12
    },
    {
      "id": "negative-existing-app",
      "prompt": "Add Tailwind styling to my existing React app.",
      "shouldTrigger": false,
      "prohibitedFiles": ["package.json"]
    }
  ]
}
```

`activationPatterns` are case-insensitive regular expressions matched against the raw trace. They are deliberately explicit because the JSONL event shape may change between Codex versions. `expectedCommands` are case-insensitive substrings matched against `command_execution` events. A case passes only when every enabled check passes and Codex exits successfully.

The runner invokes Codex with `--sandbox workspace-write --approve-for-me` in the case workspace. Change the runner only if your local CLI requires different least-privilege flags.
