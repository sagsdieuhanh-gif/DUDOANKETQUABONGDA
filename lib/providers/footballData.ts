const BASE = "https://api.football-data.org/v4";

function key() {
  return process.env.FOOTBALL_DATA_KEY?.trim();
}

const normalize = (value: string) => value.toLowerCase()
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .replace(/\b(fc|cf|afc|sc|club)\b/g, "")
  .replace(/[^a-z0-9]/g, "");

export async function verifyFixture(date: string, home: string, away: string): Promise<boolean> {
  const token = key();
  if (!token) return false;
  const day = date.slice(0, 10);
  const response = await fetch(`${BASE}/matches?dateFrom=${day}&dateTo=${day}`, {
    headers: { "X-Auth-Token": token },
    next: { revalidate: 1800 }
  });
  if (!response.ok) return false;
  const json = await response.json();
  const homeN = normalize(home);
  const awayN = normalize(away);
  return (json.matches ?? []).some((m: any) => {
    const h = normalize(m.homeTeam?.name ?? m.homeTeam?.shortName ?? "");
    const a = normalize(m.awayTeam?.name ?? m.awayTeam?.shortName ?? "");
    if (!h || !a || !homeN || !awayN) return false;
    return (h.includes(homeN) || homeN.includes(h)) && (a.includes(awayN) || awayN.includes(a));
  });
}

export function isConfigured() {
  return Boolean(key());
}
