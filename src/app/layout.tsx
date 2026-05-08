import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-be-vietnam",
});

export const metadata: Metadata = {
  title: "Chợ Đầu Mới - Nguồn Hàng Tận Gốc Giá Sỉ Tốt Nhất",
  description:
    "Chợ Đầu Mới - Mua sắm hàng tận gốc, giá sỉ tốt nhất. Đặt hàng online, giao hàng toàn quốc, đổi trả dễ dàng 24/7.",
  keywords: "chợ đầu mối, hàng tận gốc, giá sỉ, rau củ quả, thực phẩm",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={beVietnamPro.variable}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
