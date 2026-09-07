# World Coding Cup 2026 — Astro Recreation Brief

Recreation of https://tangible.levafoundation.org/world-coding-cup-2026 (a Webflow page) as an Astro site with Tailwind CSS v4 and React islands for interactivity.

## Reference materials (all in `_reference/`)

- `ref-main.html` — exact original markup of all page sections (hero → start section). **Source of truth for content, alt text, links, and structure.** Contains inline SVGs (Tangible WCC logo, Amazon sponsor logo) you should copy verbatim into components.
- `ref-header.html` / `ref-footer.html` — original navbar and footer markup (Webflow, verbose — extract only what's needed).
- `wcc-rules.css` — every original `.wcc-*` CSS rule incl. all media queries. **Source of truth for styling.**
- `nav-footer-rules.css` — original navbar/footer CSS rules.
- `inline-styles.css` — original inline styles: marquee animation, scroll-reveal, hover transitions, CSS variables.
- `screenshots/ref-desktop-1440.png`, `ref-tablet-900.png`, `ref-landscape-600.png`, `ref-portrait-400.png` — visual ground truth per breakpoint.

## Stack & conventions

- Astro 7, Tailwind v4 (CSS-first config via `@theme` / `@custom-variant` in `src/styles/global.css`), React 19 islands only where interactive.
- TypeScript for React components (`.tsx`), Astro components for everything static.
- Styling: **Tailwind utility classes in markup.** Only use global CSS for @font-face, @theme tokens, custom variants, keyframes, and the scroll-reveal rules. No scoped `<style>` blocks unless a rule genuinely can't be expressed with utilities (e.g. complex pseudo-selectors).
- Images: import from `src/assets/images/` and use `astro:assets` `<Image />` / `<Picture />` where sensible (`inferSize` not needed — local files). SVG decos/icons may be imported as `src` or inlined when they need `currentColor`.
- Font files: `public/fonts/SuperDeluxeSans-Regular.otf`. Figtree comes from Google Fonts (link in BaseLayout head, weights 300–700, display=swap).

## Layout architecture (REQUIRED pattern)

Every page section composes exactly like this:

```astro
<Section class="...">                    <!-- component: full-width <section>, relative, overflow control -->
  <BackgroundLayer ... slot="background" /> <!-- optional: absolutely-positioned full-width bg (images, scrims, color bands) -->
  <Container size="...">                 <!-- component: max-width + centered + horizontal padding -->
    ...content...
  </Container>
</Section>
```

- `Section.astro`: renders `<section class:list={['relative', className]}>` with a named slot `background` rendered **before** the default slot, plus the default slot. Props: `class` (bg color, vertical padding, overflow), `id` optional.
- `Container.astro`: props `size` = `'md' | 'lg' | 'xl' | 'full'` mapping to the max-widths used by the original (`max-w-[75rem]`, `max-w-[80rem]`, `max-w-[90rem]`/`max-w-[92rem]`, none) — check wcc-rules.css per section; plus `class` passthrough. Always `w-full mx-auto relative`.
- Backgrounds (photos, gradient scrims, partial color bands like the stats teal strip) go in the `background` slot so they span full width.

## Design tokens (define in `@theme` in global.css)

Colors (from original CSS):
- `--color-teal: #15859F` (primary brand)
- `--color-teal-deep: #0E6377` (race section bg)
- `--color-lime: #AFE90B` (primary CTA)
- `--color-sky: #7BE6FF`
- `--color-sun: #FFD23F` (yellow step card)
- `--color-lilac: #D7B4FF` (stats card, step 2)
- `--color-tangerine: #F5843F` (chip, step 4 alt)
- `--color-ember: #F2683C` (step 4 / info bar)
- `--color-ink: #1C1C1C` (near-black text)
- `--color-smoke: #555555` (body gray)
- `--color-peach: #FCF5EC` (card cream bg)
- `--color-mist: #D8E3ED` (FAQ divider border)

Fonts:
- `--font-display: "Super Deluxe Sans", Arial, sans-serif` — ALL headings/stat numbers/step numbers. Always `font-weight: 400`, usually `uppercase`, negative tracking.
- `--font-sans: "Figtree", sans-serif` — everything else.

## Breakpoints — DESKTOP-FIRST custom variants (define in global.css)

```css
@custom-variant desktop (@media (min-width: 992px));   /* explicit desktop-only, rarely needed */
@custom-variant tablet (@media (max-width: 991px));
@custom-variant landscape (@media (max-width: 767px));
@custom-variant portrait (@media (max-width: 479px));
```

Unprefixed utilities = desktop styles. Override downward: `class="p-8 tablet:p-6 landscape:p-5 portrait:p-4"`. Do NOT use Tailwind's default `sm:`/`md:`/`lg:` screens anywhere.

Match the original's responsive behavior per breakpoint exactly — it's all in `wcc-rules.css` media blocks (991px / 767px / 479px) and visible in the screenshots.

Fluid type: the original uses `clamp()` for heading sizes — keep those exact clamp() values via arbitrary values, e.g. `text-[clamp(2rem,1.3rem+2.3vw,3.5rem)]`.

## Motion & interactivity

Global scroll-reveal (already in original): elements with `data-reveal` fade/rise in when entering viewport. Implementation lives in BaseLayout: CSS in global.css (hidden state ONLY inside `@media (prefers-reduced-motion: no-preference)`, `.is-in` shows) + a small inline `<script>` with IntersectionObserver adding `.is-in`. Stagger via `style="--reveal-delay: 90ms"`. Copy the original timings from `inline-styles.css`.

Hover behaviors (cards lift −3px, buttons lift −2px, arrow chip nudges (2px,−2px)) — implement with Tailwind utilities + `motion-safe:` on the transitions, matching `inline-styles.css`.

React islands (client:visible unless noted):
1. `Countdown.tsx` — NEW, hero: live countdown to 2026-11-05T00:00:00 (days/hours/mins/secs) in Super Deluxe Sans digits, styled to sit naturally in the hero under the button row. Must render a stable placeholder server-side (no hydration mismatch: render dashes until mounted).
2. `StatCounter.tsx` — NEW, stats card: counts 0→value with easing when scrolled into view (IntersectionObserver, ~1.2s, respects prefers-reduced-motion by jumping straight to the final value). Props: `value: number`, `label: string`, formats with thousands separator (1,374).
3. `GalleryMarquee.tsx` — port of original marquee: duplicates the image row, measures row width, sets CSS vars `--marquee-distance`/`--marquee-duration`, CSS keyframe animation scrolls it left infinitely, pauses on hover, disabled under prefers-reduced-motion (falls back to native horizontal scroll). Keyframes live in global.css.

## Quality bar

- Semantic HTML (nav, header, main, section, footer, h1–h3 hierarchy — note: original page has NO h1; make the hero SVG logo's accessible name the h1 or add sr-only h1 "Tangible World Coding Cup 2026").
- All original links/hrefs preserved exactly (jotform, youtube, mailto, play store, app store, google drive, calendar, whatsapp, social links).
- Alt text preserved from original.
- `npm run build` must pass clean. No TypeScript errors.
- No dead code, no commented-out blocks, no `console.log`.
- Keep the floating "Open chat" widget OUT of scope — do not build it.
