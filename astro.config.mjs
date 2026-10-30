// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Pages stay static; only routes with `prerender = false` (the leaderboard
  // results proxy) run as Vercel functions.
  adapter: vercel(),
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()]
  }
});