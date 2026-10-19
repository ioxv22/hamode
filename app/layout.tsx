import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./assistant-dashboard.css";

export const metadata: Metadata = {
  title: "عينك المساعدة | لوحة المساعدة الذكية",
  description:
    "لوحة تحكم عربية لنظام مساعدة بصري: كاميرا الجهاز وتحليل الصورة بطلب المستخدم ووصف صوتي قابل للضبط.",
  applicationName: "عينك المساعدة",
  keywords: ["عينك المساعدة", "الذكاء الاصطناعي", "إمكانية الوصول", "نظارة ذكية"],
  openGraph: {
    title: "عينك المساعدة",
    description: "لوحة تحكم لمساعد بصري مع تحليل صور وأوصاف صوتية عند الطلب.",
    locale: "ar_AE",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#103e33",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
