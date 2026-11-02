// Run with `npm test` (Node's built-in test runner with type stripping).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { countryCodeFor, mapTournamentStandings } from "../src/data/tournament.ts";

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
