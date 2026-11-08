// Run with `npm test` (Node's built-in test runner with type stripping).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import type { LeaderboardTeam } from "../src/data/leaderboard.ts";
import { combineStandings } from "../src/data/leaderboard.ts";
import { countryCodeFor, mapTournamentStandings, parseElapsed } from "../src/data/tournament.ts";

// Trimmed from the test tournament (id 1) on 2 November 2026, team names anonymised.
const sample = JSON.parse(
  readFileSync(new URL("../src/data/fixtures/tournament-standings-sample.json", import.meta.url), "utf8"),
);
const now = new Date("2026-11-05T09:00:00Z");

test("maps every row and keeps the API's rank", () => {
  const mapped = mapTournamentStandings(sample, now);
  assert.ok(mapped);
  const { teams, updatedAt } = mapped.data;
  assert.equal(updatedAt, now.toISOString());
  assert.equal(teams.length, sample.success.length);
  assert.deepEqual(
    teams.map((t) => t.rank),
    sample.success.map((r: { rank: number }) => r.rank),
  );
  assert.deepEqual(teams[1], {
    id: "sample-team-2-mk",
    name: "Sample Team 2",
    countryCode: "mk",
    countryName: "North Macedonia",
    category: "Open",
    levels: 6,
    rank: 2,
    elapsedSeconds: 130,
  });
});

