# Tangible World Coding Cup 2026

Recreation of [tangible.levafoundation.org/world-coding-cup-2026](https://tangible.levafoundation.org/world-coding-cup-2026) (originally a Webflow page) built with **Astro 7**, **Tailwind CSS v4**, and **React 19** islands.

## Commands

```sh
npm install
npm run dev       # dev server
npm run build     # production build to ./dist
npm run preview   # serve the production build
```

## Architecture

Every page section follows the same composition:

```astro
<Section class="bg-teal ...">          <!-- full-width <section> -->
  <SomeBackground slot="background" /> <!-- optional full-bleed layer (images, scrims, color bands) -->
  <Container size="lg">                <!-- max-width + centered content -->
    ...content...
  </Container>
</Section>
```

- [Section.astro](src/components/layout/Section.astro) — renders the `background` slot before the content so backgrounds span the full viewport width.
- [Container.astro](src/components/layout/Container.astro) — sizes: `md` (75rem), `lg` (80rem), `xl` (92rem), `full`.
- Page sections live in [src/components/sections/](src/components/sections/), assembled in [index.astro](src/pages/index.astro).

## Breakpoints (desktop-first)

Custom Tailwind variants defined in [global.css](src/styles/global.css). Unprefixed utilities are the desktop styles; narrower breakpoints override downward:

| Variant      | Media query          |
| ------------ | -------------------- |
| _(none)_     | desktop base styles  |
| `desktop:`   | `min-width: 992px`   |
| `tablet:`    | `max-width: 991px`   |
| `landscape:` | `max-width: 767px`   |
| `portrait:`  | `max-width: 479px`   |

Tailwind emits these media variants sorted by width ascending, which would let `tablet:` rules beat `landscape:`/`portrait:` rules in the cascade. The variant definitions add one `:not(#_)` id of specificity per narrower step so overrides always resolve portrait > landscape > tablet, independent of stylesheet order. Don't use Tailwind's default `sm:`/`md:`/`lg:` screens in this project.

## Interactivity

- **Scroll-reveal** — elements with `data-reveal` fade/rise in via an IntersectionObserver in [BaseLayout.astro](src/layouts/BaseLayout.astro); hidden state only exists under `prefers-reduced-motion: no-preference`.
- **[Countdown.tsx](src/components/react/Countdown.tsx)** (`client:load`) — live countdown to race day in the hero; renders placeholders until mounted to avoid hydration mismatch.
- **[StatCounter.tsx](src/components/react/StatCounter.tsx)** (`client:visible`) — count-up animation for the 2025 highlights; server-renders final values, respects reduced motion.
- **[GalleryMarquee.tsx](src/components/react/GalleryMarquee.tsx)** (`client:visible`) — infinite photo marquee driven by a requestAnimationFrame loop (cruises at 60px/s, eases down to 15px/s on hover and back up on unhover with an exponential inertia curve, τ≈0.5s); falls back to a native scrollable row under reduced motion.

## Design tokens

Colors and fonts are defined in the `@theme` block of [global.css](src/styles/global.css) (teal `#15859F`, lime `#AFE90B`, sky, sun, lilac, ember, peach, …). Headings use the self-hosted **Super Deluxe Sans** ([public/fonts/](public/fonts/)); body text is **Figtree** from Google Fonts.

## Reference material

`_reference/` holds the extracted original markup, CSS, and per-breakpoint screenshots used to build this recreation; `_assets/` holds the original downloaded assets. Neither is part of the build — safe to delete once the recreation is signed off.
