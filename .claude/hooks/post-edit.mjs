#!/usr/bin/env node
// PostToolUse(Edit|Write|MultiEdit): fast, per-file feedback.
// design-lint + eslint on the touched file only; full typecheck runs in the Stop hook.
// Exit 2 sends stderr back to the model so it fixes the issue in the same turn.

import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"

const input = JSON.parse(readFileSync(0, "utf8"))
const file = input.tool_input?.file_path ?? ""
if (
  !/\.(tsx?|jsx?)$/.test(file) ||
  /\/components\/ui\//.test(file) ||
  /node_modules/.test(file)
) {
  process.exit(0)
}

const problems = []
const tryRun = (cmd, args) => {
  try {
    execFileSync(cmd, args, { stdio: "pipe", encoding: "utf8" })
  } catch (e) {
    problems.push(`${(e.stdout ?? "") + (e.stderr ?? "")}`.trim())
  }
}

tryRun("node", ["scripts/design-lint.mjs", file])
tryRun("pnpm", ["exec", "eslint", "--max-warnings=0", file])

// design-lint warnings print to stderr but exit 0; surface only real failures
const real = problems.filter(Boolean)
if (real.length) {
  console.error(`Fix before continuing (${file}):\n\n${real.join("\n\n")}`)
  process.exit(2)
}
process.exit(0)
