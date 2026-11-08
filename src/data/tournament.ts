// Maps the Tangible tournament results API (getTournamentStandings, from
// Roslyn Tait, 30 October 2026) to the board's LeaderboardData contract.
//
// Upstream shape (checked against tournament 1 on 2 November 2026):
//
//   { "success": [ { "rank": 1, "name": "Team 14", "country": "South Africa",
//                    "category": "Open", "levels_completed": 6, "time": "00:01:05" } ] }
//
// - `rank` is the official position (most levels, least attempts, fastest
//   time) and is kept as the source of truth.
// - `country` is an English country name, sometimes misspelled, or "World"
//   for teams without a country. It is mapped to an ISO alpha-2 code for the
//   flag; unknown names keep their text and get a blank flag.
// - `time` is the team's elapsed time ("HH:MM:SS", capped at the 30-minute
//   race), not a clock time, so it can't fill `lastLevelAt`. It isn't shown;
//   it's kept as `elapsedSeconds` to order teams across groups (see
//   combineStandings).
// - There is no team id and names repeat, so ids are derived from the name and
//   country, with a suffix for repeats.
// - An empty tournament returns { "success": [] }.
//
// Imports use explicit .ts extensions so this file also
// runs under `node --test`.
import { CATEGORIES, type Category, type LeaderboardData, type LeaderboardTeam } from "./leaderboard.ts";
import { continentFor } from "./continents.ts";

/** Category used when the API sends a value we don't know (reported in `issues`). */
const FALLBACK_CATEGORY: Category = "Open";

