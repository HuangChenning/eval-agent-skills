<p align="center">
  <img src="./assets/readme/hero.svg" width="100%" alt="eval-agent-skills: a workflow from prompts through JSONL traces and deterministic checks to an evaluation report">
</p>

<p align="center"><a href="./README.zh-CN.md">简体中文</a></p>

# eval-agent-skills

Build repeatable, explainable evaluation loops for Codex Agent Skills. Use real execution evidence to verify that a skill triggers correctly, follows required steps, and produces the intended results.

## What it is

This installable Codex skill provides an evaluation method, a configurable Node.js runner, and JSONL trace checks. It evaluates agent-skill behavior; it is not a replacement for an application's unit or end-to-end test framework.

## The problem it solves

One successful trial does not prove that a prompt change avoided regressions. `eval-agent-skills` turns an evaluation into an observable loop: a prompt runs Codex, the run's JSONL trace and artifacts are saved, then deterministic checks and optional structured rubric grading assess the result.

Use it to verify:

- correct activation for explicit and implicit requests, without false positives on adjacent requests;
- required commands and files, plus unnecessary repeated work; and
- conventions such as structure or style that basic file checks cannot capture.

## How it works

```text
Target skill + prompt set → codex exec --json → JSONL trace + artifacts
                                 ↓
                  command / file / activation / budget checks → report.json
```

## Quick start

Place the skill where Codex can discover it, for example in a repository's `.codex/skills/` directory:

```sh
mkdir -p .codex/skills
cp -R skills/eval-agent-skills .codex/skills/
```

Create a focused case set: at least one explicit invocation, one realistic implicit trigger, and one nearby request that should not trigger. See [eval-config.md](./skills/eval-agent-skills/references/eval-config.md) for fields and examples.

```sh
node skills/eval-agent-skills/scripts/run-evals.mjs ./evals/skill-evals.json
```

The runner creates an isolated workspace per case, stores JSONL traces in `outputDir/traces/`, and writes a summary to `outputDir/report.json`. Run it in a disposable directory or clean checkout: Codex can write files in each case workspace.

## Evaluation principles

1. **Outcome** — required files exist; builds or smoke checks succeed.
2. **Process** — the right skill activates and critical commands run.
3. **Style** — add a read-only rubric only when deterministic rules are insufficient; stabilize its output with JSON Schema.
4. **Efficiency** — limit commands or token use only when looping or waste is a genuine risk.

Every real failure should become a new case. Inspect the trace first, then tighten the skill or grader at the actual regression point—do not weaken a check to hide it.

## Scope and limitations

The runner requires a locally installed, authenticated `codex` CLI; it does not provide model access itself. Activation assertions rely on `activationPatterns` verified against a real trace because event fields may vary across Codex versions. Always run file-writing cases in isolated workspaces.

## Repository layout

```text
skills/eval-agent-skills/
├── SKILL.md                  # Evaluation method and boundaries
├── agents/openai.yaml        # Codex UI metadata
├── scripts/run-evals.mjs     # JSONL-trace and deterministic-check runner
└── references/eval-config.md # Configuration fields and examples
```

## Validate this repository

```sh
python3 /Users/huangcn/.axon/repo/skills/.system/skill-creator/scripts/quick_validate.py skills/eval-agent-skills
node --check skills/eval-agent-skills/scripts/run-evals.mjs
```

## Reference

The approach is based on OpenAI's article, [Testing Agent Skills Systematically with Evals](https://developers.openai.com/blog/eval-skills). A [local copy](./docs/Testing%20Agent%20Skills%20Systematically%20with%20Evals.md) is retained for offline reference.
