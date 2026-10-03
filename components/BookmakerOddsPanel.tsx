import type { BookmakerOdds } from "@/lib/types";

const marketLabels: Record<string, string> = {
  "Match Winner": "1X2",
  "Goals Over/Under": "Tài / Xỉu",
  "Asian Handicap": "Kèo châu Á",
  "Both Teams Score": "BTTS",
  "Double Chance": "Double Chance",
  "Correct Score": "Tỷ số chính xác"
};

export function BookmakerOddsPanel({ odds }: { odds: BookmakerOdds[] }) {
  return (
    <section className="panel oddsPanel">
      <div className="panelHeading">
        <div className="panelHeadingMain">
          <span className="sectionIcon">⚖</span>
          <div>
            <h2>So sánh tỷ lệ kèo nhà cái</h2>
            <p>Pre-match odds từ API-Football, cache 3 giờ để tiết kiệm quota.</p>
          </div>
        </div>
        <span className="updatedAt">{odds.length ? odds.length + " nhà cái" : "Chưa có odds"}</span>
      </div>

      {!odds.length ? (
        <div className="oddsEmpty">Trận này chưa có dữ liệu kèo pre-match hoặc nguồn odds chưa cập nhật.</div>
      ) : (
        <div className="oddsBookmakers">
          {odds.slice(0, 6).map((bookmaker) => (
            <article className="bookmakerStrip" key={bookmaker.id}>
              <div className="bookmakerName">
                <span className="bookmakerLogo">B</span>
                <div><strong>{bookmaker.name}</strong><small>{bookmaker.updatedAt ? new Date(bookmaker.updatedAt).toLocaleString("vi-VN") : "Chưa rõ giờ cập nhật"}</small></div>
              </div>

              <div className="bookmakerMarkets">
                {bookmaker.markets.slice(0, 5).map((market) => (
                  <div className="marketColumn" key={String(bookmaker.id) + "-" + String(market.id ?? market.name)}>
                    <span>{marketLabels[market.name] ?? market.name}</span>
                    <div>
                      {market.values.slice(0, 4).map((value) => (
                        <b key={value.value}>
                          <small>{value.value}</small>
                          <em>{value.odd}</em>
                        </b>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="oddsDisclaimer">Xác suất ngầm định từ odds không đồng nghĩa với dự đoán của mô hình và chưa loại biên lợi nhuận của nhà cái.</p>
    </section>
  );
}
