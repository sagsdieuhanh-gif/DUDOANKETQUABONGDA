import Link from "next/link";
import { FixtureCard } from "@/components/FixtureCard";
import { SourceBadge } from "@/components/SourceBadge";
import { TeamBadge } from "@/components/TeamBadge";
import { getAnalysis, listFixtures, sourceConfiguration } from "@/lib/aggregate";
import type { BookmakerOdds, MatchAnalysis, OddsMarket } from "@/lib/types";

export const dynamic = "force-dynamic";

function localDate(offset = 0) {
  const now = new Date();
  now.setDate(now.getDate() + offset);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(now);
}

function timeOnly(date: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh"
  }).format(new Date(date));
}

function dateOnly(date: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh"
  }).format(new Date(date));
}

function formLetters(form?: MatchAnalysis["homeForm"]) {
  if (!form) return [];
  return form.matches.slice(0, 5).map((m) => m.result);
}

function findMarket(bookmaker: BookmakerOdds, fragment: string): OddsMarket | undefined {
  return bookmaker.markets.find((market) => market.name.toLowerCase().includes(fragment.toLowerCase()));
}

function findOdd(market: OddsMarket | undefined, matcher: RegExp) {
  return market?.values.find((value) => matcher.test(value.value))?.odd ?? "—";
}

