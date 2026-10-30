// Leaderboard contract shared by the API routes (src/pages/api/demo and src/pages/api/standings)
// and the live board (src/components/react/Leaderboard.tsx).
//
// The live results feed only needs to return JSON in the `LeaderboardData`
// shape. Ranks are optional: when they're missing the board ranks teams by
// levels completed (highest first), then by who reached that level first.

export type Category = "Junior" | "Senior" | "Open";

export interface LeaderboardTeam {
  id: string;
  name: string;
  /** School or organisation the team represents. */
  organisation?: string;
  /** ISO 3166-1 alpha-2 country code, e.g. "za". Drives the flag. */
  countryCode: string;
  countryName: string;
  category: Category;
  /** Levels completed so far. */
  levels: number;
  /** ISO timestamp of the team's latest completed level (tie-breaker). */
  lastLevelAt?: string;
  /** 1-based position. Filled in by `rankTeams` when the feed omits it. */
  rank?: number;
}

export interface LeaderboardData {
  /** ISO timestamp of when the feed produced this snapshot. */
  updatedAt: string;
  teams: LeaderboardTeam[];
}

const CATEGORIES: readonly Category[] = ["Junior", "Senior", "Open"];

/**
 * The tournament runs as two regional groups, each with its own official
 * ranking (Roslyn Tait, 30 October 2026). The page shows them as tabs.
 */
export const LEADERBOARD_GROUPS = [
  { id: "group-1", name: "Group 1", region: "Africa, Europe, Asia & Oceania", tournamentId: 146 },
  { id: "group-2", name: "Group 2", region: "The Americas & Caribbean", tournamentId: 156 },
] as const;

export type LeaderboardGroupId = (typeof LEADERBOARD_GROUPS)[number]["id"];

function compareTeams(a: LeaderboardTeam, b: LeaderboardTeam): number {
  if (a.rank != null && b.rank != null && a.rank !== b.rank) return a.rank - b.rank;
  if (b.levels !== a.levels) return b.levels - a.levels;
  const aTime = a.lastLevelAt ? Date.parse(a.lastLevelAt) : Infinity;
  const bTime = b.lastLevelAt ? Date.parse(b.lastLevelAt) : Infinity;
  if (aTime !== bTime) return aTime - bTime;
  return a.name.localeCompare(b.name);
}

/** Sorts teams and assigns sequential ranks (keeping any ranks the feed supplied). */
export function rankTeams(teams: LeaderboardTeam[]): LeaderboardTeam[] {
  const allRanked = teams.every((team) => team.rank != null);
  return [...teams]
    .sort(compareTeams)
    .map((team, index) => ({ ...team, rank: allRanked ? team.rank : index + 1 }));
}

/** Validates an unknown API payload, dropping malformed rows instead of failing the whole board. */
export function parseLeaderboard(payload: unknown): LeaderboardData | null {
  if (!payload || typeof payload !== "object") return null;
  const { updatedAt, teams } = payload as Record<string, unknown>;
  if (!Array.isArray(teams)) return null;

  const valid = teams.flatMap((raw): LeaderboardTeam[] => {
    if (!raw || typeof raw !== "object") return [];
    const team = raw as Record<string, unknown>;
    const levels = Number(team.levels);
    if (typeof team.id !== "string" && typeof team.id !== "number") return [];
    if (typeof team.name !== "string" || !Number.isFinite(levels)) return [];
    const category = CATEGORIES.find(
      (c) => c.toLowerCase() === String(team.category ?? "").toLowerCase(),
    );
    const rank = Number(team.rank);

    return [
      {
        id: String(team.id),
        name: team.name,
        organisation: typeof team.organisation === "string" ? team.organisation : undefined,
        countryCode: String(team.countryCode ?? "").toLowerCase(),
        countryName: String(team.countryName ?? ""),
        category: category ?? "Junior",
        levels,
        lastLevelAt: typeof team.lastLevelAt === "string" ? team.lastLevelAt : undefined,
        rank: Number.isInteger(rank) && rank > 0 ? rank : undefined,
      },
    ];
  });

  return {
    updatedAt: typeof updatedAt === "string" ? updatedAt : new Date().toISOString(),
    teams: rankTeams(valid),
  };
}

// ---------------------------------------------------------------------------
// Dummy data — stands in for the live results feed until it exists.
// Team names are placeholders; the country spread mirrors the 30-country,
// five-continent field of the 2025 World Coding Cup.
// ---------------------------------------------------------------------------

type DemoTeam = [name: string, countryCode: string, countryName: string, category: Category];

