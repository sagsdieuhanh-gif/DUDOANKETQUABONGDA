import type { MatchAnalysis } from "@/lib/types";

function pct(n: number) { return `${n.toFixed(1)}%`; }

export function ProbabilityPanel({ analysis }: { analysis: MatchAnalysis }) {
  const p = analysis.prediction;
  return (
    <section className="card predictionCard">
      <div className="eyebrow">DỰ ĐOÁN MÔ HÌNH</div>
      <div className="probGrid">
        <div><span>{analysis.fixture.home.name}</span><strong>{pct(p.homeWin)}</strong><div className="meter"><i style={{ width: pct(p.homeWin) }} /></div></div>
        <div><span>Hòa</span><strong>{pct(p.draw)}</strong><div className="meter"><i style={{ width: pct(p.draw) }} /></div></div>
        <div><span>{analysis.fixture.away.name}</span><strong>{pct(p.awayWin)}</strong><div className="meter"><i style={{ width: pct(p.awayWin) }} /></div></div>
      </div>
      <div className="xg"><div><span>xG dự kiến chủ nhà</span><strong>{p.expectedHomeGoals.toFixed(2)}</strong></div><div><span>xG dự kiến đội khách</span><strong>{p.expectedAwayGoals.toFixed(2)}</strong></div></div>
      <div className="scorelines">{p.topScorelines.map((s) => <span key={s.score}><b>{s.score}</b> {s.probability.toFixed(1)}%</span>)}</div>
      <p className="muted">{p.modelNote}</p>
    </section>
  );
}
