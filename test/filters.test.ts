import assert from "node:assert/strict";
import { test } from "node:test";
import type { LeaderboardTeam } from "../src/data/leaderboard.ts";
import { continentFor } from "../src/data/continents.ts";
import {
  availableFilters,
  filterOptions,
  filterTeams,
  filtersToSearch,
  NO_FILTERS,
  parseFilters,
} from "../src/data/filters.ts";

const team = (rank: number, category: LeaderboardTeam["category"], countryCode: string, countryName: string) =>
  ({ id: `t${rank}`, name: `Team ${rank}`, rank, levels: 10 - rank, category, countryCode, countryName }) satisfies LeaderboardTeam;

const teams = [
  team(1, "Open", "", "World"),
  team(2, "Junior", "za", "South Africa"),
  team(3, "Senior", "de", "Germany"),
  team(4, "Junior", "cy", "Cuprus"),
  team(5, "Junior", "za", "South Africa"),
  team(6, "Open", "cy", "Cyprus"),
];

test("no filters keeps the official ranks", () => {
  assert.deepEqual(filterTeams(teams, NO_FILTERS).map((t) => t.position), [1, 2, 3, 4, 5, 6]);
});

test("a category filter keeps the official order and numbers from 1", () => {
  const juniors = filterTeams(teams, { ...NO_FILTERS, category: "Junior" });
  assert.deepEqual(juniors.map((t) => [t.position, t.rank]), [[1, 2], [2, 4], [3, 5]]);
});

test("continent and country filters combine with category", () => {
  const africanJuniors = filterTeams(teams, { category: "Junior", continent: "Africa", country: "" });
  assert.deepEqual(africanJuniors.map((t) => t.id), ["t2", "t5"]);
  const cyprus = filterTeams(teams, { ...NO_FILTERS, country: "cy" });
  assert.deepEqual(cyprus.map((t) => t.id), ["t4", "t6"], "both spellings of Cyprus");
  const world = filterTeams(teams, { ...NO_FILTERS, country: "world" });
  assert.deepEqual(world.map((t) => t.id), ["t1"]);
  assert.deepEqual(filterTeams(teams, { ...NO_FILTERS, continent: "Oceania" }), []);
});

test("options list only what the group has, one entry per country", () => {
  const { continents, countries } = filterOptions(teams);
  assert.deepEqual(continents, ["Africa", "Asia", "Europe"]);
  assert.deepEqual(countries.map((c) => c.key), ["cy", "de", "za", "world"]);
  assert.deepEqual(filterOptions(teams, { continent: "Africa" }).countries, [{ key: "za", name: "South Africa" }]);
  // Germany only has a Senior team, so it isn't offered with Junior.
  assert.deepEqual(filterOptions(teams, { category: "Junior" }).countries.map((c) => c.key), ["cy", "za"]);
  assert.deepEqual(filterOptions(teams, { category: "Senior" }).continents, ["Europe"]);
});

test("filters round-trip through the query string", () => {
  const filters = { category: "Junior", continent: "North America", country: "us" } as const;
  assert.equal(filtersToSearch(filters), "?category=junior&continent=north-america&country=us");
  assert.deepEqual(parseFilters(filtersToSearch(filters)), filters);
  assert.deepEqual(parseFilters("?category=masters&continent=atlantis"), NO_FILTERS);
  assert.equal(filtersToSearch(NO_FILTERS), "");
});

test("continents cover the tournament's regions", () => {
  assert.equal(continentFor("za"), "Africa");
  assert.equal(continentFor("cy"), "Asia");
  assert.equal(continentFor("ba"), "Europe");
  assert.equal(continentFor("jm"), "Caribbean");
  assert.equal(continentFor("br"), "South America");
  assert.equal(continentFor("au"), "Oceania");
  assert.equal(continentFor(""), undefined);
});

test("teams tied on the official rank share a filtered position", () => {
  const tied = [team(1, "Senior", "de", "Germany"), team(2, "Junior", "za", "South Africa"), { ...team(3, "Junior", "ke", "Kenya"), rank: 2 }, team(4, "Junior", "gh", "Ghana")];
  assert.deepEqual(filterTeams(tied, { ...NO_FILTERS, category: "Junior" }).map((t) => t.position), [1, 1, 3]);
});

test("filters the group can't offer are dropped", () => {
  // A shared link for Group 1's Africa, opened on a group without it.
  const americas = [team(1, "Junior", "us", "United States"), team(2, "Senior", "br", "Brazil")];
  assert.deepEqual(availableFilters(americas, { category: "Junior", continent: "Africa", country: "za" }), {
    category: "Junior",
    continent: "",
    country: "",
  });
  // A category that rules the chosen country out clears the country only.
  assert.deepEqual(availableFilters(teams, { category: "Junior", continent: "Europe", country: "de" }), {
    category: "Junior",
    continent: "",
    country: "",
  });
  assert.deepEqual(availableFilters(teams, { category: "Senior", continent: "Europe", country: "de" }), {
    category: "Senior",
    continent: "Europe",
    country: "de",
  });
  // Unchanged filters keep their identity, and an empty (loading) group changes nothing.
  const kept = { ...NO_FILTERS, category: "Junior" as const };
  assert.equal(availableFilters(teams, kept), kept);
  const pending = { ...NO_FILTERS, country: "za" };
  assert.equal(availableFilters([], pending), pending);
});
