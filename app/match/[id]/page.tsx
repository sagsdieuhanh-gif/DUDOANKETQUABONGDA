import Link from "next/link";
import { BookmakerOddsPanel } from "@/components/BookmakerOddsPanel";
import { FormList } from "@/components/FormList";
import { ProbabilityPanel } from "@/components/ProbabilityPanel";
import { getAnalysis } from "@/lib/aggregate";

export const dynamic = "force-dynamic";

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const a = await getAnalysis(id);
  const kickoff = new Intl.DateTimeFormat("vi-VN", { dateStyle: "full", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(a.fixture.date));
  return (
    <main>
      <Link href="/" className="back">← Quay lại lịch</Link>
      {a.fixture.isDemo && <div className="notice"><b>DỮ LIỆU MINH HỌA.</b> Mục này dùng để xem cách website hoạt động trước khi bạn nhập API key.</div>}
      <section className="matchHero">
        <div className="eyebrow">{a.fixture.league.name}</div><h1>{a.fixture.home.name} <span>vs</span> {a.fixture.away.name}</h1><p>{kickoff} · {a.fixture.venue?.name ?? "Chưa rõ sân"}</p>
        <div className="confidence"><span>Data confidence</span><strong>{a.confidence}%</strong><div><i style={{width:`${a.confidence}%`}}/></div></div>
      </section>
      <ProbabilityPanel analysis={a}/>
      <BookmakerOddsPanel odds={a.odds ?? []}/>
      <section className="twoCols"><FormList name={a.fixture.home.name} form={a.homeForm}/><FormList name={a.fixture.away.name} form={a.awayForm}/></section>
      <section className="metrics">
        <div className="card metric"><span>Elo</span><strong>{a.homeElo?.toFixed(0) ?? "—"} : {a.awayElo?.toFixed(0) ?? "—"}</strong><small>PlayerElo Team Elo</small></div>
        <div className="card metric"><span>Vắng mặt</span><strong>{a.homeInjuries} : {a.awayInjuries}</strong><small>Injury + suspension report</small></div>
        <div className="card metric"><span>Ngày nghỉ</span><strong>{a.homeForm.restDays ?? "—"} : {a.awayForm.restDays ?? "—"}</strong><small>Tính từ trận gần nhất</small></div>
        <div className="card metric"><span>Thời tiết</span><strong className="weatherText">{a.weather?.label ?? "Chưa có"}</strong><small>Open-Meteo</small></div>
      </section>
      <section className="card audit"><div className="cardTitle"><strong>Data audit</strong><span>Cập nhật {new Date(a.generatedAt).toLocaleString("vi-VN")}</span></div>{a.sources.map((s) => <div className="auditRow" key={s.name}><span className={`auditStatus ${s.status}`}>{s.status === "ok" ? "✓" : s.status === "partial" ? "!" : "×"}</span><b>{s.name}</b><p>{s.note}</p></div>)}</section>
      <section className="card formula"><div className="eyebrow">CÔNG THỨC MVP</div><h2>Con số được tạo ra thế nào?</h2><p><code>λ_home = weighted(GF_home, GA_away) × home advantage × Elo factor × rest factor × availability</code></p><p><code>λ_away = weighted(GF_away, GA_home) × Elo factor × rest factor × availability</code></p><p>Sau đó Poisson tính xác suất từng tỉ số 0–0 đến 7–7. Nếu PlayerElo có dự đoán, website blend 25% xác suất từ mô hình đó và 75% mô hình nội bộ. Kèo nhà cái được hiển thị riêng để tham khảo thị trường và hiện chưa được đưa vào công thức dự đoán nội bộ.</p></section>
    </main>
  );
}
