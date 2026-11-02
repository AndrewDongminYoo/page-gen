---
name: ui-design
description: Visual design rules for every screen or component built in this repo — color, typography, spacing, layout, component choice, states, accessibility and copy. Load before writing or changing any UI code.
---

# UI design rules

The goal is UI that looks deliberately designed rather than generated. Generated UI fails in predictable ways: default blue, gradients everywhere, every element centered, uniform card grids, cramped or random spacing, vague placeholder copy, no states. Each rule below exists to block one of those.

## Color

- One brand hue plus neutrals. Pick the hue in `design/brief.md` from the product's domain, not habit. Do not default to blue or indigo; use them only when the user asks or the brand demands it.
- Define everything in `app/tokens.css` as oklch, light and dark. Typical mapping: `--primary` = brand hue, `--accent`/`--secondary`/`--muted` = near-neutral tints of the same hue (chroma ≤ 0.02), `--chart-1..5` = brand hue at stepped lightness plus at most one contrasting hue.
- Total visible colors on a screen: brand + neutrals + destructive, three to five. A second accent hue needs a reason written in the brief.
- Gradients: avoid. If used, one subtle gradient per page, within one hue family (e.g. `from-primary/10 to-transparent`). Never purple→blue, never on text, never on buttons.
- Contrast: body text ≥ 4.5:1, large text and UI borders ≥ 3:1. `text-muted-foreground` is for secondary text only, never for anything the user must read to act.
- Check dark mode on purpose: borders, shadows and muted text behave differently.
- A logo or app icon whose background is close to the page background in either theme gets a hairline border or a contrasting plate, so the mark keeps its shape.

## Typography

- At most two families: Geist Sans for UI text, and one display family for headings, loaded via `next/font` and exposed as a CSS variable. Geist Mono only for code, numbers in tables, or keyboard hints.
- A landing page's hero and section titles use a display family chosen for this subject, with the reason in one line of the brief. Do not reach for the family you would use anywhere (Impeccable's detector flags Geist, Inter and Space Grotesk as overused), and the fonts that read that way change within a year, so choose from the subject rather than from a list. For a Korean-first product this is also the Hangul font decision.
- Scale (use these, not arbitrary sizes): `text-xs` meta, `text-sm` UI and dense content, `text-base` body, `text-lg` lead, `text-xl`/`text-2xl` section titles, `text-3xl`–`text-5xl` page/hero titles (`text-6xl`+ only for a deliberate hero). A landing-page hero is that deliberate case: break the headline into two lines on purpose and size it so it is the largest element after the product visual.
- Headings: `font-semibold` or `font-medium`, `tracking-tight` at `text-2xl` and up, `text-balance`. Body: `text-pretty`, `leading-relaxed` for long text, max width `max-w-prose` (~65ch).
- Hierarchy comes from size + weight + color together. Don't bold everything; don't use more than three weights on a page.
- Numbers in tables/stats: `tabular-nums`.
- Korean copy: Geist has no Hangul glyphs, so Korean falls back to the OS font. For Korean-first products, add a Hangul font (e.g. Pretendard via `next/font/local`) as the sans family and record it in the brief.

## Spacing and layout

- 4px scale only. Common rhythm: `gap-2` inside controls, `gap-4` between related items, `gap-6`/`gap-8` between groups, `py-16 md:py-24` between landing sections, `p-4 md:p-6` page padding in apps.
- Containers: `mx-auto w-full max-w-6xl px-4 md:px-6` for marketing; full-width with sidebar for apps; `max-w-2xl` for forms and reading.
- Mobile-first: write base classes for 390px, then `md:` / `lg:`. Nothing may overflow horizontally at 390px.
- Alignment: left-align by default. Center only short hero copy and empty states. Long centered paragraphs read as generated.
- Break the grid on purpose: vary section layouts (split, asymmetric 2/3+1/3, bento with one large tile, list) instead of repeating three equal cards or any other device. Adjacent sections must not show the same mockup at the same size; crop to the part of the screen that proves the point, or vary the frame.
- Use `size-*` for square elements, `min-h-svh` not `h-screen`, `gap` not margins between siblings.

## Components — pick the right primitive

Check `references/components.md` for the full map. The most common mistakes:

- Lists of entities (users, files, settings rows): `Item` / `ItemGroup`, not hand-rolled divs or a `Card` per row.
- Forms: `Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `FieldGroup` (+ `react-hook-form` + `zod`). Inputs with icons/buttons inside: `InputGroup`.
- No data yet: `Empty`, never a blank area. Loading: `Skeleton` matching the final layout, or `Spinner` inside the triggering button.
- Grouped actions: `ButtonGroup`. Keyboard hints: `Kbd`. Status: `Badge` with a semantic variant.
- Destructive confirmation: `AlertDialog`. Side editing on desktop: `Sheet`; on mobile: `Drawer`.
- App shells: `Sidebar` (+ `SidebarProvider`, `SidebarInset`), not a custom nav.
- Chat UIs: `Message`, `MessageGroup`, `Bubble`, `MessageScroller`, `Attachment`.
- `Card` is for a self-contained unit with its own actions — not a default wrapper for every section.

## Icons and imagery

- `lucide-react`, sized `size-4` inline with text, `size-5` standalone; stroke width default. Icons support meaning; every icon-only button needs `aria-label` or `sr-only` text.
- A feature section is not a row of icon tiles. Show the product instead: the real component, or a crop of a real screen captured with `pnpm shot`. Icon-topped feature cards are among the strongest AI-generated tells.
- Images: `next/image` with real `alt`. If no asset exists, use `/placeholder.svg?width=W&height=H&text=label` (served by this repo) and keep it obviously a placeholder; it is flagged at delivery.
- No stock-photo clichés described in alt text, no emoji as decoration.

## States and interaction

Every interactive element needs default, hover, `focus-visible`, active, and disabled styles — shadcn primitives already have them; custom elements must match. Every data view needs loading, empty, error, and populated states, and the brief lists them. Motion: `transition-colors` / `transition-opacity`, 150–200ms; `tw-animate-css` classes (`animate-in fade-in slide-in-from-bottom-2`) for entrances, at most one per page (the hero); sections below it do not animate in, on mount or on scroll. Respect `motion-reduce:`. No bouncing, no parallax.

## Copy

Write realistic, specific copy in the user's language (Korean if the request is in Korean). Real-looking names, numbers, dates and product terms. Buttons say what happens ("초대 보내기", "Export CSV"), not "Submit" / "Click here". No lorem ipsum, no "Welcome to our amazing platform".

On a landing page, each section gets a one-line title that says something to the reader ("집중의 시작은, 간단하게."). The plain label ("기능", "How it works") stays in the nav and the section `id`; do not put a small label, kicker or eyebrow above the title, since several published taste rules (Impeccable, tasteskill, Anthropic's frontend-design) flag it as an AI-generated tell. Number steps only when the order is real (a three-step setup).

When the request leaves a contact address or an outbound link blank, do not invent one. Reuse a value the user already publishes elsewhere only when you can name where it comes from, and list it under decisions to confirm in the hand-off summary; otherwise render a visible "준비 중" (coming soon) state.

## Accessibility

Semantic landmarks (`header`, `nav`, `main`, `footer`, one `h1`), label every input, `alt` on meaningful images, tap targets ≥ 40px on mobile, visible focus, no information by color alone.

## Before you call it done

Run through `references/checklist.md` against the screenshots, not against the code.
