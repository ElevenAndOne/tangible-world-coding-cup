import type { APIRoute, GetStaticPaths } from "astro";
import { getDemoLeaderboard, LEADERBOARD_GROUPS, type LeaderboardGroupId } from "../../../data/leaderboard";

// Dummy feeds in the shape the live board expects (see LeaderboardData in
// src/data/leaderboard.ts): `all` (what the page reads, both groups combined
// with combineStandings, like the live feed) and one per group. In `astro dev`
// they're evaluated on every request, so the standings move between polls; a
// build writes one snapshot of each. Set PUBLIC_LEADERBOARD_SOURCE=live to use
// the real results via /api/standings/all.json instead.
export const getStaticPaths = (() =>
  [...LEADERBOARD_GROUPS.map(({ id }) => id), "all"].map((group) => ({ params: { group } }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ params }) =>
  new Response(JSON.stringify(getDemoLeaderboard(new Date(), params.group as LeaderboardGroupId | "all")), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
