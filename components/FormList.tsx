import type { TeamForm } from "@/lib/types";

export function FormList({ name, form }: { name: string; form: TeamForm }) {
  return (
    <div className="formTeam">
      <div className="formTeamHead">
        <div><strong>{name}</strong><small>5 trận gần nhất</small></div>
        <span className="formScore">{form.weightedPointsPct.toFixed(0)}/100</span>
      </div>

      <div className="resultPills">
        {form.matches.slice(0, 5).map((m) => (
          <span className={"resultPill result" + m.result} key={String(m.fixtureId)}>{m.result}</span>
        ))}
      </div>

      <div className="formStats">
        <span><small>Bàn thắng TB</small><b>{form.avgGoalsFor.toFixed(2)}</b></span>
        <span><small>Bàn thua TB</small><b>{form.avgGoalsAgainst.toFixed(2)}</b></span>
        <span><small>Ngày nghỉ</small><b>{form.restDays ?? "—"}</b></span>
      </div>

      <div className="formRows">
        {form.matches.slice(0, 5).map((m) => (
          <div className="compactFormRow" key={String(m.fixtureId)}>
            <span className={"resultDot result" + m.result}>{m.result}</span>
            <span>{m.opponent}</span>
            <b>{m.gf}-{m.ga}</b>
          </div>
        ))}
      </div>
    </div>
  );
}
