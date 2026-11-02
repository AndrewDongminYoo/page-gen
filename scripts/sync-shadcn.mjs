#!/usr/bin/env node
// Sync components/ui/* and hooks/* from the shadcn/ui registry source.
//
// Usage: node scripts/sync-shadcn.mjs <registry-dir>
//   <registry-dir> is apps/v4/registry/new-york-v4 inside a checkout of
//   https://github.com/shadcn-ui/ui (a sparse, shallow clone is enough).
//
// Why not `shadcn add --all --overwrite`: the CLI keeps the registry's
// `import { cn } from "cn"` and adds the `cn` package, pins dependency versions
// that Dependabot already moved (recharts), and writes color values into
// app/globals.css. This template keeps `cn` in lib/utils.ts and colors in
// app/tokens.css, so the sync copies the sources and rewrites import paths only.
//
// Files are written in place; a Markdown report goes to stdout. Missing npm
// dependencies are reported, never installed: choosing a version is a review step.

import { execFileSync } from "node:child_process"
import {
  existsSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { join, resolve } from "node:path"

const registry = resolve(process.argv[2] ?? "")
if (!process.argv[2] || !existsSync(join(registry, "ui"))) {
  console.error(
    "Usage: node scripts/sync-shadcn.mjs <shadcn-ui/ui>/apps/v4/registry/new-york-v4"
  )
  process.exit(1)
}

const IMPORT_MAP = [
  [/from "cn"/g, 'from "@/lib/utils"'],
  [/@\/registry\/new-york-v4\/ui\//g, "@/components/ui/"],
  [/@\/registry\/new-york-v4\/hooks\//g, "@/hooks/"],
  [/@\/registry\/new-york-v4\/lib\//g, "@/lib/"],
]
const transform = (src) =>
  IMPORT_MAP.reduce((s, [re, to]) => s.replace(re, to), src)

// [upstream dir, local dir, file filter]. lib/ is not synced: upstream's
// lib/utils.ts re-exports the `cn` package, the template's defines cn itself.
const TARGETS = [
  ["ui", "components/ui", (f) => f.endsWith(".tsx")],
  ["hooks", "hooks", (f) => f.endsWith(".ts") && !f.startsWith("_")],
]

const added = []
const changed = []
const removed = []
const unmapped = []
const imports = new Set()
const previous = new Map()

for (const [from, to, keep] of TARGETS) {
  const upstream = readdirSync(join(registry, from)).filter(keep)
  for (const name of upstream) {
    const local = join(to, name)
    const next = transform(readFileSync(join(registry, from, name), "utf8"))
    previous.set(local, existsSync(local) ? readFileSync(local, "utf8") : null)
    if (next.includes("@/registry/")) unmapped.push(local)
    for (const m of next.matchAll(/(?:from|import)\s+"([^".][^"]*)"/g))
      imports.add(m[1])
    writeFileSync(local, next)
  }
  // Only components/ui mirrors upstream exactly; hooks/ may hold project hooks.
  if (to === "components/ui") {
    for (const name of readdirSync(to).filter(keep)) {
      if (upstream.includes(name)) continue
      rmSync(join(to, name))
      removed.push(join(to, name))
    }
  }
}

// Format with the prettier CLI and the repo config, as the commit hook does
// (it sorts Tailwind classes against app/globals.css), so a file counts as
// changed only when upstream changed it, not when only the class order differs.
execFileSync("pnpm", ["exec", "prettier", "--write", ...previous.keys()], {
  stdio: "ignore",
})
for (const [local, prev] of previous) {
  if (prev === readFileSync(local, "utf8")) continue
  ;(prev === null ? added : changed).push(local)
}

const pkg = JSON.parse(readFileSync("package.json", "utf8"))
const declared = new Set([
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.devDependencies ?? {}),
])
const packageOf = (spec) =>
  spec
    .split("/")
    .slice(0, spec.startsWith("@") ? 2 : 1)
    .join("/")
const missing = [
  ...new Set([...imports].filter((s) => !s.startsWith("@/")).map(packageOf)),
]
  .filter((p) => !declared.has(p))
  .sort()

const commit = execFileSync(
  "git",
  ["-C", registry, "log", "-1", "--format=%H %cs"],
  { encoding: "utf8" }
).trim()

// Record the upstream commit only when a file changed, so an upstream commit
// that touches nothing here does not open a pull request on its own.
const touched = added.length + changed.length + removed.length
if (touched) {
  writeFileSync(
    "components/ui/.upstream",
    `shadcn-ui/ui@${commit} apps/v4/registry/new-york-v4\n`
  )
}

const list = (title, items) =>
  items.length
    ? `\n### ${title}\n\n${items.map((i) => `- \`${i}\``).join("\n")}\n`
    : ""

console.log(`## shadcn/ui sync

Upstream: \`shadcn-ui/ui@${commit}\`, ${touched} file(s) changed.
${list("Added", added)}${list("Changed", changed)}${list("Removed (no longer in the registry)", removed)}${list("Missing npm dependencies (add them with `pnpm add`)", missing)}${list("Unmapped registry imports (extend IMPORT_MAP)", unmapped)}`)
