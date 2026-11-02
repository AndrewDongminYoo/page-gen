---
name: ship
description: Prepare the project for hand-off — prune unused shadcn components and dependencies with knip, re-verify, build, and optionally export a clean copy without the agent harness. Use only when the user says the work is ready to deliver.
disable-model-invocation: true
---

# Ship

1. Make sure the working tree is committed (`git status`), so the prune is reviewable and reversible.
2. Dry run and show the user the list:
   ```bash
   pnpm prune
   ```
   Check the list for anything loaded dynamically (computed `import()` paths, components referenced only from MDX/CMS content). If something must stay, add its file to `entry` in `knip.json` and re-run.
3. After the user confirms:
   ```bash
   pnpm prune:apply                     # prune in place + typecheck, design-lint, eslint, build
   # or
   node scripts/prune.mjs --apply --out ../<client-project-name>
   ```
   `--out` copies the pruned app without `.claude/`, `CLAUDE.md`, `AGENTS.md`, `design/`, `scripts/`, `knip.json`, removes harness scripts and dev dependencies from `package.json`, reinstalls and builds it.
4. Report: components kept, dependencies removed, build result, and any `placeholder-image` warnings from design-lint — those are assets the client must supply.

Never prune mid-development: the full component set is what lets later edits stay on-system.
