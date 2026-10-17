"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
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

/**
 * Popup PPDB — tampil di semua halaman setiap kali halaman dimuat.
 * Jika ada lebih dari satu popup aktif, pengunjung dapat memilih jenjang
 * (Yayasan/Ponpes/SMP/SMK) lewat tab di dalam popup.
 * Dikontrol dari CMS Admin → menu "Popup PPDB".
 */
export function PpdbPopup({ popups }: { popups: PopupData[] }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeUnit, setActiveUnit] = useState<string>("UMUM");

  const tabs = useMemo(
    () => TABS.filter((t) => popups.some((p) => (p.unit ?? "UMUM") === t.key)),
    [popups],
  );

  const current = useMemo(
    () => popups.find((p) => (p.unit ?? "UMUM") === activeUnit) ?? popups[0] ?? null,
    [popups, activeUnit],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (current && mounted) {
      // tampil setiap refresh — tanpa menyimpan state "sudah ditutup"
      const t = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, [current, mounted]);

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

  if (!current || !open) return null;

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
        className="popup-width relative overflow-hidden rounded-2xl bg-white shadow-lift"
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
          aria-label="Tutup pengumuman PPDB"
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
            aria-label="Pilih jenjang PPDB"
            className="grid grid-flow-col auto-cols-fr border-b border-brand-100 bg-white"
          >
            {tabs.map((t) => {
              const selected = (current.unit ?? "UMUM") === t.key;
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
          className="group block"
          aria-label={`${current.title} — buka halaman PPDB`}
        >
          <div className="relative aspect-[4/5] w-full bg-brand-100">
            <Image
              key={current.id}
              src={current.imageUrl}
              alt={current.title}
              fill
              sizes="(max-width: 640px) 90vw, 440px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </div>
          <div className="pattern-islamic flex items-center gap-3 bg-brand-700 px-4 py-3.5">
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
