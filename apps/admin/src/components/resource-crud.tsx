"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, FileText, GripVertical, ImageIcon, Pencil, Plus, Save, Trash2, Upload } from "lucide-react";
import { api, API_URL, can, getSession } from "@/lib/auth";
import { PageHeader } from "@/components/shell";
import {
  AdminCard, AdminEmptyState, DangerButton, ErrorAlert, Field, PrimaryButton,
  SecondaryButton, Select, SuccessAlert, StatusBadge, TextArea, TextInput,
} from "@/components/ui";
import { RichTextEditor } from "@/components/rich-text-editor";

export interface FieldDef {
  key: string;
  label: string;
  type?: "text" | "textarea" | "select" | "number" | "image" | "file" | "date" | "checkbox" | "html";
  options?: { value: string; label: string }[];
  required?: boolean;
  hint?: string;
  hideInTable?: boolean;
  /** hanya tampil sebagai kolom tabel (mis. penghitung view/download) — tak bisa diedit & tak dikirim saat simpan */
  readOnly?: boolean;
  /** untuk type "file": daftar tipe berkas yang diterima (default PDF/DOC/DOCX) */
  accept?: string;
  /** untuk type "file"/"image": simpan juga nama asli berkas ke field lain (mis. "fileName") */
  nameKey?: string;
  /** kondisi tampil di form, berdasarkan nilai form lain (mis. field kondisional per jenis) */
  showIf?: (form: Record<string, unknown>) => boolean;
  /** label dinamis pada form (default: label) */
  formLabel?: (form: Record<string, unknown>) => string;
  /** status wajib-diisi dinamis pada form (default: required) */
  formRequired?: (form: Record<string, unknown>) => boolean;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

export interface ResourceCrudProps {
  title: string;
  description: string;
  endpoint: string;
  fields: FieldDef[];
  createRoles?: string[];
  initialForm?: Record<string, unknown>;
  /** bila diisi (mis. "order"), list dapat diurutkan via drag & drop atau tombol naik/turun */
  orderKey?: string;
  /** query tambahan untuk endpoint list (mis. { status: "ALL" } agar draft ikut tampil) */
  listQuery?: Record<string, string>;
}

export function ResourceCrud({
  title,
  description,
  endpoint,
  fields,
  createRoles = ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  initialForm = {},
  orderKey,
  listQuery,
}: ResourceCrudProps) {
  const user = getSession()?.user ?? null;
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const listKey = listQuery ? JSON.stringify(listQuery) : "";
  const load = useCallback(async () => {
    try {
      setLoading(true);
      const qs = new URLSearchParams({ limit: "100", ...(listQuery ?? {}) }).toString();
      const res = await api<{ items: Record<string, unknown>[] }>(`${endpoint}?${qs}`);
      setItems(res.items ?? []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, listKey]);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditing(null);
    setForm({ ...initialForm });
    setModalOpen(true);
  }

  function openEdit(row: Record<string, unknown>) {
    setEditing(row);
    const f: Record<string, unknown> = {};
    for (const field of fields) {
      const v = row[field.key];
      f[field.key] = typeof v === "string" ? v : v ?? (field.type === "checkbox" ? false : "");
    }
    setForm(f);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      // hanya kirim field yang sedang tampil (field kondisional yang tersembunyi diabaikan)
      const payload: Record<string, unknown> = {};
      for (const f of fields) {
        if (f.readOnly) continue;
        if (!f.showIf || f.showIf(form)) payload[f.key] = form[f.key];
      }
      if (editing) {
        await api(`${endpoint}/${editing.id}`, { method: "PUT", body: payload });
        setSuccess("Perubahan tersimpan");
      } else {
        await api(endpoint, { method: "POST", body: payload });
        setSuccess("Data berhasil ditambahkan");
      }
      setModalOpen(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(row: Record<string, unknown>) {
    if (!confirm(`Hapus data ini? Tindakan tidak dapat dibatalkan.`)) return;
    try {
      await api(`${endpoint}/${row.id}`, { method: "DELETE" });
      setSuccess("Data dihapus");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menghapus");
    }
  }

  /** Unggah berkas/gambar ke /media/upload lalu isi field URL (dan nameKey bila ada). */
  async function handleUpload(field: FieldDef, file: File) {
    const session = getSession();
    if (!session) return;
    setUploading(field.key);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API_URL}/api/media/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.accessToken}` },
        body: fd,
      });
      if (!res.ok) throw new Error("Gagal mengunggah berkas");
      const media = await res.json();
      setForm((prev) => ({
        ...prev,
        [field.key]: media.url,
        ...(field.nameKey ? { [field.nameKey]: media.title ?? file.name } : {}),
      }));
      setSuccess("Berkas terunggah");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengunggah");
    } finally {
      setUploading(null);
    }
  }

  const canWrite = user ? createRoles.includes(user.role) : false;

  /** Pindahkan baris dari posisi `from` ke `to` (lokal, disimpan tombol "Simpan Urutan"). */
  function moveRow(from: number, to: number) {
    if (from === to || to < 0 || to >= items.length) return;
    setItems((arr) => {
      const next = [...arr];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  async function handleSaveOrder() {
    if (!orderKey) return;
    setSavingOrder(true);
    setError(null);
    try {
      const changed = items
        .map((row, idx) => ({ id: String(row.id), order: idx + 1, prev: Number(row[orderKey] ?? 0) }))
        .filter((u) => u.prev !== u.order);
      for (const u of changed) {
        await api(`${endpoint}/${u.id}`, { method: "PUT", body: { [orderKey]: u.order } });
      }
      setSuccess(changed.length ? "Urutan tersimpan" : "Tidak ada perubahan urutan");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan urutan");
    } finally {
      setSavingOrder(false);
    }
  }

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        action={
          canWrite ? (
            <div className="flex flex-wrap gap-2">
              {orderKey && (
                <SecondaryButton type="button" onClick={handleSaveOrder} disabled={savingOrder}>
                  <Save className="h-4 w-4" aria-hidden /> {savingOrder ? "Menyimpan..." : "Simpan Urutan"}
                </SecondaryButton>
              )}
              <PrimaryButton type="button" onClick={openCreate}>
                <Plus className="h-4 w-4" aria-hidden /> Tambah
              </PrimaryButton>
            </div>
          ) : undefined
        }
      />
      <ErrorAlert message={error} />
      <SuccessAlert message={success} />

      <AdminCard className="overflow-x-auto p-0">
        {loading ? (
          <div className="p-10 text-center text-sm text-ink-soft">Memuat...</div>
        ) : items.length ? (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-brand-100 text-xs uppercase tracking-wider text-ink-soft">
                {orderKey && <th className="w-28 px-4 py-4 font-semibold">Urutan</th>}
                {fields.filter((f) => !f.hideInTable).map((f) => (
                  <th key={f.key} className="px-5 py-4 font-semibold">{f.label}</th>
                ))}
                <th className="px-5 py-4 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row, idx) => (
                <tr
                  key={String(row.id)}
                  onDragOver={
                    orderKey
                      ? (e) => {
                          if (draggingIdx === null) return;
                          e.preventDefault();
                          setOverIdx(idx);
                        }
                      : undefined
                  }
                  onDrop={
                    orderKey
                      ? (e) => {
                          if (draggingIdx !== null) {
                            e.preventDefault();
                            moveRow(draggingIdx, idx);
                          }
                          setDraggingIdx(null);
                          setOverIdx(null);
                        }
                      : undefined
                  }
                  className={`border-b border-brand-50 transition last:border-0 hover:bg-cream/60 ${
                    orderKey && draggingIdx === idx ? "opacity-50" : ""
                  } ${orderKey && overIdx === idx && draggingIdx !== null && draggingIdx !== idx ? "bg-brand-50" : ""}`}
                >
                  {orderKey && (
                    <td className="px-3 py-4 align-middle">
                      <div className="flex items-center gap-1">
                        <span
                          draggable
                          onDragStart={(e) => {
                            setDraggingIdx(idx);
                            e.dataTransfer.effectAllowed = "move";
                          }}
                          onDragEnd={() => {
                            setDraggingIdx(null);
                            setOverIdx(null);
                          }}
                          className="cursor-grab text-ink-soft/40 transition hover:text-brand-500 active:cursor-grabbing"
                          title="Tarik untuk mengatur urutan"
                          aria-label="Tarik untuk mengatur urutan"
                        >
                          <GripVertical className="h-4 w-4" aria-hidden />
                        </span>
                        <span className="flex flex-col">
                          <button
                            type="button"
                            onClick={() => moveRow(idx, idx - 1)}
                            disabled={idx === 0}
                            className="rounded p-0.5 text-ink-soft/50 transition hover:bg-brand-50 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Naikkan"
                            aria-label="Naikkan"
                          >
                            <ChevronUp className="h-3.5 w-3.5" aria-hidden />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveRow(idx, idx + 1)}
                            disabled={idx === items.length - 1}
                            className="rounded p-0.5 text-ink-soft/50 transition hover:bg-brand-50 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Turunkan"
                            aria-label="Turunkan"
                          >
                            <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                          </button>
                        </span>
                        <span className="ml-0.5 w-5 text-center font-mono text-xs font-semibold text-ink-soft">{idx + 1}</span>
                      </div>
                    </td>
                  )}
                  {fields.filter((f) => !f.hideInTable).map((f) => (
                    <td key={f.key} className="max-w-[260px] truncate px-5 py-4">
                      {f.render ? (
                        f.render(row[f.key], row)
                      ) : (
                        <span>{String(row[f.key] ?? "—")}</span>
                      )}
                    </td>
                  ))}
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1.5">
                      {canWrite && (
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          className="rounded-lg p-2 text-brand-600 transition hover:bg-brand-50"
                          title="Edit"
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" aria-hidden />
                        </button>
                      )}
                      {can(user, "canDelete") && (
                        <DangerButton onClick={() => handleDelete(row)} className="!border-0 !px-2 !py-2" aria-label="Hapus">
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
            <AdminEmptyState title={`Belum ada data`} hint={canWrite ? `Klik "Tambah" untuk menambahkan data pertama.` : "Hubungi admin untuk menambahkan data."} />
          </div>
        )}
      </AdminCard>

      {/* Modal form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-brand-900/50 backdrop-blur-sm" onClick={() => setModalOpen(false)} aria-hidden />
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-lift">
            <h2 className="mb-5 font-display text-lg font-bold text-ink">
              {editing ? `Edit ${title}` : `Tambah ${title}`}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.filter((f) => !f.readOnly && (!f.showIf || f.showIf(form))).map((f) => (
                <Field
                  key={f.key}
                  label={f.formLabel ? f.formLabel(form) : f.label}
                  hint={f.hint}
                  required={f.formRequired ? f.formRequired(form) : f.required}
                >
                  {f.type === "html" ? (
                    <RichTextEditor
                      value={String(form[f.key] ?? "")}
                      onChange={(html) => setForm({ ...form, [f.key]: html })}
                    />
                  ) : f.type === "textarea" ? (
                    <TextArea
                      value={String(form[f.key] ?? "")}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      required={f.required}
                    />
                  ) : f.type === "select" ? (
                    <Select
                      value={String(form[f.key] ?? "")}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      required={f.required}
                    >
                      <option value="">— Pilih —</option>
                      {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </Select>
                  ) : f.type === "image" ? (
                    <div>
                      <label className="mb-2 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50">
                        <ImageIcon className="h-4 w-4" aria-hidden />
                        {uploading === f.key ? "Mengunggah..." : "Unggah Gambar"}
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          disabled={uploading === f.key}
                          onChange={(e) => { const file = e.target.files?.[0]; if (file) handleUpload(f, file); e.target.value = ""; }}
                        />
                      </label>
                      <TextInput
                        value={String(form[f.key] ?? "")}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                        placeholder="URL gambar (unggah atau tempel URL)"
                      />
                      {typeof form[f.key] === "string" && Boolean(form[f.key]) && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={String(form[f.key])} alt="Pratinjau" className="mt-2 aspect-video w-full rounded-xl object-cover" />
                      )}
                    </div>
                  ) : f.type === "file" ? (
                    <div>
                      <label className="mb-2 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50">
                        <Upload className="h-4 w-4" aria-hidden />
                        {uploading === f.key ? "Mengunggah..." : "Unggah Berkas"}
                        <input
                          type="file"
                          accept={f.accept ?? ".pdf,.doc,.docx"}
                          className="sr-only"
                          disabled={uploading === f.key}
                          onChange={(e) => { const file = e.target.files?.[0]; if (file) handleUpload(f, file); e.target.value = ""; }}
                        />
                      </label>
                      <TextInput
                        value={String(form[f.key] ?? "")}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                        placeholder="URL berkas (unggah atau tempel URL)"
                      />
                      {typeof form[f.key] === "string" && Boolean(form[f.key]) && (
                        <a
                          href={String(form[f.key])}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 underline"
                        >
                          <FileText className="h-3.5 w-3.5" aria-hidden /> Lihat berkas terunggah
                        </a>
                      )}
                    </div>
                  ) : f.type === "date" ? (
                    <TextInput
                      type="date"
                      value={String(form[f.key] ?? "").slice(0, 10)}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      required={f.formRequired ? f.formRequired(form) : f.required}
                    />
                  ) : f.type === "checkbox" ? (
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={Boolean(form[f.key])}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })}
                        className="h-4 w-4 rounded border-brand-300 text-brand-500"
                      />
                      {f.hint ?? "Aktifkan"}
                    </label>
                  ) : (
                    <TextInput
                      type={f.type === "number" ? "number" : "text"}
                      value={String(form[f.key] ?? "")}
                      onChange={(e) => setForm({ ...form, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value })}
                      required={f.formRequired ? f.formRequired(form) : f.required}
                    />
                  )}
                </Field>
              ))}
              <div className="flex justify-end gap-2 pt-2">
                <SecondaryButton type="button" onClick={() => setModalOpen(false)}>Batal</SecondaryButton>
                <PrimaryButton type="submit" loading={saving}>{editing ? "Simpan" : "Tambah"}</PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export { StatusBadge };