test("gives repeated team names unique ids", () => {
  const ids = mapTournamentStandings(sample, now)!.data.teams.map((t) => t.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(
    ids.filter((id) => id.startsWith("sample-library")),
    ["sample-library-za", "sample-library-za-2", "sample-library-za-3", "sample-library-za-4"],
  );
});

test("maps country names, including the misspellings in the test data", () => {
  assert.equal(countryCodeFor("South Africa"), "za");
  assert.equal(countryCodeFor("Bosnia and Herzegovina"), "ba");
  assert.equal(countryCodeFor("Bosnia and Hercegovina"), "ba");
  assert.equal(countryCodeFor("Cuprus"), "cy");
  assert.equal(countryCodeFor("Cyprus"), "cy");
  assert.equal(countryCodeFor("North Macedonia"), "mk");
  assert.equal(countryCodeFor("Côte d'Ivoire"), "ci");
  assert.equal(countryCodeFor("Trinidad and Tobago"), "tt");
  assert.equal(countryCodeFor("United States"), "us");
  assert.equal(countryCodeFor("ZA"), "za");
  assert.equal(countryCodeFor("World"), "");
  // Intl also names retired codes (UK, FX, YU, DY…); only current ones count.
  assert.equal(countryCodeFor("United Kingdom"), "gb");
  assert.equal(countryCodeFor("France"), "fr");
  assert.equal(countryCodeFor("Serbia"), "rs");
  assert.equal(countryCodeFor("Benin"), "bj");
  assert.equal(countryCodeFor("Germany"), "de");
  assert.equal(countryCodeFor("Myanmar"), "mm");
  // ISO official names, as the live groups send them.
  assert.equal(countryCodeFor("United Kingdom of Great Britain and Northern Ireland"), "gb");
  assert.equal(countryCodeFor("Tanzania, United Republic of"), "tz");
  assert.equal(countryCodeFor("Iran (Islamic Republic of)"), "ir");
  assert.equal(countryCodeFor("Holy See"), "va");
  // Two-letter input is only taken as a code when it's current.
  assert.equal(countryCodeFor("UK"), "gb");
  assert.equal(countryCodeFor("YU"), "");
  // Current codes outside the continent table still map.
  assert.equal(countryCodeFor("Christmas Island"), "cx");
  assert.equal(countryCodeFor("Antarctica"), "aq");
});

test('"World" teams get a blank flag without being reported', () => {
  const mapped = mapTournamentStandings(sample, now)!;
  const world = mapped.data.teams.find((t) => t.countryName === "World")!;
  assert.equal(world.countryCode, "");
  assert.deepEqual(mapped.issues, { unknownCountries: [], unknownCategories: [], droppedRows: 0 });
});

test("reports unknown countries and categories", () => {
  const mapped = mapTournamentStandings({
    success: [
      { rank: 1, name: "A", country: "Atlantis", category: "senior", levels_completed: 3, time: "00:01:00" },
      { rank: 2, name: "B", country: "Kenya", category: "Masters", levels_completed: 2, time: "00:02:00" },
      { rank: 3, country: "Kenya", category: "Open", levels_completed: 1 },
    ],
  })!;
  assert.equal(mapped.data.teams[0].category, "Senior");
  assert.equal(mapped.data.teams[1].category, "Open");
  assert.deepEqual(mapped.issues, {
    unknownCountries: ["Atlantis"],
    unknownCategories: ["Masters"],
    droppedRows: 1,
  });
});

test("an empty tournament maps to no teams", () => {
  assert.deepEqual(mapTournamentStandings({ success: [] }, now)?.data, {
    updatedAt: now.toISOString(),
    teams: [],
  });
});

test("rejects payloads without a success array", () => {
  assert.equal(mapTournamentStandings({ error: "Unauthorized" }), null);
  assert.equal(mapTournamentStandings(null), null);
});

test("parses the API's elapsed time", () => {
  assert.equal(parseElapsed("00:01:05"), 65);
  assert.equal(parseElapsed("00:30:00"), 1800);
  assert.equal(parseElapsed("1:02:03"), 3723);
  assert.equal(parseElapsed("12:34"), 754);
  assert.equal(parseElapsed("soon"), undefined);
  assert.equal(parseElapsed(undefined), undefined);
});

const t = (id: string, rank: number, levels: number, elapsedSeconds?: number): LeaderboardTeam => ({
  id, name: id, countryCode: "", countryName: "World", category: "Open", levels, rank, elapsedSeconds,
});

test("combines the groups by levels and keeps each group's official order", () => {
  // Group 1's official order puts b (slower) ahead of c on attempts; that order is kept.
  const group1 = [t("a", 1, 30, 1800), t("b", 2, 25, 1500), t("c", 3, 25, 900), t("d", 4, 10, 600)];
  const group2 = [t("x", 1, 28, 1800), t("y", 2, 25, 1200), t("z", 3, 5, 300)];
  const combined = combineStandings([{ id: "g1", teams: group1 }, { id: "g2", teams: group2 }]);
  assert.deepEqual(
    combined.map((team) => team.id),
    ["g1-a", "g2-x", "g2-y", "g1-b", "g1-c", "g1-d", "g2-z"],
  );
  assert.deepEqual(combined.map((team) => team.rank), [1, 2, 3, 4, 5, 6, 7]);
});

test("cross-group ties on levels and time go to group order", () => {
  const combined = combineStandings([
    { id: "g1", teams: [t("a", 1, 30, 1800)] },
    { id: "g2", teams: [t("x", 1, 30, 1800)] },
  ]);
  assert.deepEqual(combined.map((team) => team.id), ["g1-a", "g2-x"]);
});

test("one empty group leaves the other's order and ranks unchanged", () => {
  const group1 = [t("a", 1, 30), t("b", 2, 20)];
  const groups = (one: LeaderboardTeam[], two: LeaderboardTeam[]) => [
    { id: "g1", teams: one },
    { id: "g2", teams: two },
  ];
  assert.deepEqual(
    combineStandings(groups(group1, [])).map((team) => [team.id, team.rank]),
    [["g1-a", 1], ["g1-b", 2]],
  );
  assert.deepEqual(combineStandings(groups([], [])), []);
});

test("an unranked row can't land below teams with fewer levels", () => {
  // The mapper puts rows without a rank last; the merge still orders by levels.
  const group1 = [t("a", 1, 10), { ...t("lost", 0, 30), rank: undefined }];
  const combined = combineStandings([{ id: "g1", teams: group1 }, { id: "g2", teams: [t("x", 1, 20)] }]);
  assert.deepEqual(combined.map((team) => [team.id, team.rank]), [["g1-lost", 1], ["g2-x", 2], ["g1-a", 3]]);
});

test("the same team name in both groups gets distinct ids", () => {
  const combined = combineStandings([{ id: "g1", teams: [t("same", 1, 5)] }, { id: "g2", teams: [t("same", 1, 4)] }]);
  assert.deepEqual(combined.map((team) => team.id), ["g1-same", "g2-same"]);
});
