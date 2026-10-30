# Tangible World Coding Cup 2026

Recreation of [tangible.levafoundation.org/world-coding-cup-2026](https://tangible.levafoundation.org/world-coding-cup-2026) (originally a Webflow page) built with **Astro 7**, **Tailwind CSS v4**, and **React 19** islands.

## Commands

```sh
npm install
npx astro dev --background # start the background dev server
npx astro dev status       # inspect the background server
npx astro dev logs         # read server logs
npx astro dev stop         # stop the background server
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
- [Button.astro](src/components/ui/Button.astro) — shared links and actions with a circular SVG icon. Use `href` for a link, `variant` for colour treatment, `size="sm"` for cards, `arrow="down"` for in-page jumps, `icon="copy"` for copying text, and `icon="download"` for file downloads. Attributes such as `data-template` and `disabled` pass through to the rendered control. Hover changes colour without moving the button or icon.
- [communications.astro](src/pages/communications.astro) — school toolkit using the shared Header, Footer, and Button. Its photographs use the larger originals of the existing gallery assets and Astro responsive image outputs.
- [TemplateDialog.astro](src/components/ui/TemplateDialog.astro) — shared template modal with editing, clipboard feedback, keyboard navigation and a full-width Copy action.
- [communications.ts](src/data/communications.ts) — the seven complete prototype templates and the story submission email (`stories@worldcodingcup.com`). Set `storySubmissionEmail` to `null` to show the disabled “opening soon” state.
- [public/downloads/](public/downloads/) — the resource library files supplied by the client. Card sizes are read at build time; see the handover for how to update the packs.
- [WccLogo.astro](src/components/brand/WccLogo.astro) and [AmazonLogo.astro](src/components/brand/AmazonLogo.astro) — shared brand lockups. Pass `title` to `WccLogo` when it should be announced; it is decorative otherwise.
- [Communications handover](docs/communications-handover.md) — audit results, missing files and client decisions needed before launch.

## Leaderboard

[leaderboard.astro](src/pages/leaderboard.astro) is the race-day board from the Figma frame *CodeCup Football Champions → Desktop (183:2078)*.

- [Leaderboard.tsx](src/components/react/Leaderboard.tsx) (`client:load`) polls the results feed, pauses while the tab is hidden, refreshes as soon as it is visible again, keeps the last good standings if a request fails, and slides rows to their new positions when ranks change (skipped under reduced motion).
- [leaderboard.ts](src/data/leaderboard.ts) defines the feed contract (`LeaderboardData`), validates payloads, ranks teams (levels, then who reached that level first) and generates the dummy standings.
- The tournament runs as two regional groups with separate official rankings, shown as tabs: Group 1 (Africa, Europe, Asia & Oceania, tournament 146) and Group 2 (the Americas & Caribbean, tournament 156). The selected tab is kept in the URL, so `/leaderboard#group-2` opens the Americas board. Only the visible group is polled.
- [api/demo/[group].json.ts](src/pages/api/demo/[group].json.ts) serves dummy standings for each group. In `astro dev` they change every minute on a two-hour loop; a build writes one snapshot per group.
- [api/standings/[group].json.ts](src/pages/api/standings/[group].json.ts) is the live results route. It runs as a Vercel function (via `@astrojs/vercel`; every page stays prerendered), calls the Tangible tournament API with the secret `API-KEY` header and caches responses for 30 seconds. `/api/standings/test.json` reads the test tournament (id 1). **Its field mapping still has to be checked against a real response.**
- Flags come from [`flag-icons`](https://github.com/lipis/flag-icons) using each team's ISO country code.

| Env var | Where | Purpose |
| --- | --- | --- |
| `PUBLIC_LEADERBOARD_SOURCE` | Build | `live` reads `/api/standings/[group].json`; anything else uses the dummy feed |
| `PUBLIC_LEADERBOARD_POLL_SECONDS` | Build | Refresh interval (default 60, minimum 10) |
| `LEADERBOARD_API_KEY` | Vercel runtime (secret) | Key for the tournament API. Never prefix it with `PUBLIC_` |

The `PUBLIC_` variables are read at build time, so rebuild after changing them.

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

`_reference/` holds the extracted original markup, CSS, and per-breakpoint screenshots used to build this recreation; `_assets/` holds the original downloaded assets. Neither is part of the build. Retain `_reference/communications-copy-audit.json` as the independent record of the prototype copy used in the toolkit audit.
