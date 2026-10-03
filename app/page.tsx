import Link from "next/link";
import { getAnalysis, listFixtures } from "@/lib/aggregate";
import type { BookmakerOdds, MatchAnalysis, OddsMarket } from "@/lib/types";
import styles from "./home.module.css";

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

function market(bookmaker: BookmakerOdds, fragment: string): OddsMarket | undefined {
  return bookmaker.markets.find((m) => m.name.toLowerCase().includes(fragment.toLowerCase()));
}

function odd(m: OddsMarket | undefined, regex: RegExp) {
  return m?.values.find((v) => regex.test(v.value))?.odd ?? "—";
}

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((x) => x[0]).join("").toUpperCase();
}

const demoLeagues = [
  ["♞", "Premier League", 20],
  ["◆", "La Liga", 20],
  ["◉", "Serie A", 20],
  ["■", "Bundesliga", 18],
  ["●", "Ligue 1", 18],
  ["✦", "Champions League", 32],
  ["⬡", "Europa League", 32],
  ["⚽", "V-League", 7]
] as const;

const demoTips = [
  { match: "Arsenal vs Liverpool", pick: "1X2 · Arsenal thắng", meta: "Premier League — 22:30", odd: "1.95", tag: "Kèo hot", tone: "hot" },
  { match: "Real Madrid vs Barcelona", pick: "Tài xỉu 2.5 · Tài", meta: "La Liga — 21:15", odd: "1.88", tag: "Đáng chú ý", tone: "warn" },
  { match: "Man City vs Luton Town", pick: "Man City -1.5 (FT)", meta: "Premier League — 19:30", odd: "1.82", tag: "Kèo ngon", tone: "good" }
];

const demoBooks = [
  { name: "BetPro", rating: "4.9", label: "Tỷ lệ tốt nhất", icon: "C" },
  { name: "Win365", rating: "4.8", label: "Thưởng hấp dẫn", icon: "W" },
  { name: "LuckyBet", rating: "4.7", label: "Rút tiền nhanh", icon: "L" },
  { name: "VivaBet", rating: "4.6", label: "Giao diện đẹp", icon: "V" },
  { name: "ZoneBet", rating: "4.5", label: "Nhiều kèo đặc biệt", icon: "Z" }
];

const cardOdds: Record<string, [string, string, string]> = {
  "demo-2": ["1.28", "5.50", "10.00"],
  "demo-3": ["2.10", "3.60", "3.20"],
  "demo-4": ["2.05", "3.40", "3.50"],
  "demo-5": ["1.65", "4.20", "4.80"],
  "demo-6": ["1.55", "4.10", "5.50"],
  "demo-7": ["2.35", "3.25", "2.85"]
};

