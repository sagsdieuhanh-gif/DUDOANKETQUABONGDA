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
          <Link href="/#matches">Soi kèo</Link>
          <Link href="/#matches">Tỷ lệ</Link>
          <Link href="/#sources">Nguồn dữ liệu</Link>
        </nav>
        <Link href="/#matches" className="navCta">Xem trận đấu <span>→</span></Link>
      </div>
    </header>
  );
}