/** Lowercase, no accents or punctuation, "&" → "and", "saint" → "st". */
function normalise(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\bsaint\b/g, "st")
    .replace(/^the /, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Spellings Intl.DisplayNames doesn't produce, including the typos seen in the
// test tournament ("Cuprus", "Bosnia and Hercegovina").
const ALIASES: Record<string, string> = {
  cuprus: "cy",
  "bosnia and hercegovina": "ba",
  bosnia: "ba",
  usa: "us",
  "united states of america": "us",
  uk: "gb",
  "great britain": "gb",
  england: "gb",
  scotland: "gb",
  wales: "gb",
  "northern ireland": "gb",
  macedonia: "mk",
  "ivory coast": "ci",
  turkey: "tr",
  "czech republic": "cz",
  swaziland: "sz",
  "cape verde": "cv",
  "cabo verde": "cv",
  burma: "mm",
  myanmar: "mm",
  palestine: "ps",
  drc: "cd",
  "dr congo": "cd",
  "democratic republic of the congo": "cd",
  "democratic republic of congo": "cd",
  congo: "cg",
  "republic of the congo": "cg",
  "republic of congo": "cg",
  "south korea": "kr",
  russia: "ru",
  "russian federation": "ru",
  "viet nam": "vn",
  // ISO / UN official names (the live groups use these, e.g. the UK's).
  "united kingdom of great britain and northern ireland": "gb",
  "korea republic of": "kr",
  "republic of korea": "kr",
  "korea democratic people s republic of": "kp",
  "democratic people s republic of korea": "kp",
  "iran islamic republic of": "ir",
  "bolivia plurinational state of": "bo",
  "venezuela bolivarian republic of": "ve",
  "tanzania united republic of": "tz",
  "united republic of tanzania": "tz",
  "congo democratic republic of the": "cd",
  "lao people s democratic republic": "la",
  "syrian arab republic": "sy",
  "moldova republic of": "md",
  "republic of moldova": "md",
  "micronesia federated states of": "fm",
  "palestine state of": "ps",
  "state of palestine": "ps",
  "taiwan province of china": "tw",
  "hong kong sar": "hk",
  "macao sar": "mo",
  "brunei darussalam": "bn",
  "cote d ivoire": "ci",
  "turkiye": "tr",
  "netherlands kingdom of the": "nl",
  "holy see": "va",
};

// Current ISO codes with no inhabited continent in continents.ts.
const NO_CONTINENT_CODES = new Set(["aq", "bv", "cc", "cx", "gs", "hm", "io", "tf"]);

/** A current (not retired) ISO 3166-1 alpha-2 code, so it has a flag. */
function isCurrentCode(code: string): boolean {
  const lower = code.toLowerCase();
  return Boolean(continentFor(lower)) || NO_CONTINENT_CODES.has(lower);
}

let countryIndex: Map<string, string> | undefined;

/** Every English region name Intl knows (e.g. "Bosnia & Herzegovina" → "ba"), plus the aliases. */
function getCountryIndex(): Map<string, string> {
  if (countryIndex) return countryIndex;
  const index = new Map<string, string>();
  const names = new Intl.DisplayNames(["en"], { type: "region" });
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (const a of letters) {
    for (const b of letters) {
      const code = a + b;
      let name: string | undefined;
      try {
        name = names.of(code);
      } catch {
        continue;
      }
      // Only current country codes: Intl also names retired ones (UK, FX, YU,
      // ZR…) and regions (EU, UN, QO), which have no flag.
      if (!name || !isCurrentCode(code)) continue;
      const key = normalise(name);
      if (!index.has(key)) index.set(key, code.toLowerCase());
    }
  }
  for (const [alias, code] of Object.entries(ALIASES)) index.set(alias, code);
  countryIndex = index;
  return index;
}

/** ISO 3166-1 alpha-2 code (lowercase) for a country name or code, or "" when unknown. */
export function countryCodeFor(country: string): string {
  const trimmed = country.trim();
  // Accept a code as-is only if it's current; "UK" falls through to the "uk" alias.
  if (/^[a-z]{2}$/i.test(trimmed) && isCurrentCode(trimmed)) return trimmed.toLowerCase();
  return getCountryIndex().get(normalise(trimmed)) ?? "";
}

/** Names the API uses for teams without a country; these get a blank flag, not a warning. */
const NO_COUNTRY = new Set(["world", "international", ""]);

export interface TournamentMapping {
  data: LeaderboardData;
  /** Values that couldn't be mapped, for the server log (no team names). */
  issues: { unknownCountries: string[]; unknownCategories: string[]; droppedRows: number };
}

/** "00:12:34" → 754 seconds; undefined when the value isn't H:MM:SS / MM:SS. */
export function parseElapsed(value: unknown): number | undefined {
  if (typeof value !== "string") return undefined;
  const parts = value.trim().split(":");
  if (parts.length < 2 || parts.length > 3 || parts.some((part) => !/^\d+$/.test(part))) return undefined;
  return parts.reduce((total, part) => total * 60 + Number(part), 0);
}

function slug(value: string): string {
  return normalise(value).replace(/ /g, "-") || "team";
}

/**
 * Converts a getTournamentStandings response to LeaderboardData.
 * Returns null when the payload isn't the expected shape (no `success` array).
 */
export function mapTournamentStandings(payload: unknown, now: Date = new Date()): TournamentMapping | null {
  if (!payload || typeof payload !== "object") return null;
  const rows = (payload as Record<string, unknown>).success;
  if (!Array.isArray(rows)) return null;

  const unknownCountries = new Set<string>();
  const unknownCategories = new Set<string>();
  const seenIds = new Map<string, number>();
  let droppedRows = 0;

  const teams = rows.flatMap((raw): LeaderboardTeam[] => {
    if (!raw || typeof raw !== "object") {
      droppedRows++;
      return [];
    }
    const row = raw as Record<string, unknown>;
    const name = typeof row.name === "string" ? row.name.trim() : "";
    const levels = Number(row.levels_completed);
    const rank = Number(row.rank);
    if (!name || !Number.isFinite(levels)) {
      droppedRows++;
      return [];
    }

    const countryName = typeof row.country === "string" ? row.country.trim() : "";
    const countryCode = countryCodeFor(countryName);
    if (!countryCode && !NO_COUNTRY.has(countryName.toLowerCase())) unknownCountries.add(countryName);

    const rawCategory = String(row.category ?? "").trim();
    const category = CATEGORIES.find((c) => c.toLowerCase() === rawCategory.toLowerCase());
    if (!category) unknownCategories.add(rawCategory);

    const base = `${slug(name)}-${countryCode || slug(countryName || "none")}`;
    const repeat = (seenIds.get(base) ?? 0) + 1;
    seenIds.set(base, repeat);

    return [
      {
        id: repeat === 1 ? base : `${base}-${repeat}`,
        name,
        countryCode,
        countryName,
        category: category ?? FALLBACK_CATEGORY,
        levels,
        rank: Number.isInteger(rank) && rank > 0 ? rank : undefined,
        elapsedSeconds: parseElapsed(row.time),
      },
    ];
  });

  // Keep the API's order (its rank order); ids for repeated names follow it.
  teams.sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity));

  return {
    data: { updatedAt: now.toISOString(), teams },
    issues: {
      unknownCountries: [...unknownCountries],
      unknownCategories: [...unknownCategories],
      droppedRows,
    },
  };
}

/**
 * Combines the groups' standings into one ranked list.
 *
 * Each group is already in official order (most levels, least attempts,
 * fastest time), and that order is kept. The groups are merged by levels, so
 * the combined list is exact on levels. The API doesn't send attempts, so
 * when teams from different groups have the same levels they're ordered by
 * elapsed time, then by group order. Ranks are renumbered 1, 2, 3…
 */
export function combineStandings(groups: LeaderboardTeam[][]): LeaderboardTeam[] {
  const heads = groups.map(() => 0);
  const combined: LeaderboardTeam[] = [];
  const ahead = (a: LeaderboardTeam, b: LeaderboardTeam) =>
    a.levels !== b.levels
      ? a.levels > b.levels
      : (a.elapsedSeconds ?? Infinity) < (b.elapsedSeconds ?? Infinity);

  for (;;) {
    let next = -1;
    groups.forEach((teams, group) => {
      const team = teams[heads[group]];
      if (team && (next < 0 || ahead(team, groups[next][heads[next]]))) next = group;
    });
    if (next < 0) break;
    combined.push(groups[next][heads[next]++]);
  }
  return combined.map((team, index) => ({ ...team, rank: index + 1 }));
}
