import type { APIRoute } from "astro";
import { getDemoLeaderboard } from "../../data/leaderboard";

// Dummy feed in the shape the live board expects (see LeaderboardData in
// src/data/leaderboard.ts). In `astro dev` it is evaluated on every request,
// so the standings move between polls. In a static build it is written once
// to /api/leaderboard.json; point PUBLIC_LEADERBOARD_API_URL at the real
// results feed when it exists.
export const GET: APIRoute = () =>
  new Response(JSON.stringify(getDemoLeaderboard()), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
