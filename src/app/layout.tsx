import type { Metadata, Viewport } from "next";
import "@fontsource-variable/unbounded";
import "@fontsource-variable/golos-text";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import { SITE } from "@/shared/config/site";
import { StoreProvider } from "@/shared/store/StoreProvider";
import { Header } from "@/widgets/header/Header";
import { Footer } from "@/widgets/footer/Footer";
import { CookieBanner } from "@/widgets/cookie-banner/CookieBanner";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "АНГАР — AmigoKiz Production: VFX, CGI, UGC и обучение",
    template: "%s — АНГАР | AmigoKiz Production",
  },
  description:
    "Продакшн Амира Абдурахманова (Amigo Kiz): VFX-визуализация, CGI и UGC-контент для брендов. Интенсивы по визуальным эффектам и 3D. Кизилюрт, Дагестан.",
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "АНГАР — AmigoKiz Production",
    title: "АНГАР — AmigoKiz Production",
    description:
      "VFX-визуализация, CGI и UGC-контент для брендов. Обучение от практиков студии.",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <StoreProvider>
          <a href="#main" className="skip-link">
            К содержанию
          </a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <CookieBanner />
        </StoreProvider>
      </body>
    </html>
  );
}
