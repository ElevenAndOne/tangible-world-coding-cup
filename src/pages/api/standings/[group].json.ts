import type { APIRoute } from "astro";
import { getSecret } from "astro:env/server";
import { combineStandings, LEADERBOARD_GROUPS, type LeaderboardData } from "../../../data/leaderboard";
import { mapTournamentStandings } from "../../../data/tournament";

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
// A Map, so names like "constructor" can't pass as a group.
const TOURNAMENTS = new Map<string, number>([
  ...LEADERBOARD_GROUPS.map(({ id, tournamentId }) => [id, tournamentId] as const),
  ["test", 1],
]);

const json = (body: unknown, status: number, cache = "no-store") =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": cache },
  });

class FeedError extends Error {}

/** Fetches one tournament and converts it to LeaderboardData (see src/data/tournament.ts). */
async function fetchStandings(
  tournamentId: number,
  label: string,
  apiKey: string,
  cancel?: AbortSignal,
): Promise<LeaderboardData> {
  const timeout = AbortSignal.timeout(10_000);
  let upstream: Response;
  try {
    upstream = await fetch(`${API_BASE}?tournament_id=${tournamentId}`, {
      headers: { "API-KEY": apiKey, Accept: "application/json" },
      signal: cancel ? AbortSignal.any([timeout, cancel]) : timeout,
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
  const tournamentId = TOURNAMENTS.get(group);
  if (group !== COMBINED && tournamentId === undefined) return json({ error: "Unknown group" }, 404);

  // Read at request time, so changing the key in Vercel needs no rebuild.
  const apiKey = getSecret("LEADERBOARD_API_KEY");
  if (!apiKey) return json({ error: "Results feed is not configured" }, 503);

  try {
    let data: LeaderboardData;
    if (group === COMBINED) {
      // Both groups play the same competition at different times, so the board
      // shows one list. If either group fails, the whole request fails and the
      // board keeps its last good standings, rather than ranking half the field.
      // When one group fails, cancel the other group's request too.
      const cancel = new AbortController();
      const results = await Promise.all(
        LEADERBOARD_GROUPS.map(({ id, tournamentId }) =>
          fetchStandings(tournamentId, id, apiKey, cancel.signal).catch((error) => {
            cancel.abort();
            throw error;
          }),
        ),
      );
      const teams = combineStandings(LEADERBOARD_GROUPS.map(({ id }, index) => ({ id, teams: results[index].teams })));
      data = { updatedAt: new Date().toISOString(), teams };
    } else {
      data = await fetchStandings(tournamentId!, group, apiKey);
    }

    // Every viewer polls this route; a short shared cache (per URL) means the
    // page's all.json costs about one request per tournament every 30 seconds.
    // The single-group and test URLs are cached separately and are only for checks.
    return json(data, 200, "public, s-maxage=30, stale-while-revalidate=30");
  } catch (error) {
    return json({ error: error instanceof FeedError ? error.message : "Results feed failed" }, 502);
  }
};
