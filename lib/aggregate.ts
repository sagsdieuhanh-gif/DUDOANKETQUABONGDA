import type { Fixture, MatchAnalysis, SourceAudit } from "@/lib/types";
import { buildPrediction } from "@/lib/prediction.mjs";
import * as api from "@/lib/providers/apiFootball";
import * as fd from "@/lib/providers/footballData";
import * as elo from "@/lib/providers/playerElo";
import { getWeather } from "@/lib/providers/openMeteo";
import { demoAnalysis, demoFixtures } from "@/lib/demo-data";

export function sourceConfiguration() {
  return {
    apiFootball: api.isConfigured(),
    footballData: fd.isConfigured(),
    playerElo: elo.isConfigured(),
    openMeteo: true
  };
}

export async function listFixtures(date: string): Promise<{ fixtures: Fixture[]; demo: boolean }> {
  if (!api.isConfigured()) return { fixtures: demoFixtures(), demo: true };
  try {
    const fixtures = await api.getFixturesByDate(date);
    return { fixtures, demo: false };
  } catch {
    return { fixtures: demoFixtures(), demo: true };
  }
}

export async function getAnalysis(id: string): Promise<MatchAnalysis> {
  if (id.startsWith("demo-") || !api.isConfigured()) return demoAnalysis(id);

  const sources: SourceAudit[] = [];
  const fixture = await api.getFixture(id);
  if (!fixture) throw new Error("FIXTURE_NOT_FOUND");
  sources.push({ name: "API-Football", status: "ok", note: "Fixture + 5 trận gần nhất + injuries + H2H." });

  const [homeMatches, awayMatches, injuriesFetch, h2hResult] = await Promise.all([
    api.getRecentMatches(fixture.home.id, fixture.date, 5).catch(() => []),
    api.getRecentMatches(fixture.away.id, fixture.date, 5).catch(() => []),
    api.getInjuries(id).then((data) => ({ data, ok: true })).catch(() => ({ data: [], ok: false })),
    api.getH2H(fixture.home.id, fixture.away.id, 5).catch(() => [])
  ]);

  const homeForm = api.summarizeForm(homeMatches, fixture.date);
  const awayForm = api.summarizeForm(awayMatches, fixture.date);
  const homeInjuries = injuriesFetch.data.filter((x: any) => x.team?.id === fixture.home.id).length;
  const awayInjuries = injuriesFetch.data.filter((x: any) => x.team?.id === fixture.away.id).length;
  const h2h = api.mapH2HForHome(h2hResult, fixture.home.id);

  const [verified, homeElo, awayElo, externalPrediction, weather] = await Promise.all([
    fd.verifyFixture(fixture.date, fixture.home.name, fixture.away.name).catch(() => false),
    elo.isConfigured() ? elo.getClubElo(fixture.home.id).catch(() => undefined) : Promise.resolve(undefined),
    elo.isConfigured() ? elo.getClubElo(fixture.away.id).catch(() => undefined) : Promise.resolve(undefined),
    elo.isConfigured() ? elo.getFixturePrediction(id) : Promise.resolve(undefined),
    getWeather(fixture.venue?.city, fixture.date)
  ]);

  sources.push({
    name: "football-data.org",
    status: fd.isConfigured() ? (verified ? "ok" : "partial") : "missing",
    note: !fd.isConfigured() ? "Chưa cấu hình key." : verified ? "Tên đội + ngày thi đấu khớp nguồn phụ." : "Không tìm thấy bản ghi khớp; có thể giải không thuộc free coverage."
  });
  sources.push({
    name: "PlayerElo",
    status: elo.isConfigured() ? (homeElo && awayElo ? "ok" : "partial") : "missing",
    note: !elo.isConfigured() ? "Chưa cấu hình key." : homeElo && awayElo ? "Có Team Elo; model ngoài được blend nếu endpoint prediction có dữ liệu." : "Key có nhưng chưa có đủ Elo cho hai đội."
  });
  sources.push({ name: "Open-Meteo", status: weather ? "ok" : "partial", note: weather ? "Forecast theo thành phố sân đấu." : "Chưa định vị/forecast được địa điểm." });

  const prediction = buildPrediction({
    homeAvgGF: homeForm.avgGoalsFor,
    homeAvgGA: homeForm.avgGoalsAgainst,
    awayAvgGF: awayForm.avgGoalsFor,
    awayAvgGA: awayForm.avgGoalsAgainst,
    homeElo,
    awayElo,
    homeRestDays: homeForm.restDays,
    awayRestDays: awayForm.restDays,
    homeInjuries,
    awayInjuries,
    externalPrediction
  });

  let confidence = 48;
  if (homeMatches.length >= 5 && awayMatches.length >= 5) confidence += 18;
  if (injuriesFetch.ok) confidence += 5;
  if (verified) confidence += 10;
  if (homeElo && awayElo) confidence += 10;
  if (externalPrediction) confidence += 5;
  if (weather) confidence += 3;
  confidence = Math.min(96, confidence);

  return {
    fixture, homeForm, awayForm, homeElo, awayElo, homeInjuries, awayInjuries,
    h2h, weather, verifiedByFootballData: verified, externalPrediction,
    prediction, confidence, sources, generatedAt: new Date().toISOString()
  };
}
