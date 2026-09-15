---
name: eval-agent-skills
description: "Build repeatable evals for Codex agent skills using targeted prompts, JSONL traces, deterministic checks, and optional rubric grading."
---

# Evaluate Agent Skills

Use this skill when creating, improving, or guarding against regressions in a Codex skill. Do not use it merely to test ordinary application code.

## Define the contract first

Before changing the target skill, write the smallest checkable definition of success. Separate it into:

- outcome: required files, commands succeeding, build or smoke checks;
- process: skill activation and essential commands or tool use;
- style: conventions that need qualitative judgement; and
- efficiency: command or token budgets only when thrashing is a real risk.

Turn manual failures into new cases. Avoid tests that merely assert headings or wording in a skill file.

## Build a focused prompt set

Create 10–20 cases only when that many are justified; begin smaller when the surface area is small. Include:

- an explicit `$skill-name` request;
- one or more realistic implicit requests that should activate it; and
- an adjacent negative control that must not activate it.

Each case needs an observable assertion. For activation checks, first inspect a real JSONL trace and configure a stable `activationPatterns` match; do not assume a trace field is portable across Codex versions.

## Run deterministic checks

Use `scripts/run-evals.mjs` with a config as documented in [references/eval-config.md](references/eval-config.md). It creates an isolated workspace and JSONL trace for each case, then checks commands, files, activation patterns, and command limits. Keep artifact directories outside the target skill directory or ignore them in version control.

Run the suite from a disposable eval workspace or a clean checkout. Use the least Codex permissions that allow the target task. Review failed traces before changing either the skill or a grader.

## Add qualitative grading only where needed

For requirements deterministic checks cannot express, add a small read-only rubric pass using `codex exec --output-schema`. Define stable check IDs and a compact schema; ask the grader to inspect the generated workspace, not to modify it. Store its structured result alongside the trace.

## Interpret results

Compare runs by case and check, not just one aggregate score. A failure should identify whether activation, process, output, style, or efficiency regressed. Fix the narrow cause, rerun the affected case, then run the whole suite. Do not weaken a check to hide a genuine regression.
