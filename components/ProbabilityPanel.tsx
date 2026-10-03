import type { MatchAnalysis } from "@/lib/types";
import { TeamBadge } from "@/components/TeamBadge";

function pct(n: number) { return n.toFixed(1) + "%"; }

export function ProbabilityPanel({ analysis }: { analysis: MatchAnalysis }) {
  const p = analysis.prediction;
  return (
    <section className="panel predictionPanel">
      <div className="panelHeading">
        <div className="panelHeadingMain">
          <span className="sectionIcon">✦</span>
          <div>
            <h2>Dự đoán kết quả trận đấu</h2>
            <p>Phân tích xác suất từ phong độ, Elo, lịch nghỉ và lực lượng.</p>
          </div>
        </div>
        <span className="updatedAt">Độ tin cậy {analysis.confidence}%</span>
      </div>

      <div className="predictionLayout">
        <div className="probabilityBoard">
          <div className="probTeam">
            <TeamBadge name={analysis.fixture.home.name} logo={analysis.fixture.home.logo} size={54}/>
            <div>
              <span>{analysis.fixture.home.name}</span>
              <strong className="probHome">{pct(p.homeWin)}</strong>
              <small>Khả năng thắng</small>
            </div>
          </div>

          <div className="probDraw">
            <span>Hòa</span>
            <strong>{pct(p.draw)}</strong>
            <small>Khả năng hòa</small>
          </div>

          <div className="probTeam probTeamAway">
            <div>
              <span>{analysis.fixture.away.name}</span>
              <strong className="probAway">{pct(p.awayWin)}</strong>
              <small>Khả năng thắng</small>
            </div>
            <TeamBadge name={analysis.fixture.away.name} logo={analysis.fixture.away.logo} size={54}/>
          </div>
        </div>

        <div className="predictionSide">
          <div className="xgCard">
            <span>xG dự kiến</span>
            <div><b>{p.expectedHomeGoals.toFixed(2)}</b><i>—</i><b>{p.expectedAwayGoals.toFixed(2)}</b></div>
            <small>{analysis.fixture.home.name} · {analysis.fixture.away.name}</small>
          </div>
          <div className="confidenceCard">
            <span>Độ tin cậy dữ liệu</span>
            <div className="confidenceBar"><i style={{width: analysis.confidence + "%"}}/></div>
            <b>{analysis.confidence}%</b>
          </div>
        </div>
      </div>

      <div className="scorelineStrip">
        <span className="stripLabel">Tỷ số có xác suất cao:</span>
        {p.topScorelines.map((s, index) => (
          <span className={index === 0 ? "scoreChip scoreChipHot" : "scoreChip"} key={s.score}>
            <b>{s.score}</b><small>{s.probability.toFixed(1)}%</small>
          </span>
        ))}
      </div>
    </section>
  );
}
