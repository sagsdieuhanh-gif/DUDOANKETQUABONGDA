import Link from "next/link";
import type { Fixture } from "@/lib/types";
import { TeamBadge } from "@/components/TeamBadge";

export function FixtureCard({ fixture }: { fixture: Fixture }) {
  const kickoff = new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh"
  }).format(new Date(fixture.date));

  return (
    <Link className="matchCard" href={"/match/" + fixture.id}>
      <div className="matchCardTop">
        <span className="leaguePill">{fixture.league.name}</span>
        <time>{kickoff}</time>
      </div>
      <div className="matchTeams">
        <div className="miniTeam"><TeamBadge name={fixture.home.name} logo={fixture.home.logo} size={38}/><strong>{fixture.home.name}</strong></div>
        <span className="vsDot">VS</span>
        <div className="miniTeam miniTeamAway"><strong>{fixture.away.name}</strong><TeamBadge name={fixture.away.name} logo={fixture.away.logo} size={38}/></div>
      </div>
      <div className="matchCardBottom">
        <span>{fixture.venue?.name ?? "Chưa xác định sân"}</span>
        <b>Phân tích →</b>
      </div>
    </Link>
  );
}