const DEMO_TEAMS: DemoTeam[] = [
  ["Code Cheetahs", "za", "South Africa", "Open"],
  ["Palanca Pixels", "ao", "Angola", "Open"],
  ["Island Loopers", "bm", "Bermuda", "Open"],
  ["Victoria Falls Coders", "zw", "Zimbabwe", "Junior"],
  ["Roma Robots", "it", "Italy", "Junior"],
  ["Kabul Algorithmics", "af", "Afghanistan", "Junior"],
  ["Maseru Mountaineers", "ls", "Lesotho", "Junior"],
  ["Madrid Bit Builders", "es", "Spain", "Junior"],
  ["Stockholm Sprinters", "se", "Sweden", "Junior"],
  ["Seattle Speed Stars", "us", "United States", "Junior"],
  ["KwaDukuza Kodez", "za", "South Africa", "Junior"],
  ["Gaborone Gears", "bw", "Botswana", "Junior"],
  ["Jakarta Juara", "id", "Indonesia", "Senior"],
  ["Nairobi Ninjas", "ke", "Kenya", "Senior"],
  ["Lagos Logic", "ng", "Nigeria", "Senior"],
  ["Accra Arrows", "gh", "Ghana", "Junior"],
  ["Windhoek Wizards", "na", "Namibia", "Senior"],
  ["Maputo Makers", "mz", "Mozambique", "Junior"],
  ["Addis Ascend", "et", "Ethiopia", "Senior"],
  ["Kigali Kites", "rw", "Rwanda", "Junior"],
  ["Kampala Crafters", "ug", "Uganda", "Senior"],
  ["Dar Debuggers", "tz", "Tanzania", "Junior"],
  ["Cairo Circuit", "eg", "Egypt", "Open"],
  ["Rabat Runners", "ma", "Morocco", "Senior"],
  ["Pune Pathfinders", "in", "India", "Senior"],
  ["São Paulo Sparks", "br", "Brazil", "Junior"],
  ["London Loops", "gb", "United Kingdom", "Senior"],
  ["Berlin Bytes", "de", "Germany", "Open"],
  ["Manila Movers", "ph", "Philippines", "Junior"],
  ["Lilongwe Lions", "mw", "Malawi", "Junior"],
  ["Lusaka Launchers", "zm", "Zambia", "Senior"],
  ["Yaoundé Yielders", "cm", "Cameroon", "Junior"],
  ["Dakar Drivers", "sn", "Senegal", "Senior"],
  ["Gqeberha Gamechangers", "za", "South Africa", "Senior"],
  ["Surabaya Stars", "id", "Indonesia", "Junior"],
  ["Mombasa Makers", "ke", "Kenya", "Junior"],
  ["Toronto Tilers", "ca", "Canada", "Junior"],
  ["Monterrey Movers", "mx", "Mexico", "Open"],
  ["Kingston Coders", "jm", "Jamaica", "Junior"],
  ["Bogotá Builders", "co", "Colombia", "Senior"],
  ["Buenos Aires Bits", "ar", "Argentina", "Junior"],
  ["Santiago Sparks", "cl", "Chile", "Senior"],
  ["Port of Spain Pathfinders", "tt", "Trinidad and Tobago", "Junior"],
  ["Lima Loopers", "pe", "Peru", "Open"],
  ["Austin Algorithms", "us", "United States", "Senior"],
  ["Rio Racers", "br", "Brazil", "Open"],
];

const AMERICAS = new Set(["us", "ca", "mx", "jm", "co", "ar", "cl", "tt", "pe", "br"]);

// Each demo "race" loops over two hours so a board left open keeps moving.
const DEMO_LOOP_MINUTES = 120;

/** Small deterministic PRNG so every request in a minute agrees on the standings. */
function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Dummy standings that progress with the clock, so polling visibly changes the board. */
export function getDemoLeaderboard(
  now: Date = new Date(),
  group: LeaderboardGroupId = "group-1",
): LeaderboardData {
  const minute = Math.floor(now.getTime() / 60_000);
  const elapsed = minute % DEMO_LOOP_MINUTES;
  const raceStart = (minute - elapsed) * 60_000;

  const inGroup = DEMO_TEAMS.filter(([, countryCode]) =>
    group === "group-2" ? AMERICAS.has(countryCode) : !AMERICAS.has(countryCode),
  );

  const teams = inGroup.map(([name, countryCode, countryName, category], index) => {
    const random = seeded(index + 1 + (group === "group-2" ? 100 : 0));
    const head = Math.floor(random() * 6);
    // Earlier teams in the list are a touch faster, so the dummy podium starts
    // close to the Figma layout before the race shuffles it.
    const pace = 0.32 + random() * 0.18 + (inGroup.length - index) * 0.006;
    const levels = head + Math.floor(pace * elapsed);
    const minutesSinceLevel = Math.min(elapsed, Math.floor(random() * 3));

    return {
      id: `${group}-team-${index + 1}`,
      name,
      countryCode,
      countryName,
      category,
      levels,
      lastLevelAt: new Date(raceStart + (elapsed - minutesSinceLevel) * 60_000).toISOString(),
    } satisfies LeaderboardTeam;
  });

  return { updatedAt: now.toISOString(), teams: rankTeams(teams) };
}
