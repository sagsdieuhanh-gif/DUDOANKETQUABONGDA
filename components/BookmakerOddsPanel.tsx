import type { BookmakerOdds, OddsMarket } from "@/lib/types";

function market(bookmaker: BookmakerOdds, name: string) {
  return bookmaker.markets.find((m) => m.name.toLowerCase().includes(name.toLowerCase()));
}

function odd(m: OddsMarket | undefined, regex: RegExp) {
  return m?.values.find((v) => regex.test(v.value))?.odd ?? "—";
}

export function BookmakerOddsPanel({ odds }: { odds: BookmakerOdds[] }) {
  return (
    <section className="panel oddsPanel mockOddsPanel">
      <div className="panelHeading mockOddsHeading">
        <div className="panelHeadingMain">
          <span className="sectionIcon">⚖</span>
          <div>
            <h2>So sánh tỷ lệ kèo nhà cái</h2>
            <p>Odds pre-match · dữ liệu thị trường để đối chiếu.</p>
          </div>
        </div>
        <span className="updatedAt">{odds.length ? odds.length + " nhà cái" : "Chưa có odds"}</span>
      </div>

      <div className="oddsTabs">
        <span className="oddsTabActive">1X2</span><span>Tài/Xỉu 2.5</span><span>Asian Handicap</span><span>Cả hai đội ghi bàn</span><span>Double Chance</span>
      </div>

      {!odds.length ? (
        <div className="oddsEmpty">Trận này chưa có dữ liệu kèo pre-match hoặc nguồn odds chưa cập nhật.</div>
      ) : (
        <div className="matrixWrap">
          <div className="matrixRow matrixHeader">
            <span>Nhà cái</span><span>1</span><span>X</span><span>2</span><span>Trên 2.5</span><span>Dưới 2.5</span><span>AH chủ</span><span>AH khách</span><span>BTTS Có</span><span>BTTS Không</span>
          </div>
          {odds.slice(0, 6).map((bookmaker) => {
            const one = market(bookmaker, "winner");
            const ou = market(bookmaker, "over/under");
            const ah = market(bookmaker, "asian handicap");
            const btts = market(bookmaker, "both teams");
            return (
              <div className="matrixRow" key={bookmaker.id}>
                <strong>{bookmaker.name}</strong>
                <b>{odd(one,/home|1$/i)}</b>
                <b>{odd(one,/draw|x/i)}</b>
                <b>{odd(one,/away|2$/i)}</b>
                <b>{odd(ou,/over.*2\.5|2\.5.*over/i)}</b>
                <b>{odd(ou,/under.*2\.5|2\.5.*under/i)}</b>
                <b>{ah?.values[0]?.odd ?? "—"}</b>
                <b>{ah?.values[1]?.odd ?? "—"}</b>
                <b>{odd(btts,/yes|có/i)}</b>
                <b>{odd(btts,/no|không/i)}</b>
              </div>
            );
          })}
        </div>
      )}

      <p className="oddsDisclaimer">Odds có thể thay đổi theo thời gian. Đây là dữ liệu thị trường, không phải khuyến nghị đặt cược.</p>
    </section>
  );
}
