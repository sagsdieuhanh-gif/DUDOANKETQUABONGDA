import Link from "next/link";
import { BookmakerOddsPanel } from "@/components/BookmakerOddsPanel";
import { FormList } from "@/components/FormList";
import { ProbabilityPanel } from "@/components/ProbabilityPanel";
import { TeamBadge } from "@/components/TeamBadge";
import { getAnalysis } from "@/lib/aggregate";

export const dynamic = "force-dynamic";

function reasons(a: Awaited<ReturnType<typeof getAnalysis>>) {
  const out: Array<{ title: string; detail: string; level: "high" | "mid" }> = [];
  const formDiff = a.homeForm.weightedPointsPct - a.awayForm.weightedPointsPct;
  out.push({
    title: "Phong độ hiện tại",
    detail: (formDiff >= 0 ? a.fixture.home.name : a.fixture.away.name) + " đang có điểm phong độ nhỉnh hơn trong chuỗi trận gần nhất.",
    level: Math.abs(formDiff) >= 15 ? "high" : "mid"
  });
  if (a.homeElo && a.awayElo) {
    const diff = a.homeElo - a.awayElo;
    out.push({
      title: "Chỉ số Elo & sức mạnh",
      detail: "Chênh lệch Elo là " + Math.abs(Math.round(diff)) + " điểm, nghiêng về " + (diff >= 0 ? a.fixture.home.name : a.fixture.away.name) + ".",
      level: Math.abs(diff) >= 100 ? "high" : "mid"
    });
  }
  out.push({
    title: "Lực lượng & chấn thương",
    detail: a.fixture.home.name + " có " + a.homeInjuries + " trường hợp vắng mặt, " + a.fixture.away.name + " có " + a.awayInjuries + ".",
    level: Math.abs(a.homeInjuries - a.awayInjuries) >= 2 ? "high" : "mid"
  });
  out.push({
    title: "Lợi thế sân nhà",
    detail: "Mô hình luôn áp dụng hệ số lợi thế sân nhà cho " + a.fixture.home.name + ".",
    level: "high"
  });
  out.push({
    title: "Lịch thi đấu & thể lực",
    detail: "Ngày nghỉ: " + a.fixture.home.name + " " + (a.homeForm.restDays ?? "—") + " ngày, " + a.fixture.away.name + " " + (a.awayForm.restDays ?? "—") + " ngày.",
    level: "mid"
  });
  return out;
}

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const a = await getAnalysis(id);
  const date = new Intl.DateTimeFormat("vi-VN", { weekday:"long", day:"2-digit", month:"2-digit", year:"numeric", timeZone:"Asia/Ho_Chi_Minh" }).format(new Date(a.fixture.date));
  const time = new Intl.DateTimeFormat("vi-VN", { hour:"2-digit", minute:"2-digit", timeZone:"Asia/Ho_Chi_Minh" }).format(new Date(a.fixture.date));
  const r = reasons(a);
  const firstBookmaker = a.odds?.[0];

  return (
    <main className="matchPage exactMatchPage">
      <div className="breadcrumb"><Link href="/">⌂</Link><span>›</span><span>{a.fixture.league.name}</span><span>›</span><b>{a.fixture.home.name} vs {a.fixture.away.name}</b></div>

      {a.fixture.isDemo && <div className="notice"><b>DỮ LIỆU MINH HỌA.</b><span>Trang này đang chạy bằng dữ liệu demo.</span></div>}

      <section className="matchBanner exactMatchBanner">
        <div className="bannerTeam">
          <TeamBadge name={a.fixture.home.name} logo={a.fixture.home.logo} size={80}/>
          <div><strong>{a.fixture.home.name}</strong><small>(Chủ nhà)</small></div>
        </div>
        <div className="bannerCenter">
          <span className="leagueBadge">⚽ {a.fixture.league.name}</span>
          <small>{date}</small>
          <strong>{time}</strong>
          <span>⌾ {a.fixture.venue?.name ?? "Chưa rõ sân"}{a.fixture.venue?.city ? ", " + a.fixture.venue.city : ""}</span>
        </div>
        <div className="bannerTeam bannerTeamAway">
          <div><strong>{a.fixture.away.name}</strong><small>(Đội khách)</small></div>
          <TeamBadge name={a.fixture.away.name} logo={a.fixture.away.logo} size={80}/>
        </div>
      </section>

      <nav className="matchTabs exactTabs">
        <a className="tabActive" href="#overview">▣ Tổng quan</a>
        <a href="#analysis">▥ Phân tích</a>
        <a href="#odds">⚖ Kèo nhà cái</a>
        <a href="#form">◉ Đội hình / phong độ</a>
        <a href="#h2h">⚽ H2H</a>
      </nav>

      <div className="matchContentGrid exactMatchGrid" id="overview">
        <div className="matchMainColumn">
          <ProbabilityPanel analysis={a}/>

          <div className="oddsAndFormRow">
            <div id="odds"><BookmakerOddsPanel odds={a.odds ?? []}/></div>
            <section className="panel compactFormPanel" id="form">
              <div className="panelHeading">
                <div className="panelHeadingMain"><span className="sectionIcon">◉</span><div><h2>Phong độ gần đây</h2><p>5 trận gần nhất</p></div></div>
              </div>
              <div className="formCompare stackedFormCompare">
                <FormList name={a.fixture.home.name} form={a.homeForm}/>
                <FormList name={a.fixture.away.name} form={a.awayForm}/>
              </div>
            </section>
          </div>

          <div className="bottomAnalysisGrid">
            <section className="panel seasonStatsPanel">
              <div className="panelHeading">
                <div className="panelHeadingMain"><span className="sectionIcon">◉</span><div><h2>Thống kê nhanh</h2><p>Chỉ số đang dùng trong mô hình</p></div></div>
              </div>
              <div className="seasonCompare">
                <div><span>Bàn thắng TB</span><b>{a.homeForm.avgGoalsFor.toFixed(2)}</b><i><em style={{width: Math.min(100,a.homeForm.avgGoalsFor/3*100)+"%"}}/></i><b>{a.awayForm.avgGoalsFor.toFixed(2)}</b></div>
                <div><span>Bàn thua TB</span><b>{a.homeForm.avgGoalsAgainst.toFixed(2)}</b><i><em style={{width: Math.min(100,a.homeForm.avgGoalsAgainst/3*100)+"%"}}/></i><b>{a.awayForm.avgGoalsAgainst.toFixed(2)}</b></div>
                <div><span>Elo</span><b>{a.homeElo?.toFixed(0) ?? "—"}</b><i><em style={{width:"64%"}}/></i><b>{a.awayElo?.toFixed(0) ?? "—"}</b></div>
                <div><span>Ngày nghỉ</span><b>{a.homeForm.restDays ?? "—"}</b><i><em style={{width:"52%"}}/></i><b>{a.awayForm.restDays ?? "—"}</b></div>
                <div><span>Vắng mặt</span><b>{a.homeInjuries}</b><i><em style={{width:"35%"}}/></i><b>{a.awayInjuries}</b></div>
              </div>
            </section>

            <section className="panel explanationPanel" id="analysis">
              <div className="panelHeading">
                <div className="panelHeadingMain"><span className="sectionIcon">💡</span><div><h2>Vì sao hệ thống dự đoán như vậy?</h2><p>Các yếu tố tác động chính</p></div></div>
              </div>
              <div className="reasonList">
                {r.map((item,index)=>(
                  <div className="reasonRow" key={item.title}>
                    <span className="reasonNumber">{index+1}</span>
                    <div><b>{item.title}</b><p>{item.detail}</p></div>
                    <span className={item.level==="high"?"impact impactHigh":"impact"}>{item.level==="high"?"Ảnh hưởng cao":"Ảnh hưởng trung bình"}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel h2hPanel" id="h2h">
              <div className="panelHeading"><div className="panelHeadingMain"><span className="sectionIcon">◉</span><div><h2>Lịch sử đối đầu</h2><p>{a.h2h.length || 0} trận gần nhất có dữ liệu</p></div></div></div>
              <div className="h2hList">
                {a.h2h.length ? a.h2h.slice(0,5).map((m)=>(
                  <div key={m.fixtureId}><span>{new Date(m.date).toLocaleDateString("vi-VN")}</span><b>{m.opponent}</b><strong>{m.gf} - {m.ga}</strong></div>
                )) : <p className="sideNote">Chưa có dữ liệu H2H.</p>}
              </div>
            </section>
          </div>

          <section className="panel dataAuditPanel" id="sources">
            <div className="panelHeading"><div className="panelHeadingMain"><span className="sectionIcon">✓</span><div><h2>Kiểm tra nguồn dữ liệu</h2><p>Cập nhật {new Date(a.generatedAt).toLocaleString("vi-VN")}</p></div></div></div>
            <div className="auditGrid">{a.sources.map((s)=><div className="auditCard" key={s.name}><span className={"auditBadge "+s.status}>{s.status==="ok"?"✓":s.status==="partial"?"!":"×"}</span><div><b>{s.name}</b><p>{s.note}</p></div></div>)}</div>
          </section>
        </div>

        <aside className="matchRightRail exactRightRail">
          <section className="sidePanel">
            <div className="sidePanelHead"><b>🔥 Kèo nổi bật hôm nay</b><span>Xem thêm ›</span></div>
            {firstBookmaker?.markets.slice(0,3).map((m)=>(
              <div className="tipRow" key={m.name}><span className="tipIcon">⚽</span><div><b>{m.name}</b><small>{m.values[0]?.value ?? "Thị trường"} · {a.fixture.league.name}</small></div><strong>{m.values[0]?.odd ?? "—"}</strong></div>
            )) ?? <p className="sideNote">Chưa có odds nổi bật.</p>}
          </section>

          <section className="sidePanel dataSignalPanel">
            <div className="sidePanelHead"><b>🎯 Đề xuất theo dữ liệu</b></div>
            <div className="signalCard"><span>1</span><div><b>Kịch bản 1X2</b><p>Xác suất cao nhất hiện là {Math.max(a.prediction.homeWin,a.prediction.draw,a.prediction.awayWin).toFixed(1)}%.</p></div><em>Tham khảo</em></div>
            <div className="signalCard"><span>2</span><div><b>Tổng bàn kỳ vọng</b><p>Mô hình hiện cho tổng xG {(a.prediction.expectedHomeGoals+a.prediction.expectedAwayGoals).toFixed(2)}.</p></div><em>Dữ liệu</em></div>
            <div className="signalCard"><span>3</span><div><b>Tỷ số nổi bật</b><p>{a.prediction.topScorelines[0]?.score ?? "—"} đang có xác suất cao nhất trong ma trận Poisson.</p></div><em>Mô hình</em></div>
            <div className="signalCard"><span>4</span><div><b>Độ tin cậy</b><p>Data confidence hiện tại {a.confidence}%.</p></div><em>Audit</em></div>
          </section>

          <section className="sidePanel">
            <div className="sidePanelHead"><b>◎ Dữ liệu trận</b></div>
            <div className="summaryItem"><span>Thời tiết</span><b>{a.weather?.temperature != null ? a.weather.temperature+"°C" : "—"}</b></div>
            <div className="summaryItem"><span>Vắng mặt</span><b>{a.homeInjuries} : {a.awayInjuries}</b></div>
            <div className="summaryItem"><span>Ngày nghỉ</span><b>{a.homeForm.restDays ?? "—"} : {a.awayForm.restDays ?? "—"}</b></div>
            <div className="summaryItem"><span>Data confidence</span><b>{a.confidence}%</b></div>
          </section>
        </aside>
      </div>
    </main>
  );
}
