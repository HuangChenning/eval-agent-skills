#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const configPath = process.argv[2];
if (!configPath) {
  console.error("Usage: node run-evals.mjs <config.json>");
  process.exit(2);
}

const absoluteConfigPath = resolve(configPath);
const configDir = dirname(absoluteConfigPath);
const config = JSON.parse(readFileSync(absoluteConfigPath, "utf8"));
const outputDir = resolve(configDir, config.outputDir ?? "artifacts/skill-evals");
const activationPatterns = (config.activationPatterns ?? []).map((pattern) => new RegExp(pattern, "i"));

if (!Array.isArray(config.cases) || config.cases.length === 0) {
  throw new Error("config.cases must contain at least one case");
}

const commandEvents = (events) => events.filter((event) =>
  event.type === "item.completed" && event.item?.type === "command_execution"
);

function checkCase(testCase) {
  const workspace = join(outputDir, "workspaces", testCase.id);
  const tracePath = join(outputDir, "traces", `${testCase.id}.jsonl`);
  rmSync(workspace, { recursive: true, force: true });
  mkdirSync(workspace, { recursive: true });
  mkdirSync(dirname(tracePath), { recursive: true });

  const result = spawnSync("codex", [
    "exec", "--json", "--sandbox", "workspace-write", "--approve-for-me",
    "--skip-git-repo-check", "-C", workspace, testCase.prompt
  ], { encoding: "utf8" });
  writeFileSync(tracePath, result.stdout ?? "", "utf8");
  const events = (result.stdout ?? "").split("\n").filter(Boolean).map((line) => JSON.parse(line));
  const commands = commandEvents(events).map((event) => event.item.command ?? "");
  const checks = [];
  const add = (id, pass, detail) => checks.push({ id, pass, detail });

  add("exit-code", result.status === 0, `exit code: ${result.status ?? "unknown"}`);
  if (typeof testCase.shouldTrigger === "boolean") {
    if (activationPatterns.length === 0) throw new Error("shouldTrigger requires top-level activationPatterns");
    const activated = activationPatterns.some((pattern) => pattern.test(result.stdout ?? ""));
    add("activation", activated === testCase.shouldTrigger, `observed activation: ${activated}`);
  }
  for (const expected of testCase.expectedCommands ?? []) {
    add(`command:${expected}`, commands.some((command) => command.toLowerCase().includes(expected.toLowerCase())), expected);
  }
  for (const file of testCase.expectedFiles ?? []) add(`file:${file}`, existsSync(join(workspace, file)), file);
  for (const file of testCase.prohibitedFiles ?? []) add(`absent:${file}`, !existsSync(join(workspace, file)), file);
  if (Number.isInteger(testCase.maxCommands)) add("command-budget", commands.length <= testCase.maxCommands, `${commands.length}/${testCase.maxCommands}`);
  return { id: testCase.id, pass: checks.every((check) => check.pass), workspace, tracePath, checks, stderr: result.stderr };
}

const report = { config: absoluteConfigPath, results: config.cases.map(checkCase) };
report.pass = report.results.every((result) => result.pass);
mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
for (const result of report.results) console.log(`${result.pass ? "PASS" : "FAIL"} ${result.id} (${result.tracePath})`);
process.exit(report.pass ? 0 : 1);
