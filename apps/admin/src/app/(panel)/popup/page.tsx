"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, CheckCircle2, ImageIcon, Megaphone } from "lucide-react";
import { api, API_URL, getSession } from "@/lib/auth";
import { PageHeader } from "@/components/shell";
import {
  AdminCard, AdminEmptyState, DangerButton, ErrorAlert, Field, PrimaryButton,
  SecondaryButton, Select, SuccessAlert, TextArea, TextInput,
} from "@/components/ui";

interface PopupRow {
  id: string;
  title: string;
  imageUrl: string;
  unit?: string | null;
  linkUrl: string;
  buttonText: string;
  widthDesktop?: number;
  widthTablet?: number;
  widthMobile?: number;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
}

/** Label jenjang untuk badge — null = popup umum (Yayasan) */
const UNIT_LABEL: Record<string, string> = {
  PONPES: "Ponpes",
  SMP: "SMP",
  SMK: "SMK",
  YAYASAN: "Yayasan",
};

const EMPTY = {
  title: "",
  imageUrl: "",
  unit: "",
  linkUrl: "/ppdb",
  buttonText: "DAFTAR SEKARANG",
  widthDesktop: 440,
  widthTablet: 360,
  widthMobile: 300,
  startDate: "",
  endDate: "",
};

export default function PopupAdminPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<PopupRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PopupRow | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api<PopupRow[]>("/popup/admin/all");
      setItems(res ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat popup");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function uploadFlyer(file: File) {
    const session = getSession();
    if (!session) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API_URL}/api/media/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.accessToken}` },
        body: fd,
      });
      if (!res.ok) throw new Error("Gagal mengunggah flyer");
      const media = await res.json();
      setForm((f) => ({ ...f, imageUrl: media.url }));
      setSuccess("Flyer terunggah");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengunggah");
    } finally {
      setUploading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY });
    setModalOpen(true);
  }

  function openEdit(p: PopupRow) {
    setEditing(p);
    setForm({
      title: p.title,
      imageUrl: p.imageUrl,
      unit: p.unit ?? "",
      linkUrl: p.linkUrl,
      buttonText: p.buttonText,
      widthDesktop: p.widthDesktop ?? 440,
      widthTablet: p.widthTablet ?? 360,
      widthMobile: p.widthMobile ?? 300,
      startDate: p.startDate ? p.startDate.slice(0, 10) : "",
      endDate: p.endDate ? p.endDate.slice(0, 10) : "",
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        title: form.title,
        imageUrl: form.imageUrl,
        unit: form.unit || null,
        linkUrl: form.linkUrl || "/ppdb",
        buttonText: form.buttonText || "DAFTAR SEKARANG",
        widthDesktop: Math.min(1200, Math.max(200, Number(form.widthDesktop) || 440)),
        widthTablet: Math.min(1200, Math.max(200, Number(form.widthTablet) || 360)),
        widthMobile: Math.min(1200, Math.max(200, Number(form.widthMobile) || 300)),
        ...(form.startDate ? { startDate: form.startDate } : {}),
        ...(form.endDate ? { endDate: form.endDate } : {}),
      };
      if (editing) {
        await api(`/popup/${editing.id}`, { method: "PUT", body });
        setSuccess("Popup diperbarui");
      } else {
        await api("/popup", { method: "POST", body });
        setSuccess("Popup dibuat & diaktifkan");
      }
      setModalOpen(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  async function activate(p: PopupRow) {
    try {
      await api(`/popup/${p.id}`, { method: "PUT", body: { isActive: true } });
      setSuccess(`Popup "${p.title}" sekarang aktif di seluruh halaman`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengaktifkan");
    }
  }

  async function deactivate(p: PopupRow) {
    try {
      await api(`/popup/${p.id}`, { method: "PUT", body: { isActive: false } });
      setSuccess("Popup dinonaktifkan");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menonaktifkan");
    }
  }

  async function remove(p: PopupRow) {
    if (!confirm(`Hapus popup "${p.title}"?`)) return;
    try {
      await api(`/popup/${p.id}`, { method: "DELETE" });
      setSuccess("Popup dihapus");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menghapus");
    }
  }

  return (
    <>
      <PageHeader
        title="Popup PPDB"
        description="Flyer PPDB/PPDB yang tampil di seluruh halaman website setiap kali halaman dimuat. Bisa dibuat per jenjang: Yayasan (umum), Ponpes, SMP, atau SMK."
        action={<PrimaryButton type="button" onClick={openCreate}><Plus className="h-4 w-4" aria-hidden /> Buat Popup</PrimaryButton>}
      />
      <ErrorAlert message={error} />
      <SuccessAlert message={success} />

      <div className="mb-4 flex items-start gap-3 rounded-2xl bg-gold-100/60 p-4 text-sm text-gold-500">
        <Megaphone className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
        <p>
          <strong>Cara kerja:</strong> satu popup aktif <em>per jenjang</em> (Yayasan/Ponpes/SMP/SMK).
          Pengunjung dapat berpindah jenjang lewat tab di dalam popup, dan menutupnya dengan tombol ✕.
          Popup tanpa jenjang (umum) tampil sebagai bawaan.
        </p>
      </div>

      {items.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((p) => (
            <AdminCard key={p.id} className="flex flex-col p-0">
              <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl bg-cream">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.imageUrl} alt={p.title} className="h-full w-full object-cover" />
                <span
                  className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${
                    p.isActive ? "bg-emerald-500 text-white" : "bg-white/90 text-ink-soft"
                  }`}
                >
                  {p.isActive && <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />}
                  {p.isActive ? "AKTIF" : "Nonaktif"}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-display font-bold text-ink">{p.title}</p>
                  <span className="inline-flex shrink-0 items-center rounded-full bg-brand-100 px-2.5 py-0.5 text-[11px] font-bold text-brand-700">
                    {UNIT_LABEL[p.unit ?? ""] ?? "Yayasan"}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-ink-soft">Link: {p.linkUrl} · Tombol: {p.buttonText}</p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  Ukuran: {p.widthDesktop ?? 440}px / {p.widthTablet ?? 360}px / {p.widthMobile ?? 300}px (desktop · tablet · mobile)
                </p>
                {(p.startDate || p.endDate) && (
                  <p className="mt-0.5 text-xs text-ink-soft">
                    Jadwal: {p.startDate?.slice(0, 10) ?? "…"} s/d {p.endDate?.slice(0, 10) ?? "…"}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-1.5 border-t border-brand-50 pt-3">
                  {p.isActive ? (
                    <SecondaryButton type="button" onClick={() => deactivate(p)} className="!px-3 !py-1.5 !text-xs">
                      Nonaktifkan
                    </SecondaryButton>
                  ) : (
                    <SecondaryButton type="button" onClick={() => activate(p)} className="!px-3 !py-1.5 !text-xs">
                      Aktifkan
                    </SecondaryButton>
                  )}
                  <button type="button" onClick={() => openEdit(p)} className="rounded-lg p-2 text-brand-600 hover:bg-brand-50" aria-label={`Edit ${p.title}`}>
                    <Pencil className="h-4 w-4" aria-hidden />
                  </button>
                  <DangerButton onClick={() => remove(p)} className="!border-0 !px-2 !py-2" aria-label={`Hapus ${p.title}`}>
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </DangerButton>
                </div>
              </div>
            </AdminCard>
          ))}
        </div>
      ) : (
        <AdminEmptyState title="Belum ada popup" hint='Klik "Buat Popup" untuk membuat flyer PPDB pertama.' />
      )}

      {/* Modal form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-brand-900/50 backdrop-blur-sm" onClick={() => setModalOpen(false)} aria-hidden />
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-lift">
            <h2 className="mb-5 font-display text-lg font-bold text-ink">{editing ? "Edit Popup" : "Buat Popup PPDB"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Judul" required>
                <TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="PPDB 2027/2028 Telah Dibuka" required />
              </Field>

              <Field label="Jenjang (Unit)" hint="Popup khusus jenjang menggantikan popup umum di tab jenjang tersebut">
                <Select
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                >
                  <option value="">Umum / Yayasan (semua pengunjung)</option>
                  <option value="PONPES">Ponpes — Pondok Pesantren</option>
                  <option value="SMP">SMP</option>
                  <option value="SMK">SMK</option>
                </Select>
              </Field>

              <Field label="Flyer (gambar)" required hint="Unggah gambar flyer atau tempel URL">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFlyer(f); }}
                      aria-label="Unggah file flyer"
                    />
                    <SecondaryButton type="button" disabled={uploading} onClick={() => fileRef.current?.click()}>
                      {uploading ? "Mengunggah..." : (<><ImageIcon className="h-4 w-4" aria-hidden /> Unggah Flyer</>)}
                    </SecondaryButton>
                  </div>
                  <TextInput
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="https://... atau hasil unggahan"
                    required
                  />
                  {form.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.imageUrl} alt="Pratinjau flyer" className="aspect-[4/3] w-full rounded-xl object-cover" />
                  )}
                </div>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Link Tujuan" hint="Misal /ppdb atau URL eksternal">
                  <TextInput value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} />
                </Field>
                <Field label="Teks Tombol">
                  <TextInput value={form.buttonText} onChange={(e) => setForm({ ...form, buttonText: e.target.value })} />
                </Field>
              </div>

              <div className="rounded-xl border border-brand-100 bg-cream/60 p-4">
                <p className="mb-3 font-display text-sm font-bold text-ink">Ukuran Popup per Perangkat</p>
                <p className="mb-3 text-xs text-ink-soft">
                  Atur lebar popup (dalam piksel) untuk desktop, tablet, dan mobile secara terpisah (200–1200 px).
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="Desktop">
                    <TextInput
                      type="number"
                      min={200}
                      max={1200}
                      value={form.widthDesktop}
                      onChange={(e) => setForm({ ...form, widthDesktop: Number(e.target.value) })}
                    />
                  </Field>
                  <Field label="Tablet">
                    <TextInput
                      type="number"
                      min={200}
                      max={1200}
                      value={form.widthTablet}
                      onChange={(e) => setForm({ ...form, widthTablet: Number(e.target.value) })}
                    />
                  </Field>
                  <Field label="Mobile">
                    <TextInput
                      type="number"
                      min={200}
                      max={1200}
                      value={form.widthMobile}
                      onChange={(e) => setForm({ ...form, widthMobile: Number(e.target.value) })}
                    />
                  </Field>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Mulai Tayang (opsional)">
                  <TextInput type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                </Field>
                <Field label="Berakhir Tayang (opsional)">
                  <TextInput type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                </Field>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <SecondaryButton type="button" onClick={() => setModalOpen(false)}>Batal</SecondaryButton>
                <PrimaryButton type="submit" loading={saving}>{editing ? "Simpan" : "Buat & Aktifkan"}</PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
