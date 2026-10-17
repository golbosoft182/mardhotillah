"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BadgeCheck, ChevronLeft, ChevronRight, ClipboardList, Eye, Loader2,
  Search, ShieldCheck, Trash2, XCircle,
} from "lucide-react";
import { api } from "@/lib/auth";
import { PageHeader } from "@/components/shell";
import {
  AdminCard, AdminEmptyState, DangerButton, ErrorAlert, PrimaryButton,
  SecondaryButton, SuccessAlert,
} from "@/components/ui";

/** CMS → List PPDB: pendaftaran online dari website, urut terbaru → terlama. */

interface Reg {
  id: string;
  regCode: string;
  fullName: string;
  nickname?: string | null;
  gender: string;
  birthPlace?: string | null;
  birthDate?: string | null;
  address?: string | null;
  unit: string;
  previousSchool?: string | null;
  parentName: string;
  parentPhone: string;
  parentEmail?: string | null;
  notes?: string | null;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  verifiedAt?: string | null;
  verifiedBy?: string | null;
  createdAt: string;
}

const UNIT_LABEL: Record<string, string> = {
  PONPES: "Ponpes",
  SMP: "SMP",
  SMK: "SMK",
};

const STATUS_BADGE: Record<Reg["status"], string> = {
  PENDING: "bg-gold-100 text-gold-500",
  VERIFIED: "bg-brand-100 text-brand-700",
  REJECTED: "bg-red-100 text-red-700",
};