export default async function Home({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const params = await searchParams;
  const date = params.date || localDate();
  const { fixtures, demo } = await listFixtures(date);
  const sources = sourceConfiguration();
  const featured = fixtures[0];

  let featuredAnalysis: MatchAnalysis | undefined;
  if (featured) {
    try {
      featuredAnalysis = await getAnalysis(String(featured.id));
    } catch {
      featuredAnalysis = undefined;
    }
  }

  const leagueCounts = Array.from(
    fixtures.reduce((map, fixture) => {
      map.set(fixture.league.name, (map.get(fixture.league.name) ?? 0) + 1);
      return map;
    }, new Map<string, number>())
  ).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const homeForm = formLetters(featuredAnalysis?.homeForm);
  const awayForm = formLetters(featuredAnalysis?.awayForm);
  const p = featuredAnalysis?.prediction;
  const bookmakers = featuredAnalysis?.odds?.slice(0, 5) ?? [];
  const leadBookmaker = bookmakers[0];
  const leadMarkets = leadBookmaker?.markets.slice(0, 3) ?? [];

  return (
    <main className="sportsbookPage exactHome">
      <section className="homeHero exactHero">
        <div className="homeHeroCopy">
          <h1>Dự đoán bóng đá thông minh, <em>dễ xem, dễ dùng</em></h1>
          <p>Kết hợp phân tích phong độ, tỷ lệ kèo, chấn thương, sức mạnh Elo và lịch thi đấu để đưa ra bức tranh xác suất rõ ràng nhất.</p>
          {demo && <span className="demoCornerBadge">DỮ LIỆU MINH HỌA</span>}
          <div className="quickFilters">
            <Link className={date === localDate() ? "filterChip filterActive" : "filterChip"} href={"/?date=" + localDate()}>▣ Hôm nay</Link>
            <Link className={date === localDate(1) ? "filterChip filterActive" : "filterChip"} href={"/?date=" + localDate(1)}>▣ Ngày mai</Link>
            <a className="filterChip" href="#matches">⚽ Premier League</a>
            <a className="filterChip" href="#matches">◆ La Liga</a>
            <a className="filterChip" href="#matches">✦ Champions League</a>
            <a className="filterChip" href="#featured-analysis">🔥 Kèo hot</a>
          </div>
        </div>
      </section>

      <section className="dashboardShell exactShell" id="matches">
        <aside className="leftRail">
          <div className="sidePanel leaguePanel">
            <div className="sidePanelHead"><b>Giải đấu phổ biến</b></div>
            <div className="leagueList">
              {leagueCounts.length ? leagueCounts.map(([name, count], index) => (
                <div className="leagueRow" key={name}>
                  <span><i>{["♞","◆","◉","■","●","✦","⬡","⚽"][index] ?? "⚽"}</i>{name}</span>
                  <b>{count}</b>
                </div>
              )) : <p className="muted">Chưa có dữ liệu giải đấu.</p>}
              <div className="leagueAll">◌ <span>Tất cả giải đấu</span><b>›</b></div>
            </div>
          </div>

          <div className="sidePanel compactStats">
            <div className="sidePanelHead"><b>Thống kê nhanh</b></div>
            <div className="quickStat"><span>▣</span><div><b>{fixtures.length}</b><small>Trận đấu theo ngày</small></div></div>
            <div className="quickStat"><span>◉</span><div><b>{featuredAnalysis ? "Có" : "—"}</b><small>Trận có phân tích chi tiết</small></div></div>
            <div className="quickStat"><span>↗</span><div><b>{bookmakers.length || "—"}</b><small>Nhà cái trong trận tâm điểm</small></div></div>
            <div className="quickStat"><span>✓</span><div><b>{featuredAnalysis?.confidence ?? "—"}{featuredAnalysis ? "%" : ""}</b><small>Độ tin cậy dữ liệu</small></div></div>
          </div>
        </aside>

        <div className="centerColumn">
          {featured ? (
            <section className={demo ? "featuredMatch demoFeatured" : "featuredMatch"} id="featured-analysis">
              <div className="featuredTop">
                <span className="hotLabel">▣ Trận đấu tâm điểm</span>
                <span className="featuredLeague">⚽ {featured.league.name}</span>
                <Link href={"/match/" + featured.id}>Xem phân tích chi tiết →</Link>
              </div>

              <Link href={"/match/" + featured.id} className="featuredTeams">
                <div className="featuredTeam">
                  <TeamBadge name={featured.home.name} logo={featured.home.logo} size={66}/>
                  <div>
                    <strong>{featured.home.name}</strong>
                    <span className="tinyForm">Phong độ:
                      {homeForm.length ? homeForm.map((r, i) => <i className={"miniResult r" + r} key={i}>{r}</i>) : <em> —</em>}
                    </span>
                  </div>
                </div>

                <div className="featuredKickoff">
                  <small>{dateOnly(featured.date)}</small>
                  <strong>{timeOnly(featured.date)}</strong>
                  <span>⌾ {featured.venue?.name ?? "Chưa xác định sân"}</span>
                </div>

                <div className="featuredTeam featuredAway">
                  <div>
                    <strong>{featured.away.name}</strong>
                    <span className="tinyForm">Phong độ:
                      {awayForm.length ? awayForm.map((r, i) => <i className={"miniResult r" + r} key={i}>{r}</i>) : <em> —</em>}
                    </span>
                  </div>
                  <TeamBadge name={featured.away.name} logo={featured.away.logo} size={66}/>
                </div>
              </Link>

              <div className="featuredNumbers">
                <div><b className="numGreen">{p ? p.homeWin.toFixed(0) + "%" : "—"}</b><span>Khả năng thắng<br/>{featured.home.name}</span><i><em style={{width: (p?.homeWin ?? 0) + "%"}}/></i></div>
                <div><b>{p ? p.draw.toFixed(0) + "%" : "—"}</b><span>Khả năng hòa</span><i><em style={{width: (p?.draw ?? 0) + "%"}}/></i></div>
                <div><b className="numRed">{p ? p.awayWin.toFixed(0) + "%" : "—"}</b><span>Khả năng thắng<br/>{featured.away.name}</span><i><em style={{width: (p?.awayWin ?? 0) + "%"}}/></i></div>
                <div><b>{p ? (p.expectedHomeGoals + p.expectedAwayGoals).toFixed(2) : "—"}</b><span>Bàn thắng kỳ vọng<br/>(xG tổng)</span></div>
                <div><b>{p?.topScorelines[0]?.score ?? "—"}</b><span>Tỷ số dễ xảy ra nhất</span></div>
              </div>
            </section>
          ) : <div className="empty">Không có trận trong ngày đã chọn.</div>}

          <div className="sectionBar compactSectionBar">
            <div><h2>Trận đấu sắp diễn ra</h2></div>
            <form className="dateForm">
              <input type="date" name="date" defaultValue={date}/>
              <button type="submit">Xem ngày</button>
            </form>
          </div>

          <div className="matchesGrid exactMatchesGrid">
            {fixtures.slice(featured ? 1 : 0, 7).map((fixture) => <FixtureCard key={String(fixture.id)} fixture={fixture}/>)}
          </div>

          <section className="homeOdds panel" id="odds-home">
            <div className="homeOddsHead"><b>◉ Tỷ lệ kèo nhà cái {featured ? "(" + featured.home.name + " vs " + featured.away.name + ")" : ""}</b><Link href={featured ? "/match/" + featured.id + "#odds" : "#"}>Xem tất cả tỷ lệ ›</Link></div>
            {bookmakers.length ? (
              <div className="homeOddsTable">
                <div className="oddsTableRow oddsTableHeader"><span>Nhà cái</span><span>1</span><span>X</span><span>2</span><span>Tài 2.5</span><span>Xỉu 2.5</span></div>
                {bookmakers.slice(0, 4).map((bookmaker) => {
                  const oneXtwo = findMarket(bookmaker, "winner");
                  const overUnder = findMarket(bookmaker, "over/under");
                  return (
                    <div className="oddsTableRow" key={bookmaker.id}>
                      <strong>{bookmaker.name}</strong>
                      <b>{findOdd(oneXtwo, /home|1$/i)}</b>
                      <b>{findOdd(oneXtwo, /draw|x/i)}</b>
                      <b>{findOdd(oneXtwo, /away|2$/i)}</b>
                      <b>{findOdd(overUnder, /over.*2\.5|2\.5.*over/i)}</b>
                      <b>{findOdd(overUnder, /under.*2\.5|2\.5.*under/i)}</b>
                    </div>
                  );
                })}
              </div>
            ) : <div className="oddsEmpty">Chưa có dữ liệu odds cho trận tâm điểm.</div>}
          </section>
        </div>

        <aside className="rightRail">
          <div className="sidePanel featuredTips">
            <div className="sidePanelHead"><b>🔥 Top kèo nổi bật</b><span>Xem thêm ›</span></div>
            {leadMarkets.length ? leadMarkets.map((market) => {
              const first = market.values[0];
              return (
                <div className="tipRow" key={market.name}>
                  <span className="tipIcon">⚽</span>
                  <div><b>{market.name}</b><small>{first?.value ?? "Thị trường"} · {featured?.league.name}</small></div>
                  <strong>{first?.odd ?? "—"}</strong>
                </div>
              );
            }) : <p className="sideNote">Chưa có odds nổi bật cho trận hiện tại.</p>}
          </div>

          <div className="sidePanel bookmakerPanel">
            <div className="sidePanelHead"><b>◈ Nhà cái có dữ liệu</b><span>Xem tất cả ›</span></div>
            {bookmakers.length ? bookmakers.map((bookmaker, index) => (
              <div className="bookmakerMini" key={bookmaker.id}>
                <span className={"bookIcon b" + (index % 5)}>B</span>
                <b>{bookmaker.name}</b>
                <em>{bookmaker.markets.length} thị trường</em>
              </div>
            )) : <p className="sideNote">Chưa có bookmaker cho trận tâm điểm.</p>}
          </div>

          <div className="sidePanel homeFormPanel">
            <div className="sidePanelHead"><b>◉ Phong độ 5 trận gần nhất</b></div>
            {featuredAnalysis ? (
              <div className="homeFormCols">
                <div>
                  <strong>{featuredAnalysis.fixture.home.name}</strong>
                  {featuredAnalysis.homeForm.matches.slice(0,5).map((m) => <span key={m.fixtureId}><i className={"miniResult r" + m.result}>{m.result}</i><em>vs {m.opponent}</em><b>{m.gf}-{m.ga}</b></span>)}
                </div>
                <div>
                  <strong>{featuredAnalysis.fixture.away.name}</strong>
                  {featuredAnalysis.awayForm.matches.slice(0,5).map((m) => <span key={m.fixtureId}><i className={"miniResult r" + m.result}>{m.result}</i><em>vs {m.opponent}</em><b>{m.gf}-{m.ga}</b></span>)}
                </div>
              </div>
            ) : <p className="sideNote">Chưa có dữ liệu phong độ.</p>}
          </div>

          <div className="sidePanel" id="sources">
            <div className="sidePanelHead"><b>◎ Nguồn dữ liệu</b></div>
            <div className="sourceStack">
              <SourceBadge name="API-Football" active={sources.apiFootball}/>
              <SourceBadge name="football-data.org" active={sources.footballData}/>
              <SourceBadge name="PlayerElo" active={sources.playerElo}/>
              <SourceBadge name="Open-Meteo" active />
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
