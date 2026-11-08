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
- The tournament runs as two regional groups at different times — Group 1 (Africa, Europe, Asia & Oceania, tournament 146) and Group 2 (the Americas & Caribbean, tournament 156) — playing the same competition, so the board shows **one combined list**. `combineStandings` in [tournament.ts](src/data/tournament.ts) merges them by levels completed and keeps each group's official order (most levels, least attempts, fastest time). **Compromise:** the API doesn't send attempts, so when teams from different groups have the same levels they're ordered by elapsed time (`time`, capped at 30 minutes), then Group 1 first; that cross-group order is approximate. If either group fails to load, the whole request fails and the board keeps its last good standings rather than ranking half the field.
- Filters ([filters.ts](src/data/filters.ts)) narrow the list by category, continent and country. They keep the official order and number the remaining teams 1, 2, 3… (with their own podium), so *Junior* shows who leads the juniors; each row's overall rank is in its tooltip and screen-reader label. Continents come from the country code ([continents.ts](src/data/continents.ts)), since the API only sends a country; the Caribbean is listed separately and Central America counts as North America. Each dropdown only offers what the other filters leave available, and a filter the standings can't offer is dropped once they load. Filters are kept in the query string (`/leaderboard?category=junior&continent=africa`).
- [api/demo/[group].json.ts](src/pages/api/demo/[group].json.ts) serves dummy standings: `all.json` (what the page reads, both groups combined) and one per group. In `astro dev` they change every minute on a two-hour loop; a build writes one snapshot of each.
- [api/standings/[group].json.ts](src/pages/api/standings/[group].json.ts) is the live results route. It runs as a Vercel function (via `@astrojs/vercel`; every page stays prerendered), calls the Tangible tournament API with the secret `API-KEY` header and caches responses for 30 seconds. `/api/standings/all.json` (what the page reads) fetches both groups in parallel and combines them; `group-1.json` and `group-2.json` return one group, and `test.json` the test tournament (id 1).
- [tournament.ts](src/data/tournament.ts) maps the API's `{ success: [{ rank, name, country, category, levels_completed, time }] }` to `LeaderboardData` (checked against tournament 1 on 2 November 2026):
  - `rank` is kept as the official position (most levels, least attempts, fastest time).
  - `country` is an English name, mapped to an ISO alpha-2 code for the flag via `Intl.DisplayNames` (current codes only, not retired ones such as UK or YU), plus aliases for ISO official names (`United Kingdom of Great Britain and Northern Ireland`, as the live groups send it), other spellings and the typos in the test data (`Cuprus`, `Bosnia and Hercegovina`). `World` and unknown names keep their text and get a blank flag.
  - `category` is matched to Junior/Senior/Open ignoring case. `levels_completed` becomes `levels`.
  - `time` is elapsed time, not a clock time, so it isn't used or shown (the design only has Category and Levels).
  - The API has no team id and names repeat, so ids come from the name and country, with `-2`, `-3`… for repeats.
  - An empty tournament (`{ "success": [] }`, as 146 and 156 return before race day) shows "No results yet". A payload without `success` returns a 502, and the board keeps its last good standings.
  - Unknown countries or categories and dropped rows are logged by the function (`[standings] … unmapped values`, without team names).
- `npm test` runs the mapping tests against an anonymised sample in [src/data/fixtures](src/data/fixtures/).
- Flags come from [`flag-icons`](https://github.com/lipis/flag-icons) using each team's ISO country code.

| Env var | Where | Purpose |
| --- | --- | --- |
| `PUBLIC_LEADERBOARD_SOURCE` | Build | `live` reads `/api/standings/all.json`; anything else uses the dummy feed |
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
