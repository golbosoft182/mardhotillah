"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Menu as MenuIcon,
  X,
  ChevronDown,
  Info,
  GraduationCap,
  Newspaper,
  Sparkles,
} from "lucide-react";

export interface NavNode {
  label: string;
  url: string;
  children?: NavNode[];
}

export const FALLBACK_NAV: NavNode[] = [
  { label: "Beranda", url: "/" },
  {
    label: "Tentang Kami",
    url: "/tentang/profil",
    children: [
      { label: "Profil Yayasan", url: "/tentang/profil" },
      { label: "Sejarah", url: "/tentang/sejarah" },
      { label: "Visi & Misi", url: "/tentang/visi-misi" },
      { label: "Struktur Organisasi", url: "/tentang/struktur" },
      { label: "Legalitas", url: "/tentang/legalitas" },
    ],
  },
  {
    label: "Pendidikan",
    url: "/ponpes",
    children: [
      { label: "Pondok Pesantren Mardhotillah", url: "/ponpes" },
      { label: "SMP Unggulan Mardhotillah", url: "/smp" },
      { label: "SMK Mardhotillah Plus", url: "/smk" },
    ],
  },
  { label: "Program", url: "/program" },
  {
    label: "Publikasi",
    url: "/berita",
    children: [
      { label: "Berita", url: "/berita" },
      { label: "Artikel", url: "/artikel" },
      { label: "Opini Guru", url: "/opini" },
      { label: "Pojok Siswa", url: "/pojok-siswa" },
      { label: "Agenda", url: "/agenda" },
      { label: "Galeri", url: "/galeri" },
    ],
  },
  { label: "Prestasi", url: "/prestasi" },
  { label: "Fasilitas", url: "/fasilitas" },
  { label: "SPMB", url: "/ppdb" },
  { label: "Kontak", url: "/kontak" },
];

/** Ikon dekoratif per grup menu (murni visual) */
function groupIcon(label: string) {
  if (label.includes("Pendidikan")) return GraduationCap;
  if (label.includes("Publikasi")) return Newspaper;
  return Info;
}

