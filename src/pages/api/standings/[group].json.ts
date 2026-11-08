import type { APIRoute } from "astro";
import { getSecret } from "astro:env/server";
import { LEADERBOARD_GROUPS, type LeaderboardData } from "../../../data/leaderboard";
import { combineStandings, mapTournamentStandings } from "../../../data/tournament";

// Server-side proxy for the Tangible tournament results API (endpoints from
// Roslyn Tait, 30 October 2026). The API needs a secret API-KEY header, so the
// browser calls this route instead and the key never reaches the page.
//
// Set LEADERBOARD_API_KEY in the hosting environment (Vercel project settings).
// It is read at request time and must not be prefixed with PUBLIC_.
export const prerender = false;

const API_BASE = "https://tournament.tangible-games.com/api/v1/getTournamentStandings";

// `all` (what the page reads) combines both groups into one list. Each group
// is also available on its own, plus Roslyn's test tournament (id 1).
const COMBINED = "all";
const TOURNAMENTS: Record<string, number> = {
  ...Object.fromEntries(LEADERBOARD_GROUPS.map(({ id, tournamentId }) => [id, tournamentId])),
  test: 1,
};

const json = (body: unknown, status: number, cache = "no-store") =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": cache },
  });

class FeedError extends Error {}

/** Fetches one tournament and converts it to LeaderboardData (see src/data/tournament.ts). */
async function fetchStandings(tournamentId: number, label: string, apiKey: string): Promise<LeaderboardData> {
  let upstream: Response;
  try {
    upstream = await fetch(`${API_BASE}?tournament_id=${tournamentId}`, {
      headers: { "API-KEY": apiKey, Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new FeedError("Results feed is unreachable");
  }
  if (!upstream.ok) throw new FeedError(`Results feed returned ${upstream.status}`);

  // { success: [{ rank, name, country, category, levels_completed, time }] }.
  // Before race day the groups return { success: [] } ("No results yet").
  const mapped = mapTournamentStandings(await upstream.json().catch(() => null));
  if (!mapped) throw new FeedError("Results feed returned an unexpected format");

  const { unknownCountries, unknownCategories, droppedRows } = mapped.issues;
  if (unknownCountries.length || unknownCategories.length || droppedRows) {
    console.warn(`[standings] ${label}: unmapped values`, mapped.issues);
  }
  return mapped.data;
}

export const GET: APIRoute = async ({ params }) => {
  const group = params.group ?? "";
  if (group !== COMBINED && !TOURNAMENTS[group]) return json({ error: "Unknown group" }, 404);

  // Read at request time, so changing the key in Vercel needs no rebuild.
  const apiKey = getSecret("LEADERBOARD_API_KEY");
  if (!apiKey) return json({ error: "Results feed is not configured" }, 503);

  try {
    let data: LeaderboardData;
    if (group === COMBINED) {
      // Both groups play the same competition at different times, so the board
      // shows one list. If either group fails, the whole request fails and the
      // board keeps its last good standings, rather than ranking half the field.
      const results = await Promise.all(
        LEADERBOARD_GROUPS.map(({ id, tournamentId }) => fetchStandings(tournamentId, id, apiKey)),
      );
      const teams = combineStandings(
        // Prefix ids by group: the same team name can appear in both.
        results.map((result, index) =>
          result.teams.map((team) => ({ ...team, id: `${LEADERBOARD_GROUPS[index].id}-${team.id}` })),
        ),
      );
      data = { updatedAt: new Date().toISOString(), teams };
    } else {
      data = await fetchStandings(TOURNAMENTS[group], group, apiKey);
    }

    // Every viewer polls this route; a short shared cache keeps the load on the
    // tournament API to about one request per tournament every 30 seconds.
    return json(data, 200, "public, s-maxage=30, stale-while-revalidate=30");
  } catch (error) {
    return json({ error: error instanceof FeedError ? error.message : "Results feed failed" }, 502);
  }
};
