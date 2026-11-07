// Category / continent / country filters for the leaderboard.
//
// Filtering keeps the official order (the API's rank: most levels, least
// attempts, fastest time) and numbers the remaining teams 1, 2, 3…, so
// "Junior" shows who leads the juniors. Each team keeps its overall rank too.
import { CATEGORIES, type Category, type LeaderboardTeam } from "./leaderboard.ts";
import { CONTINENTS, continentFor, type Continent } from "./continents.ts";

export const CATEGORY_OPTIONS = CATEGORIES;

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

/**
 * Teams matching every active filter, in official order, numbered from 1.
 * Teams that tie on the official rank share a position (1, 2, 2, 4).
 */
export function filterTeams(teams: LeaderboardTeam[], filters: BoardFilters): RankedTeam[] {
  const filtered = isFiltered(filters);
  const matches = teams.filter(
    (team) =>
      (!filters.category || team.category === filters.category) &&
      (!filters.continent || continentFor(team.countryCode) === filters.continent) &&
      (!filters.country || countryKey(team) === filters.country),
  );
  const ranked: RankedTeam[] = [];
  matches.forEach((team, index) => {
    const previous = ranked[index - 1];
    const tied = previous && team.rank != null && team.rank === previous.rank;
    const position = !filtered ? (team.rank ?? index + 1) : tied ? previous.position : index + 1;
    ranked.push({ ...team, position });
  });
  return ranked;
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

/**
 * Continents and countries present in a group. Each list is narrowed by the
 * other filters, so it never offers a choice that would leave the board empty.
 */
export function filterOptions(
  teams: LeaderboardTeam[],
  { category = "", continent = "" }: Partial<BoardFilters> = {},
): { continents: Continent[]; countries: CountryOption[] } {
  const inCategory = category ? teams.filter((team) => team.category === category) : teams;
  const present = new Set(inCategory.map((team) => continentFor(team.countryCode)));
  const countries = new Map<string, string>();
  for (const team of inCategory) {
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

/**
 * Drops a continent or country the current group can't offer (e.g. from a
 * shared link, or after switching tab). Returns the same object when nothing changes.
 */
export function availableFilters(teams: LeaderboardTeam[], filters: BoardFilters): BoardFilters {
  if (!teams.length) return filters;
  let next = filters;
  const { continents } = filterOptions(teams, { category: filters.category });
  if (next.continent && !continents.includes(next.continent)) next = { ...next, continent: "" };
  const { countries } = filterOptions(teams, next);
  if (next.country && !countries.some((c) => c.key === next.country)) next = { ...next, country: "" };
  return next;
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
