#!/usr/bin/env node
// PreToolUse(Edit|Write|MultiEdit): keep shadcn primitives pristine.
// The template ships every component; the agent composes, it doesn't rewrite.
// To allow a deliberate change to a primitive, run with ALLOW_UI_EDIT=1
// or ask the user, who can edit the file directly.
// Scope: Edit/Write/MultiEdit only. A shell command (sed -i, cat >) is not seen here.

import { readFileSync } from "node:fs"

const input = JSON.parse(readFileSync(0, "utf8"))
const file = input.tool_input?.file_path ?? ""

// hooks/use-mobile.ts ships with the sidebar primitive and is vendored the same way.
const VENDORED = /\/(?:components\/ui\/[^/]+\.tsx|hooks\/use-mobile\.ts)$/

if (VENDORED.test(file) && !process.env.ALLOW_UI_EDIT) {
  console.error(
    [
      `Blocked: ${file} is a shadcn primitive.`,
      "Compose it instead: pass className, use its variants, or wrap it in components/<feature>/.",
      "If the primitive itself truly must change, stop and ask the user to approve it.",
    ].join("\n")
  )
  process.exit(2)
}
process.exit(0)