const STATUS_LABEL: Record<Reg["status"], string> = {
  PENDING: "Menunggu",
  VERIFIED: "Terverifikasi",
  REJECTED: "Ditolak",
};

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function PpdbListAdminPage() {
  const [items, setItems] = useState<Reg[]>([]);
  const [stats, setStats] = useState<{ total: number; pending: number; verified: number; byUnit: Record<string, number> } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [unit, setUnit] = useState("");
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Detail modal
  const [detail, setDetail] = useState<Reg | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (unit) params.set("unit", unit);
      if (status) params.set("status", status);
      if (q.trim()) params.set("q", q.trim());
      const res = await api<{ items: Reg[]; total: number; totalPages: number }>(`/ppdb/registrations?${params}`);
      setItems(res?.items ?? []);
      setTotal(res?.total ?? 0);
      setTotalPages(res?.totalPages ?? 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat pendaftaran");
    } finally {
      setLoading(false);
    }
  }, [unit, status, q, page]);

  const loadStats = useCallback(async () => {
    try {
      setStats(await api<typeof stats>("/ppdb/registrations/stats"));
    } catch {
      /* statistik bersifat opsional */
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadStats(); }, [loadStats]);

  function changeFilter(fn: () => void) {
    fn();
    setPage(1);
  }

  async function verify(r: Reg) {
    try {
      await api(`/ppdb/registrations/${r.id}/status`, { method: "PATCH", body: { status: "VERIFIED" } });
      setSuccess(`${r.fullName} (${r.regCode}) diverifikasi`);
      await Promise.all([load(), loadStats()]);
      setDetail(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memverifikasi");
    }
  }

  async function reject(r: Reg) {
    try {
      await api(`/ppdb/registrations/${r.id}/status`, { method: "PATCH", body: { status: "REJECTED" } });
      setSuccess(`${r.fullName} (${r.regCode}) ditandai ditolak`);
      await Promise.all([load(), loadStats()]);
      setDetail(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menolak");
    }
  }

  async function resetStatus(r: Reg) {
    try {
      await api(`/ppdb/registrations/${r.id}/status`, { method: "PATCH", body: { status: "PENDING" } });
      setSuccess(`Status ${r.fullName} dikembalikan ke Menunggu`);
      await Promise.all([load(), loadStats()]);
      setDetail(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengubah status");
    }
  }

  async function remove(r: Reg) {
    if (!confirm(`Hapus pendaftaran ${r.fullName} (${r.regCode})? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      await api(`/ppdb/registrations/${r.id}`, { method: "DELETE" });
      setSuccess("Pendaftaran dihapus");
      await Promise.all([load(), loadStats()]);
      setDetail(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menghapus");
    }
  }

  return (
    <>
      <PageHeader
        title="List PPDB"
        description="Pendaftaran online dari website — urut dari terbaru. Verifikasi data calon peserta didik PONPES, SMP, dan SMK di sini."
      />
      <ErrorAlert message={error} />
      <SuccessAlert message={success} />

      {/* Kartu statistik */}
      {stats && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <AdminCard className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Total Pendaftar</p>
            <p className="mt-1 font-display text-2xl font-extrabold text-ink">{stats.total}</p>
          </AdminCard>
          <AdminCard className="bg-gold-100/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gold-500">Menunggu Verifikasi</p>
            <p className="mt-1 font-display text-2xl font-extrabold text-gold-500">{stats.pending}</p>
          </AdminCard>
          <AdminCard className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Terverifikasi</p>
            <p className="mt-1 font-display text-2xl font-extrabold text-brand-700">{stats.verified}</p>
          </AdminCard>
          <AdminCard className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Per Unit</p>
            <p className="mt-1 font-display text-sm font-bold text-ink">
              Ponpes {stats.byUnit?.PONPES ?? 0} · SMP {stats.byUnit?.SMP ?? 0} · SMK {stats.byUnit?.SMK ?? 0}
            </p>
          </AdminCard>
        </div>
      )}

      {/* Filter bar */}
      <AdminCard className="mb-4 flex flex-wrap items-end gap-3 p-4">
        <div>
          <label htmlFor="f-unit" className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-soft">Unit</label>
          <select
            id="f-unit"
            value={unit}
            onChange={(e) => changeFilter(() => setUnit(e.target.value))}
            className="rounded-xl border border-brand-900/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">Semua Unit</option>
            <option value="PONPES">Ponpes</option>
            <option value="SMP">SMP</option>
            <option value="SMK">SMK</option>
          </select>
        </div>
        <div>
          <label htmlFor="f-status" className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-soft">Status</label>
          <select
            id="f-status"
            value={status}
            onChange={(e) => changeFilter(() => setStatus(e.target.value))}
            className="rounded-xl border border-brand-900/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">Semua Status</option>
            <option value="PENDING">Menunggu</option>
            <option value="VERIFIED">Terverifikasi</option>
            <option value="REJECTED">Ditolak</option>
          </select>
        </div>
        <div className="min-w-56 flex-1">
          <label htmlFor="f-q" className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-soft">Cari</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" aria-hidden />
            <input
              id="f-q"
              value={q}
              onChange={(e) => changeFilter(() => setQ(e.target.value))}
              placeholder="Nama, kode, ortu, atau no. WA…"
              className="w-full rounded-xl border border-brand-900/15 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>
        {(unit || status || q) && (
          <SecondaryButton
            type="button"
            onClick={() => changeFilter(() => { setUnit(""); setStatus(""); setQ(""); })}
            className="!px-3 !py-2.5 !text-xs"
          >
            <XCircle className="h-4 w-4" aria-hidden /> Reset Filter
          </SecondaryButton>
        )}
      </AdminCard>

      {/* Tabel pendaftaran */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" aria-label="Memuat" />
        </div>
      ) : items.length ? (
        <AdminCard className="overflow-x-auto p-0">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-brand-100 bg-mint/60 text-xs uppercase tracking-wide text-ink-soft">
                <th className="px-4 py-3 font-bold">Kode</th>
                <th className="px-4 py-3 font-bold">Nama Calon</th>
                <th className="px-4 py-3 font-bold">Unit</th>
                <th className="px-4 py-3 font-bold">Ortu / Wali</th>
                <th className="px-4 py-3 font-bold">WhatsApp</th>
                <th className="px-4 py-3 font-bold">Daftar</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 text-right font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} className="border-b border-brand-50 transition hover:bg-brand-50/40">
                  <td className="px-4 py-3">
                    <span className="rounded-lg bg-cream px-2 py-1 font-mono text-xs font-bold text-brand-700">{r.regCode}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-ink">{r.fullName}</p>
                    {r.previousSchool && <p className="text-xs text-ink-soft">dari {r.previousSchool}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-bold text-brand-700">
                      {UNIT_LABEL[r.unit] ?? r.unit}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{r.parentName}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-soft">{r.parentPhone}</td>
                  <td className="px-4 py-3 text-xs text-ink-soft">{formatDate(r.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_BADGE[r.status]}`}>
                      {r.status === "VERIFIED" && <BadgeCheck className="h-3.5 w-3.5" aria-hidden />}
                      {STATUS_LABEL[r.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setDetail(r)}
                        className="rounded-lg p-2 text-brand-600 transition hover:bg-brand-50"
                        aria-label={`Detail ${r.fullName}`}
                      >
                        <Eye className="h-4 w-4" aria-hidden />
                      </button>
                      {r.status !== "VERIFIED" && (
                        <PrimaryButton type="button" onClick={() => verify(r)} className="!px-3 !py-1.5 !text-xs">
                          <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Verifikasi
                        </PrimaryButton>
                      )}
                      <DangerButton onClick={() => remove(r)} className="!border-0 !px-2 !py-2" aria-label={`Hapus ${r.fullName}`}>
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </DangerButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Paginasi */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 border-t border-brand-100 px-4 py-3">
              <p className="text-xs text-ink-soft">
                Halaman {page} dari {totalPages} · {total} pendaftar
              </p>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-brand-200 p-2 text-brand-700 disabled:opacity-40 hover:bg-brand-50"
                  aria-label="Halaman sebelumnya"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-brand-200 p-2 text-brand-700 disabled:opacity-40 hover:bg-brand-50"
                  aria-label="Halaman berikutnya"
                >
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>
          )}
        </AdminCard>
      ) : (
        <AdminEmptyState
          title="Belum ada pendaftaran"
          hint="Pendaftaran dari website akan muncul di sini secara otomatis, urut dari yang terbaru."
        />
      )}

      {/* Modal detail */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-brand-900/50 backdrop-blur-sm" onClick={() => setDetail(null)} aria-hidden />
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-lift sm:p-8">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-sm font-bold text-brand-700">{detail.regCode}</p>
                <h2 className="mt-1 font-display text-xl font-bold text-ink">{detail.fullName}</h2>
                <p className="text-sm text-ink-soft">
                  {UNIT_LABEL[detail.unit] ?? detail.unit} ·{" "}
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${STATUS_BADGE[detail.status]}`}>
                    {STATUS_LABEL[detail.status]}
                  </span>
                </p>
              </div>
              <button type="button" onClick={() => setDetail(null)} className="rounded-lg p-2 hover:bg-brand-50" aria-label="Tutup detail">
                <XCircle className="h-5 w-5 text-ink-soft" aria-hidden />
              </button>
            </div>

            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              {[
                ["Nama Panggilan", detail.nickname],
                ["Jenis Kelamin", detail.gender === "MALE" ? "Laki-laki" : "Perempuan"],
                ["Tempat / Tgl Lahir", detail.birthPlace ? `${detail.birthPlace}, ${formatDate(detail.birthDate)}` : formatDate(detail.birthDate)],
                ["Asal Sekolah", detail.previousSchool],
                ["Alamat", detail.address],
                ["Nama Ortu / Wali", detail.parentName],
                ["WhatsApp", detail.parentPhone],
                ["Email", detail.parentEmail],
                ["Waktu Daftar", formatDate(detail.createdAt)],
                ["Diverifikasi", detail.verifiedAt ? `${formatDate(detail.verifiedAt)} oleh ${detail.verifiedBy ?? "—"}` : null],
                ["Catatan Pendaftar", detail.notes],
              ].map(([label, value]) =>
                value ? (
                  <div key={label as string} className="rounded-xl bg-cream px-4 py-2.5">
                    <dt className="text-xs font-bold uppercase tracking-wide text-ink-soft">{label}</dt>
                    <dd className="mt-0.5 text-ink">{value}</dd>
                  </div>
                ) : null,
              )}
            </dl>

            <div className="mt-6 flex flex-wrap gap-2 border-t border-brand-100 pt-5">
              {detail.status !== "VERIFIED" && (
                <PrimaryButton type="button" onClick={() => verify(detail)}>
                  <ShieldCheck className="h-4 w-4" aria-hidden /> Verifikasi
                </PrimaryButton>
              )}
              {detail.status !== "REJECTED" && (
                <SecondaryButton type="button" onClick={() => reject(detail)}>
                  <XCircle className="h-4 w-4" aria-hidden /> Tandai Ditolak
                </SecondaryButton>
              )}
              {detail.status !== "PENDING" && (
                <SecondaryButton type="button" onClick={() => resetStatus(detail)}>
                  <ClipboardList className="h-4 w-4" aria-hidden /> Kembali ke Menunggu
                </SecondaryButton>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
