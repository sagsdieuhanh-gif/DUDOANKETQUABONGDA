import Link from "next/link";
import { BookmakerOddsPanel } from "@/components/BookmakerOddsPanel";
import { FormList } from "@/components/FormList";
import { ProbabilityPanel } from "@/components/ProbabilityPanel";
import { TeamBadge } from "@/components/TeamBadge";
import { getAnalysis } from "@/lib/aggregate";

export const dynamic = "force-dynamic";

function reasonLines(a: Awaited<ReturnType<typeof getAnalysis>>) {
  const lines: Array<{ title: string; detail: string; level: string }> = [];
  const formDiff = a.homeForm.weightedPointsPct - a.awayForm.weightedPointsPct;
  lines.push({
    title: "Phong độ gần đây",
    detail: formDiff >= 0
      ? a.fixture.home.name + " có điểm phong độ cao hơn " + a.fixture.away.name + " trong chuỗi trận gần nhất."
      : a.fixture.away.name + " đang có điểm phong độ cao hơn " + a.fixture.home.name + ".",
    level: Math.abs(formDiff) >= 15 ? "Ảnh hưởng cao" : "Ảnh hưởng vừa"
  });

  if (a.homeElo && a.awayElo) {
    const eloDiff = Math.round(a.homeElo - a.awayElo);
    lines.push({
      title: "Sức mạnh Elo",
      detail: "Chênh lệch Elo hiện tại là " + Math.abs(eloDiff) + " điểm, nghiêng về " + (eloDiff >= 0 ? a.fixture.home.name : a.fixture.away.name) + ".",
      level: Math.abs(eloDiff) >= 100 ? "Ảnh hưởng cao" : "Ảnh hưởng vừa"
    });
  }

  lines.push({
    title: "Lực lượng",
    detail: a.fixture.home.name + " ghi nhận " + a.homeInjuries + " trường hợp vắng mặt; " + a.fixture.away.name + " là " + a.awayInjuries + ".",
    level: Math.abs(a.homeInjuries - a.awayInjuries) >= 2 ? "Ảnh hưởng cao" : "Ảnh hưởng vừa"
  });

  lines.push({
    title: "Lịch nghỉ",
    detail: "Số ngày nghỉ gần nhất: " + a.fixture.home.name + " " + (a.homeForm.restDays ?? "—") + " ngày, " + a.fixture.away.name + " " + (a.awayForm.restDays ?? "—") + " ngày.",
    level: "Ảnh hưởng vừa"
  });

  return lines;
}

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const a = await getAnalysis(id);
  const kickoffDate = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(a.fixture.date));
  const kickoffTime = new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(a.fixture.date));
  const reasons = reasonLines(a);
  const firstBookmaker = a.odds?.[0];

  return (
    <main className="matchPage">
      <div className="breadcrumb"><Link href="/">Trang chủ</Link><span>›</span><span>{a.fixture.league.name}</span><span>›</span><b>{a.fixture.home.name} vs {a.fixture.away.name}</b></div>

      {a.fixture.isDemo && <div className="notice"><b>DỮ LIỆU MINH HỌA.</b><span>Trang này đang chạy bằng bộ dữ liệu demo.</span></div>}

      <section className="matchBanner">
        <div className="bannerTeam">
          <TeamBadge name={a.fixture.home.name} logo={a.fixture.home.logo} size={88}/>
          <div><strong>{a.fixture.home.name}</strong><small>Chủ nhà</small></div>
        </div>

        <div className="bannerCenter">
          <span className="leagueBadge">{a.fixture.league.name}</span>
          <small>{kickoffDate}</small>
          <strong>{kickoffTime}</strong>
          <span>{a.fixture.venue?.name ?? "Chưa rõ sân"}{a.fixture.venue?.city ? " · " + a.fixture.venue.city : ""}</span>
        </div>

        <div className="bannerTeam bannerTeamAway">
          <div><strong>{a.fixture.away.name}</strong><small>Đội khách</small></div>
          <TeamBadge name={a.fixture.away.name} logo={a.fixture.away.logo} size={88}/>
        </div>
      </section>

      <nav className="matchTabs">
        <a className="tabActive" href="#overview">▣ Tổng quan</a>
        <a href="#analysis">▥ Phân tích</a>
        <a href="#odds">⚖ Kèo nhà cái</a>
        <a href="#form">◉ Phong độ</a>
        <a href="#sources">◎ Nguồn dữ liệu</a>
      </nav>

      <div className="matchContentGrid" id="overview">
        <div className="matchMainColumn">
          <ProbabilityPanel analysis={a}/>

          <div id="odds">
            <BookmakerOddsPanel odds={a.odds ?? []}/>
          </div>

          <section className="panel" id="form">
            <div className="panelHeading">
              <div className="panelHeadingMain"><span className="sectionIcon">◉</span><div><h2>Phong độ gần đây</h2><p>So sánh 5 trận gần nhất của hai đội.</p></div></div>
            </div>
            <div className="formCompare">
              <FormList name={a.fixture.home.name} form={a.homeForm}/>
              <FormList name={a.fixture.away.name} form={a.awayForm}/>
            </div>
          </section>

          <section className="matchMetricGrid">
            <div className="metricTile"><span>Elo</span><b>{a.homeElo?.toFixed(0) ?? "—"} <i>:</i> {a.awayElo?.toFixed(0) ?? "—"}</b><small>PlayerElo</small></div>
            <div className="metricTile"><span>Vắng mặt</span><b>{a.homeInjuries} <i>:</i> {a.awayInjuries}</b><small>Chấn thương / treo giò</small></div>
            <div className="metricTile"><span>Ngày nghỉ</span><b>{a.homeForm.restDays ?? "—"} <i>:</i> {a.awayForm.restDays ?? "—"}</b><small>Từ trận gần nhất</small></div>
            <div className="metricTile"><span>Thời tiết</span><b className="metricWeather">{a.weather?.label ?? "Chưa có"}</b><small>Open-Meteo</small></div>
          </section>

          <section className="panel explanationPanel" id="analysis">
            <div className="panelHeading">
              <div className="panelHeadingMain"><span className="sectionIcon">💡</span><div><h2>Vì sao hệ thống dự đoán như vậy?</h2><p>Các yếu tố đang tác động nhiều nhất đến mô hình.</p></div></div>
            </div>
            <div className="reasonList">
              {reasons.map((reason, index) => (
                <div className="reasonRow" key={reason.title}>
                  <span className="reasonNumber">{index + 1}</span>
                  <div><b>{reason.title}</b><p>{reason.detail}</p></div>
                  <span className={reason.level.includes("cao") ? "impact impactHigh" : "impact"}>{reason.level}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="panel dataAuditPanel" id="sources">
            <div className="panelHeading">
              <div className="panelHeadingMain"><span className="sectionIcon">✓</span><div><h2>Kiểm tra nguồn dữ liệu</h2><p>Cập nhật {new Date(a.generatedAt).toLocaleString("vi-VN")}</p></div></div>
            </div>
            <div className="auditGrid">
              {a.sources.map((source) => (
                <div className="auditCard" key={source.name}>
                  <span className={"auditBadge " + source.status}>{source.status === "ok" ? "✓" : source.status === "partial" ? "!" : "×"}</span>
                  <div><b>{source.name}</b><p>{source.note}</p></div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="matchRightRail">
          <section className="sidePanel stickyPanel">
            <div className="sidePanelHead"><b>🔥 Tóm tắt trận đấu</b></div>
            <div className="summaryItem"><span>Xác suất cao nhất</span><b>{Math.max(a.prediction.homeWin, a.prediction.draw, a.prediction.awayWin).toFixed(1)}%</b></div>
            <div className="summaryItem"><span>Tổng xG dự kiến</span><b>{(a.prediction.expectedHomeGoals + a.prediction.expectedAwayGoals).toFixed(2)}</b></div>
            <div className="summaryItem"><span>Độ tin cậy</span><b>{a.confidence}%</b></div>
            <div className="summaryItem"><span>Tỷ số nổi bật</span><b>{a.prediction.topScorelines[0]?.score ?? "—"}</b></div>
          </section>

          <section className="sidePanel">
            <div className="sidePanelHead"><b>📈 Tỷ số đáng chú ý</b></div>
            <div className="sidebarScorelines">
              {a.prediction.topScorelines.slice(0, 5).map((score, index) => (
                <div key={score.score} className={index === 0 ? "sidebarScore sidebarScoreHot" : "sidebarScore"}><b>{score.score}</b><span>{score.probability.toFixed(1)}%</span></div>
              ))}
            </div>
          </section>

          <section className="sidePanel">
            <div className="sidePanelHead"><b>⚖ Thị trường tham khảo</b></div>
            {firstBookmaker ? (
              <div className="marketPreview">
                <strong>{firstBookmaker.name}</strong>
                {firstBookmaker.markets.slice(0, 3).map((market) => (
                  <div key={market.name} className="marketPreviewBlock">
                    <span>{market.name}</span>
                    <div>{market.values.slice(0, 3).map((v) => <b key={v.value}>{v.value} <em>{v.odd}</em></b>)}</div>
                  </div>
                ))}
              </div>
            ) : <p className="sideNote">Chưa có odds pre-match cho trận này.</p>}
          </section>
        </aside>
      </div>
    </main>
  );
}
