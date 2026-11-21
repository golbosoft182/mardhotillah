"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Send, Globe } from "lucide-react";
import { api, can, getSession } from "@/lib/auth";
import { PageHeader } from "@/components/shell";
import { AdminCard, AdminEmptyState, DangerButton, ErrorAlert, StatusBadge, SuccessAlert } from "@/components/ui";

interface ProgramRow {
  id: string;
  name: string;
  slug: string;
  unit: string | null;
  image?: string | null;
  order: number;
  status: string;
  updatedAt: string;
}

const UNITS: Record<string, string> = {
  YAYASAN: "Yayasan",
  PONPES: "Ponpes",
  SMP: "SMP",
  SMK: "SMK",
};

export default function ProgramsPage() {
  const user = getSession()?.user ?? null;
  const [items, setItems] = useState<ProgramRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const canWrite = user ? ["SUPER_ADMIN", "ADMIN", "EDITOR"].includes(user.role) : false;

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // status= (kosong) menampilkan semua status, termasuk draft
      const res = await api<{ items: ProgramRow[] }>("/programs?limit=100&status=");
      setItems(res.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function publish(p: ProgramRow) {
    setBusyId(p.id);
    try {
      await api(`/programs/${p.id}`, { method: "PUT", body: { status: "PUBLISHED" } });
      setSuccess(`"${p.name}" berhasil dipublikasikan`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mempublikasikan");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(p: ProgramRow) {
    if (!confirm(`Hapus "${p.name}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setBusyId(p.id);
    try {
      await api(`/programs/${p.id}`, { method: "DELETE" });
      setSuccess("Program dihapus");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menghapus");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Program"
        description="Kelola program pendidikan beserta konten dan halaman detailnya."
        action={
          canWrite ? (
            <Link href="/programs/new" className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-display font-semibold text-white transition hover:bg-brand-700">
              <Plus className="h-4 w-4" aria-hidden /> Buat Baru
            </Link>
          ) : undefined
        }
      />
      <ErrorAlert message={error} />
      <SuccessAlert message={success} />

      <AdminCard className="overflow-x-auto p-0">
        {loading ? (
          <div className="p-10 text-center text-sm text-ink-soft">Memuat...</div>
        ) : items.length ? (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-brand-100 text-xs uppercase tracking-wider text-ink-soft">
                <th className="px-5 py-4 font-semibold">Program</th>
                <th className="px-5 py-4 font-semibold">Unit</th>
                <th className="px-5 py-4 font-semibold">Urutan</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-b border-brand-50 transition last:border-0 hover:bg-cream/60">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {p.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image} alt="" className="h-10 w-14 shrink-0 rounded-lg object-cover ring-1 ring-brand-100" />
                      ) : (
                        <div className="h-10 w-14 shrink-0 rounded-lg bg-brand-50 ring-1 ring-brand-100" />
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink">{p.name}</p>
                        <p className="truncate text-xs text-ink-soft">/{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">{p.unit ? UNITS[p.unit] ?? p.unit : "Global"}</td>
                  <td className="px-5 py-4">{p.order}</td>
                  <td className="px-5 py-4"><StatusBadge status={p.status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      {p.status === "PUBLISHED" ? (
                        <a
                          href={`${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100"}/program/${p.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg p-2 text-ink-soft transition hover:bg-brand-50 hover:text-brand-600"
                          title="Lihat di website"
                          aria-label={`Lihat ${p.name} di website`}
                        >
                          <Globe className="h-4 w-4" aria-hidden />
                        </a>
                      ) : (
                        can(user, "canPublish") && (
                          <button
                            type="button"
                            onClick={() => publish(p)}
                            disabled={busyId === p.id}
                            className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50"
                            title="Publikasikan"
                            aria-label={`Publikasikan ${p.name}`}
                          >
                            <Send className="h-4 w-4" aria-hidden />
                          </button>
                        )
                      )}
                      {canWrite && (
                        <Link
                          href={`/programs/${p.id}/edit`}
                          className="rounded-lg p-2 text-brand-600 transition hover:bg-brand-50"
                          title="Edit"
                          aria-label={`Edit ${p.name}`}
                        >
                          <Pencil className="h-4 w-4" aria-hidden />
                        </Link>
                      )}
                      {can(user, "canDelete") && (
                        <DangerButton
                          onClick={() => remove(p)}
                          disabled={busyId === p.id}
                          className="!border-0 !px-2 !py-2"
                          aria-label={`Hapus ${p.name}`}
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
            <AdminEmptyState title="Belum ada program" hint="Klik 'Buat Baru' untuk menambahkan program pertama." />
          </div>
        )}
      </AdminCard>
    </>
  );
}
