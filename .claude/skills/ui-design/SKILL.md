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

## Typography

- At most two families: Geist Sans (default) and optionally one display family for headings, loaded via `next/font` and exposed as a CSS variable. Geist Mono only for code, numbers in tables, or keyboard hints.
- Scale (use these, not arbitrary sizes): `text-xs` meta, `text-sm` UI and dense content, `text-base` body, `text-lg` lead, `text-xl`/`text-2xl` section titles, `text-3xl`–`text-5xl` page/hero titles (`text-6xl`+ only for a deliberate hero).
- Headings: `font-semibold` or `font-medium`, `tracking-tight` at `text-2xl` and up, `text-balance`. Body: `text-pretty`, `leading-relaxed` for long text, max width `max-w-prose` (~65ch).
- Hierarchy comes from size + weight + color together. Don't bold everything; don't use more than three weights on a page.
- Numbers in tables/stats: `tabular-nums`.
- Korean copy: Geist has no Hangul glyphs, so Korean falls back to the OS font. For Korean-first products, add a Hangul font (e.g. Pretendard via `next/font/local`) as the sans family and record it in the brief.

## Spacing and layout

- 4px scale only. Common rhythm: `gap-2` inside controls, `gap-4` between related items, `gap-6`/`gap-8` between groups, `py-16 md:py-24` between landing sections, `p-4 md:p-6` page padding in apps.
- Containers: `mx-auto w-full max-w-6xl px-4 md:px-6` for marketing; full-width with sidebar for apps; `max-w-2xl` for forms and reading.
- Mobile-first: write base classes for 390px, then `md:` / `lg:`. Nothing may overflow horizontally at 390px.
- Alignment: left-align by default. Center only short hero copy and empty states. Long centered paragraphs read as generated.
- Break the grid on purpose: vary section layouts (split, asymmetric 2/3+1/3, bento with one large tile, list) instead of repeating three equal cards.
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

- `lucide-react`, sized `size-4` inline with text, `size-5` standalone, `size-6`–`size-8` in feature tiles; stroke width default. Icons support meaning; every icon-only button needs `aria-label` or `sr-only` text.
- Images: `next/image` with real `alt`. If no asset exists, use `/placeholder.svg?width=W&height=H&text=label` (served by this repo) and keep it obviously a placeholder; it is flagged at delivery.
- No stock-photo clichés described in alt text, no emoji as decoration.

## States and interaction

Every interactive element needs default, hover, `focus-visible`, active, and disabled styles — shadcn primitives already have them; custom elements must match. Every data view needs loading, empty, error, and populated states, and the brief lists them. Motion: `transition-colors` / `transition-opacity`, 150–200ms; `tw-animate-css` classes (`animate-in fade-in slide-in-from-bottom-2`) for entrances; respect `motion-reduce:`. No bouncing, no parallax, no animation on scroll by default.

## Copy

Write realistic, specific copy in the user's language (Korean if the request is in Korean). Real-looking names, numbers, dates and product terms. Buttons say what happens ("초대 보내기", "Export CSV"), not "Submit" / "Click here". No lorem ipsum, no "Welcome to our amazing platform".

## Accessibility

Semantic landmarks (`header`, `nav`, `main`, `footer`, one `h1`), label every input, `alt` on meaningful images, tap targets ≥ 40px on mobile, visible focus, no information by color alone.

## Before you call it done

Run through `references/checklist.md` against the screenshots, not against the code.
