import type { BookmakerOdds } from "@/lib/types";

const marketLabels: Record<string, string> = {
  "Match Winner": "Kèo châu Âu 1X2",
  "Goals Over/Under": "Tài / Xỉu",
  "Asian Handicap": "Kèo châu Á",
  "Both Teams Score": "Cả hai đội ghi bàn",
  "Double Chance": "Double Chance",
  "Correct Score": "Tỉ số chính xác"
};

export function BookmakerOddsPanel({ odds }: { odds: BookmakerOdds[] }) {
  return (
    <section className="card oddsPanel">
      <div className="cardTitle">
        <div>
          <div className="eyebrow">ODDS THỊ TRƯỜNG</div>
          <strong>Kèo nhà cái trước trận</strong>
        </div>
        <span>API-Football · cache 3 giờ</span>
      </div>

      {!odds.length ? (
        <div className="oddsEmpty">Trận này chưa có dữ liệu kèo pre-match hoặc nguồn odds chưa cập nhật.</div>
      ) : (
        <div className="bookmakerGrid">
          {odds.map((bookmaker) => (
            <article className="bookmakerCard" key={bookmaker.id}>
              <div className="bookmakerHead">
                <strong>{bookmaker.name}</strong>
                <small>{bookmaker.updatedAt ? new Date(bookmaker.updatedAt).toLocaleString("vi-VN") : "Chưa rõ giờ cập nhật"}</small>
              </div>

              <div className="marketList">
                {bookmaker.markets.map((market) => (
                  <div className="marketBlock" key={String(bookmaker.id) + "-" + String(market.id ?? market.name)}>
                    <div className="marketName">{marketLabels[market.name] ?? market.name}</div>
                    <div className="oddsValues">
                      {market.values.map((value, index) => (
                        <div className="oddChip" key={value.value + "-" + String(index)}>
                          <span>{value.value}</span>
                          <b>{value.odd}</b>
                          {value.impliedProbability != null && <small>≈ {value.impliedProbability.toFixed(1)}%</small>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="oddsDisclaimer">Tỷ lệ cược có thể thay đổi theo thời gian và nhà cái. Xác suất “≈” chỉ là 1 / odds thập phân, chưa loại biên lợi nhuận của nhà cái; phần này chỉ dùng để tham khảo dữ liệu thị trường.</p>
    </section>
  );
}
