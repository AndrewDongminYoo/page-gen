# Visual QA checklist

Judge from `.screenshots/*.png`, all four variants (desktop/mobile × light/dark). Each line is pass/fail; fix every fail.

## First impression (look at the desktop-light shot for 3 seconds)

- [ ] It's obvious what the page is and what to do next.
- [ ] One clear focal point; the eye doesn't bounce between equal-weight elements.
- [ ] It doesn't look like a template: no default blue, no purple gradient, no row of three identical cards as the main idea.
- [ ] On a landing page, the hero headline is the largest element after the product visual.
- [ ] Section titles say something to the reader; none is only a label such as "Features", and no small label or eyebrow sits above them.
- [ ] Features are shown with the product (real components or screen crops), not a row of icon tiles.
- [ ] Only the hero animates in; no section fades or slides in as you scroll.
- [ ] The page carries the brief's idea sentence: one dominant visual that comes from the product's own subject.
- [ ] No two adjacent sections repeat the same mockup or device at the same size.

## Hierarchy and type

- [ ] Heading sizes step down clearly; no two adjacent levels look the same.
- [ ] Body text is comfortable to read: line length ≤ ~75 characters, enough line height.
- [ ] No orphaned single words on headings (use `text-balance`).
- [ ] Secondary text is visibly secondary but still readable.

## Spacing and alignment

- [ ] Consistent rhythm between sections; nothing cramped against a neighbour.
- [ ] Elements share edges — left edges of text blocks, card edges, column edges line up.
- [ ] Padding inside cards/controls is even on all sides.

## Color

- [ ] Brand color used sparingly for emphasis and primary actions, not as wallpaper.
- [ ] Dark mode: borders visible, no pure-black-on-pure-white flashes, muted text readable, charts legible.
- [ ] The logo or app icon keeps its shape in both themes; it does not melt into a background of the same color.

## Mobile (390px)

- [ ] No horizontal scroll (the script fails on this).
- [ ] Nav collapses sensibly; primary action is reachable without scrolling far.
- [ ] Tap targets comfortable; nothing tiny or crowded.
- [ ] Multi-column layouts stack in a sensible order.

## Content and states

- [ ] Copy is specific and realistic; no lorem, no "Feature 1".
- [ ] Empty, loading and error states exist where data appears (render them via a query param or story route if needed).
- [ ] Placeholder images are marked as such and listed for replacement.

## Craft details

- [ ] Icons are consistent in size and stroke and optically aligned with text.
- [ ] Focus rings visible when tabbing (spot-check with the Playwright MCP).
- [ ] Numbers align (`tabular-nums`), dates and currencies formatted for the locale.
