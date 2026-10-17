"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Eye, CalendarDays, Trophy, Star, Plus, ArrowRight, FolderOpen } from "lucide-react";
import { api, can, getSession } from "@/lib/auth";
import { PageHeader } from "@/components/shell";
import { AdminCard, AdminEmptyState, StatusBadge } from "@/components/ui";

interface ListResponse<T> {
  items: T[];
  total: number;
}

interface PostRow {
  id: string;
  title: string;
  status: string;
  type: string;
  unit: string;
  updatedAt: string;
  author?: { name: string } | null;
}

export default function DashboardPage() {
  // Dibaca sekali via initializer agar referensinya stabil — bukan tiap render.
  // [user] yang tidak stabil membuat efek fetch jalan tak berujung.
  const [user] = useState(() => getSession()?.user ?? null);
  const [stats, setStats] = useState<{ label: string; value: number; icon: React.ComponentType<{ className?: string }>; href: string }[]>([]);
  const [reviewQueue, setReviewQueue] = useState<PostRow[]>([]);
  const [recent, setRecent] = useState<PostRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [posts, pages, events, achievements, review, latest] = await Promise.all([
          api<ListResponse<PostRow>>("/posts/admin/all?limit=1"),
          can(user, "canPublish") ? api<ListResponse<unknown>>("/pages?limit=1") : Promise.resolve({ items: [], total: 0 }),
          can(user, "canPublish") ? api<ListResponse<unknown>>("/events?limit=1") : Promise.resolve({ items: [], total: 0 }),
          can(user, "canPublish") ? api<ListResponse<unknown>>("/achievements?limit=1") : Promise.resolve({ items: [], total: 0 }),
          api<ListResponse<PostRow>>("/posts/admin/all?status=REVIEW&limit=5"),
          api<ListResponse<PostRow>>("/posts/admin/all?limit=5"),
        ]);

        setStats([
          { label: "Total Artikel", value: posts.total, icon: FileText, href: "/posts" },
          { label: "Halaman", value: pages.total, icon: FolderOpen, href: "/pages" },
          { label: "Agenda", value: events.total, icon: CalendarDays, href: "/agenda" },
          { label: "Prestasi", value: achievements.total, icon: Trophy, href: "/prestasi" },
        ]);
        setReviewQueue(review.items ?? []);
        setRecent(latest.items ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Gagal memuat dashboard");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch sekali saat mount
  }, []);

  return (
    <>
      <PageHeader
        title={`Selamat datang, ${user?.name?.split(" ")[0]} 👋`}
        description="Ringkasan konten dan aktivitas terbaru."
        action={
          <Link
            href="/posts/new"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-display font-semibold text-white transition hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" aria-hidden /> Buat Artikel
          </Link>
        }
      />
      {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href} className="group">
            <AdminCard className="flex items-center gap-4 transition group-hover:-translate-y-0.5 group-hover:shadow-md">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <div>
                <p className="font-display text-2xl font-bold text-ink">{value}</p>
                <p className="text-xs text-ink-soft">{label}</p>
              </div>
            </AdminCard>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Antrean review */}
        <AdminCard>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display font-bold text-ink">Menunggu Review</h2>
            <Star className="h-4 w-4 text-gold-400" aria-hidden />
          </div>
          {reviewQueue.length ? (
            <ul className="space-y-3">
              {reviewQueue.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 rounded-xl bg-cream p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{p.title}</p>
                    <p className="text-xs text-ink-soft">oleh {p.author?.name ?? "—"}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-soft">Tidak ada artikel menunggu review. 🎉</p>
          )}
        </AdminCard>

        {/* Aktivitas terbaru */}
        <AdminCard>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display font-bold text-ink">Artikel Terbaru</h2>
            <Link href="/posts" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline">
              Lihat semua <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
          </div>
          {recent.length ? (
            <ul className="space-y-3">
              {recent.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 rounded-xl bg-cream p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{p.title}</p>
                    <p className="text-xs text-ink-soft">{new Date(p.updatedAt).toLocaleDateString("id-ID")}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </li>
              ))}
            </ul>
          ) : (
            <AdminEmptyState title="Belum ada artikel" hint="Mulai dengan membuat artikel pertama." />
          )}
        </AdminCard>
      </div>

      {/* Panduan peran */}
      <AdminCard className="mt-6">
        <h2 className="mb-2 font-display font-bold text-ink">Hak akses Anda</h2>
        <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Membuat artikel", ok: true },
            { label: "Mengedit artikel", ok: true },
            { label: "MemPublikasikan", ok: can(user, "canPublish") },
            { label: "Menghapus konten", ok: can(user, "canDelete") },
            { label: "Kelola pengguna", ok: can(user, "canManageUsers") },
            { label: "Pengaturan situs & SEO", ok: can(user, "canManageSettings") },
            { label: "Menu navigasi", ok: can(user, "canManageMenus") },
            { label: "Konten PPDB", ok: can(user, "canManagePpdb") },
          ].map(({ label, ok }) => (
            <div key={label} className="flex items-center gap-2">
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${ok ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
                {ok ? "✓" : "—"}
              </span>
              <span className={ok ? "text-ink" : "text-ink-soft/60"}>{label}</span>
            </div>
          ))}
        </div>
        {user?.role === "OSIS" && (
          <p className="mt-4 rounded-xl bg-gold-100 px-4 py-3 text-xs text-gold-500">
            <strong>Mode OSIS:</strong> Anda dapat membuat artikel sekolah (Berita, Artikel, Opini, Pojok Siswa).
            Artikel akan masuk ke antrean <em>Review</em> dan dipublikasikan oleh Admin.
          </p>
        )}
      </AdminCard>
    </>
  );
}
