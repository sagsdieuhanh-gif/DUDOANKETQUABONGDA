# Football Predictor Lab — MVP

Website Next.js tổng hợp nhiều nguồn dữ liệu bóng đá miễn phí/miễn phí có giới hạn, tính form và dự đoán 1/X/2 bằng mô hình Poisson có điều chỉnh Elo, ngày nghỉ và vắng mặt.

> Quan trọng: đây là mô hình xác suất, không phải cam kết kết quả. Các trọng số MVP phải được backtest trước khi xem là mô hình production.

## 1. Stack

- Next.js 16.3.8 + React 19.2.7 + TypeScript
- Server Components: API key không bị lộ ra trình duyệt
- API-Football: fixtures, recent form, injuries, H2H
- football-data.org: đối chiếu fixture
- PlayerElo: Team Elo + external prediction nếu endpoint có dữ liệu
- Open-Meteo: địa điểm + forecast
- Poisson: chuyển expected goals thành xác suất home/draw/away + scoreline

## 2. Chạy ngay ở Demo Mode

Yêu cầu: Node.js >= 20.9 (khuyến nghị Node 22 LTS).

```bash
npm install
npm run dev
```

Mở: http://localhost:3000

Không có key thì website tự chạy DEMO MODE.

## 3. Biến môi trường

Copy `.env.example` thành `.env.local` và điền:

```env
API_FOOTBALL_KEY=xxxxx
FOOTBALL_DATA_KEY=xxxxx
PLAYER_ELO_KEY=xxxxx
```

Không đưa `.env.local` lên GitHub.

## 4. Data pipeline

API-Football → fixture, recent matches, injuries, H2H  
football-data.org → xác minh lịch/kết quả  
PlayerElo → Elo + model đối chiếu  
Open-Meteo → weather  
Poisson → 1/X/2 + expected goals + scoreline

## 5. Kiểm tra

```bash
npm run typecheck
npm run test:model
npm run build
```

## 6. Deploy Vercel

Import repository này vào Vercel, sau đó thêm các Environment Variables:
- `API_FOOTBALL_KEY`
- `FOOTBALL_DATA_KEY`
- `PLAYER_ELO_KEY`

Không dùng prefix `NEXT_PUBLIC_` cho các key bí mật.

## 7. Lưu ý

Free tier phù hợp prototype/hobby. Trước khi triển khai commercial, kiểm tra lại điều khoản sử dụng của từng nguồn dữ liệu.

## UI status

Current production target: sportsbook redesign (dark green, responsive home + match analysis).
