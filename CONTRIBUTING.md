# Contributing to page-gen

This file is for maintainers of the page-gen template repository.
[README.md](README.md) covers working in a repository made from the template.

In a repository made from the template, the shadcn sync workflow skips itself (`if: github.repository == 'AndrewDongminYoo/page-gen'`), so only [CI and dependency updates](#ci-and-dependency-updates) and [Changing the harness](#changing-the-harness) apply there.

## Before you open a pull request

```bash
pnpm check                     # typecheck + design-lint + eslint
pnpm build
pnpm dev                       # in another terminal, then:
pnpm shot /                    # must report no FAIL
trunk check                    # if Trunk is installed; see README §Trunk
```

CI repeats every step except Trunk; see [CI and dependency updates](#ci-and-dependency-updates).

## Updating components

The app scaffold comes from shadcn's `templates/next-app`; the components track the `new-york-v4` registry, and `components/ui/.upstream` records the synced upstream commit.

Primitives in `components/ui/` are the upstream registry source with two mechanical changes (eslint skips them for that reason): the `cn` import points at `@/lib/utils` instead of the `cn` package, and the files are formatted with the repo's prettier config, which sorts Tailwind classes.
Customize through tokens and `className`, not by editing primitives, so updates stay mechanical.

The `shadcn sync` workflow refreshes them every Monday and opens one pull request; run it by hand from the Actions tab.
It refuses an upstream commit older than the one recorded in `components/ui/.upstream`, since syncing it would roll the components back; the `allow-older` input overrides that for a test run.
It needs one of two repository settings to open that pull request: **Settings → Actions → General → Allow GitHub Actions to create and approve pull requests**, or a fine-grained token with Contents and Pull requests write access saved as the `SHADCN_SYNC_TOKEN` secret.
With the token, the pull request also runs CI; without it, GitHub records an empty, failed CI run, so close and reopen the pull request to start CI.
Locally, against a checkout of `shadcn-ui/ui`:

```bash
node scripts/sync-shadcn.mjs ../ui/apps/v4/registry/new-york-v4
```

Do not use `npx shadcn@latest add --all --overwrite` for this: it adds the `cn` package, pins dependency versions Dependabot already moved, and writes color values into `app/globals.css`.

## CI and dependency updates

- `ci.yml` runs on every pull request, Dependabot's included: `pnpm check`, `pnpm build`, and `pnpm shot /` against the production build. Screenshots are uploaded as an artifact.
- Dependabot opens weekly grouped pull requests for npm and GitHub Actions; `.github/dependabot.yml` explains the groups. The Actions updates also keep the SHA pins in `.github/workflows` current.
- `node scripts/prune.mjs --out` exports leave `.github/` out.

## Changing the harness

- Edit a skill, hook or the subagent in `.claude/`, then exercise it in a session: ask for a small page and confirm the hook output and screenshots behave as the change intends.
- Keep rules in one place. Design rules belong in `.claude/skills/ui-design/`, and anything a hook must enforce belongs in `scripts/design-lint.mjs` as well, since a rule the hooks do not check depends on the prompt being followed.
- A new harness file or directory that a client should not receive goes into `HARNESS` in `scripts/prune.mjs`, which lists what `--out` leaves out.
- Some tooling configs were seeded from another repository. Before you rely on a reason, path or approval in `osv-scanner.toml`, the `pnpm-workspace.yaml` overrides, the cspell dictionary or `.trunk/`, confirm it against this repository.
