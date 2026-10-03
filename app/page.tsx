import { FixtureCard } from "@/components/FixtureCard";
import { SourceBadge } from "@/components/SourceBadge";
import { listFixtures, sourceConfiguration } from "@/lib/aggregate";

export const dynamic = "force-dynamic";

function localDate() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export default async function Home({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const params = await searchParams;
  const date = params.date || localDate();
  const { fixtures, demo } = await listFixtures(date);
  const sources = sourceConfiguration();

  return (
    <main>
      <section className="hero">
        <div><div className="eyebrow">FOOTBALL DATA INTELLIGENCE</div><h1>Dự đoán trận đấu từ <em>dữ liệu thật</em>, không phải cảm tính.</h1><p>Phong độ gần đây, Elo, lịch nghỉ, chấn thương, H2H và thời tiết được tổng hợp thành một dự đoán có thể truy ngược nguồn.</p></div>
        <div className="heroPanel"><b>Nguồn đang bật</b><div className="sources"><SourceBadge name="API-Football" active={sources.apiFootball}/><SourceBadge name="football-data.org" active={sources.footballData}/><SourceBadge name="PlayerElo" active={sources.playerElo}/><SourceBadge name="Open-Meteo" active /></div></div>
      </section>

      {demo && <div className="notice"><b>Đang ở DEMO MODE.</b> Chưa có API_FOOTBALL_KEY hoặc API lỗi. Các trận bên dưới chỉ minh họa giao diện/mô hình; thêm key vào <code>.env.local</code> để dùng dữ liệu thật.</div>}

      <section className="sectionHead"><div><div className="eyebrow">LỊCH THI ĐẤU</div><h2>Chọn trận để phân tích</h2></div><form className="dateForm"><input type="date" name="date" defaultValue={date}/><button type="submit">Tải lịch</button></form></section>
      <section className="fixtureGrid">{fixtures.length ? fixtures.slice(0, 30).map((f) => <FixtureCard key={String(f.id)} fixture={f}/>) : <div className="empty">Không có trận trong nguồn dữ liệu cho ngày này.</div>}</section>

      <section className="how"><div className="eyebrow">PIPELINE</div><h2>Mỗi lần bạn bấm một trận</h2><div className="steps"><div><b>01</b><strong>Thu thập</strong><p>Fixture + 5 trận gần nhất + injury + H2H.</p></div><div><b>02</b><strong>Đối chiếu</strong><p>football-data.org xác nhận lịch; PlayerElo bổ sung sức mạnh.</p></div><div><b>03</b><strong>Chuẩn hóa</strong><p>Tính form, GF/GA có trọng số, ngày nghỉ và availability.</p></div><div><b>04</b><strong>Dự đoán</strong><p>Expected goals → Poisson → 1/X/2 + scoreline.</p></div></div></section>
    </main>
  );
}
