import type { APIRoute, GetStaticPaths } from "astro";
import { getDemoLeaderboard, LEADERBOARD_GROUPS, type LeaderboardGroupId } from "../../../data/leaderboard";

// Dummy feed for each group, in the shape the live board expects (see
// LeaderboardData in src/data/leaderboard.ts). In `astro dev` it is evaluated
// on every request, so the standings move between polls. A build writes one
// snapshot per group. Set PUBLIC_LEADERBOARD_SOURCE=live to use the real
// results via /api/standings/[group].json instead.
export const getStaticPaths = (() =>
  LEADERBOARD_GROUPS.map(({ id }) => ({ params: { group: id } }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ params }) =>
  new Response(JSON.stringify(getDemoLeaderboard(new Date(), params.group as LeaderboardGroupId)), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
