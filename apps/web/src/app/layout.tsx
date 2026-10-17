import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PpdbPopup } from "@/components/ppdb-popup";
import { apiServer, type PopupData, type Settings } from "@/lib/api";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await apiServer<Settings>("/settings");
  const seo = await apiServer<{ title?: string; description?: string }>("/seo/home");
  const name = settings?.site_name ?? "Yayasan Mardhotillah";
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100"),
    title: {
      default: seo?.title ?? `${name} — Membangun Generasi Qur'ani, Berilmu dan Berkarakter`,
      template: `%s | ${name}`,
    },
    description:
      seo?.description ??
      "Ekosistem pendidikan Islam terpadu: Pondok Pesantren, SMP Unggulan, dan SMK Mardhotillah Plus.",
    openGraph: {
      type: "website",
      siteName: name,
      locale: "id_ID",
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Popup PPDB aktif (bisa lebih dari satu: per jenjang Ponpes/SMP/SMK + umum) — tampil di semua halaman
  const popups =
    (await apiServer<PopupData[]>("/popup/actives")) ??
    ([] as PopupData[]);

  return (
    <html lang="id" className={`${inter.variable} ${jakarta.variable}`}>
      <body>
        <a
          href="#konten-utama"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-brand-700 focus:text-white focus:px-4 focus:py-2 focus:rounded-br-lg"
        >
          Lewati ke konten utama
        </a>
        <PpdbPopup popups={popups} />
        <Header />
        <main id="konten-utama">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
