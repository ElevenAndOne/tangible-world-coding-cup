// Category / continent / country filters for the leaderboard.
//
// Filtering keeps the official order (the API's rank: most levels, least
// attempts, fastest time) and numbers the remaining teams 1, 2, 3…, so
// "Junior" shows who leads the juniors. Each team keeps its overall rank too.
import type { Category, LeaderboardTeam } from "./leaderboard";
import { CONTINENTS, continentFor, type Continent } from "./continents.ts";

export const CATEGORY_OPTIONS: readonly Category[] = ["Junior", "Senior", "Open"];

export interface BoardFilters {
  category: Category | "";
  continent: Continent | "";
  /** Country key: the ISO code, or the country text for teams without one (e.g. "World"). */
  country: string;
}

export const NO_FILTERS: BoardFilters = { category: "", continent: "", country: "" };

export interface RankedTeam extends LeaderboardTeam {
  /** Position within the current filter (equals `rank` when nothing is filtered). */
  position: number;
}

export interface CountryOption {
  key: string;
  name: string;
}

export function countryKey(team: Pick<LeaderboardTeam, "countryCode" | "countryName">): string {
  return team.countryCode || team.countryName.trim().toLowerCase();
}

export function isFiltered(filters: BoardFilters): boolean {
  return Boolean(filters.category || filters.continent || filters.country);
}

/** Teams matching every active filter, in official order, numbered from 1. */
export function filterTeams(teams: LeaderboardTeam[], filters: BoardFilters): RankedTeam[] {
  const filtered = isFiltered(filters);
  return teams
    .filter(
      (team) =>
        (!filters.category || team.category === filters.category) &&
        (!filters.continent || continentFor(team.countryCode) === filters.continent) &&
        (!filters.country || countryKey(team) === filters.country),
    )
    .map((team, index) => ({ ...team, position: filtered ? index + 1 : (team.rank ?? index + 1) }));
}

let displayNames: Intl.DisplayNames | undefined;

/** One name per country, so "Cyprus" and "Cuprus" share an entry. */
function countryLabel(team: LeaderboardTeam): string {
  if (!team.countryCode) return team.countryName || "Unknown";
  try {
    displayNames ??= new Intl.DisplayNames(["en"], { type: "region" });
    return displayNames.of(team.countryCode.toUpperCase()) ?? team.countryName;
  } catch {
    return team.countryName;
  }
}

/** Continents and countries present in a group (countries narrowed to the chosen continent). */
export function filterOptions(
  teams: LeaderboardTeam[],
  continent: BoardFilters["continent"] = "",
): { continents: Continent[]; countries: CountryOption[] } {
  const present = new Set(teams.map((team) => continentFor(team.countryCode)));
  const countries = new Map<string, string>();
  for (const team of teams) {
    if (continent && continentFor(team.countryCode) !== continent) continue;
    const key = countryKey(team);
    if (key && !countries.has(key)) countries.set(key, countryLabel(team));
  }
  return {
    continents: CONTINENTS.filter((c) => present.has(c)),
    countries: [...countries]
      .map(([key, name]) => ({ key, name }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
}

/** Reads filters from a query string (?category=junior&continent=africa&country=za). */
export function parseFilters(search: string): BoardFilters {
  const params = new URLSearchParams(search);
  const pick = <T extends string>(value: string | null, options: readonly T[]) =>
    options.find((option) => option.toLowerCase() === (value ?? "").toLowerCase()) ?? "";
  return {
    category: pick(params.get("category"), CATEGORY_OPTIONS),
    continent: pick(params.get("continent")?.replace(/-/g, " ") ?? null, CONTINENTS),
    country: (params.get("country") ?? "").toLowerCase(),
  };
}

/** The query string for a set of filters ("" when nothing is filtered). */
export function filtersToSearch(filters: BoardFilters): string {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category.toLowerCase());
  if (filters.continent) params.set("continent", filters.continent.toLowerCase().replace(/ /g, "-"));
  if (filters.country) params.set("country", filters.country);
  const search = params.toString();
  return search ? `?${search}` : "";
}
