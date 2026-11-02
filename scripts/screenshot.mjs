#!/usr/bin/env node
// Renders routes at desktop + mobile, light + dark, and runs cheap layout checks.
// Requires a running server (pnpm dev) and `pnpm exec playwright install chromium` once.
//
// Usage: node scripts/screenshot.mjs [/route ...]
// Env:   BASE_URL (default http://localhost:3000), CHROME_PATH (optional)
// Out:   .screenshots/<route>__<viewport>__<scheme>.png  + report on stdout
// Exit:  1 if any console error, page error, failed request, or horizontal overflow.

import { mkdirSync } from "node:fs"
import { chromium } from "@playwright/test"

const BASE = process.env.BASE_URL ?? "http://localhost:3000"
const routes = process.argv.slice(2).length ? process.argv.slice(2) : ["/"]
const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
]
const SCHEMES = ["light", "dark"]
const OUT = ".screenshots"
mkdirSync(OUT, { recursive: true })

// Uses Playwright's Chromium; set CHROME_PATH to use an installed Chrome instead.
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || undefined,
})
let failed = false

for (const route of routes) {
  for (const vp of VIEWPORTS) {
    for (const scheme of SCHEMES) {
      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        colorScheme: scheme,
        deviceScaleFactor: vp.name === "mobile" ? 2 : 1,
      })
      const page = await ctx.newPage()
      const problems = []
      page.on(
        "console",
        (m) => m.type() === "error" && problems.push(`console: ${m.text()}`)
      )
      page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`))
      page.on("requestfailed", (r) =>
        problems.push(`requestfailed: ${r.url()}`)
      )

      await page.goto(BASE + route, { waitUntil: "networkidle" })
      await page.waitForTimeout(300)

      const layout = await page.evaluate(() => {
        const doc = document.documentElement
        const overflowX = doc.scrollWidth - window.innerWidth
        const offenders = []
        if (overflowX > 1) {
          for (const el of document.querySelectorAll("body *")) {
            const r = el.getBoundingClientRect()
            if (r.right > window.innerWidth + 1 && r.width > 0) {
              offenders.push(
                `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)}`
              )
              if (offenders.length >= 5) break
            }
          }
        }
        const imgsNoAlt = [...document.images].filter(
          (i) => !i.hasAttribute("alt")
        ).length
        const smallTargets = [
          ...document.querySelectorAll("button, a, [role=button]"),
        ].filter((el) => {
          const r = el.getBoundingClientRect()
          return r.width > 0 && (r.width < 24 || r.height < 24)
        }).length
        return { overflowX, offenders, imgsNoAlt, smallTargets }
      })

      if (layout.overflowX > 1)
        problems.push(
          `horizontal overflow ${layout.overflowX}px: ${layout.offenders.join(", ")}`
        )
      if (layout.imgsNoAlt)
        problems.push(`${layout.imgsNoAlt} <img> without alt`)
      const notes = layout.smallTargets
        ? ` (note: ${layout.smallTargets} tap targets < 24px)`
        : ""

      const slug =
        route === "/" ? "home" : route.replace(/^\//, "").replace(/\//g, "_")
      const file = `${OUT}/${slug}__${vp.name}__${scheme}.png`
      await page.screenshot({ path: file, fullPage: true })

      const status = problems.length ? "FAIL" : "ok  "
      console.log(`${status} ${file}${notes}`)
      for (const p of problems) console.log(`     - ${p}`)
      if (problems.length) failed = true
      await ctx.close()
    }
  }
}

await browser.close()
process.exit(failed ? 1 : 0)
