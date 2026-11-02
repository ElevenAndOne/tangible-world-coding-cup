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
// - `time` is the team's elapsed time, not a clock time, so it can't fill
//   `lastLevelAt`. The board doesn't show it (the design has Category and
//   Levels columns only) and ordering comes from `rank`.
// - There is no team id and names repeat, so ids are derived from the name and
//   country, with a suffix for repeats.
// - An empty tournament returns { "success": [] }.
//
// Only types are imported, so this file also runs under `node --test`.
import type { Category, LeaderboardData, LeaderboardTeam } from "./leaderboard";

const CATEGORIES: readonly Category[] = ["Junior", "Senior", "Open"];

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
  palestine: "ps",
  drc: "cd",
  "dr congo": "cd",
  "democratic republic of the congo": "cd",
  "democratic republic of congo": "cd",
  congo: "cg",
  "republic of the congo": "cg",
  "republic of congo": "cg",
  "south korea": "kr",
  "korea republic of": "kr",
  russia: "ru",
  "russian federation": "ru",
  "viet nam": "vn",
};

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
      // Unassigned codes echo back; ZZ/QO/EU/UN etc. aren't countries.
      if (!name || name === code || /unknown|outlying|european union|united nations|pseudo/i.test(name)) continue;
      index.set(normalise(name), code.toLowerCase());
    }
  }
  for (const [alias, code] of Object.entries(ALIASES)) index.set(alias, code);
  countryIndex = index;
  return index;
}

/** ISO 3166-1 alpha-2 code (lowercase) for a country name or code, or "" when unknown. */
export function countryCodeFor(country: string): string {
  const trimmed = country.trim();
  if (/^[a-z]{2}$/i.test(trimmed)) return trimmed.toLowerCase();
  return getCountryIndex().get(normalise(trimmed)) ?? "";
}

/** Names the API uses for teams without a country; these get a blank flag, not a warning. */
const NO_COUNTRY = new Set(["world", "international", ""]);

export interface TournamentMapping {
  data: LeaderboardData;
  /** Values that couldn't be mapped, for the server log (no team names). */
  issues: { unknownCountries: string[]; unknownCategories: string[]; droppedRows: number };
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