export function MegaMenu({ nav, siteName }: { nav: NavNode[]; siteName: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [openDesktop, setOpenDesktop] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenGroup(null);
    setOpenDesktop(null);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setOpenDesktop(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Klik di luar area nav menutup panel desktop
  const navRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenDesktop(null);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };
  const openWithDelay = (label: string) => {
    cancelClose();
    setOpenDesktop(label);
  };
  const closeWithDelay = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpenDesktop(null), 180);
  };

  return (
    <div ref={navRef} className="relative">
      {/* ================= DESKTOP MEGA MENU ================= */}
      <nav aria-label="Navigasi utama" className="hidden min-w-0 items-center gap-0 xl:flex">
        {nav.map((item) => (
          <div
            key={item.label}
            className="relative"
            onMouseEnter={item.children?.length ? () => openWithDelay(item.label) : undefined}
            onMouseLeave={item.children?.length ? closeWithDelay : undefined}
          >
            {item.children?.length ? (
              <>
                <button
                  type="button"
                  aria-expanded={openDesktop === item.label}
                  aria-haspopup="true"
                  onClick={() => setOpenDesktop(item.label)}
                  className={`flex items-center gap-1 whitespace-nowrap rounded-full px-1.5 py-2 text-[12.5px] font-display font-bold uppercase tracking-wide transition hover:bg-brand-50 hover:text-brand-700 md:min-[1500px]:px-2.5 md:min-[1500px]:text-[14px] ${
                    openDesktop === item.label || pathname.startsWith(item.url) ? "bg-brand-50 text-brand-700" : "text-ink"
                  }`}
                >
                  {item.label}
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${openDesktop === item.label ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </button>

                {/* Panel mega menu lebar */}
                {openDesktop === item.label && (
                  <div className="absolute left-1/2 top-full z-50 w-[560px] -translate-x-1/2 pt-2">
                    <div className="overflow-hidden rounded-2xl bg-white shadow-lift ring-1 ring-brand-900/10">
                      <div className="grid grid-cols-[1fr_190px]">
                        {/* Kolom link */}
                        <div className="p-3">
                          <p className="px-3 pb-2 pt-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-gold-500">
                            {item.label}
                          </p>
                          <div className={item.children.length > 4 ? "grid grid-cols-2 gap-0.5" : ""}>
                            {item.children.map((child) => (
                              <Link
                                key={child.url}
                                href={child.url}
                                onClick={() => setOpenDesktop(null)}
                                className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition hover:bg-brand-50 hover:text-brand-700 ${
                                  pathname === child.url ? "bg-brand-50 font-semibold text-brand-700" : "text-ink-soft"
                                }`}
                              >
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-300" aria-hidden />
                                <span className="uppercase tracking-wide">{child.label}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                        {/* Kartu promo SPMB */}
                        <div className="pattern-islamic m-2 flex flex-col justify-between rounded-xl bg-brand-600 p-4">
                          <div>
                            <Sparkles className="mb-2 h-5 w-5 text-gold-400" aria-hidden />
                            <p className="font-display text-sm font-bold leading-snug text-white">
                              SPMB 2027/2028 telah dibuka
                            </p>
                            <p className="mt-1 text-xs text-white/70">Daftarkan putra-putri Anda sekarang.</p>
                          </div>
                          <Link
                            href="/ppdb"
                            onClick={() => setOpenDesktop(null)}
                            className="mt-3 inline-flex items-center justify-center rounded-full bg-gold-400 px-3.5 py-2 text-xs font-display font-bold text-brand-800 transition hover:bg-sun-400"
                          >
                            INFO SPMB
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Link
                href={item.url}
                className={`whitespace-nowrap rounded-full px-1.5 py-2 text-[12.5px] font-display font-bold uppercase tracking-wide transition hover:bg-brand-50 hover:text-brand-700 md:min-[1500px]:px-2.5 md:min-[1500px]:text-[14px] ${
                  pathname === item.url ? "text-brand-700" : "text-ink"
                }`}
              >
                {item.label}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* ================= MOBILE TOGGLE ================= */}
      <button
        type="button"
        aria-expanded={mobileOpen}
        aria-controls="mobile-menu"
        aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}                onClick={() => setMobileOpen(!mobileOpen)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-brand-700 transition hover:bg-brand-50 xl:hidden"
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
      </button>

      {/* ================= MOBILE DRAWER — portal ke body agar lolos dari backdrop-blur header ================= */}
      {mobileOpen && portalReady && createPortal(
        <div className="fixed inset-0 z-[80]">
          <div className="absolute inset-0 bg-brand-900/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} aria-hidden />
          <div
            id="mobile-menu"
            className="absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col bg-white shadow-lift"
            role="dialog"
            aria-label="Menu navigasi"
          >
            <div className="flex items-center justify-between border-b border-brand-100 p-5">
              <span className="font-display text-lg font-bold text-brand-700">{siteName}</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Tutup menu"
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-brand-50"
              >
                <X className="h-5 w-5 text-brand-700" />
              </button>
            </div>
            <nav aria-label="Navigasi mobile" className="flex-1 overflow-y-auto p-4">
              {nav.map((item) => (
                <div key={item.label} className="mb-0.5">
                  {item.children?.length ? (
                    <>
                      <button
                        type="button"
                        aria-expanded={openGroup === item.label}
                        onClick={() => setOpenGroup(openGroup === item.label ? null : item.label)}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left font-display font-bold uppercase tracking-wide text-ink transition hover:bg-brand-50"
                      >
                        <span className="flex items-center gap-2.5">
                          {(() => {
                            const Icon = groupIcon(item.label);
                            return <Icon className="h-4 w-4 text-brand-500" aria-hidden />;
                          })()}
                          {item.label}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 text-brand-500 transition-transform ${openGroup === item.label ? "rotate-180" : ""}`}
                          aria-hidden
                        />
                      </button>
                      {openGroup === item.label && (
                        <div className="ml-4 space-y-0.5 border-l-2 border-brand-100 py-1 pl-3">
                          {item.children.map((child) => (
                            <Link
                              key={child.url}
                              href={child.url}
                              className={`block rounded-lg px-3 py-2.5 text-sm uppercase tracking-wide transition hover:bg-brand-50 hover:text-brand-700 ${
                                pathname === child.url ? "font-semibold text-brand-700" : "text-ink-soft"
                              }`}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.url}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-3 font-display font-bold uppercase tracking-wide text-ink transition hover:bg-brand-50"
                    >
                      {(() => {
                        const Icon = groupIcon(item.label);
                        return <Icon className="h-4 w-4 text-brand-500" aria-hidden />;
                      })()}
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
            <div className="border-t border-brand-100 p-4">
              <Link
                href="/ppdb"
                onClick={() => setMobileOpen(false)}
                className="flex w-full items-center justify-center rounded-full bg-gold-400 px-6 py-3 font-display font-semibold text-brand-800 shadow-card transition hover:bg-sun-400"
              >
                DAFTAR SPMB
              </Link>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
