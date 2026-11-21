"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AchievementCard, ActivityCard, EventCard, NewsCard, PartnerCard, ProgramKerjaCard, VacancyCard } from "@/components/ui/cards";
import {
  apiClient,
  type Achievement,
  type Activity,
  type EventItem,
  type IndustryPartner,
  type JobVacancy,
  type KesiswaanProgram,
  type ListResponse,
  type Post,
} from "@/lib/api";

type InfiniteVariant = "news" | "event" | "achievement" | "activity" | "program" | "vacancy" | "partner";
type ListItem = Achievement | Activity | EventItem | IndustryPartner | JobVacancy | KesiswaanProgram | Post;

const PAGE_SIZE = 20;

function CardItem({ variant, item, basePath }: { variant: InfiniteVariant; item: ListItem; basePath: string }) {
  if (variant === "achievement") return <AchievementCard item={item as Achievement} />;
  if (variant === "event") return <EventCard event={item as EventItem} />;
  if (variant === "program") return <ProgramKerjaCard program={item as KesiswaanProgram} />;
  if (variant === "vacancy") return <VacancyCard vacancy={item as JobVacancy} />;
  if (variant === "partner") return <PartnerCard partner={item as IndustryPartner} />;
  if (variant === "activity") return <ActivityCard item={item as Activity} />;
  return <NewsCard post={item as Post} basePath={basePath} />;
}

/**
 * Daftar dengan pagination 20 per halaman.
 * Halaman pertama dirender dari server (SEO + first paint), halaman berikutnya
 * dimuat otomatis saat sentinel masuk viewport (infinite scroll).
 */
export function InfiniteList({
  endpoint,
  params = {},
  initialItems,
  initialTotalPages,
  variant,
  gridClassName,
  basePath = "/berita",
}: {
  endpoint: string;
  params?: Record<string, string | number | undefined>;
  initialItems: ListItem[];
  initialTotalPages: number;
  variant: InfiniteVariant;
  gridClassName: string;
  basePath?: string;
}) {
  const [items, setItems] = useState<ListItem[]>(initialItems);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(Math.max(1, initialTotalPages));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);

  const paramsKey = JSON.stringify(params);
  const stableParams = useMemo(
    () => JSON.parse(paramsKey) as Record<string, string | number | undefined>,
    [paramsKey],
  );

  const fetchPage = useCallback(
    async (target: number) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setLoading(true);
      setError(false);
      const res = await apiClient<ListResponse<ListItem>>(endpoint, {
        ...stableParams,
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
    },
    [endpoint, stableParams],
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || page >= totalPages || error) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) fetchPage(page + 1);
    }, { rootMargin: "300px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [page, totalPages, error, fetchPage]);

  const hasMore = page < totalPages;

  return (
    <>
      <div className={gridClassName}>
        {items.map((item) => (
          <CardItem key={item.id} variant={variant} item={item} basePath={basePath} />
        ))}
      </div>

      {hasMore ? (
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
          <p className="mt-10 text-center text-sm text-ink-soft">Semua data telah ditampilkan.</p>
        )
      )}
    </>
  );
}
