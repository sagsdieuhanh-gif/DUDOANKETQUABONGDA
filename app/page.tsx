import Link from "next/link";
import { FixtureCard } from "@/components/FixtureCard";
import { SourceBadge } from "@/components/SourceBadge";
import { TeamBadge } from "@/components/TeamBadge";
import { listFixtures, sourceConfiguration } from "@/lib/aggregate";

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

function kickoff(date: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh"
  }).format(new Date(date));
}

export default async function Home({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const params = await searchParams;
  const date = params.date || localDate();
  const { fixtures, demo } = await listFixtures(date);
  const sources = sourceConfiguration();
  const featured = fixtures[0];
  const leagueCounts = Array.from(
    fixtures.reduce((map, fixture) => {
      map.set(fixture.league.name, (map.get(fixture.league.name) ?? 0) + 1);
      return map;
    }, new Map<string, number>())
  ).sort((a, b) => b[1] - a[1]).slice(0, 7);

  return (
    <main className="sportsbookPage">
      <section className="homeHero">
        <div className="homeHeroCopy">
          <span className="heroKicker">⚡ FOOTBALL INTELLIGENCE</span>
          <h1>Dự đoán bóng đá <em>thông minh, dễ xem, dễ dùng.</em></h1>
          <p>Kết hợp phong độ, Elo, chấn thương, lịch nghỉ, tỷ lệ nhà cái và lịch thi đấu để bạn xem toàn bộ bức tranh của một trận đấu chỉ trong vài giây.</p>
          <div className="quickFilters">
            <Link className={date === localDate() ? "filterChip filterActive" : "filterChip"} href={"/?date=" + localDate()}>📅 Hôm nay</Link>
            <Link className={date === localDate(1) ? "filterChip filterActive" : "filterChip"} href={"/?date=" + localDate(1)}>🗓 Ngày mai</Link>
            <a className="filterChip" href="#matches">⚽ Lịch đấu</a>
            <a className="filterChip" href="#sources">📊 Nguồn dữ liệu</a>
          </div>
        </div>
        <div className="heroGlass">
          <span className="heroGlassIcon">◎</span>
          <b>Dữ liệu → Phân tích → Xác suất</b>
          <p>Mọi con số quan trọng đều có thể truy ngược về nguồn dữ liệu.</p>
        </div>
      </section>

      {demo && (
        <div className="notice noticeWide">
          <b>Demo mode đang bật.</b>
          <span>API-Football chưa phản hồi hoặc chưa được cấu hình trên deployment hiện tại.</span>
        </div>
      )}

      <section className="dashboardShell" id="matches">
        <aside className="leftRail">
          <div className="sidePanel">
            <div className="sidePanelHead"><b>Giải đấu hôm nay</b><span>{fixtures.length} trận</span></div>
            <div className="leagueList">
              {leagueCounts.length ? leagueCounts.map(([name, count]) => (
                <div className="leagueRow" key={name}><span>⚽ {name}</span><b>{count}</b></div>
              )) : <p className="muted">Chưa có dữ liệu giải đấu.</p>}
            </div>
          </div>

          <div className="sidePanel compactStats">
            <div className="sidePanelHead"><b>Thống kê nhanh</b></div>
            <div className="quickStat"><span>📅</span><div><b>{fixtures.length}</b><small>Trận theo ngày đã chọn</small></div></div>
            <div className="quickStat"><span>🧠</span><div><b>1X2 + xG</b><small>Mô hình dự đoán chính</small></div></div>
            <div className="quickStat"><span>💹</span><div><b>Odds</b><small>Kèo nhà cái trước trận</small></div></div>
          </div>
        </aside>

        <div className="centerColumn">
          {featured ? (
            <Link className="featuredMatch" href={"/match/" + featured.id}>
              <div className="featuredTop">
                <span className="hotLabel">🔥 Trận tâm điểm</span>
                <span>{featured.league.name}</span>
                <b>Phân tích chi tiết →</b>
              </div>
              <div className="featuredTeams">
                <div className="featuredTeam">
                  <TeamBadge name={featured.home.name} logo={featured.home.logo} size={72}/>
                  <div><strong>{featured.home.name}</strong><small>Chủ nhà</small></div>
                </div>
                <div className="featuredKickoff">
                  <small>{kickoff(featured.date).split(" ")[0]}</small>
                  <strong>{kickoff(featured.date).split(" ")[1] ?? kickoff(featured.date)}</strong>
                  <span>{featured.venue?.name ?? "Chưa xác định sân"}</span>
                </div>
                <div className="featuredTeam featuredAway">
                  <div><strong>{featured.away.name}</strong><small>Đội khách</small></div>
                  <TeamBadge name={featured.away.name} logo={featured.away.logo} size={72}/>
                </div>
              </div>
              <div className="featuredBenefits">
                <span>✓ Phong độ gần đây</span>
                <span>✓ Xác suất 1X2</span>
                <span>✓ Expected Goals</span>
                <span>✓ Odds nhà cái</span>
              </div>
            </Link>
          ) : <div className="empty">Không có trận trong ngày đã chọn.</div>}

          <div className="sectionBar">
            <div><span className="sectionEyebrow">LỊCH THI ĐẤU</span><h2>Trận đấu sắp diễn ra</h2></div>
            <form className="dateForm">
              <input type="date" name="date" defaultValue={date}/>
              <button type="submit">Xem ngày</button>
            </form>
          </div>

          <div className="matchesGrid">
            {fixtures.slice(featured ? 1 : 0, 13).map((fixture) => <FixtureCard key={String(fixture.id)} fixture={fixture}/>)}
          </div>
        </div>

        <aside className="rightRail">
          <div className="sidePanel" id="sources">
            <div className="sidePanelHead"><b>🟢 Nguồn đang hoạt động</b></div>
            <div className="sourceStack">
              <SourceBadge name="API-Football" active={sources.apiFootball}/>
              <SourceBadge name="football-data.org" active={sources.footballData}/>
              <SourceBadge name="PlayerElo" active={sources.playerElo}/>
              <SourceBadge name="Open-Meteo" active />
            </div>
            <p className="sideNote">Website chỉ hiển thị dữ liệu có nguồn. Thiếu nguồn nào sẽ báo rõ ở trang phân tích trận.</p>
          </div>

          <div className="sidePanel">
            <div className="sidePanelHead"><b>🎯 Cách đọc nhanh</b></div>
            <div className="guideItem"><span>1</span><p><b>Xác suất</b><small>Xem 1 / X / 2 trước.</small></p></div>
            <div className="guideItem"><span>2</span><p><b>Phong độ</b><small>So sánh 5 trận gần nhất.</small></p></div>
            <div className="guideItem"><span>3</span><p><b>Odds</b><small>Đối chiếu nhiều nhà cái.</small></p></div>
            <div className="guideItem"><span>4</span><p><b>Data audit</b><small>Kiểm tra độ đầy đủ dữ liệu.</small></p></div>
          </div>
        </aside>
      </section>
    </main>
  );
}
