// Continent for each ISO 3166-1 alpha-2 country code, used by the board's
// continent filter. The tournament API only sends a country, so the continent
// is derived here. The Caribbean is listed on its own because the tournament
// names it separately ("North / South America & Caribbean"); Central America
// counts as North America. Transcontinental countries use their usual UN
// grouping (Russia and Türkiye: Europe; Egypt: Africa).

export const CONTINENTS = [
  "Africa",
  "Asia",
  "Europe",
  "Oceania",
  "North America",
  "South America",
  "Caribbean",
] as const;

export type Continent = (typeof CONTINENTS)[number];

const CODES: Record<Continent, string> = {
  Africa:
    "dz ao bj bw bf bi cv cm cf td km cg cd ci dj eg gq er sz et ga gm gh gn gw ke ls lr ly mg mw ml mr mu yt ma mz na ne ng re rw sh st sn sc sl so za ss sd tz tg tn ug eh zm zw",
  Asia:
    "af am az bh bd bt bn kh cn cy ge hk in id ir iq il jp jo kz kw kg la lb mo my mv mn mm np kp om pk ps ph qa sa sg kr lk sy tw tj th tl tm ae uz vn ye",
  Europe:
    "ax al ad at by be ba bg hr cz dk ee fo fi fr de gi gr gg hu is ie im it je xk lv li lt lu mt md mc me nl mk no pl pt ro ru sm rs sk si es sj se ch tr ua gb va",
  Oceania:
    "as au ck fj pf gu ki mh fm nr nc nz nu nf mp pw pg pn ws sb tk to tv um vu wf",
  "North America": "bz bm ca cr sv gl gt hn mx ni pa pm us",
  "South America": "ar bo br cl co ec fk gf gy py pe sr uy ve",
  Caribbean:
    "ai ag aw bs bb bq vg ky cu cw dm do gd gp ht jm mq ms pr bl kn lc mf vc sx tt tc vi",
};

const BY_CODE = new Map<string, Continent>(
  CONTINENTS.flatMap((continent) => CODES[continent].split(" ").map((code) => [code, continent] as const)),
);

/** Continent for a lowercase alpha-2 code, or undefined (e.g. "World" teams with no code). */
export function continentFor(countryCode: string): Continent | undefined {
  return BY_CODE.get(countryCode.toLowerCase());
}
