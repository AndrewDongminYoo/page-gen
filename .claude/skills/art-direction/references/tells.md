# Dated AI-tell registry

Patterns that published sources flag as signs of AI-generated UI, with the date each source was written.
Sources were read on 2026-11-02.
Tells move every few months, so re-check this file against current sources whenever the page-gen vs v0 comparison is repeated (`docs/notes/2026-11-02-v0-comparison.md`).

Judge combinations, not single traits: a near-black ground with one neon accent is right for a developer tool and a tell for a bakery.
Status `banned` means `ui-design` forbids it outright; `warned` means it needs a subject-based reason written in the brief.

## Sources

| Key        | Source                                                                                                                                                                                                                                                                                                                                                                                  | Date                         |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| prg        | [Why your AI keeps building the same purple gradient website](https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website)                                                                                                                                                                                                                                     | 2025-10-26                   |
| anthropic  | [Anthropic `frontend-design` SKILL.md](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md)                                                                                                                                                                                                                                                                  | last changed 2026-09-03      |
| taste      | [tasteskill v2 SKILL.md](https://github.com/Leonxlnx/taste-skill/blob/12af471/skills/taste-skill/SKILL.md), [research.md](https://github.com/Leonxlnx/taste-skill/blob/12af471/skills/taste-skill/references/research.md) (gallery study of 247 sites scored by a model panel), [tells.md](https://github.com/Leonxlnx/taste-skill/blob/12af471/skills/taste-skill/references/tells.md) | commit of 2026-10-24         |
| impeccable | [Impeccable craft floor](https://github.com/pbakaus/impeccable/blob/e89e3ad/.claude/skills/impeccable/reference/craft-floor.md) and [detector rules](https://github.com/pbakaus/impeccable/blob/e89e3ad/crates/live/assets/antipatterns.json)                                                                                                                                           | commit of 2026-11-01         |
| emil       | [Emil Kowalski `remove-animations`](https://github.com/emilkowalski/skills/blob/main/skills/remove-animations/SKILL.md)                                                                                                                                                                                                                                                                 | main branch, read 2026-11-02 |

## First wave (2023 to 2025)

| Trait                                  | Sources                                                                                          | Status                                      |
| -------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------- |
| Purple or indigo gradient on white     | prg, taste (dates it to 2023–2024)                                                               | banned                                      |
| Inter or Roboto everywhere             | prg                                                                                              | warned (see display faces below)            |
| Centered hero with centered paragraphs | prg                                                                                              | warned (`ui-design` left-aligns by default) |
| Three icon-topped feature boxes        | prg, taste, impeccable `icon-tile-stack`; gallery data 1% of top sites against 28% of weak sites | banned                                      |
| Soft 0.1-opacity shadow on every card  | prg                                                                                              | warned                                      |

## 2026 clusters

The five default clusters in anthropic (2026-09-03), with the other sources that name the same traits.

| Cluster              | Traits                                                                                                                          | Also flagged by                                                                                                                             | Status                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Cream and terracotta | warm cream ground near `#F4F1EA`, high-contrast serif display, terracotta accent near `#D97757` (Anthropic's own Claude accent) | taste ("third wave", where the fixes for earlier tells became the look), impeccable `cream-palette`, `italic-serif-display`                 | warned; the likeliest destination when asked to make a page "more tasteful" |
| Near-black and acid  | near-black ground with one acid green or neon accent                                                                            | —                                                                                                                                           | warned outside developer tools                                              |
| Broadsheet           | newspaper-style layout ruled with hairlines                                                                                     | taste bans hairlines                                                                                                                        | warned                                                                      |
| SaaS-card kit        | identical rounded cards, one radius, the same soft grey shadow                                                                  | impeccable `icon-tile-stack`, taste                                                                                                         | banned as the main idea of a section                                        |
| Template chrome      | eyebrow labels above headings, numbered section labels, decorative mono labels                                                  | impeccable `kicker-above-heading`, `hero-eyebrow-chip`; taste "no eyebrows"; gallery data for eyebrows 32% of top sites against 45% of weak | banned for eyebrows; numbering only for a real order                        |

## Fonts

impeccable's `overused-font` rule lists Inter, Roboto, Fraunces, Geist, Plus Jakarta Sans and Space Grotesk.
Anthropic's 2025-11 blog post suggested Space Grotesk; a year later it is on the overused list.
So this registry names no replacement fonts: `ui-design` keeps Geist for UI text and asks for a display face chosen from the subject, with the reason in the brief.

## Motion

| Trait                             | Sources                                             | Status                                  |
| --------------------------------- | --------------------------------------------------- | --------------------------------------- |
| Fade or slide-in on every section | anthropic, emil, impeccable ("one authored moment") | banned (`ui-design` §States: hero only) |

## Where sources disagree, and this repository's choice

| Topic                                                         | Disagreement                                                                                                                     | Choice here                                                                                                     |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Hairlines, 1px outlined boxes, resting shadows, 9–16px radius | taste bans them; they are shadcn's defaults in the locked `components/ui/`                                                       | keep the primitives; avoid card grids as a section's main idea and depart from the default on at least one axis |
| Monospace labels and index numbering                          | taste bans them as house taste, while its own data shows them more often on strong sites (44% against 24%, 38% against 21%)      | warned, not banned                                                                                              |
| Italic serif accent word                                      | impeccable flags it; taste's data shows no real difference (4% against 7%)                                                       | warned only inside the cream-and-terracotta combination                                                         |
| Letter-spacing                                                | [ibelick `baseline-ui`](https://github.com/ibelick/ui-skills/blob/4907a52/skills/baseline-ui/SKILL.md) bans `tracking-*` changes | keep `tracking-tight` on large headings (`ui-design` §Typography)                                               |
| Amount of motion                                              | taste fails a page under 8 moving elements; ibelick bans animation nobody asked for                                              | one hero entrance plus the brief's living element                                                               |

<!-- cspell:ignore Kowalski Fraunces ibelick -->
