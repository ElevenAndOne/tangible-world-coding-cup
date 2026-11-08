import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import "flag-icons/css/flag-icons.min.css";
import { parseLeaderboard, type LeaderboardData } from "../../data/leaderboard";
import {
  CATEGORY_OPTIONS,
  NO_FILTERS,
  availableFilters,
  filterOptions,
  filterTeams,
  filtersToSearch,
  isFiltered,
  parseFilters,
  type BoardFilters,
  type RankedTeam,
} from "../../data/filters";

interface Props {
  /** URL of the combined results feed (JSON in the LeaderboardData shape). */
  endpoint: string;
  /** Server-rendered snapshot; null shows the loading state until the first fetch. */
  initial: LeaderboardData | null;
  /** How often to re-fetch while the page is visible. */
  pollMs: number;
}

type Status = "loading" | "live" | "stale";

const PODIUM_SIZE = 3;

/** Shared empty list, so memos and effects don't rerun while there's no data. */
const NO_TEAMS: LeaderboardData["teams"] = [];

const SHIELDS = [
  // gold, silver, bronze — light edge first, then the face
  ["#fff4b8", "linear-gradient(160deg,#ffe58a 0%,#e6b230 38%,#b47b0e 70%,#f2cd5c 100%)"],
  ["#ffffff", "linear-gradient(160deg,#f7f8f9 0%,#c9cfd4 38%,#8f989f 70%,#dfe3e6 100%)"],
  ["#ffe1cf", "linear-gradient(160deg,#f2c4a8 0%,#c98d6b 38%,#8f5a3e 70%,#d9a483 100%)"],
] as const;

const SHIELD_SHAPE = "[clip-path:polygon(0_0,100%_0,100%_74%,50%_100%,0_74%)]";

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function Flag({ code, name }: { code: string; name: string }) {
  const known = /^[a-z]{2}$/.test(code);
  return (
    <span
      className="relative mx-[calc(var(--flag-h)*0.17)] inline-flex h-(--flag-h) w-(--flag-w) shrink-0 -skew-x-[20deg] scale-y-[0.94] overflow-hidden border-2 border-white bg-white"
      title={name}
    >
      {known && (
        <span
          className={`fi fi-${code} absolute! inset-0 h-full! w-full! bg-cover! bg-center!`}
          aria-hidden="true"
        />
      )}
      {/* Glossy fold from the Figma flag component */}
      <span
        className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.3)_18%,rgba(0,0,0,0.24)_48%,rgba(0,0,0,0.5)_54%,rgba(255,255,255,0.26)_72%,rgba(0,0,0,0.17)_81%,rgba(255,255,255,0.3)_100%)] opacity-50 mix-blend-hard-light"
        aria-hidden="true"
      />
      <span className="sr-only">{name}</span>
    </span>
  );
}

function Shield({ place }: { place: number }) {
  const [edge, face] = SHIELDS[place - 1];
  return (
    <span
      className={`absolute top-1/2 left-[calc((100%-var(--slant))/2)] h-(--shield-h) w-(--shield-w) -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_2px_2px_rgba(0,37,62,0.35)]`}
      aria-hidden="true"
    >
      <span className={`absolute inset-0 ${SHIELD_SHAPE}`} style={{ background: edge }} />
      <span className={`absolute inset-[3px] ${SHIELD_SHAPE}`} style={{ background: face }} />
    </span>
  );
}

