"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { EmptyState, Section } from "@/components/ui/section";
import { apiClient, resolveImageUrl, type DkvWork, type ListResponse } from "@/lib/api";

const PAGE_SIZE = 20;
/** Pola rasio kartu agar tampilan masonry bervariasi */
const RATIOS = ["aspect-[3/4]", "aspect-[4/5]", "aspect-square", "aspect-[4/3]"];

function formatWorkDate(value?: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(d);
}

/**
 * Galeri Showcase Karya DKV — layout masonry (kolom round-robin agar item baru
 * tidak menata ulang item lama), infinite scroll (20 per halaman), dan popup
 * pratinjau gambar ukuran besar (lightbox dengan navigasi prev/next).
 */
export function KaryaDkvClient({
  initialItems,
  initialTotalPages,
}: {
  initialItems: DkvWork[];
  initialTotalPages: number;
}) {
  const [items, setItems] = useState<DkvWork[]>(initialItems);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(Math.max(1, initialTotalPages));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const [cols, setCols] = useState(3);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);

  // Jumlah kolom responsif untuk layout masonry
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      setCols(w < 640 ? 2 : w < 1024 ? 3 : 4);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const fetchPage = useCallback(async (target: number) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setLoading(true);
    setError(false);
    const res = await apiClient<ListResponse<DkvWork>>("/dkv-works", {
      sort: "newest",
      page: target,
      limit: PAGE_SIZE,
    });
    if (res?.items) {
      setItems((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...res.items.filter((n) => !seen.has(n.id))];
      });
      setPage(target);
      setTotalPages(Math.max(1, res.totalPages));
    } else {
      setError(true);
    }
    setLoading(false);
    busyRef.current = false;
  }, []);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || page >= totalPages || error) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchPage(page + 1);
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [page, totalPages, error, fetchPage]);

  // Navigasi keyboard pada lightbox
  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
      if (e.key === "ArrowLeft") setActive((i) => (i === null ? i : Math.max(0, i - 1)));
      if (e.key === "ArrowRight") setActive((i) => (i === null ? i : Math.min(items.length - 1, i + 1)));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, items.length]);

  const indexMap = useMemo(() => new Map(items.map((it, i) => [it.id, i])), [items]);
  const columns = useMemo(() => {
    const grid: DkvWork[][] = Array.from({ length: cols }, () => []);
    items.forEach((it, i) => grid[i % cols].push(it));
    return grid;
  }, [items, cols]);

  const current = active !== null ? items[active] : null;

  if (!items.length) {
    return (
      <Section>
        <EmptyState
          title="Belum ada karya DKV"
          hint="Karya siswa akan tampil di sini setelah dipublikasikan lewat CMS."
        />
      </Section>
    );
  }

  return (
    <>
      <Section>
        <div className="flex items-start gap-4">
          {columns.map((col, ci) => (
            <div key={ci} className="flex min-w-0 flex-1 flex-col gap-4">
              {col.map((it) => {
                const idx = indexMap.get(it.id) ?? 0;
                const img = resolveImageUrl(it.image);
                const pdf = resolveImageUrl(it.file);
                const isPdf = it.mediaType === "PDF";
                return (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => setActive(idx)}
                    className="group relative block w-full break-inside-avoid overflow-hidden rounded-2xl shadow-card transition hover:shadow-lift"
                    aria-label={`Perbesar karya: ${it.title}`}
                  >
                    <span className={`relative block ${RATIOS[idx % RATIOS.length]} bg-brand-100`}>
                      {img ? (
                        <Image
                          src={img}
                          alt={it.title}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : isPdf && pdf ? (
                        <iframe
                          src={`${pdf}#page=1&toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                          title={`Pratinjau PDF: ${it.title}`}
                          loading="lazy"
                          tabIndex={-1}
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 h-full w-full border-0"
                        />
                      ) : (
                        <span className="pattern-islamic flex h-full w-full items-center justify-center bg-brand-500 font-display text-3xl text-white/40" aria-hidden>
                          ✦
                        </span>
                      )}
                    </span>
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-900/85 to-transparent p-3 text-left">
                      {(isPdf || it.category) && (
                        <span className="mb-1 flex flex-wrap items-center gap-1">
                          {isPdf && (
                            <span className="inline-block rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                              PDF
                            </span>
                          )}
                          {it.category && (
                            <span className="inline-block rounded-full bg-gold-400/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-800">
                              {it.category}
                            </span>
                          )}
                        </span>
                      )}
                      <span className="block font-display text-sm font-semibold leading-snug text-white">
                        {it.title}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {page < totalPages ? (
          <div ref={sentinelRef} className="mt-10 flex justify-center">
            {error ? (
              <button
                type="button"
                onClick={() => fetchPage(page + 1)}
                className="rounded-full bg-white px-6 py-2.5 font-display text-sm font-semibold text-brand-700 ring-1 ring-brand-200 transition hover:bg-brand-50"
              >
                Gagal memuat — coba lagi
              </button>
            ) : (
              <span className="inline-flex items-center gap-2 text-sm font-medium text-ink-soft">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-200 border-t-brand-500" aria-hidden />
                {loading ? "Memuat…" : "Gulir untuk memuat lagi"}
              </span>
            )}
          </div>
        ) : (
          items.length > PAGE_SIZE && (
            <p className="mt-10 text-center text-sm text-ink-soft">Semua karya telah ditampilkan.</p>
          )
        )}
      </Section>

      {current && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-brand-900/90 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau karya"
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            onClick={() => setActive(null)}
            aria-label="Tutup"
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>
          {active !== null && active > 0 && (
            <button
              type="button"
              aria-label="Karya sebelumnya"
              onClick={(e) => {
                e.stopPropagation();
                setActive((i) => (i === null ? i : Math.max(0, i - 1)));
              }}
              className="absolute left-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          <figure className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            {current.mediaType === "PDF" && resolveImageUrl(current.file) ? (
              <iframe
                src={resolveImageUrl(current.file)!}
                title={current.title}
                className="mx-auto h-[72vh] w-full rounded-2xl border-0 bg-white"
              />
            ) : resolveImageUrl(current.image) ? (
              <Image
                src={resolveImageUrl(current.image)!}
                alt={current.title}
                width={1400}
                height={1000}
                className="mx-auto max-h-[70vh] w-auto rounded-2xl object-contain"
              />
            ) : (
              <div className="pattern-islamic mx-auto flex h-[50vh] w-full items-center justify-center rounded-2xl bg-brand-500 font-display text-5xl text-white/40" aria-hidden>
                ✦
              </div>
            )}
            <figcaption className="mx-auto mt-4 max-w-2xl text-center text-white">
              <h2 className="font-display text-lg font-bold">{current.title}</h2>
              <p className="mt-1 text-xs text-white/70">
                {[current.category, current.author, formatWorkDate(current.workDate)].filter(Boolean).join(" · ")}
              </p>
              {current.description && (
                <p className="mt-2 text-sm leading-relaxed text-white/80">{current.description}</p>
              )}
            </figcaption>
          </figure>
          {active !== null && active < items.length - 1 && (
            <button
              type="button"
              aria-label="Karya berikutnya"
              onClick={(e) => {
                e.stopPropagation();
                setActive((i) => (i === null ? i : Math.min(items.length - 1, i + 1)));
              }}
              className="absolute right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
      )}
    </>
  );
}
