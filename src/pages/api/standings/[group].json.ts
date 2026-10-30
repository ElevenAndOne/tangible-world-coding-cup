import type { APIRoute } from "astro";

// Server-side proxy for the Tangible tournament results API (endpoints from
// Roslyn Tait, 30 October 2026). The API needs a secret API-KEY header, so the
// browser calls this route instead and the key never reaches the page.
//
// Set LEADERBOARD_API_KEY in the hosting environment (Vercel project settings).
// It is read at request time and must not be prefixed with PUBLIC_.
export const prerender = false;

const API_BASE = "https://tournament.tangible-games.com/api/v1/getTournamentStandings";

const TOURNAMENTS: Record<string, { id: number; label: string }> = {
  "group-1": { id: 146, label: "Group 1 · Africa, Europe, Asia and Oceania" },
  "group-2": { id: 156, label: "Group 2 · North and South America and the Caribbean" },
  test: { id: 1, label: "Test data" },
};

const json = (body: unknown, status: number, cache = "no-store") =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": cache },
  });

export const GET: APIRoute = async ({ params }) => {
  const tournament = TOURNAMENTS[params.group ?? ""];
  if (!tournament) return json({ error: "Unknown group" }, 404);

  const apiKey = process.env.LEADERBOARD_API_KEY ?? import.meta.env.LEADERBOARD_API_KEY;
  if (!apiKey) return json({ error: "Results feed is not configured" }, 503);

  try {
    const upstream = await fetch(`${API_BASE}?tournament_id=${tournament.id}`, {
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
