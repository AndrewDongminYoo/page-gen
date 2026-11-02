# page-gen

A Next.js App Router + Tailwind v4 + shadcn/ui template that ships **every** shadcn component, plus a Claude Code harness (skills, hooks, a review subagent, MCP servers) that makes the agent write a design brief before code and fix what it sees in screenshots.
When the work is done, knip removes every component and dependency the app does not use.

This README is for developers who work in a repository made from this template.
Maintaining the template itself (component sync, CI, harness changes) is in [CONTRIBUTING.md](CONTRIBUTING.md).
The agent reads `CLAUDE.md` and `.claude/skills/*`; those files own the design rules and the workflow, and this README links to them instead of repeating them.

## Setup

Create your repository with **Use this template** on GitHub, then clone it.
GitHub copies every file on the default branch, harness included, as a single commit; there is no setting that leaves files out.

Prerequisites: Node 24 (`.node-version`), pnpm 12 (the exact version is in `packageManager` in `package.json`), and Claude Code.
Trunk is optional; see [Trunk](#trunk).

```bash
pnpm install
pnpm exec playwright install chromium   # or set CHROME_PATH to a local Chrome
claude                                   # then describe the screen you want
```

On the first start, Claude Code asks you to approve the two project MCP servers in `.mcp.json`: context7 (current library docs) and Playwright (browser control). Approve both; the workflow uses them.

## Prompting the agent

You do not need to name a skill.
Any request to make, mock up, or change UI triggers the `build-ui` skill, which writes `design/brief.md`, sets tokens in `app/tokens.css`, builds from `components/ui/*`, and screenshots the result at 1440px and 390px in light and dark until the checks pass.
For a vague request the agent makes the decisions itself and records them in the brief, so the more of the brief's inputs you give, the less it guesses:

| Input                 | Example                                                                     |
| --------------------- | --------------------------------------------------------------------------- |
| Product and audience  | "an invoicing tool for finance leads at 20–200 person companies"            |
| What the page must do | "convince them to start a trial; the plan comparison matters most"          |
| Sections              | "hero, three plans with a monthly/yearly toggle, comparison table, FAQ"     |
| Tone and reference    | "calm and precise, Linear-like density"                                     |
| Brand color           | "deep green" (the agent avoids blue and indigo unless you ask for them)     |
| Real content          | paste the copy, prices or a JSON sample; otherwise it writes realistic copy |
| States                | "show the empty state of the invoice list and a failed payment"             |

A first prompt that covers most of these:

```plaintext
Build a pricing page at /pricing for an invoicing tool aimed at finance leads at 20–200 person companies.
Calm, precise tone, Linear-like density, deep green brand.
Sections: hero, three plans (Starter $0, Team $29, Business $79 per seat) with a monthly/yearly toggle, a feature comparison table, FAQ.
```

Follow-up prompts work best when they name a route, a viewport and a theme, because that is how the screenshots are named:

```plaintext
On /pricing at 390px in dark mode the comparison table overflows. Fix it and re-shoot.
Run the design-reviewer on / and /pricing against design/brief.md and apply its fixes.
Change the brand hue to terracotta and update both themes.
```

Things to know while prompting:

- The agent cannot edit `components/ui/*` or `hooks/use-mobile.ts`; a hook blocks it and it composes or wraps the primitive instead. If a primitive really must change, start the session with `ALLOW_UI_EDIT=1 claude` or edit the file yourself.
- Asking for another UI library, raw palette colors, gradients from purple to blue, inline SVG icons or lorem ipsum works against `CLAUDE.md` §Hard no's. design-lint fails raw palette colors, color literals, inline SVG icons, emoji and lorem ipsum, so the agent spends the turn undoing them. Ask for the effect you want instead.
- After a full page or a multi-component feature, the agent delegates to the `design-reviewer` subagent. You can also ask for it by name, as above.
- `/ship` only runs when you type it (`disable-model-invocation: true`). Use it when the work is ready to hand off, not during development.

## What the harness contains

| Piece                          | Where                                                    | What it does                                                                        |
| ------------------------------ | -------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Project instructions           | `CLAUDE.md` (imports `AGENTS.md`)                        | Fixed stack, workflow, hard no's. `next dev` rewrites the `AGENTS.md` block         |
| `build-ui` skill               | `.claude/skills/build-ui/`                               | The process: brief → tokens → build → screenshots → review                          |
| `art-direction` skill          | `.claude/skills/art-direction/` (+ `references/`)        | The direction: hard gates, visual axes, style presets, dated AI-tell registry       |
| `ui-design` skill              | `.claude/skills/ui-design/` (+ `references/`)            | The rules: color, type, spacing, states, accessibility, copy; review checklist      |
| `ship` skill                   | `.claude/skills/ship/`                                   | Prune with knip, re-verify, build, optional clean export                            |
| `design-reviewer` subagent     | `.claude/agents/design-reviewer.md`                      | Renders routes and returns a prioritized fix list, judged against the brief         |
| `guard-ui` hook (PreToolUse)   | `.claude/hooks/guard-ui.mjs`                             | Blocks Edit/Write on shadcn primitives (shell edits are not seen)                   |
| `post-edit` hook (PostToolUse) | `.claude/hooks/post-edit.mjs`                            | design-lint + eslint on the edited file                                             |
| `on-stop` hook (Stop)          | `.claude/hooks/on-stop.mjs`                              | Typecheck + design-lint before the turn ends; forces at most one extra fix round    |
| Permissions                    | `.claude/settings.json`                                  | Allows dev, check and screenshot commands; asks before `prune:apply` and `pnpm add` |
| MCP servers                    | `.mcp.json`                                              | context7 for library docs, Playwright for browser control                           |
| Scripts                        | `scripts/design-lint.mjs`, `screenshot.mjs`, `prune.mjs` | Regex design linter, render-and-check, knip prune and export                        |

## Commands

```bash
pnpm dev
pnpm check                     # typecheck + design-lint + eslint
pnpm shot / /pricing           # screenshots + layout checks into .screenshots/
pnpm prune:dry-run             # what knip would remove (plain `pnpm prune` is pnpm's own command)
pnpm prune:apply               # remove unused components/deps, then typecheck, lint, build
node scripts/prune.mjs --apply --out ../client-app   # + export without the harness, .git or .env*
```

## Adding skills

Skills extend what the agent knows. Before you add one, check it against what is already here:

- **Next.js knowledge is already covered.** `next dev` writes the `AGENTS.md` block that points the agent at `node_modules/next/dist/docs/`, which matches the installed Next.js version. Do not install `next-best-practices`: Vercel retired it as a skill for Next.js 16.3+ for this reason (see the [`vercel-labs/next-skills` README](https://github.com/vercel-labs/next-skills)). The Next.js workflow skills now live in `vercel/next.js` and install with `npx skills add vercel/next.js`.
- **A new skill must not contradict `ui-design`.** The hooks enforce this repository's rules whatever a skill says, so a skill that asks for, say, raw palette colors only produces lint failures.

Where to find skills:

- [skills.sh](https://skills.sh): the directory behind the `skills` CLI, searchable, with install counts.
- [`vercel-labs/agent-skills`](https://github.com/vercel-labs/agent-skills): React and Next.js performance, composition patterns, view transitions, web design guidelines, Vercel deployment.
- [`anthropics/skills`](https://github.com/anthropics/skills): Anthropic's examples and document skills, as a Claude Code plugin marketplace.

Install with the [`skills` CLI](https://github.com/vercel-labs/skills) (Node 22.20+), from the repository root:

```bash
npx skills find design                                                            # search
npx skills add vercel-labs/agent-skills --skill web-design-guidelines -a claude-code --copy
npx skills list                                                                   # what is installed
npx skills check && npx skills update                                             # updates
npx skills remove web-design-guidelines
```

Pass `--copy`. Without it, the CLI keeps the skill files in `.agents/skills/` and puts only symlinks in `.claude/skills/`; knip and markdownlint skip `.claude/skills/` but not `.agents/`.
For Claude Code a project install goes to `.claude/skills/`; `-g` installs to `~/.claude/skills/` for every project instead.
Prefer the project install and commit what it writes (check `git status`; the CLI can also write `skills-lock.json` at the repository root): a skill that lives only in your home directory is missing for teammates and for cloud sessions.
Read a skill's `SKILL.md` before committing it; the agent follows it as instructions.

Anthropic's marketplace installs through Claude Code's plugin commands instead.
Unlike `npx skills add`, this puts no skill files in the repository, so the commit advice above does not cover it:

```plaintext
/plugin marketplace add anthropics/skills
/plugin install example-skills@anthropic-agent-skills
```

`prune.mjs --out` leaves `.claude/`, `.agents/` and `skills-lock.json` out of a client export, so installed skills never reach the client.

## Quality tools

| Tool        | Runs where                                  | Config                                 |
| ----------- | ------------------------------------------- | -------------------------------------- |
| knip        | `pnpm prune:*`, `/ship`                     | `knip.json`                            |
| Trunk       | locally, with git hooks                     | `.trunk/trunk.yaml`, `.trunk/configs/` |
| osv-scanner | inside Trunk                                | `osv-scanner.toml`                     |
| cspell      | VS Code extension, or a global `cspell` CLI | `cspell.config.yaml`, `.cspell/`       |

CI (`ci.yml`) runs none of these; it runs `pnpm check`, `pnpm build` and the render smoke test.
Trunk, osv-scanner and cspell are local tools.

### knip

`scripts/prune.mjs` uses knip to find unused files and dependencies, which after a project is built is most of `components/ui/`.
knip follows static imports only. A component referenced through a computed `import()` path or from CMS/MDX content gets removed; add its file to `entry` in `knip.json`.
`ignoreDependencies` lists the packages that only CSS uses (`tailwindcss`, `@tailwindcss/postcss`, `tw-animate-css`); add any other CSS-only or CLI-only package there.
Run `pnpm prune:dry-run` and read the list before `pnpm prune:apply`. The `ship` skill does this for you.

### Trunk

[Trunk](https://docs.trunk.io) pins and runs the linters: actionlint, checkov, eslint, git-diff-check, markdownlint, osv-scanner, prettier, trivy, trufflehog and yamllint (versions in `.trunk/trunk.yaml`).
It is not an npm dependency. Install the CLI with `brew install trunk-io` or the `@trunkio/launcher` npm package.

```bash
trunk fmt                  # format changed files
trunk check                # lint changed files
trunk check --all          # lint everything
trunk upgrade              # move the CLI, plugins and linters to new versions
```

`trunk.yaml` enables two git hooks: `trunk-fmt-pre-commit` and `trunk-check-pre-push`.
`git config core.hooksPath` shows whether they are active in your clone; it points into Trunk's cache once they are.
`trunk-upgrade-available` tells you when `trunk upgrade` has something new; review the version changes it makes like any dependency bump.
A finding to suppress gets a `trunk-ignore(<linter>/<rule>)` comment with the reason next to it, as in `.github/workflows/shadcn-sync.yml`.

### osv-scanner

osv-scanner runs inside `trunk check` and reports known vulnerabilities in `pnpm-lock.yaml`.
Fix a finding by upgrading the package, or with an `overrides` entry in `pnpm-workspace.yaml` when the fixed version is compatible.
Only ignore a vulnerability in `osv-scanner.toml` with a `reason` that holds evidence from this repository: why no compatible fix exists, why the code is not reachable, who approved it, and who re-checks it and when.

**The entry that ships with the template is the template's decision, not yours.** The minimatch ignore records evidence and an approval from the page-gen repository. In your repository, re-check it against your own `pnpm-lock.yaml` and ESLint config, then rewrite its reason and owner, or remove it once the vulnerable version is gone.

### cspell

cspell checks spelling in code and docs.
The recommended VS Code extension (`streetsidesoftware.code-spell-checker`) reads `cspell.config.yaml`; outside the editor, run it with a globally installed CLI:

```bash
cspell lint --no-progress "**/*.{md,ts,tsx,mjs}"
```

Add project words to `.cspell/custom-dictionary.txt`, one per line, sorted.
Add a word only when it is correct (a product name, an API identifier); fix a typo instead.

## Caveats

- design-lint is regex-based: fast and dependency-free, not a parser. Suppress a deliberate exception with `// design-lint-ignore <reason>`.
- The Stop hook forces at most one extra fix round per turn (`stop_hook_active` guard) to avoid loops.
- `guard-ui` sees Edit and Write only. A shell command such as `sed -i` can still change a primitive, so do not ask the agent to route around the block.
