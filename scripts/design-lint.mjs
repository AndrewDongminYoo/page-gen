#!/usr/bin/env node
// Deterministic design-rule linter. Catches what the model tends to slip on,
// so the rules don't depend on the prompt being followed.
//
// Usage: node scripts/design-lint.mjs [files...]   (no args = scan the project)
// Suppress one line with a trailing comment: // design-lint-ignore <reason>
// or put // design-lint-ignore-next-line on the line above.

import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative, sep } from "node:path"

const ROOT = process.cwd()
const SCAN_DIRS = ["app", "components", "lib", "hooks"]
const SKIP = [`components${sep}ui${sep}`, `node_modules`, `.next`]
const EXT = /\.(tsx|ts|jsx|js|mdx)$/

const PALETTE =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose"
const UTIL =
  "bg|text|border|from|via|to|ring|fill|stroke|outline|shadow|decoration|divide|accent|caret|placeholder"

const RULES = [
  {
    id: "raw-palette",
    level: "error",
    re: new RegExp(
      `\\b(?:[a-z-]+:)*(?:${UTIL})-(?:${PALETTE})-\\d{2,3}(?:\\/\\d+)?\\b`,
      "g"
    ),
    msg: "Raw Tailwind palette color. Use semantic tokens (bg-primary, text-muted-foreground, chart-1…) and define colors in app/tokens.css.",
  },
  {
    id: "arbitrary-color",
    level: "error",
    re: /-\[(?:#|rgb|hsl|oklch|color:)[^\]]*\]/g,
    msg: "Arbitrary color value. Add a token to app/tokens.css instead.",
  },
  {
    id: "color-literal",
    level: "error",
    // The lookbehind skips in-page anchors such as href="#add" or href: "#faded".
    re: /(?<!\b(?:href|to)\s*[=:]\s*\{?)(?:["'`\s(:])(#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|oklch\()/g,
    msg: "Color literal in component code. Colors live in app/tokens.css only (charts: var(--chart-N)).",
  },
  {
    id: "inline-svg-icon",
    level: "error",
    re: /<svg[\s>]/g,
    msg: "Inline <svg>. Use lucide-react icons. Logos/illustrations go in components/brand/ (exempt).",
    skipPath: `components${sep}brand${sep}`,
  },
  {
    id: "emoji",
    level: "error",
    re: /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F2FF}]/gu,
    msg: "Emoji in UI. Use a lucide icon or plain text.",
  },
  {
    id: "lorem",
    level: "error",
    re: /lorem ipsum/gi,
    msg: "Lorem ipsum. Write realistic copy for the product's domain.",
  },
  {
    id: "arbitrary-font-size",
    level: "warn",
    re: /\btext-\[\d+(?:px|rem)\]/g,
    msg: "Arbitrary font size. Stick to the type scale in the ui-design skill.",
  },
  {
    id: "arbitrary-spacing",
    level: "warn",
    re: /\b(?:p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|gap|space-[xy])-\[\d+px\]/g,
    msg: "Arbitrary spacing. Use the 4px scale (p-4, gap-6…).",
  },
  {
    id: "placeholder-image",
    level: "warn",
    re: /\/placeholder\.svg/g,
    msg: "Placeholder image still referenced. Replace with a real asset before delivery.",
  },
]

function walk(dir, out = []) {
  let entries
  try {
    entries = readdirSync(dir)
  } catch {
    return out
  }
  for (const name of entries) {
    const p = join(dir, name)
    const rel = relative(ROOT, p)
    if (SKIP.some((s) => rel.includes(s))) continue
    const st = statSync(p)
    if (st.isDirectory()) walk(p, out)
    else if (EXT.test(name)) out.push(p)
  }
  return out
}

function lintFile(file) {
  const rel = relative(ROOT, file)
  if (SKIP.some((s) => rel.includes(s)) || !EXT.test(rel)) return []
  const issues = []
  const lines = readFileSync(file, "utf8").split("\n")
  lines.forEach((line, i) => {
    if (line.includes("design-lint-ignore")) return
    if (i > 0 && lines[i - 1].includes("design-lint-ignore-next-line")) return
    const trimmed = line.trim()
    if (
      trimmed.startsWith("//") ||
      trimmed.startsWith("*") ||
      trimmed.startsWith("/*")
    )
      return
    for (const rule of RULES) {
      if (rule.skipPath && rel.includes(rule.skipPath)) continue
      rule.re.lastIndex = 0
      const m = rule.re.exec(line)
      if (m) issues.push({ rel, line: i + 1, rule, match: m[0].trim() })
    }
  })
  return issues
}

const args = process.argv.slice(2)
const files = args.length
  ? args.map((f) => (f.startsWith("/") ? f : join(ROOT, f)))
  : SCAN_DIRS.flatMap((d) => walk(join(ROOT, d)))

const issues = files.flatMap(lintFile)
const errors = issues.filter((x) => x.rule.level === "error")

for (const x of issues) {
  const tag = x.rule.level === "error" ? "error" : "warn "
  console.error(
    `${tag} ${x.rel}:${x.line}  [${x.rule.id}] ${x.match}\n      ${x.rule.msg}`
  )
}
if (issues.length === 0 && !args.length) console.log("design-lint: clean")
process.exit(errors.length ? 1 : 0)
