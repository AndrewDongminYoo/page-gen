---
name: build-ui
description: End-to-end workflow for building or redesigning a page, screen, or feature UI in this repo — brief, tokens, implementation, screenshot loop, review. Use for any request to make, mock up, or change user-facing UI.
---

# Build UI

Load the `ui-design` skill first; this skill is the process, that one is the rules.

## 1. Brief (`design/brief.md`)

Write it before any component code. Keep it under a page. If the request is vague, decide and record the decision; ask the user only when a wrong guess would waste the whole build (e.g. which product it is for).

```md
# <Page / feature>

Audience & goal: <who, what they must accomplish here>
Tone: <3 adjectives>; reference feel: <e.g. "Linear-like density" / "editorial, airy">
Brand hue: <name + oklch> — why it fits the domain
Type: <Geist Sans | + display family> ; scale used: <list>
Layout: <container, grid, breakpoints behaviour>
Sections / regions:

1. <name> — purpose — components (`Item`, `Field`, …) — layout shape
2. …
   States: <loading / empty / error / populated per data region>
   Copy language: <ko | en>
   Assets needed: <real images/logos, or placeholders to replace>
```

If the user attached a screenshot or URL, the brief describes what you observed (layout, palette, type, density) and the build matches it closely.

## 2. Tokens

Rewrite `app/tokens.css` (`:root` and `.dark`) from the brief. Keep every variable name; change values only. If adding a display font, load it in `app/layout.tsx` with `next/font` and set `--font-heading-family`.

## 3. Build

- Server components by default; push `"use client"` down to the smallest interactive leaf.
- One file per meaningful section in `components/<feature>/`; the route's `page.tsx` composes them.
- Realistic data lives in `lib/<feature>-data.ts` (typed), not inline in JSX.
- For each data region, implement every state from the brief. Make states viewable, e.g. `?state=empty|loading|error` handled in the page.

## 4. Render loop

```bash
pnpm dev > /tmp/next-dev.log 2>&1 &   # once per session; wait for "Ready"
pnpm shot / /pricing                  # every route you touched
```

If Playwright's Chromium isn't installed, set `CHROME_PATH` to a local Chrome binary.

Read each PNG the script prints (desktop/mobile × light/dark). Compare against the brief and `ui-design/references/checklist.md`. Fix, re-shoot. Stop when the script reports no FAIL and the checklist passes — usually 2–4 iterations. Use the Playwright MCP for interaction checks (open dialogs, tab focus, hover).

## 5. Review

For a full page or multi-component feature, spawn the `design-reviewer` subagent with the routes and the brief path. Apply its fixes, re-shoot, and finish with a short summary: what was built, decisions taken, placeholders left to replace.
