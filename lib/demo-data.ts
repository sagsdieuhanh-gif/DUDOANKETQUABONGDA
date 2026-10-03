import type { Fixture, MatchAnalysis, RecentMatch, TeamForm } from "@/lib/types";
import { buildPrediction } from "@/lib/prediction.mjs";

const fixtures: Fixture[] = [
  {
    id: "demo-1", date: "2026-10-04T22:30:00+07:00", status: "NS", isDemo: true,
    league: { id: 39, name: "Premier League · DỮ LIỆU MINH HỌA", season: 2026 },
    venue: { name: "Emirates Stadium", city: "London" },
    home: { id: 42, name: "Arsenal" }, away: { id: 40, name: "Liverpool" }
  }
];

function recent(prefix: number, rows: Array<[string, string, number, number, "home"|"away"]>): RecentMatch[] {
  return rows.map((r, i) => ({
    fixtureId: `${prefix}-${i}`, date: r[0], opponent: r[1], gf: r[2], ga: r[3], venue: r[4],
    result: r[2] > r[3] ? "W" : r[2] === r[3] ? "D" : "L"
  }));
}

function form(matches: RecentMatch[], pct: number, gf: number, ga: number, rest: number): TeamForm {
  return { matches, weightedPointsPct: pct, avgGoalsFor: gf, avgGoalsAgainst: ga, restDays: rest };
}

export function demoFixtures(): Fixture[] { return fixtures; }

export function demoAnalysis(id: string): MatchAnalysis {
  const fixture = fixtures.find((f) => String(f.id) === id) ?? fixtures[0];
  const homeMatches = recent(1, [
    ["2026-09-27T20:00:00Z", "Newcastle", 2, 0, "home"],
    ["2026-09-20T20:00:00Z", "Tottenham", 2, 1, "away"],
    ["2026-09-13T20:00:00Z", "Brighton", 1, 1, "home"],
    ["2026-09-06T20:00:00Z", "Chelsea", 3, 1, "away"],
    ["2026-08-30T20:00:00Z", "Everton", 2, 0, "home"]
  ]);
  const awayMatches = recent(2, [
    ["2026-09-28T20:00:00Z", "Chelsea", 1, 1, "home"],
    ["2026-09-21T20:00:00Z", "Man City", 2, 2, "away"],
    ["2026-09-14T20:00:00Z", "Everton", 2, 0, "home"],
    ["2026-09-07T20:00:00Z", "Newcastle", 1, 0, "away"],
    ["2026-08-31T20:00:00Z", "Tottenham", 1, 2, "home"]
  ]);
  const homeForm = form(homeMatches, 86, 2.0, 0.65, 7);
  const awayForm = form(awayMatches, 61, 1.38, 1.02, 6);
  const externalPrediction = { home: 0.48, draw: 0.25, away: 0.27 };
  const prediction = buildPrediction({
    homeAvgGF: homeForm.avgGoalsFor, homeAvgGA: homeForm.avgGoalsAgainst,
    awayAvgGF: awayForm.avgGoalsFor, awayAvgGA: awayForm.avgGoalsAgainst,
    homeElo: 2604, awayElo: 2396, homeRestDays: 7, awayRestDays: 6,
    homeInjuries: 1, awayInjuries: 2, externalPrediction
  });
  return {
    fixture, homeForm, awayForm, homeElo: 2604, awayElo: 2396,
    homeInjuries: 1, awayInjuries: 2, h2h: [],
    weather: { temperature: 15, precipitationProbability: 28, windSpeed: 12, label: "15°C · mưa 28% · gió 12 km/h" },
    verifiedByFootballData: true, externalPrediction, prediction, confidence: 88,
    generatedAt: new Date().toISOString(),
    sources: [
      { name: "API-Football", status: "ok", note: "Demo mô phỏng fixture, form, injuries." },
      { name: "football-data.org", status: "ok", note: "Demo mô phỏng bước đối chiếu lịch." },
      { name: "PlayerElo", status: "ok", note: "Demo Elo/model đối chiếu." },
      { name: "Open-Meteo", status: "ok", note: "Demo thời tiết." }
    ]
  };
}
