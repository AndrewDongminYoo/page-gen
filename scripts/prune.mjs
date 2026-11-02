#!/usr/bin/env node
// Delivery step: remove every shadcn component/hook/dependency the app doesn't
// import, then prove the result still type-checks, lints and builds.
//
// Usage:
//   node scripts/prune.mjs              # dry run: show what would be removed
//   node scripts/prune.mjs --apply      # prune in place
//   node scripts/prune.mjs --apply --out ../client-app
//                                       # prune, then export a clean copy
//                                       # without the agent harness
//
// Knip only follows static imports. A component loaded via a computed
// import() path will be removed; import it statically or add it to
// knip.json "entry".

import { execSync } from "node:child_process"
import {
  cpSync,
  existsSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { basename, join, resolve } from "node:path"

const args = process.argv.slice(2)
const apply = args.includes("--apply")
const outIdx = args.indexOf("--out")
const out = outIdx >= 0 ? resolve(args[outIdx + 1] ?? "") : null

const run = (cmd, opts = {}) => {
  console.log(`\n$ ${cmd}`)
  return execSync(cmd, { stdio: "inherit", ...opts })
}

const KNIP = "pnpm exec knip --include files,dependencies --no-config-hints"

if (!apply) {
  try {
    run(KNIP)
    console.log("\nNothing to prune.")
  } catch {
    console.log(
      "\nDry run only. Re-run with --apply to remove the items above."
    )
  }
  process.exit(0)
}

// 1. Prune: unused files (components/ui/*, hooks/*) and unused dependencies.
//    Exports inside kept files are left intact so components stay complete.
try {
  run(`${KNIP} --fix --fix-type files,dependencies --allow-remove-files`)
} catch {
  // knip exits non-zero when it found (and fixed) issues
}
run("pnpm install")

// 2. Verify. Any failure here means the prune broke something: stop.
run(
  "pnpm exec knip --include files,dependencies,unlisted,unresolved --no-config-hints"
)
run("pnpm typecheck")
run("node scripts/design-lint.mjs")
run("pnpm lint")
run("pnpm build")

const kept = execSync("ls components/ui", { encoding: "utf8" })
  .trim()
  .split("\n")
console.log(`\nPruned. Kept ${kept.length} ui components: ${kept.join(", ")}`)

if (!out) process.exit(0)

// 3. Export a client-facing copy without the agent harness.
if (existsSync(out)) {
  console.error(`\n${out} already exists. Choose another --out path.`)
  process.exit(1)
}
// .git goes too: its history still holds every harness file, so a client
// could restore them with one `git checkout .`.
// .github goes too: ci.yml runs `pnpm shot` and shadcn-sync.yml runs a script,
// and both are removed from the export.
const HARNESS = [
  ".claude",
  ".git",
  ".github",
  ".mcp.json",
  "CLAUDE.md",
  "AGENTS.md",
  "design",
  ".screenshots",
  "scripts",
  "knip.json",
  "node_modules",
  ".next",
  "tsconfig.tsbuildinfo",
]
const excluded = HARNESS.map((h) => resolve(h))
cpSync(".", out, {
  recursive: true,
  filter: (src) => {
    const abs = resolve(src)
    // Local secrets (.env, .env.local, …) never leave this machine.
    if (basename(abs).startsWith(".env")) return false
    return !excluded.some((x) => abs === x || abs.startsWith(x + "/"))
  },
})

const pkgPath = join(out, "package.json")
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"))
for (const k of ["lint:design", "shot", "prune", "prune:apply"])
  delete pkg.scripts?.[k]
pkg.scripts.check = "pnpm typecheck && pnpm lint"
for (const dep of ["knip", "@playwright/test"])
  delete pkg.devDependencies?.[dep]

// The placeholder image route is a dev aid; drop it if nothing references it.
let stillUsed = false
try {
  execSync(
    'grep -rqs "/placeholder.svg" app components lib --exclude-dir=placeholder.svg',
    {
      cwd: out,
    }
  )
  stillUsed = true
} catch {}
if (stillUsed)
  console.warn(
    "\nWarning: /placeholder.svg is still referenced. Replace those images."
  )
else
  rmSync(join(out, "app", "placeholder.svg"), { recursive: true, force: true })
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n")

// Keep the verified lockfile: pnpm only drops the removed dev dependencies
// instead of re-resolving every range to whatever is newest today.
run("pnpm install --no-frozen-lockfile", { cwd: out })
run("pnpm build", { cwd: out })
console.log(`\nExported clean project to ${out}`)