export default async function Home({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const params = await searchParams;
  const date = params.date || localDate();
  const { fixtures, demo } = await listFixtures(date);
  const featured = fixtures[0];

  let a: MatchAnalysis | undefined;
  if (featured) {
    try { a = await getAnalysis(String(featured.id)); } catch { a = undefined; }
  }

  const prediction = demo
    ? { homeWin: 44, draw: 26, awayWin: 30, expectedHomeGoals: 1.62, expectedAwayGoals: 1.18, topScorelines: [{ score: "2-1", probability: 13.4 }] }
    : a?.prediction;

  const books = a?.odds?.slice(0, 5) ?? [];
  const formHome = a?.homeForm.matches.slice(0, 5) ?? [];
  const formAway = a?.awayForm.matches.slice(0, 5) ?? [];

  const leagueCounts = demo
    ? demoLeagues
    : Array.from(fixtures.reduce((m, f) => {
        m.set(f.league.name, (m.get(f.league.name) ?? 0) + 1);
        return m;
      }, new Map<string, number>())).slice(0, 8).map(([name, count], i) => [["♞","◆","◉","■","●","✦","⬡","⚽"][i] ?? "⚽", name, count] as const);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <h1>Dự đoán bóng đá thông minh, <em>dễ xem, dễ dùng</em></h1>
          <p>Kết hợp phân tích phong độ, tỷ lệ kèo, chấn thương, sức mạnh Elo và lịch thi đấu để đưa ra dự đoán chính xác và khách quan nhất.</p>
          <div className={styles.filters}>
            <Link className={styles.activeFilter} href={"/?date=" + localDate()}>▦ Hôm nay</Link>
            <Link href={"/?date=" + localDate(1)}>▣ Ngày mai</Link>
            <a href="#matches">♞ Premier League</a>
            <a href="#matches">◆ La Liga</a>
            <a href="#matches">⚽ Champions League</a>
            <a href="#featured">🔥 Kèo hot</a>
          </div>
        </div>
      </section>

      <section className={styles.shell} id="matches">
        <aside className={styles.leftRail}>
          <section className={styles.panel}>
            <h3>Giải đấu phổ biến</h3>
            <div className={styles.leagueList}>
              {leagueCounts.map(([icon, name, count]) => (
                <div className={styles.leagueRow} key={name}>
                  <span><i>{icon}</i>{name}</span><b>{count}</b>
                </div>
              ))}
              <div className={styles.allLeague}><span>◌</span><b>Tất cả giải đấu</b><em>›</em></div>
            </div>
          </section>

          <section className={styles.panel}>
            <h3>Thống kê nhanh</h3>
            <div className={styles.quickStats}>
              <div><span>▣</span><p><b>{demo ? "320" : fixtures.length}</b><small>Trận đấu hôm nay</small></p></div>
              <div><span>♟</span><p><b>{demo ? "85" : (a ? "Có" : "—")}</b><small>{demo ? "Trận có dự đoán" : "Trận có phân tích"}</small></p></div>
              <div><span>↗</span><p><b>{demo ? "92%" : (a ? a.confidence + "%" : "—")}</b><small>{demo ? "Tỷ lệ dự đoán đúng (7 ngày qua)" : "Độ tin cậy dữ liệu"}</small></p></div>
              <div><span>◉</span><p><b>{demo ? "150+" : (books.length || "—")}</b><small>{demo ? "Nhà cái được so sánh" : "Nhà cái có dữ liệu"}</small></p></div>
            </div>
          </section>
        </aside>

        <div className={styles.center}>
          {featured && (
            <section className={styles.featured} id="featured">
              <div className={styles.featuredHead}>
                <span className={styles.hotLabel}>▣ Trận đấu tâm điểm</span>
                <span>♞ {featured.league.name}{demo ? " — Vòng 32" : ""}</span>
                <Link href={"/match/" + featured.id}>Xem phân tích chi tiết →</Link>
              </div>

              <div className={styles.matchStage}>
                {demo && <div className={styles.leftPlayer}/>}
                <div className={styles.teamBlock}>
                  <div className={styles.crest}>{initials(featured.home.name)}</div>
                  <strong>{featured.home.name}</strong>
                  <small>Phong độ: <i>W</i><i>W</i><i>D</i><i>W</i><i>W</i></small>
                </div>

                <div className={styles.kickoff}>
                  <small>{demo ? "Chủ nhật, 14/04/2024" : new Intl.DateTimeFormat("vi-VN",{weekday:"long",day:"2-digit",month:"2-digit",year:"numeric",timeZone:"Asia/Ho_Chi_Minh"}).format(new Date(featured.date))}</small>
                  <b>{timeOnly(featured.date)}</b>
                  <span>⌾ {featured.venue?.name ?? "Chưa rõ sân"}</span>
                </div>

                <div className={styles.teamBlock + " " + styles.teamAway}>
                  <div className={styles.crest}>{initials(featured.away.name)}</div>
                  <strong>{featured.away.name}</strong>
                  <small>Phong độ: <i>W</i><i>L</i><i>W</i><i>W</i><i>D</i></small>
                </div>
                {demo && <div className={styles.rightPlayer}/>}
              </div>

              <div className={styles.predictionStrip}>
                <div><b className={styles.green}>{prediction?.homeWin.toFixed(0) ?? "—"}%</b><span>Khả năng thắng<br/>{featured.home.name}</span><em><i style={{width:(prediction?.homeWin ?? 0)+"%"}}/></em></div>
                <div><b>{prediction?.draw.toFixed(0) ?? "—"}%</b><span>Khả năng hòa</span><em><i style={{width:(prediction?.draw ?? 0)+"%"}}/></em></div>
                <div><b className={styles.red}>{prediction?.awayWin.toFixed(0) ?? "—"}%</b><span>Khả năng thắng<br/>{featured.away.name}</span><em><i style={{width:(prediction?.awayWin ?? 0)+"%"}}/></em></div>
                <div><b>{prediction ? (prediction.expectedHomeGoals + prediction.expectedAwayGoals).toFixed(1) : "—"}</b><span>Bàn thắng kỳ vọng<br/>(xG)</span></div>
                <div><b>{prediction?.topScorelines[0]?.score ?? "—"}</b><span>Tỷ số dễ xảy ra nhất</span></div>
              </div>
            </section>
          )}

          <div className={styles.sectionTitle}>
            <h2>Trận đấu sắp diễn ra</h2>
            <div><button>Tất cả</button><span>Premier League</span><span>La Liga</span><span>Serie A</span><span>Bundesliga</span></div>
          </div>

          <div className={styles.matchGrid}>
            {fixtures.slice(1, 7).map((f) => {
              const o = cardOdds[String(f.id)] ?? ["—","—","—"];
              return (
                <Link href={"/match/" + f.id} className={styles.matchCard} key={String(f.id)}>
                  <div><span>⚽ {f.league.name}{demo ? " — Vòng 32" : ""}</span><time>Hôm nay, {timeOnly(f.date)}</time></div>
                  <section>
                    <p><i className={styles.smallCrest}>{initials(f.home.name)}</i><b>{f.home.name}</b></p>
                    <strong>vs</strong>
                    <p><b>{f.away.name}</b><i className={styles.smallCrest}>{initials(f.away.name)}</i></p>
                  </section>
                  <footer><span>1 <b>{o[0]}</b></span><span>X <b>{o[1]}</b></span><span>2 <b>{o[2]}</b></span></footer>
                </Link>
              );
            })}
          </div>

          <section className={styles.oddsPanel}>
            <header><b>◉ Tỷ lệ kèo nhà cái ({featured?.home.name} vs {featured?.away.name})</b><a>Xem tất cả tỷ lệ ›</a></header>
            <div className={styles.oddsTable}>
              <div className={styles.oddsHeader}><span>Nhà cái</span><span>1 (Arsenal)</span><span>X (Hòa)</span><span>2 (Liverpool)</span><span>Tài 2.5</span><span>Xỉu 2.5</span></div>
              {(books.length ? books : [
                {id:1,name:"BetPro",markets:[]},{id:2,name:"Win365",markets:[]},{id:3,name:"LuckyBet",markets:[]}
              ] as any[]).slice(0,3).map((book:any, idx:number) => {
                const m1 = market(book, "winner");
                const ou = market(book, "over/under");
                const fallback = [
                  ["1.95","3.60","3.40","1.88","1.98"],
                  ["1.93","3.55","3.45","1.90","1.95"],
                  ["1.90","3.70","3.50","1.92","1.92"]
                ][idx];
                return <div className={styles.oddsRow} key={book.id}>
                  <strong>{book.name}</strong>
                  <b>{demo ? fallback[0] : odd(m1,/home|1$/i)}</b>
                  <b>{demo ? fallback[1] : odd(m1,/draw|x/i)}</b>
                  <b>{demo ? fallback[2] : odd(m1,/away|2$/i)}</b>
                  <b>{demo ? fallback[3] : odd(ou,/over.*2\.5|2\.5.*over/i)}</b>
                  <b>{demo ? fallback[4] : odd(ou,/under.*2\.5|2\.5.*under/i)}</b>
                </div>;
              })}
            </div>
          </section>
        </div>

        <aside className={styles.rightRail}>
          <section className={styles.panel}>
            <div className={styles.panelTitle}><h3>🔥 Top kèo nổi bật</h3><a>Xem thêm ›</a></div>
            <div className={styles.tipList}>
              {demoTips.map((t) => <div className={styles.tip} key={t.match}>
                <span>⚽</span><div><b>{t.match}</b><strong>{t.pick}</strong><small>◉ {t.meta}</small></div><aside><b>{t.odd}</b><i className={styles[t.tone]}>{t.tag}</i></aside>
              </div>)}
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelTitle}><h3>⬡ Nhà cái tốt nhất</h3><a>Xem tất cả ›</a></div>
            <div className={styles.bookList}>
              {demoBooks.map((b, i) => <div key={b.name}><span className={styles["book"+i]}>{b.icon}</span><b>{b.name}</b><strong>★ {b.rating}</strong><em>{b.label}</em></div>)}
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelTitle}><h3>⬡ Phong độ 5 trận gần nhất</h3><a>Xem thêm ›</a></div>
            <div className={styles.formTabs}><b>Arsenal</b><b>Liverpool</b></div>
            <div className={styles.formCols}>
              <div>{formHome.map((m) => <p key={String(m.fixtureId)}><i className={styles["r"+m.result]}>{m.result}</i><span>vs {m.opponent}</span><b>{m.gf}-{m.ga}</b></p>)}</div>
              <div>{formAway.map((m) => <p key={String(m.fixtureId)}><i className={styles["r"+m.result]}>{m.result}</i><span>vs {m.opponent}</span><b>{m.gf}-{m.ga}</b></p>)}</div>
            </div>
          </section>
        </aside>
      </section>

      {demo && <div className={styles.demoNote}>Dữ liệu trên màn hình này là dữ liệu minh họa để hoàn thiện giao diện; khi API thật có dữ liệu, website sẽ ưu tiên dữ liệu thật.</div>}
    </main>
  );
}
