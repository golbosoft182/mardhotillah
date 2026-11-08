import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { MegaMenu, type NavNode } from "./mega-menu";
import { TopbarWidgets } from "./topbar-widgets";
import { apiServer, type MenuResponse, type Settings } from "@/lib/api";

export async function Header() {
  const [menuRes, settings] = await Promise.all([
    apiServer<MenuResponse>("/menus", { location: "HEADER" }),
    apiServer<Settings>("/settings"),
  ]);
  // Nama situs + subjudulnya diatur dari CMS → Pengaturan → Identitas Situs
  const siteName = settings?.site_name ?? "Yayasan Mardhotillah";
  const siteSubtitle = settings?.site_subtitle ?? "Ponpes · SMP · SMK";
  const fallback = (await import("./mega-menu")).FALLBACK_NAV;
  const nav: NavNode[] =
    menuRes && menuRes.items.length > 0
      ? menuRes.items.map((i) => ({
          label: i.label,
          url: i.url,
          children: i.children?.map((c) => ({ label: c.label, url: c.url })),
        }))
      : fallback;

  return (
    <>
      {/* Topbar: jam sistem + pemilih bahasa (ID/EN/AR) — di atas announcement */}
      <div className="bg-brand-900 text-white">
        <div className="mx-auto flex h-9 w-full items-center justify-between gap-3 px-4 sm:px-6 xl:px-10">
          <p className="hidden shrink-0 text-[11px] text-white/60 lg:block">
            Selamat datang di website resmi Yayasan Mardhotillah
          </p>
          <TopbarWidgets />
        </div>
      </div>
      {/* Announcement bar — teks diatur dari CMS (Pengaturan → Pengumuman) */}
      {(settings?.announcement_text ??
        "SPMB 2027/2028 telah dibuka — Daftarkan putra-putri Anda sekarang") && (
        <div className="bg-brand-800 text-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 py-2.5 text-center text-xs sm:text-sm">
            <p>
              <Sparkles className="mr-1 inline h-4 w-4 text-gold-400" aria-hidden />
              {settings?.announcement_text ?? "SPMB 2027/2028 telah dibuka — Daftarkan putra-putri Anda sekarang"}
            </p>
            <Link
              href={settings?.announcement_link || "/ppdb"}
              className="inline-flex items-center gap-1 font-display font-bold text-gold-400 underline-offset-4 transition hover:underline"
            >
              INFO SPMB <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      )}
      <header className="sticky top-0 z-40 border-b border-brand-900/10 bg-white/90 backdrop-blur-md">
      <div className="mx-auto grid w-full grid-cols-[auto_1fr] items-center gap-3 px-4 sm:px-6 xl:h-18 xl:grid-cols-[1fr_auto_1fr] xl:px-10">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 justify-self-start" aria-label={`${siteName} — Beranda`}>
          <Image
            src="/images/logos/yayasan.webp"
            alt="Logo Yayasan Mardhotillah"
            width={44}
            height={44}
            className="h-10 w-10 rounded-xl object-contain sm:h-11 sm:w-11"
            priority
          />
          <span className="leading-tight">
            <span className="block whitespace-nowrap font-display text-base font-extrabold uppercase tracking-wide text-brand-700 sm:text-lg">{siteName}</span>
            <span className="hidden whitespace-nowrap text-xs font-medium text-ink-soft sm:text-sm md:block">{siteSubtitle}</span>
          </span>
        </Link>
        <nav aria-label="Menu" className="hidden min-w-0 xl:block">
          <MegaMenu nav={nav} siteName={siteName} />
        </nav>
        <div className="flex items-center gap-3 justify-self-end">
          <Link
            href="/ppdb"
            className="hidden rounded-full bg-gold-400 px-5 py-2.5 font-display text-sm font-semibold text-brand-800 shadow-card transition hover:bg-sun-400 sm:inline-flex"
          >
            SPMB
          </Link>
          <span className="xl:hidden">
            <MegaMenu nav={nav} siteName={siteName} />
          </span>
        </div>
      </div>
    </header>
    </>
  );
}
