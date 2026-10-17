"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Search, Send, Globe } from "lucide-react";
import { api, can, getSession } from "@/lib/auth";
import { PageHeader } from "@/components/shell";
import { AdminCard, AdminEmptyState, DangerButton, ErrorAlert, PrimaryButton, StatusBadge, SuccessAlert } from "@/components/ui";

interface PostRow {
  id: string;
  title: string;
  slug: string;
  status: string;
  type: string;
  unit: string;
  updatedAt: string;
  publishedAt?: string | null;
  author?: { name: string } | null;
}

interface ListResponse<T> {
  items: T[];
  total: number;
  totalPages: number;
}

const TYPES = [
  { value: "", label: "Semua Jenis" },
  { value: "BERITA", label: "Berita" },
  { value: "ARTIKEL", label: "Artikel" },
  { value: "OPINI", label: "Opini Guru" },
  { value: "POJOK_SISWA", label: "Pojok Siswa" },
];

const UNITS = [
  { value: "", label: "Semua Unit" },
  { value: "YAYASAN", label: "Yayasan" },
  { value: "PONPES", label: "Ponpes" },
  { value: "SMP", label: "SMP" },
  { value: "SMK", label: "SMK" },
];

const STATUSES = [
  { value: "", label: "Semua Status" },
  { value: "PUBLISHED", label: "Publik" },
  { value: "REVIEW", label: "Review" },
  { value: "DRAFT", label: "Draft" },
];

export default function PostsListPage() {
  const user = getSession()?.user ?? null;
  const [data, setData] = useState<ListResponse<PostRow> | null>(null);
  const [page, setPage] = useState(1);
  const [type, setType] = useState("");
  const [unit, setUnit] = useState("");
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (type) params.set("type", type);
      if (unit) params.set("unit", unit);
      if (status) params.set("status", status);
      if (q) params.set("q", q);
      const res = await api<ListResponse<PostRow>>(`/posts/admin/all?${params}`);
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data");
    }
  }, [page, type, unit, status, q]);

  useEffect(() => { load(); }, [load]);

  async function publish(p: PostRow) {
    setBusyId(p.id);
    try {
      await api(`/posts/${p.id}`, { method: "PUT", body: { status: "PUBLISHED" } });
      setSuccess(`"${p.title}" berhasil dipublikasikan`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mempublikasikan");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(p: PostRow) {
    if (!confirm(`Hapus "${p.title}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setBusyId(p.id);
    try {
      await api(`/posts/${p.id}`, { method: "DELETE" });
      setSuccess("Artikel dihapus");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menghapus");
    } finally {
      setBusyId(null);
    }
  }

  const selectCls = "rounded-xl border border-brand-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-500";

  return (
    <>
      <PageHeader
        title="Berita & Artikel"
        description="Kelola berita, artikel, opini guru, dan pojok siswa."
        action={
          <Link href="/posts/new" className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-display font-semibold text-white transition hover:bg-brand-700">
            <Plus className="h-4 w-4" aria-hidden /> Buat Baru
          </Link>
        }
      />
      <ErrorAlert message={error} />
      <SuccessAlert message={success} />

      {/* Filter bar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft/50" aria-hidden />
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Cari judul..."
            aria-label="Cari artikel"
            className="w-52 rounded-xl border border-brand-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand-500"
          />
        </div>
        <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} aria-label="Filter jenis" className={selectCls}>
          {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        {user?.role !== "OSIS" && (
          <>
            <select value={unit} onChange={(e) => { setUnit(e.target.value); setPage(1); }} aria-label="Filter unit" className={selectCls}>
              {UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Filter status" className={selectCls}>
              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </>
        )}
      </div>

      {/* Tabel */}
      <AdminCard className="overflow-x-auto p-0">
        {data?.items?.length ? (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-brand-100 text-xs uppercase tracking-wider text-ink-soft">
                <th className="px-5 py-4 font-semibold">Judul</th>
                <th className="px-5 py-4 font-semibold">Jenis</th>
                <th className="px-5 py-4 font-semibold">Unit</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Diperbarui</th>
                <th className="px-5 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((p) => (
                <tr key={p.id} className="border-b border-brand-50 transition last:border-0 hover:bg-cream/60">
                  <td className="max-w-[280px] px-5 py-4">
                    <p className="truncate font-medium text-ink">{p.title}</p>
                    <p className="text-xs text-ink-soft">oleh {p.author?.name ?? "—"}</p>
                  </td>
                  <td className="px-5 py-4">{TYPES.find((t) => t.value === p.type)?.label ?? p.type}</td>
                  <td className="px-5 py-4">{UNITS.find((u) => u.value === p.unit)?.label ?? p.unit}</td>
                  <td className="px-5 py-4"><StatusBadge status={p.status} /></td>
                  <td className="px-5 py-4 text-xs text-ink-soft">{new Date(p.updatedAt).toLocaleDateString("id-ID")}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      {p.status === "PUBLISHED" ? (
                        <a
                          href={`${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100"}/${p.type === "BERITA" ? "berita" : "artikel"}/${p.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg p-2 text-ink-soft transition hover:bg-brand-50 hover:text-brand-600"
                          title="Lihat di website"
                          aria-label={`Lihat ${p.title} di website`}
                        >
                          <Globe className="h-4 w-4" aria-hidden />
                        </a>
                      ) : can(user, "canPublish") && (
                        <button
                          type="button"
                          onClick={() => publish(p)}
                          disabled={busyId === p.id}
                          className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50"
                          title="Publikasikan"
                          aria-label={`Publikasikan ${p.title}`}
                        >
                          <Send className="h-4 w-4" aria-hidden />
                        </button>
                      )}
                      <Link
                        href={`/posts/${p.id}/edit`}
                        className="rounded-lg p-2 text-brand-600 transition hover:bg-brand-50"
                        title="Edit"
                        aria-label={`Edit ${p.title}`}
                      >
                        <Pencil className="h-4 w-4" aria-hidden />
                      </Link>
                      {can(user, "canDelete") && (
                        <DangerButton
                          onClick={() => remove(p)}
                          disabled={busyId === p.id}
                          className="!border-0 !px-2 !py-2"
                          aria-label={`Hapus ${p.title}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </DangerButton>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6">
            <AdminEmptyState title="Belum ada artikel" hint="Klik 'Buat Baru' untuk menulis artikel pertama Anda." />
          </div>
        )}
      </AdminCard>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <nav aria-label="Navigasi halaman" className="mt-4 flex justify-center gap-2">
          {Array.from({ length: data.totalPages }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPage(i + 1)}
              aria-current={page === i + 1 ? "page" : undefined}
              className={`h-9 w-9 rounded-xl text-sm font-semibold transition ${page === i + 1 ? "bg-brand-500 text-white" : "bg-white text-brand-700 ring-1 ring-brand-200 hover:bg-brand-50"}`}
            >
              {i + 1}
            </button>
          ))}
        </nav>
      )}
    </>
  );
}
