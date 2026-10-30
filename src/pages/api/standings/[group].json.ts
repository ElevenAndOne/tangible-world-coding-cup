import type { APIRoute } from "astro";
import { getSecret } from "astro:env/server";
import { LEADERBOARD_GROUPS } from "../../../data/leaderboard";

// Server-side proxy for the Tangible tournament results API (endpoints from
// Roslyn Tait, 30 October 2026). The API needs a secret API-KEY header, so the
// browser calls this route instead and the key never reaches the page.
//
// Set LEADERBOARD_API_KEY in the hosting environment (Vercel project settings).
// It is read at request time and must not be prefixed with PUBLIC_.
export const prerender = false;

const API_BASE = "https://tournament.tangible-games.com/api/v1/getTournamentStandings";

// The two live groups, plus Roslyn's test tournament (id 1) for checking the
// response format before race day.
const TOURNAMENTS: Record<string, number> = {
  ...Object.fromEntries(LEADERBOARD_GROUPS.map(({ id, tournamentId }) => [id, tournamentId])),
  test: 1,
};

const json = (body: unknown, status: number, cache = "no-store") =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": cache },
  });

export const GET: APIRoute = async ({ params }) => {
  const tournamentId = TOURNAMENTS[params.group ?? ""];
  if (!tournamentId) return json({ error: "Unknown group" }, 404);

  // Read at request time, so changing the key in Vercel needs no rebuild.
  const apiKey = getSecret("LEADERBOARD_API_KEY");
  if (!apiKey) return json({ error: "Results feed is not configured" }, 503);

  try {
    const upstream = await fetch(`${API_BASE}?tournament_id=${tournamentId}`, {
      headers: { "API-KEY": apiKey, Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!upstream.ok) return json({ error: `Results feed returned ${upstream.status}` }, 502);

    // TODO(field mapping): convert Roslyn's response to LeaderboardData once a
    // real sample has been checked. Until then the payload is passed through.
    const data = await upstream.json();

    // Every viewer polls this route; a short shared cache keeps the load on the
    // tournament API to roughly one request per group every 30 seconds.
    return json(data, 200, "public, s-maxage=30, stale-while-revalidate=30");
  } catch {
    return json({ error: "Results feed is unreachable" }, 502);
  }
};
