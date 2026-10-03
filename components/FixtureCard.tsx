import Link from "next/link";
import type { Fixture } from "@/lib/types";
import { TeamBadge } from "@/components/TeamBadge";

const demoOdds: Record<string, [string,string,string]> = {
  "demo-2": ["1.28","5.70","9.60"],
  "demo-3": ["1.86","3.80","3.70"],
  "demo-4": ["2.42","3.20","2.86"],
  "demo-5": ["1.62","4.10","4.80"],
  "demo-6": ["1.52","4.35","5.75"],
  "demo-7": ["2.05","3.15","3.42"]
};

export function FixtureCard({ fixture }: { fixture: Fixture }) {
  const kickoff = new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh"
  }).format(new Date(fixture.date));
  const odds = demoOdds[String(fixture.id)];

  return (
    <Link className="matchCard" href={"/match/" + fixture.id}>
      <div className="matchCardTop">
        <span className="leaguePill">⚽ {fixture.league.name}</span>
        <time>{kickoff}</time>
      </div>
      <div className="matchTeams">
        <div className="miniTeam"><TeamBadge name={fixture.home.name} logo={fixture.home.logo} size={30}/><strong>{fixture.home.name}</strong></div>
        <span className="vsDot">VS</span>
        <div className="miniTeam miniTeamAway"><strong>{fixture.away.name}</strong><TeamBadge name={fixture.away.name} logo={fixture.away.logo} size={30}/></div>
      </div>
      <div className="miniOdds">
        <span><i>1</i><b>{odds?.[0] ?? "—"}</b></span>
        <span><i>X</i><b>{odds?.[1] ?? "—"}</b></span>
        <span><i>2</i><b>{odds?.[2] ?? "—"}</b></span>
      </div>
    </Link>
  );
}
