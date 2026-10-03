import fs from "node:fs/promises";
import path from "node:path";

const outDir = path.join(process.cwd(), "site", "data");
const outFile = path.join(outDir, "football.json");
const apiKey = process.env.API_FOOTBALL_KEY || "";
const footballDataKey = process.env.FOOTBALL_DATA_KEY || "";

function vnDate(offsetDays = 0) {
  const now = new Date(Date.now() + offsetDays * 86400000);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(now);
  const obj = Object.fromEntries(parts.map(p => [p.type, p.value]));
  return obj.year + "-" + obj.month + "-" + obj.day;
}

async function getJson(url, headers = {}) {
  const res = await fetch(url, { headers: { Accept: "application/json", ...headers } });
  if (!res.ok) throw new Error(url + " -> HTTP " + res.status);
  return res.json();
}

function normalizeFixture(x) {
  return {
    id: String(x.fixture?.id ?? ""),
    date: x.fixture?.date ?? "",
    status: x.fixture?.status?.short ?? "NS",
    venue: x.fixture?.venue?.name ?? "",
    city: x.fixture?.venue?.city ?? "",
    league: {
      id: x.league?.id ?? null,
      name: x.league?.name ?? "Unknown",
      country: x.league?.country ?? "",
      logo: x.league?.logo ?? ""
    },
    home: {
      id: x.teams?.home?.id ?? null,
      name: x.teams?.home?.name ?? "Home",
      logo: x.teams?.home?.logo ?? ""
    },
    away: {
      id: x.teams?.away?.id ?? null,
      name: x.teams?.away?.name ?? "Away",
      logo: x.teams?.away?.logo ?? ""
    },
    goals: { home: x.goals?.home ?? null, away: x.goals?.away ?? null }
  };
}

function normalizeOdds(payload) {
  const first = payload?.response?.[0];
  if (!first) return [];
  return (first.bookmakers ?? []).slice(0, 5).map(b => ({
    id: b.id,
    name: b.name,
    bets: (b.bets ?? []).slice(0, 5).map(bet => ({
      id: bet.id,
      name: bet.name,
      values: (bet.values ?? []).slice(0, 8).map(v => ({ value: v.value, odd: v.odd }))
    }))
  }));
}

function normalizePrediction(payload) {
  const p = payload?.response?.[0];
  if (!p) return null;
  const percent = p.predictions?.percent ?? {};
  return {
    winner: p.predictions?.winner?.name ?? "",
    advice: p.predictions?.advice ?? "",
    home: Number(String(percent.home ?? "0").replace("%","")) || 0,
    draw: Number(String(percent.draw ?? "0").replace("%","")) || 0,
    away: Number(String(percent.away ?? "0").replace("%","")) || 0,
    goals: p.predictions?.goals ?? {},
    underOver: p.predictions?.under_over ?? ""
  };
}

const fallback = {
  generatedAt: new Date().toISOString(),
  date: vnDate(),
  mode: "demo",
  sources: {
    apiFootball: { ok: false, note: "Chưa có API_FOOTBALL_KEY trong GitHub Secrets." },
    footballData: { ok: false, note: "Chưa có FOOTBALL_DATA_KEY trong GitHub Secrets." }
  },
  fixtures: [
    { id:"demo-1", date: vnDate()+"T22:30:00+07:00", status:"NS", venue:"Emirates Stadium", city:"London", league:{id:39,name:"Premier League",country:"England",logo:""}, home:{id:42,name:"Arsenal",logo:"https://media.api-sports.io/football/teams/42.png"}, away:{id:40,name:"Liverpool",logo:"https://media.api-sports.io/football/teams/40.png"}, goals:{home:null,away:null}, prediction:{home:44,draw:26,away:30,winner:"Arsenal",advice:"Demo data",goals:{home:"1.6",away:"1.2"},underOver:""}, odds:[] },
    { id:"demo-2", date: vnDate()+"T19:30:00+07:00", status:"NS", venue:"Etihad Stadium", city:"Manchester", league:{id:39,name:"Premier League",country:"England",logo:""}, home:{id:50,name:"Man City",logo:"https://media.api-sports.io/football/teams/50.png"}, away:{id:null,name:"Luton Town",logo:""}, goals:{home:null,away:null}, odds:[] },
    { id:"demo-3", date: vnDate()+"T21:15:00+07:00", status:"NS", venue:"Santiago Bernabéu", city:"Madrid", league:{id:140,name:"La Liga",country:"Spain",logo:""}, home:{id:541,name:"Real Madrid",logo:"https://media.api-sports.io/football/teams/541.png"}, away:{id:529,name:"Barcelona",logo:"https://media.api-sports.io/football/teams/529.png"}, goals:{home:null,away:null}, odds:[] }
  ],
  footballDataMatches: 0
};

const result = structuredClone(fallback);

if (apiKey) {
  try {
    const date = vnDate();
    const fixturesRaw = await getJson(
      "https://v3.football.api-sports.io/fixtures?date=" + date + "&timezone=Asia%2FHo_Chi_Minh",
      { "x-apisports-key": apiKey }
    );
    let fixtures = (fixturesRaw.response ?? []).map(normalizeFixture);

    if (!fixtures.length) {
      const tomorrow = vnDate(1);
      const tomorrowRaw = await getJson(
        "https://v3.football.api-sports.io/fixtures?date=" + tomorrow + "&timezone=Asia%2FHo_Chi_Minh",
        { "x-apisports-key": apiKey }
      );
      fixtures = (tomorrowRaw.response ?? []).map(normalizeFixture);
      result.date = tomorrow;
    } else {
      result.date = date;
    }

    fixtures = fixtures.slice(0, 24);

    for (let i = 0; i < Math.min(3, fixtures.length); i++) {
      const f = fixtures[i];
      try {
        const [predRaw, oddsRaw] = await Promise.all([
          getJson("https://v3.football.api-sports.io/predictions?fixture=" + f.id, { "x-apisports-key": apiKey }),
          getJson("https://v3.football.api-sports.io/odds?fixture=" + f.id, { "x-apisports-key": apiKey })
        ]);
        f.prediction = normalizePrediction(predRaw);
        f.odds = normalizeOdds(oddsRaw);
      } catch (e) {
        f.odds = [];
        f.prediction = null;
        console.warn("Extra data failed for fixture", f.id, String(e));
      }
    }

    result.fixtures = fixtures.length ? fixtures : fallback.fixtures;
    result.mode = fixtures.length ? "live-cache" : "demo";
    result.sources.apiFootball = {
      ok: true,
      note: fixtures.length ? "API-Football cập nhật qua GitHub Actions." : "API-Football trả 0 trận, đang dùng fallback."
    };
  } catch (e) {
    result.sources.apiFootball = { ok: false, note: String(e) };
    console.error("API-Football error:", e);
  }
}

if (footballDataKey) {
  try {
    const fd = await getJson(
      "https://api.football-data.org/v4/matches?dateFrom=" + result.date + "&dateTo=" + result.date,
      { "X-Auth-Token": footballDataKey }
    );
    result.footballDataMatches = Array.isArray(fd.matches) ? fd.matches.length : 0;
    result.sources.footballData = {
      ok: true,
      note: "football-data.org đối chiếu " + result.footballDataMatches + " trận."
    };
  } catch (e) {
    result.sources.footballData = { ok: false, note: String(e) };
    console.error("football-data error:", e);
  }
}

result.generatedAt = new Date().toISOString();
await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(outFile, JSON.stringify(result, null, 2), "utf8");
console.log("Wrote", outFile, "mode:", result.mode, "fixtures:", result.fixtures.length);
