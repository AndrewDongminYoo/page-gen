# page-gen

v0-style UI generation with Claude Code, locally. A Next.js App Router + Tailwind v4 + shadcn/ui template that ships **every** shadcn component, plus a Claude harness that forces the three things that make v0's output good: a fixed stack, a design brief before code, and a render-and-fix loop. When the work is done, knip removes every component and dependency the app doesn't use.

## Setup

Create your repository with **Use this template** on GitHub, then clone it.
GitHub copies every file on the default branch, harness included, as a single commit; there is no setting that leaves files out.

```bash
pnpm install
pnpm exec playwright install chromium   # or set CHROME_PATH to a local Chrome
claude                                   # then describe the screen you want
```

Snapshot: shadcn `new-york-v4` registry and `templates/next-app` from `shadcn-ui/ui@c0d63c3` (2026-11-01), Next 16.4.3, React 19.3.1.

## How a request flows

| Step                                                                                | What enforces it                                                               |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Brief in `design/brief.md`, tokens in `app/tokens.css`                              | `CLAUDE.md`, `build-ui` skill                                                  |
| Compose from `components/ui/*`, never rewrite them                                  | `guard-ui` PreToolUse hook blocks Edit/Write on primitives (not shell edits)   |
| Design rules (one brand hue, type scale, no raw palette, no inline svg/emoji/lorem) | `ui-design` skill + `scripts/design-lint.mjs` on every edit (PostToolUse hook) |
| Type-safe, lint-clean before the turn ends                                          | Stop hook runs typecheck + design-lint                                         |
| Visual check at 1440/390px × light/dark, overflow + console errors                  | `pnpm shot` (`scripts/screenshot.mjs`), Playwright MCP                         |
| Independent critique                                                                | `design-reviewer` subagent                                                     |
| Current library docs                                                                | context7 MCP, `node_modules/next/dist/docs`                                    |
| Delivery: prune + verify + clean export                                             | `/ship` skill → `scripts/prune.mjs`                                            |

## Commands

```bash
pnpm dev
pnpm check                     # typecheck + design-lint + eslint
pnpm shot / /pricing           # screenshots + layout checks into .screenshots/
pnpm prune                     # dry run: what knip would remove
pnpm prune:apply               # remove unused components/deps, then typecheck, lint, build
node scripts/prune.mjs --apply --out ../client-app   # + export without the harness, .git or .env*
```

## Updating components

Primitives in `components/ui/` are kept identical to upstream (eslint skips them for that reason). To refresh, re-run `npx shadcn@latest add --all --overwrite` in the template repo, review the diff, and commit. Customize through tokens and `className`, not by editing primitives, so updates stay mechanical.

## Caveats

- knip follows static imports only. Components referenced through computed `import()` paths or CMS/MDX content get removed; add them to `entry` in `knip.json`.
- design-lint is regex-based: fast and dependency-free, not a parser. Suppress a deliberate exception with `// design-lint-ignore <reason>`.
- The Stop hook forces at most one extra fix round per turn (`stop_hook_active` guard) to avoid loops.
