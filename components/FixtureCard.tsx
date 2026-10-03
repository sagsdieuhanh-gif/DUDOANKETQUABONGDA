import Link from "next/link";
import type { Fixture } from "@/lib/types";

export function FixtureCard({ fixture }: { fixture: Fixture }) {
  const time = new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(fixture.date));
  return (
    <Link className="fixtureCard" href={`/match/${fixture.id}`}>
      <div className="fixtureTop"><span>{fixture.league.name}</span><span>{time}</span></div>
      <div className="teamsRow">
        <strong>{fixture.home.name}</strong><span className="versus">VS</span><strong>{fixture.away.name}</strong>
      </div>
      <div className="fixtureBottom"><span>{fixture.venue?.name ?? "Chưa xác định sân"}</span><span>Phân tích →</span></div>
    </Link>
  );
}
