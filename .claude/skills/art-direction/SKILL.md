---
name: art-direction
description: Choose a page's visual direction from the product itself — hard gates, axis values, the nearest style preset, and a dated check against AI-generated tells — and record it in design/brief.md before tokens are written. Use from build-ui step 1 once the subject inventory and idea sentence exist, and whenever the user names a style (brutalism, glassmorphism, neumorphism, editorial, bento, …) or asks for a different look.
---

# Art direction

`ui-design` keeps a page from looking generated; this skill decides what it should look like instead.
It routes on axes, and treats named styles as presets on those axes, so "Swiss but warmer" is a move on one axis, not a new style.
Work in this order and do not skip ahead: gates, axes, preset, tell check, record.
Taste never overrides a gate.

## Inputs

Read them from `design/brief.md` (build-ui §1); decide and record any that are missing.

- Product category and audience, including age band.
- Density: low (marketing, reading), medium (forms, settings), high (tables, dashboards, dense lists).
- Task criticality: browse, sign up, transact, regulated (finance, health records, government).
- Tone on the four [NN/g tone-of-voice dimensions](https://www.nngroup.com/articles/tone-of-voice-dimensions/), each from −2 to +2: formal ↔ casual, serious ↔ funny, respectful ↔ irreverent, matter-of-fact ↔ enthusiastic.
- The subject inventory and the idea sentence.

A request that names a style is a preset request: start from that preset, but the gates still apply.

## 1. Hard gates

| Condition                       | Effect                                                                                                                                                                    | Source                                                                                                                                                                                                                                                        |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Regulated or transactional task | Expressiveness ≤ 1; translucency 0 in content; forms, navigation and checkout follow established patterns                                                                 | [Google's M3 Expressive research](https://design.google/library/expressive-material-design-google-research) cautions to keep established patterns in a banking interface                                                                                      |
| High density                    | Depth ≥ 1 with visible borders or fills on every control; no neumorphism                                                                                                  | [NN/g on flat UI](https://www.nngroup.com/articles/flat-ui-less-attention-cause-uncertainty/): weak signifiers took about 22% longer and drew about 25% more fixations                                                                                        |
| Brutalist or raw ornament       | Only with conventional hierarchy and navigation; breaking conventions themselves (antidesign) only for designer, artist or entertainment audiences                        | [NN/g on brutalism](https://www.nngroup.com/articles/brutalism-antidesign/)                                                                                                                                                                                   |
| Translucency above 0            | Overlays, menus and sticky chrome only, never body text over busy imagery; opaque fallback under `prefers-reduced-transparency`                                           | [NN/g on glassmorphism](https://www.nngroup.com/articles/glassmorphism/) says "sparingly" and asks for contrast checks; overlay-only is this repo's stricter rule                                                                                             |
| Neumorphism requested           | Not a preset here: controls drawn only by soft shadows on a same-color ground rarely meet the 3:1 UI-border contrast `ui-design` requires; offer a tactile preset instead | `ui-design` §Color                                                                                                                                                                                                                                            |
| Always                          | One brand hue, no per-section reveals (`ui-design`); and at least one of radius, display face or color energy departs from the shadcn default                             | The shadcn default (`--radius: 0.625rem`, Geist, neutral tokens, soft xs shadows) sits close to the "SaaS-card kit" that [Anthropic's frontend-design](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) lists as an AI default |

## 2. Axes

Give each axis an integer from 0 to 3.

| Axis              | 0                    | 3                                       | Lever in this repo                                                                                                                        |
| ----------------- | -------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Depth / signifier | flat, hairlines only | tactile: hard offset or layered shadows | `--shadow-*` override in `app/tokens.css`; border weight in `components/<feature>/`                                                       |
| Translucency      | opaque               | glass chrome                            | `bg-background/70 backdrop-blur-md` on overlays only (gate)                                                                               |
| Expressiveness    | conventional         | bold shape, color and scale             | display face, headline-to-body ratio, brand chroma                                                                                        |
| Formality         | casual               | formal                                  | `--radius` (small reads formal; large reads casual, per a secondary summary of Refactoring UI, unverified), serif or rounded display face |
| Ornament          | plain, raw           | illustrated, textured                   | `components/brand/` illustrations, texture backgrounds                                                                                    |
| Density           | airy                 | dense                                   | section rhythm (`py-16 md:py-24` → tighter), type scale                                                                                   |
| Motion budget     | none                 | orchestrated                            | hero entrance and the brief's living element only (`ui-design` §States)                                                                   |

Map tone to axes before choosing a preset: formal and respectful push formality up; enthusiastic and funny push expressiveness and ornament up; matter-of-fact pushes ornament down.

## 3. Preset

Pick the preset in `references/presets.md` whose coordinates are closest, then move single axes to fit the subject.
Write down every axis you moved and why; the moves are where the page stops looking like its category.

## 4. Tell check

Read `references/tells.md` and judge the combination, not single traits.
If the direction matches two or more traits of one dated cluster, change an axis, or keep the combination and write the subject-based reason in the brief.
Never fix a tell by picking a named replacement from a list: replacements become the next tells.

## 5. Record

Add this block to `design/brief.md`, then write tokens (build-ui §2) through the levers below.

```plaintext
Direction:
  Axes: depth 2 · translucency 0 · expressiveness 2 · formality 1 · ornament 1 · density 1 · motion 1
  Nearest preset: <slug>, moved: <axis +/-1 — reason from the subject>
  Gates applied: <list, or none>
  Departs from the shadcn default on: <radius | display face | color energy> — why
  Tell check: <clusters compared; any kept combination and its subject reason>
```

## Levers in this stack

Checked on 2026-11-02 against this repository.

- `app/tokens.css` is the only place for colors and `--radius`; `--radius-sm` to `--radius-xl` derive from `--radius` in `app/globals.css`.
- Shadows: the locked primitives in `components/ui/` use `shadow-xs` (16 uses), `shadow-md` (8), `shadow-lg` (6) and `shadow-sm` (5). An `@theme` block in `app/tokens.css` rewrites the compiled utility for every primitive, and a token variable as the color keeps it theme-aware; `pnpm build` with the block below compiled `.shadow-xs` to `4px 4px 0 0 var(--tw-shadow-color,var(--foreground))`. Override only the sizes the preset needs, and re-shoot both themes.

  ```css
  @theme {
    --shadow-xs: 4px 4px 0 0 var(--foreground);
  }
  ```

- Display face: load it with `next/font` in `app/layout.tsx` and set `--font-heading-family` (build-ui §2).
- Border weight, cropped screens and illustration belong in `components/<feature>/` and `components/brand/`; never edit `components/ui/` to reach a style.

The use counts change when the shadcn sync updates `components/ui/`; recount with `grep -rhoE --include='*.tsx' 'shadow-(xs|sm|md|lg)' components/ui | sort | uniq -c`.
