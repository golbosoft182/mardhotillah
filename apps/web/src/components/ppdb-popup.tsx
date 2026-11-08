"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { X, Megaphone } from "lucide-react";
import type { PopupData } from "@/lib/api";

/** Urutan & label tab jenjang — UMUM = popup Yayasan (unit null di database) */
const TABS: { key: string; label: string }[] = [
  { key: "UMUM", label: "Yayasan" },
  { key: "PONPES", label: "Ponpes" },
  { key: "SMP", label: "SMP" },
  { key: "SMK", label: "SMK" },
];

/** Kunci tab sebuah popup: unit kosong/YAYASAN = tab umum (Yayasan) */
function tabKey(popup: PopupData): string {
  if (!popup.unit || popup.unit === "YAYASAN") return "UMUM";
  return popup.unit;
}

/**
 * Popup SPMB — tampil di semua halaman setiap kali halaman dimuat, kecuali
 * di halaman SPMB sendiri (/ppdb) karena pengunjung sudah berada di sana.
 * Jika ada lebih dari satu popup aktif, pengunjung dapat memilih jenjang
 * (Yayasan/Ponpes/SMP/SMK) lewat tab di dalam popup.
 * Dikontrol dari CMS Admin → menu "Popup SPMB".
 */
export function PpdbPopup({ popups }: { popups: PopupData[] }) {
  const pathname = usePathname();
  // Jangan tampilkan di halaman pendaftaran SPMB maupun halaman turunannya
  const hidden = pathname === "/ppdb" || pathname.startsWith("/ppdb/");
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  // Tab aktif = pilihan pengunjung; null berarti pakai popup pertama yang tersedia
  const [activeUnit, setActiveUnit] = useState<string | null>(null);

  // Tab hanya untuk jenjang yang benar-benar punya popup aktif — yang kosong tidak ditampilkan
  const tabs = useMemo(() => TABS.filter((t) => popups.some((p) => tabKey(p) === t.key)), [popups]);

  const current = useMemo(
    () => (activeUnit ? popups.find((p) => tabKey(p) === activeUnit) : undefined) ?? popups[0] ?? null,
    [popups, activeUnit],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (current && mounted && !hidden) {
      // tampil setiap refresh — tanpa menyimpan state "sudah ditutup"
      const t = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(t);
    }
    setOpen(false);
  }, [current, mounted, hidden]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (hidden || !current || !open) return null;

  const showTabs = tabs.length > 1;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-brand-900/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={current.title}
      onClick={() => setOpen(false)}
    >
      <div
        className="popup-width relative flex max-h-[92vh] flex-col overflow-hidden rounded-2xl bg-white shadow-lift"
        onClick={(e) => e.stopPropagation()}
        style={
          {
            "--w-mobile": `${current.widthMobile ?? 300}px`,
            "--w-tablet": `${current.widthTablet ?? 360}px`,
            "--w-desktop": `${current.widthDesktop ?? 440}px`,
          } as React.CSSProperties
        }
      >
        {/* Tombol close — di bawah bar tab jika tab jenjang ditampilkan */}
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Tutup pengumuman SPMB"
          className={`absolute right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70 ${
            showTabs ? "top-12" : "top-3"
          }`}
        >
          <X className="h-5 w-5" aria-hidden />
        </button>

        {/* Tab pilihan jenjang */}
        {showTabs && (
          <div
            role="tablist"
            aria-label="Pilih jenjang SPMB"
            className="grid shrink-0 grid-flow-col auto-cols-fr border-b border-brand-100 bg-white"
          >
            {tabs.map((t) => {
              const selected = tabKey(current) === t.key;
              return (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveUnit(t.key)}
                  className={`px-2 py-2.5 font-display text-xs font-bold transition sm:text-sm ${
                    selected
                      ? "bg-brand-700 text-white"
                      : "bg-white text-ink-soft hover:bg-brand-50 hover:text-brand-700"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        )}

        <Link
          href={current.linkUrl || "/ppdb"}
          onClick={() => setOpen(false)}
          className="group flex min-h-0 flex-col"
          aria-label={`${current.title} — buka halaman SPMB`}
        >
          {/* Flyer ditampilkan utuh (object-contain) dan dibatasi tinggi layar,
              supaya bagian bawah gambar tidak pernah terpotong. */}
          <div className="flex w-full items-center justify-center overflow-hidden bg-white">
            <Image
              key={current.id}
              src={current.imageUrl}
              alt={current.title}
              width={1080}
              height={1350}
              sizes="(max-width: 640px) 90vw, 440px"
              className="mx-auto block h-auto w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
              style={{ maxHeight: showTabs ? "calc(92vh - 9.5rem)" : "calc(92vh - 8rem)" }}
            />
          </div>
          <div className="pattern-islamic flex shrink-0 items-center gap-3 bg-brand-700 px-4 py-3.5">
            <Megaphone className="h-5 w-5 shrink-0 text-gold-400" aria-hidden />
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-bold text-white">{current.title}</p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-gold-400">
                {current.buttonText || "DAFTAR SEKARANG"}
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3" aria-hidden>
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h9.19l-3.22-3.22a.75.75 0 011.06-1.06l4.5 4.5a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 11-1.06-1.06l3.22-3.22H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                </svg>
              </span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
