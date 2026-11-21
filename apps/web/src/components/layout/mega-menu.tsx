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

/** Parent yang panelnya dibuat auto-lebar dan tiap submenu dipaksa satu baris
 *  (kunci huruf besar) — dipakai untuk menu dengan banyak submenu panjang. */
const WIDE_PANELS = new Set(["KURIKULUM", "KESISWAAN"]);

export const FALLBACK_NAV: NavNode[] = [
  { label: "Beranda", url: "/" },
  {
    label: "Tentang Kami",
    url: "/tentang/profil",
    children: [
      { label: "Profil Yayasan", url: "/tentang/profil" },
      { label: "Sejarah", url: "/tentang/sejarah" },
      { label: "Visi & Misi", url: "/tentang/visi-misi" },
      { label: "Struktur Organisasi", url: "/tentang/struktur-organisasi" },
      { label: "Pimpinan", url: "/tentang/pimpinan" },
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
  { label: "Bursa Kerja Khusus", url: "/bkk" },
  { label: "Mitra Industri", url: "/mitra-industri" },
  { label: "SPMB", url: "/ppdb" },
  { label: "Kontak", url: "/kontak" },
];

/** Ikon dekoratif per grup menu (murni visual) */
function groupIcon(label: string) {
  if (label.includes("Pendidikan")) return GraduationCap;
  if (label.includes("Publikasi")) return Newspaper;
  return Info;
}

/** Daftar tautan bertingkat di dalam kolom mega menu (level ≥ 3). */
function DeepLinks({ nodes, onNavigate, depth = 0 }: { nodes: NavNode[]; onNavigate: () => void; depth?: number }) {
  return (
    <ul className={depth === 0 ? "mt-2 space-y-0.5" : "mt-1 space-y-0.5 border-l border-brand-100 pl-2.5"}>
      {nodes.map((n) => (
        <li key={`${n.label}-${n.url}`}>
          <Link
            href={n.url}
            onClick={onNavigate}
            className="block rounded-lg px-2.5 py-1.5 text-sm uppercase tracking-wide text-ink-soft transition hover:bg-brand-50 hover:text-brand-700"
          >
            {n.label}
          </Link>
          {n.children?.length ? <DeepLinks nodes={n.children} onNavigate={onNavigate} depth={depth + 1} /> : null}
        </li>
      ))}
    </ul>
  );
}

/** Satu kolom mega menu: judul (menu level 2) + tautan turunannya (level ≥ 3). */
function MegaColumn({ node, onNavigate }: { node: NavNode; onNavigate: () => void }) {
  return (
    <div className="min-w-[180px] max-w-[240px]">
      <Link
        href={node.url}
        onClick={onNavigate}
        className="flex items-center gap-2 border-b border-brand-100 pb-2 font-display text-[13px] font-bold uppercase tracking-wide text-brand-700 transition hover:text-brand-500"
      >
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" aria-hidden />
        {node.label}
      </Link>
      {node.children?.length ? <DeepLinks nodes={node.children} onNavigate={onNavigate} /> : null}
    </div>
  );
}

/** Item navigasi mobile — akordeon rekursif (kedalaman tidak dibatasi). */
function MobileNavItem({
  node,
  onNavigate,
  depth,
}: {
  node: NavNode;
  onNavigate: () => void;
  depth: number;
}) {
  const [open, setOpen] = useState(false);
  const hasKids = !!node.children?.length;

  if (!hasKids) {
    return (
      <Link
        href={node.url}
        onClick={onNavigate}
        className={`flex items-center gap-2.5 rounded-xl px-3 py-3 font-display font-bold uppercase tracking-wide text-ink transition hover:bg-brand-50 ${
          depth === 0 ? "" : "text-[13px]"
        }`}
      >
        {depth === 0 &&
          (() => {
            const Icon = groupIcon(node.label);
            return <Icon className="h-4 w-4 text-brand-500" aria-hidden />;
          })()}
        {node.label}
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left font-display font-bold uppercase tracking-wide text-ink transition hover:bg-brand-50"
      >
        <span className="flex items-center gap-2.5">
          {depth === 0 &&
            (() => {
              const Icon = groupIcon(node.label);
              return <Icon className="h-4 w-4 text-brand-500" aria-hidden />;
            })()}
          {node.label}
        </span>
        <ChevronDown className={`h-4 w-4 text-brand-500 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && (
        <div className="ml-3 space-y-0.5 border-l-2 border-brand-100 py-1 pl-3">
          {node.children!.map((c) => (
            <MobileNavItem key={`${c.label}-${c.url}`} node={c} onNavigate={onNavigate} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function MegaMenu({ nav, siteName }: { nav: NavNode[]; siteName: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDesktop, setOpenDesktop] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  // Kunci scroll latar saat drawer mobile terbuka (agar tidak ikut bergulir)
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
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

  // Isi kartu promo SPMB — dipakai di panel flat maupun mega menu berkode kolom.
  const promoInner = (
    <>
      <div>
        <Sparkles className="mb-2 h-5 w-5 text-gold-400" aria-hidden />
        <p className="font-display text-sm font-bold leading-snug text-white">SPMB 2027/2028 telah dibuka</p>
        <p className="mt-1 text-xs text-white/70">Daftarkan putra-putri Anda sekarang.</p>
      </div>
      <Link
        href="/ppdb"
        onClick={() => setOpenDesktop(null)}
        className="mt-3 inline-flex items-center justify-center rounded-full bg-gold-400 px-3.5 py-2 text-xs font-display font-bold text-brand-800 transition hover:bg-sun-400"
      >
        INFO SPMB
      </Link>
    </>
  );

  return (
    <div ref={navRef} className="relative">
      {/* ================= DESKTOP MEGA MENU ================= */}
      <nav aria-label="Navigasi utama" className="hidden min-w-0 items-center gap-0 xl:flex">
        {nav.map((item) => {
          // Panel lebih lebar + daftar satu kolom bila ada label submenu yang panjang,
          // supaya tiap submenu tampil satu baris tanpa turun baris.
          const wide = item.children?.some((c) => c.label.length > 45) ?? false;
          // Panel auto-lebar (w-max) + submenu satu baris untuk parent tertentu,
          // agar label panjang tidak turun ke baris kedua.
          const isWidePanel = WIDE_PANELS.has(item.label.toUpperCase());
          // Submenu yang punya anak sendiri → tampil sebagai mega menu berkode kolom.
          const hasGroups = (item.children ?? []).some((c) => (c.children?.length ?? 0) > 0);
          const panelWidth = wide || isWidePanel || hasGroups ? "w-max" : "w-[560px]";
          const nowrapLabels = wide || isWidePanel;
          return (
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

                {/* Panel mega menu */}
                {openDesktop === item.label && (
                  <div className={`absolute left-1/2 top-full z-50 ${panelWidth} -translate-x-1/2 pt-2`}>
                    <div className="overflow-hidden rounded-2xl bg-white shadow-lift ring-1 ring-brand-900/10">
                      {hasGroups ? (
                        /* Mega menu berkode kolom: tiap submenu jadi kolom berjudul + tautan turunannya */
                        <div className="flex flex-wrap items-stretch gap-6 p-6">
                          {(item.children ?? []).map((c) => (
                            <MegaColumn key={`${c.label}-${c.url}`} node={c} onNavigate={() => setOpenDesktop(null)} />
                          ))}
                          <div className="pattern-islamic flex w-[190px] shrink-0 flex-col justify-between rounded-xl bg-brand-600 p-4">
                            {promoInner}
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-[1fr_190px]">
                          {/* Kolom link */}
                          <div className="p-3">
                            <p className="px-3 pb-2 pt-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-gold-500">
                              {item.label}
                            </p>
                            <div className={wide ? "" : item.children.length > 4 ? "grid grid-cols-2 gap-0.5" : ""}>
                              {item.children.map((child) => (
                                <Link
                                  key={`${child.label}-${child.url}`}
                                  href={child.url}
                                  onClick={() => setOpenDesktop(null)}
                                  className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition hover:bg-brand-50 hover:text-brand-700 ${
                                    pathname === child.url ? "bg-brand-50 font-semibold text-brand-700" : "text-ink-soft"
                                  }`}
                                >
                                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-300" aria-hidden />
                                  <span className={`uppercase tracking-wide ${nowrapLabels ? "whitespace-nowrap" : ""}`}>{child.label}</span>
                                </Link>
                              ))}
                            </div>
                          </div>
                          {/* Kartu promo SPMB */}
                          <div className="pattern-islamic m-2 flex flex-col justify-between rounded-xl bg-brand-600 p-4">
                            {promoInner}
                          </div>
                        </div>
                      )}
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
          );
        })}
      </nav>

      {/* ================= MOBILE TOGGLE ================= */}
      <button
        type="button"
        aria-expanded={mobileOpen}
        aria-controls="mobile-menu"
        aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
        onClick={() => setMobileOpen(!mobileOpen)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full text-brand-700 transition hover:bg-brand-50 xl:hidden"
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
      </button>

      {/* ================= MOBILE DRAWER — portal ke body agar lolos dari backdrop-blur header ================= */}
      {mobileOpen && portalReady && createPortal(
        <div className="fixed inset-0 z-[80]">
          <div className="absolute inset-0 bg-brand-900/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} aria-hidden />
          <div
            id="mobile-menu"
            className="absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col bg-white shadow-lift sm:max-w-md"
            role="dialog"
            aria-label="Navigasi mobile"
          >
            <div className="flex items-center justify-between border-b border-brand-100 p-5">
              <span className="font-display text-lg font-bold text-brand-700">{siteName}</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Tutup menu"
                className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-brand-50"
              >
                <X className="h-5 w-5 text-brand-700" />
              </button>
            </div>
            <nav aria-label="Navigasi mobile" className="flex-1 overflow-y-auto p-4">
              {nav.map((item) => (
                <div key={`${item.label}-${item.url}`} className="mb-0.5">
                  <MobileNavItem node={item} onNavigate={() => setMobileOpen(false)} depth={0} />
                </div>
              ))}
            </nav>
            <div className="border-t border-brand-100 p-4">
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/kontak"
                  onClick={() => setMobileOpen(false)}
                  className="flex w-full items-center justify-center rounded-full border border-brand-200 px-4 py-3 font-display text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
                >
                  Kontak
                </Link>
                <Link
                  href="/ppdb"
                  onClick={() => setMobileOpen(false)}
                  className="flex w-full items-center justify-center rounded-full bg-gold-400 px-4 py-3 font-display text-sm font-semibold text-brand-800 shadow-card transition hover:bg-sun-400"
                >
                  Daftar SPMB
                </Link>
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
