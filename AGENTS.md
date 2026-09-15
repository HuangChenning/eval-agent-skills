# Repository Guidelines

## Project Structure & Module Organization

This repository packages a reusable Codex skill for evaluating other agent skills. The distributable skill lives in `skills/eval-agent-skills/`:

- `SKILL.md` is the primary instruction entry point.
- `agents/openai.yaml` contains UI-facing metadata.
- `scripts/run-evals.mjs` runs configured Codex evaluation cases.
- `references/eval-config.md` documents the runner configuration.

`Testing Agent Skills Systematically with Evals.md` is source background material, not executable documentation. Place future skill-specific resources beside the skill under `references/`, `scripts/`, or `assets/`; do not add generated evaluation artifacts to the skill directory.

## Build, Test, and Development Commands

There is no package manifest or build step. Validate the skill and its runner directly:

```sh
python3 /Users/huangcn/.axon/repo/skills/.system/skill-creator/scripts/quick_validate.py skills/eval-agent-skills
node --check skills/eval-agent-skills/scripts/run-evals.mjs
node skills/eval-agent-skills/scripts/run-evals.mjs path/to/evals.json
```

The last command executes Codex cases in isolated workspaces and writes traces and a `report.json` beneath the config's `outputDir`. Use a disposable directory or a clean checkout before running it.

## Coding Style & Naming Conventions

Use concise Markdown with sentence-case headings and concrete, testable instructions. Skill folders and script names use lowercase kebab-case, for example `eval-agent-skills` and `run-evals.mjs`. Keep configuration JSON valid and use two-space indentation. Write Node scripts as ESM, use double quotes, and prefer small deterministic helpers over abstractions.

## Testing Guidelines

For every behavior change, run the validator and Node syntax check. Add or update a focused eval case when fixing an observed failure. Cases should include an explicit invocation, realistic implicit invocation, and an adjacent negative control where applicable. Assert observable outcomes—commands, files, trace patterns, or command budgets—not prose in `SKILL.md`.

## Commit & Pull Request Guidelines

The available history contains only `first commit`, so no established convention exists. Use short imperative commits scoped to the change, such as `Add eval configuration example`. Pull requests should describe the user-visible behavior, list validation commands and results, link relevant issues, and include a sample trace or `report.json` excerpt when modifying the runner. Do not commit generated traces, isolated workspaces, or credentials.
