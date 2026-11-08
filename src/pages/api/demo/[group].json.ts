import type { APIRoute, GetStaticPaths } from "astro";
import { getDemoLeaderboard, LEADERBOARD_GROUPS, type LeaderboardGroupId } from "../../../data/leaderboard";

// Dummy feed for the combined board and each group, in the shape the live board expects (see
// LeaderboardData in src/data/leaderboard.ts). In `astro dev` it is evaluated
// on every request, so the standings move between polls. A build writes one
// snapshot per group. Set PUBLIC_LEADERBOARD_SOURCE=live to use the real
// results via /api/standings/[group].json instead.
// `all` combines both groups, as the page shows them; each group is also available.
export const getStaticPaths = (() =>
  [...LEADERBOARD_GROUPS.map(({ id }) => id), "all"].map((group) => ({ params: { group } }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ params }) =>
  new Response(JSON.stringify(getDemoLeaderboard(new Date(), params.group as LeaderboardGroupId | "all")), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
