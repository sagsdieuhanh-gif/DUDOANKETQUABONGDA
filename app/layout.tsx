import type { Metadata } from "next";
import { TopNav } from "@/components/TopNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "KèoBóng AI | Phân tích & dự đoán bóng đá",
  description: "Phân tích trận đấu, phong độ, tỷ lệ nhà cái và dự đoán xác suất từ nhiều nguồn dữ liệu."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        <TopNav />
        {children}
        <footer className="siteFooter">
          <div>
            <strong>⚽ KèoBóng AI</strong>
            <span>Dữ liệu nhiều nguồn · Phân tích xác suất · Cập nhật tự động</span>
          </div>
          <p>Thông tin chỉ mang tính tham khảo. Tỷ lệ có thể thay đổi theo nhà cung cấp và thời điểm.</p>
        </footer>
      </body>
    </html>
  );
}
