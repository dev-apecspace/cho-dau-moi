import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import { supabase } from "@/lib/supabase";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-be-vietnam",
});

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await supabase
    .from("site_settings")
    .select("key, value");

  const settings: Record<string, string> = {};
  data?.forEach(row => {
    settings[row.key] = row.value?.v;
  });

  const title = settings.site_name || "Chợ Đầu Mới";
  const subtitle = settings.site_subtitle || "Nguồn Hàng Tận Gốc Giá Sỉ Tốt Nhất";
  const description = settings.site_description || "Chợ Đầu Mới - Mua sắm hàng tận gốc, giá sỉ tốt nhất. Đặt hàng online, giao hàng toàn quốc, đổi trả dễ dàng 24/7.";
  const faviconUrl = settings.site_favicon || "/favicon.ico";

  return {
    title: `${title} - ${subtitle}`,
    description: description,
    keywords: "chợ đầu mối, hàng tận gốc, giá sỉ, rau củ quả, thực phẩm",
    icons: {
      icon: faviconUrl,
    },
  };
}

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
