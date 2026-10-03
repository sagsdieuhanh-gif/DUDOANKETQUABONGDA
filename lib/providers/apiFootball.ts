import type { Fixture, RecentMatch, TeamForm } from "@/lib/types";

const BASE = "https://v3.football.api-sports.io";

function apiKey() {
  return process.env.API_FOOTBALL_KEY?.trim();
}

async function apiFootball(path: string, revalidate = 900) {
  const key = apiKey();
  if (!key) throw new Error("API_FOOTBALL_KEY_MISSING");

  const response = await fetch(`${BASE}${path}`, {
    headers: { "x-apisports-key": key },
    next: { revalidate }
  });
  if (!response.ok) throw new Error(`API_FOOTBALL_${response.status}`);
  const json = await response.json();
  if (json.errors && Object.keys(json.errors).length) {
    throw new Error(`API_FOOTBALL_ERROR:${JSON.stringify(json.errors)}`);
  }
  return json.response ?? [];
}

function mapFixture(row: any): Fixture {
  return {
    id: row.fixture.id,
    date: row.fixture.date,
    timestamp: row.fixture.timestamp,
    status: row.fixture.status?.short ?? "NS",
    league: {
      id: row.league?.id,
      name: row.league?.name ?? "Unknown league",
      logo: row.league?.logo,
      season: row.league?.season
    },
    venue: { name: row.fixture.venue?.name, city: row.fixture.venue?.city },
    home: { id: row.teams.home.id, name: row.teams.home.name, logo: row.teams.home.logo },
    away: { id: row.teams.away.id, name: row.teams.away.name, logo: row.teams.away.logo },
    goals: { home: row.goals?.home ?? null, away: row.goals?.away ?? null }
  };
}

export async function getFixturesByDate(date: string): Promise<Fixture[]> {
  const rows = await apiFootball(`/fixtures?date=${encodeURIComponent(date)}&timezone=Asia%2FHo_Chi_Minh`, 600);
  return rows.map(mapFixture);
}

export async function getFixture(id: string | number): Promise<Fixture | null> {
  const rows = await apiFootball(`/fixtures?id=${id}&timezone=Asia%2FHo_Chi_Minh`, 600);
  return rows[0] ? mapFixture(rows[0]) : null;
}

function recentMatchForTeam(row: any, teamId: number): RecentMatch | null {
  const home = row.teams.home.id === teamId;
  const gf = home ? row.goals.home : row.goals.away;
  const ga = home ? row.goals.away : row.goals.home;
  if (!Number.isFinite(gf) || !Number.isFinite(ga)) return null;
  return {
    fixtureId: row.fixture.id,
    date: row.fixture.date,
    opponent: home ? row.teams.away.name : row.teams.home.name,
    venue: home ? "home" : "away",
    gf,
    ga,
    result: gf > ga ? "W" : gf === ga ? "D" : "L"
  };
}

export async function getRecentMatches(teamId: number, beforeDate?: string, last = 5): Promise<RecentMatch[]> {
  const path = `/fixtures?team=${teamId}&last=${last + 2}&status=FT-AET-PEN&timezone=Asia%2FHo_Chi_Minh`;
  const rows = await apiFootball(path, 1800);
  const cutoff = beforeDate ? new Date(beforeDate).getTime() : Infinity;
  return rows
    .filter((row: any) => new Date(row.fixture.date).getTime() < cutoff)
    .map((row: any) => recentMatchForTeam(row, teamId))
    .filter(Boolean)
    .sort((a: RecentMatch, b: RecentMatch) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, last) as RecentMatch[];
}

export function summarizeForm(matches: RecentMatch[], fixtureDate: string): TeamForm {
  const weights = [1, 0.86, 0.74, 0.64, 0.55, 0.47, 0.40, 0.34, 0.29, 0.25];
  let weightTotal = 0;
  let weightedPoints = 0;
  let weightedGf = 0;
  let weightedGa = 0;

  matches.forEach((m, index) => {
    const w = weights[index] ?? 0.2;
    weightTotal += w;
    weightedPoints += (m.result === "W" ? 3 : m.result === "D" ? 1 : 0) * w;
    weightedGf += m.gf * w;
    weightedGa += m.ga * w;
  });

  const lastPlayed = matches[0]?.date ? new Date(matches[0].date).getTime() : null;
  const target = new Date(fixtureDate).getTime();
  const restDays = lastPlayed ? Math.max(0, Math.floor((target - lastPlayed) / 86400000)) : null;

  return {
    matches,
    weightedPointsPct: weightTotal ? (weightedPoints / (3 * weightTotal)) * 100 : 50,
    avgGoalsFor: weightTotal ? weightedGf / weightTotal : 1.35,
    avgGoalsAgainst: weightTotal ? weightedGa / weightTotal : 1.35,
    restDays
  };
}

export async function getInjuries(fixtureId: string | number) {
  return apiFootball(`/injuries?fixture=${fixtureId}`, 14400);
}

export async function getH2H(homeId: number, awayId: number, last = 5): Promise<any[]> {
  return apiFootball(`/fixtures/headtohead?h2h=${homeId}-${awayId}&last=${last}`, 21600);
}

export function mapH2HForHome(rows: any[], homeTeamId: number): RecentMatch[] {
  return rows.map((row: any) => recentMatchForTeam(row, homeTeamId)).filter(Boolean) as RecentMatch[];
}

export function isConfigured() {
  return Boolean(apiKey());
}
