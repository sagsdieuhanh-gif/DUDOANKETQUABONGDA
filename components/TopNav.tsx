import Link from "next/link";

export function TopNav() {
  return (
    <header className="topNav">
      <div className="topNavInner">
        <Link href="/" className="brandMark">
          <span className="brandBall">⚽</span>
          <span>KèoBóng <b>AI</b></span>
        </Link>

        <nav className="desktopNav" aria-label="Điều hướng chính">
          <Link href="/" className="navActive">Trang chủ</Link>
          <Link href="/#matches">Lịch đấu</Link>
          <Link href="/#featured-analysis">Soi kèo</Link>
          <Link href="/#odds-home">Tỷ lệ</Link>
          <Link href="/#sources">Kèo nhà cái</Link>
          <Link href="/#matches">BXH</Link>
        </nav>

        <div className="navTools">
          <div className="navSearch" aria-hidden="true">
            <span>⌕</span><em>Tìm trận đấu, giải đấu, đội bóng...</em>
          </div>
          <button className="themeGhost" type="button" aria-label="Giao diện">☼</button>
          <Link href="/#matches" className="navCta">Xem dự đoán <span>→</span></Link>
        </div>
      </div>
    </header>
  );
}
