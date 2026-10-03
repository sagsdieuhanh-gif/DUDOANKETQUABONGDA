import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Football Predictor Lab",
  description: "Phân tích và dự đoán bóng đá đa nguồn, minh bạch dữ liệu."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body><header className="siteHeader"><a href="/" className="brand"><span>FP</span> Football Predictor Lab</a><div className="tagline">Multi-source · Explainable · Free-first</div></header>{children}<footer>Prototype phân tích xác suất — không đảm bảo kết quả thực tế. Luôn hiển thị nguồn và độ tin cậy dữ liệu.</footer></body></html>;
}