function Row({ team }: { team: RankedTeam }) {
  // Position within the current filter, so a filtered board has its own podium.
  const rank = team.position;
  const podium = rank >= 1 && rank <= PODIUM_SIZE;
  const overall = team.rank != null && team.rank !== rank ? team.rank : null;

  const tone = podium
    ? "text-board-ink bg-[linear-gradient(180deg,#edb300_0%,#fde024_100%)]"
    : "text-white bg-[linear-gradient(180deg,#55879f_0%,#1b3f51_100%)]";

  return (
    <div
      className={`flex items-stretch ${
        podium
          ? "h-(--podium-h) [--slant:calc(var(--podium-h)*0.39)] text-(length:--podium-text)"
          : "h-(--row-h) [--slant:calc(var(--row-h)*0.39)] text-(length:--row-text)"
      } ${podium ? "[--flag-h:var(--podium-flag-h)] [--flag-w:var(--podium-flag-w)]" : "[--flag-h:var(--row-flag-h)] [--flag-w:var(--row-flag-w)]"}`}
    >
      {/* Rank */}
      <div
        className="relative grid w-(--rank-w) shrink-0 place-items-center"
        title={overall ? `Overall rank ${overall}` : undefined}
      >
        <span
          className={`absolute inset-0 rounded-l-[4px] ${tone} [clip-path:polygon(0_0,100%_0,calc(100%-var(--slant))_100%,0_100%)]`}
          aria-hidden="true"
        />
        {podium && <Shield place={rank} />}
        <span
          className={`relative pr-(--slant) font-board leading-none font-bold ${
            podium ? "text-board-ink text-(length:--medal-text)" : "text-white"
          }`}
        >
          <span className="sr-only">Rank </span>
          {rank}
          {overall && <span className="sr-only"> (overall rank {overall})</span>}
        </span>
      </div>

      {/* Team + stats, separated from the rank by the slanted gap */}
      <div
        className={`relative ml-[calc(var(--slant)*-0.5)] flex min-w-0 flex-1 items-center gap-(--cell-gap) rounded-r-[4px] pr-(--stats-px) pl-[calc(var(--slant)+0.75rem)] ${tone} [clip-path:polygon(var(--slant)_0,100%_0,100%_100%,0_100%)]`}
      >
        <Flag code={team.countryCode} name={team.countryName} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-board leading-none font-bold" title={team.organisation ?? team.name}>
            {team.name}
          </p>
          <p
            className={`mt-1 hidden truncate font-board text-[0.7em] leading-none font-bold landscape:block ${
              podium ? "opacity-75" : "opacity-70"
            }`}
          >
            {team.category}
          </p>
        </div>
        <p className="w-(--category-w) shrink-0 font-board leading-none font-bold landscape:hidden">
          <span className="sr-only">Category </span>
          {team.category}
        </p>
        <p className="w-(--levels-w) shrink-0 font-board leading-none font-bold tabular-nums">
          {team.levels}
          <span className="sr-only"> levels</span>
        </p>
      </div>
    </div>
  );
}

/** Animates rows to their new positions when the order changes (FLIP). */
function useRankAnimation(teams: RankedTeam[]) {
  const nodes = useRef(new Map<string, HTMLLIElement>());
  const previous = useRef(new Map<string, number>());

  useLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const next = new Map<string, number>();

    nodes.current.forEach((node, id) => {
      const top = node.offsetTop;
      next.set(id, top);
      const before = previous.current.get(id);
      if (reduce || before == null || before === top) return;
      node.animate(
        [{ transform: `translateY(${before - top}px)` }, { transform: "translateY(0)" }],
        { duration: 700, easing: "cubic-bezier(0.22, 0.61, 0.36, 1)" },
      );
    });

    previous.current = next;
  }, [teams]);

  return useCallback((id: string) => (node: HTMLLIElement | null) => {
    if (node) nodes.current.set(id, node);
    else nodes.current.delete(id);
  }, []);
}

/** Tracks whether a scroll box has hidden content above or below, to drive its edge fades. */
function useScrollFades(deps: unknown) {
  const ref = useRef<HTMLDivElement>(null);
  const [fades, setFades] = useState({ top: false, bottom: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const scrollable = el.scrollHeight - el.clientHeight > 1;
      const top = scrollable && el.scrollTop > 1;
      const bottom = scrollable && el.scrollTop + el.clientHeight < el.scrollHeight - 1;
      setFades((current) =>
        current.top === top && current.bottom === bottom ? current : { top, bottom },
      );
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);

    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [deps]);

  return [ref, fades] as const;
}

/** Category / continent / country filters, kept in the query string so a filtered board can be shared. */
function useFilters() {
  // Start unfiltered so the server render matches; read the URL once mounted.
  const [filters, setFilters] = useState<BoardFilters>(NO_FILTERS);
  useEffect(() => setFilters(parseFilters(window.location.search)), []);

  const update = useCallback((next: BoardFilters) => {
    setFilters(next);
    history.replaceState(null, "", `${window.location.pathname}${filtersToSearch(next)}${window.location.hash}`);
  }, []);

  return [filters, update] as const;
}

