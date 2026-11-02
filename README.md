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

The app scaffold comes from shadcn's `templates/next-app`; the components track the `new-york-v4` registry, and `components/ui/.upstream` records the synced upstream commit.

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
pnpm prune:dry-run             # what knip would remove (plain `pnpm prune` is pnpm's own command)
pnpm prune:apply               # remove unused components/deps, then typecheck, lint, build
node scripts/prune.mjs --apply --out ../client-app   # + export without the harness, .git or .env*
```

## Updating components

Primitives in `components/ui/` are the upstream registry source with two mechanical changes (eslint skips them for that reason): the `cn` import points at `@/lib/utils` instead of the `cn` package, and the files are formatted with the repo's prettier config, which sorts Tailwind classes. Customize through tokens and `className`, not by editing primitives, so updates stay mechanical.

The `shadcn sync` workflow refreshes them every Monday and opens one pull request; run it by hand from the Actions tab.
It needs one of two repository settings to open that pull request: **Settings → Actions → General → Allow GitHub Actions to create and approve pull requests**, or a fine-grained token with Contents and Pull requests write access saved as the `SHADCN_SYNC_TOKEN` secret.
With the token, the pull request also runs CI; without it, GitHub records an empty, failed CI run, so close and reopen the pull request to start CI.
Locally, against a checkout of `shadcn-ui/ui`:

```bash
node scripts/sync-shadcn.mjs ../ui/apps/v4/registry/new-york-v4
```

Do not use `npx shadcn@latest add --all --overwrite` for this: it adds the `cn` package, pins dependency versions Dependabot already moved, and writes color values into `app/globals.css`.

## CI and dependency updates

- `ci.yml` runs on every pull request, Dependabot's included: `pnpm check`, `pnpm build`, and `pnpm shot /` against the production build. Screenshots are uploaded as an artifact.
- Dependabot opens weekly grouped pull requests for npm and GitHub Actions; `.github/dependabot.yml` explains the groups.
- In a repository created from this template, CI and Dependabot run as they are, and the sync workflow skips itself. `--out` exports leave `.github/` out.

## Caveats

- knip follows static imports only. Components referenced through computed `import()` paths or CMS/MDX content get removed; add them to `entry` in `knip.json`.
- design-lint is regex-based: fast and dependency-free, not a parser. Suppress a deliberate exception with `// design-lint-ignore <reason>`.
- The Stop hook forces at most one extra fix round per turn (`stop_hook_active` guard) to avoid loops.
