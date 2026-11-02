@AGENTS.md

# UI agent workspace

This repo is a pre-built Next.js App Router + Tailwind v4 + shadcn/ui (new-york, every component) template. Your job is to compose screens from what's here, not to rebuild foundations. Quality comes from three things: a fixed stack, a brief written before code, and a render-and-fix loop. Skip none of them.

## Fixed stack (do not change without asking)

- Next.js App Router, React Server Components by default; add `"use client"` only to the leaf that needs state or effects.
- Tailwind v4 utilities only. No CSS modules, no styled-components, no inline `style` for colors or spacing.
- UI primitives: `@/components/ui/*` — all shadcn components are already installed. Import them; never re-create or copy them. `components/ui/` is write-protected by a hook.
- Icons: `lucide-react` only. Charts: `@/components/ui/chart` (Recharts). Toasts: `sonner`. Forms: `react-hook-form` + `zod` + `@/components/ui/field`.
- Colors, radius and fonts are tokens in `app/tokens.css` / `app/globals.css`. Components use semantic classes only (`bg-primary`, `text-muted-foreground`, `border-border`, `bg-chart-2`).
- Feature components go in `components/<feature>/`, kebab-case filenames. Logos and custom illustrations go in `components/brand/`.
- Library APIs drift: when unsure about a Next.js, Tailwind v4 or shadcn API, check `node_modules/next/dist/docs/` or the context7 MCP before writing code.

## Workflow for any UI request

Use the `build-ui` skill. In short:

1. **Brief** — write `design/brief.md` first (audience, tone, one brand hue, type pairing, page sections, which ui components each section uses, states). For a vague request, make the decisions yourself and state them in the brief; don't stall.
2. **Tokens** — update `app/tokens.css` from the brief (light and dark). This is the only file where color values appear.
3. **Build** — compose pages from `components/ui/*`. Follow the `ui-design` skill.
4. **Render** — `pnpm dev` in the background, then `pnpm shot /route ...`. Read every PNG in `.screenshots/`, fix what you see, repeat until it holds up at 1440px and 390px in both themes and the script reports no FAIL.
5. **Review** — for anything beyond a single small component, delegate to the `design-reviewer` subagent and apply its fixes.

Automatic checks you don't need to run by hand: each edit runs design-lint + eslint on the file; the turn can't end while typecheck or design-lint fails.

## Delivery

Never prune during development. When the user says the work is ready to hand off, use the `ship` skill: it removes unused components and dependencies with knip, then re-verifies and builds. Ask before running it.

## Hard no's

Raw Tailwind palette colors (`bg-blue-500`), hex/rgb/oklch in components, inline `<svg>` icons, emoji as icons, lorem ipsum, purple-to-blue gradients, editing `components/ui/*`, adding a second UI library.