const SELECT_CLASS =
  "w-full min-w-0 cursor-pointer appearance-none truncate rounded-xl border border-sky/50 bg-white/5 bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2012%208%22%3E%3Cpath%20d=%22M1%201l5%205%205-5%22%20fill=%22none%22%20stroke=%22white%22%20stroke-width=%222%22/%3E%3C/svg%3E')] bg-[length:0.7rem] bg-[position:right_0.8rem_center] bg-no-repeat py-1.5 pr-8 pl-3 font-board text-sm tablet:py-2 font-bold text-white transition-colors hover:border-sky focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime data-active:border-lime data-active:bg-lime/15 [&_option]:bg-board [&_option]:text-white";

function FilterSelect({
  label,
  value,
  onChange,
  options,
  allLabel,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  allLabel: string;
}) {
  return (
    <label className="flex min-w-0 flex-1 flex-row items-center gap-2.5 tablet:flex-col tablet:items-stretch tablet:gap-1">
      <span className="shrink-0 font-display text-[0.75rem] leading-none tracking-[0.06em] text-white/75 uppercase">
        {label}
      </span>
      <select
        className={SELECT_CLASS}
        value={value}
        data-active={value || undefined}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function Leaderboard({ endpoint, initial, pollMs }: Props) {
  const [filters, setFilters] = useFilters();
  const [data, setData] = useState<LeaderboardData | null>(initial);
  const [status, setStatus] = useState<Status>(initial ? "live" : "loading");

  // Times are only shown once mounted: the server can't know the visitor's
  // timezone, so formatting during SSR would cause a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const updated = mounted && data ? formatTime(data.updatedAt) : "";

  const allTeams = data?.teams ?? NO_TEAMS;
  const teams = useMemo(() => filterTeams(allTeams, filters), [allTeams, filters]);
  const options = useMemo(
    () => filterOptions(allTeams, { category: filters.category, continent: filters.continent }),
    [allTeams, filters.category, filters.continent],
  );
  const filtered = isFiltered(filters);
  const rowRef = useRankAnimation(teams);

  // Once the standings load, drop a continent or country they can't offer
  // (e.g. from a shared link, or a country with no teams in the category).
  useEffect(() => {
    const next = availableFilters(allTeams, filters);
    if (next !== filters) setFilters(next);
  }, [allTeams, filters, setFilters]);

  useEffect(() => {
    let timer: number | undefined;
    let controller: AbortController | undefined;

    const load = async () => {
      controller?.abort();
      controller = new AbortController();
      try {
        const response = await fetch(endpoint, {
          cache: "no-store",
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const next = parseLeaderboard(await response.json());
        if (!next) throw new Error("Unexpected leaderboard payload");
        setData(next);
        setStatus("live");
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        // Keep showing the last good standings; the badge flags the problem.
        setStatus((current) => (current === "loading" ? "loading" : "stale"));
        console.warn("[leaderboard] refresh failed:", error);
      }
    };

    const schedule = () => {
      window.clearInterval(timer);
      timer = window.setInterval(load, pollMs);
    };

    // Only poll while someone can see the board; catch up as soon as they return.
    const onVisibility = () => {
      if (document.hidden) {
        window.clearInterval(timer);
      } else {
        load();
        schedule();
      }
    };

    load();
    schedule();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("online", load);

    return () => {
      window.clearInterval(timer);
      controller?.abort();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("online", load);
    };
  }, [endpoint, pollMs]);

  const [listRef, fades] = useScrollFades(teams.length);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Live badge on the panel's bottom edge (top edge once the list flows with the page) */}
      <p
        className="absolute right-(--panel-p) bottom-0 z-10 flex translate-y-1/2 items-center gap-2 rounded-full border border-sky/60 bg-board px-3 py-1 font-board text-xs font-bold text-white/85 tablet:top-0 tablet:bottom-auto tablet:-translate-y-1/2 portrait:text-[0.7rem]"
        aria-live="polite"
      >
        <span
          className={`size-2 rounded-full ${
            status === "live"
              ? "bg-lime motion-safe:animate-pulse"
              : status === "stale"
                ? "bg-sun"
                : "bg-white/50"
          }`}
          aria-hidden="true"
        />
        {status === "loading" && "Loading results…"}
        {status === "live" && (updated ? <>Live · updated {updated}</> : "Live")}
        {status === "stale" && (updated ? <>Reconnecting · last update {updated}</> : "Reconnecting")}
      </p>

      {/* Filters: the official order is kept and the remaining teams are numbered 1, 2, 3… */}
      <div
        role="group"
        aria-label="Filter teams"
        className="mb-(--tabs-gap) flex items-center gap-4 tablet:items-end tablet:gap-3 landscape:flex-wrap portrait:gap-2"
      >
        <FilterSelect
          label="Category"
          allLabel="All"
          value={filters.category}
          onChange={(category) => setFilters({ ...filters, category: category as BoardFilters["category"] })}
          options={CATEGORY_OPTIONS.map((c) => ({ value: c, label: c }))}
        />
        <FilterSelect
          label="Continent"
          allLabel="All"
          value={filters.continent}
          // A new continent clears a country that isn't in it.
          onChange={(continent) =>
            setFilters({ ...filters, continent: continent as BoardFilters["continent"], country: "" })
          }
          options={options.continents.map((c) => ({ value: c, label: c }))}
        />
        <FilterSelect
          label="Country"
          allLabel="All"
          value={filters.country}
          onChange={(country) => setFilters({ ...filters, country })}
          options={options.countries.map((c) => ({ value: c.key, label: c.name }))}
        />
        <div className="flex shrink-0 flex-row items-center gap-3 tablet:flex-col tablet:items-end tablet:gap-1 landscape:w-full landscape:flex-row landscape:items-center landscape:justify-between">
          <p className="font-board text-xs font-bold whitespace-nowrap text-white/70" aria-live="polite">
            {filtered ? `${teams.length} of ${allTeams.length} teams` : `${allTeams.length} teams`}
          </p>
          <button
            type="button"
            onClick={() => setFilters(NO_FILTERS)}
            disabled={!filtered}
            className="rounded-xl border border-sky/50 px-3 py-1.5 font-board text-sm font-bold text-white transition-colors hover:border-sky hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime disabled:cursor-default disabled:opacity-40 disabled:hover:border-sky/50 disabled:hover:bg-transparent tablet:py-2 landscape:py-1.5"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Column headings */}
      <div
        className="flex items-center font-display leading-none text-white uppercase"
        aria-hidden="true"
      >
        <span className="w-(--rank-w) shrink-0" />
        <span className="flex-1 pl-[calc(var(--podium-h)*0.39+0.75rem)] text-(length:--head-text)">
          Teams
        </span>
        <span className="flex gap-(--cell-gap) pr-(--stats-px) text-(length:--subhead-text)">
          <span className="w-(--category-w) landscape:hidden">Category</span>
          <span className="w-(--levels-w)">Levels</span>
        </span>
      </div>

      {/* Scrolls inside the panel on desktop; flows with the page below that */}
      {/* Each edge fades only while rows are hidden past it */}
      <div
        ref={listRef}
        id="standings-panel"
        data-fade-top={fades.top || undefined}
        data-fade-bottom={fades.bottom || undefined}
        className="mt-(--list-gap) min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-color:rgba(123,230,255,0.5)_transparent] [scrollbar-width:thin] [mask-image:linear-gradient(to_bottom,transparent,#000_var(--fade-top),#000_calc(100%-var(--fade-bottom)),transparent)] [transition:--fade-top_250ms_ease,--fade-bottom_250ms_ease] data-fade-top:[--fade-top:1.5rem] data-fade-bottom:[--fade-bottom:2.5rem] motion-reduce:transition-none tablet:overflow-visible tablet:[mask-image:none]"
      >
        {teams.length === 0 ? (
          <p className="py-12 text-center font-board text-lg font-bold text-white/80">
            {status === "loading"
              ? "Loading the leaderboard…"
              : allTeams.length && filtered
                ? "No teams match these filters."
                : "No results yet — check back once racing starts."}
          </p>
        ) : (
          <ol className="flex flex-col gap-(--row-gap) py-2" aria-label="Standings, all regions">
            {teams.map((team) => (
              <li key={team.id} ref={rowRef(team.id)} className="relative">
                <Row team={team} />
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
