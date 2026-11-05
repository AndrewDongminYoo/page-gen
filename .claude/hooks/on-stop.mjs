#!/usr/bin/env node
// Stop: the turn can't end while the project fails typecheck or design-lint.
// stop_hook_active guards against an infinite fix loop: after one forced
// continuation, the model is allowed to stop and report what's still broken.

import { execSync } from "node:child_process"
import { readFileSync } from "node:fs"

const input = JSON.parse(readFileSync(0, "utf8"))
if (input.stop_hook_active) process.exit(0)

const failures = []
for (const cmd of ["pnpm -s typecheck", "node scripts/design-lint.mjs"]) {
  try {
    execSync(cmd, { stdio: "pipe", encoding: "utf8" })
  } catch (e) {
    failures.push(`$ ${cmd}\n${((e.stdout ?? "") + (e.stderr ?? "")).trim()}`)
  }
}

if (failures.length) {
  console.error(
    `Project checks failed. Fix these before finishing:\n\n${failures.join("\n\n")}`
  )
  process.exit(2)
}
process.exit(0)
