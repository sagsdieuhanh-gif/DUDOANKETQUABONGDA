import type { TeamForm } from "@/lib/types";

export function FormList({ name, form }: { name: string; form: TeamForm }) {
  return (
    <div className="card">
      <div className="cardTitle"><strong>{name}</strong><span>Form {form.weightedPointsPct.toFixed(0)}/100</span></div>
      <div className="miniStats"><span>GF <b>{form.avgGoalsFor.toFixed(2)}</b></span><span>GA <b>{form.avgGoalsAgainst.toFixed(2)}</b></span><span>Nghỉ <b>{form.restDays ?? "?"} ngày</b></span></div>
      <div className="formList">
        {form.matches.length ? form.matches.map((m) => (
          <div className="formRow" key={String(m.fixtureId)}><span className={`result result${m.result}`}>{m.result}</span><span>{m.opponent}</span><b>{m.gf}-{m.ga}</b><small>{m.venue === "home" ? "Sân nhà" : "Sân khách"}</small></div>
        )) : <p className="muted">Chưa đủ dữ liệu trận gần nhất.</p>}
      </div>
    </div>
  );
}
