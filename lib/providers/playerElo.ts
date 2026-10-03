const BASE = "https://data-api.playerelo.football";

function key() {
  return process.env.PLAYER_ELO_KEY?.trim();
}

async function get(path: string, revalidate = 21600) {
  const token = key();
  if (!token) throw new Error("PLAYER_ELO_KEY_MISSING");
  const response = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate }
  });
  if (!response.ok) throw new Error(`PLAYER_ELO_${response.status}`);
  return response.json();
}

function findNumber(obj: any, keys: string[]): number | undefined {
  for (const k of keys) {
    const value = obj?.[k];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return undefined;
}

export async function getClubElo(teamId: number): Promise<number | undefined> {
  const json = await get(`/v1/clubs/${teamId}`);
  return findNumber(json, ["team_elo", "elo", "rating"]);
}

export async function getFixturePrediction(fixtureId: string | number) {
  try {
    const json = await get(`/v1/fixtures/${fixtureId}/prediction`, 3600);
    if (![json?.p_home, json?.p_draw, json?.p_away].every((v) => typeof v === "number")) return undefined;
    return { home: json.p_home, draw: json.p_draw, away: json.p_away };
  } catch {
    return undefined;
  }
}

export function isConfigured() {
  return Boolean(key());
}
