"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { api, can, getSession } from "@/lib/auth";
import { PageHeader } from "@/components/shell";
import {
  AdminCard, AdminEmptyState, DangerButton, ErrorAlert, Field, PrimaryButton,
  SecondaryButton, Select, SuccessAlert, StatusBadge, TextArea, TextInput,
} from "@/components/ui";

export interface FieldDef {
  key: string;
  label: string;
  type?: "text" | "textarea" | "select" | "number" | "image" | "date" | "checkbox";
  options?: { value: string; label: string }[];
  required?: boolean;
  hint?: string;
  hideInTable?: boolean;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

export interface ResourceCrudProps {
  title: string;
  description: string;
  endpoint: string;
  fields: FieldDef[];
  createRoles?: string[];
  initialForm?: Record<string, unknown>;
}

export function ResourceCrud({
  title,
  description,
  endpoint,
  fields,
  createRoles = ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  initialForm = {},
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

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api<{ items: Record<string, unknown>[] }>(`${endpoint}?limit=100`);
      setItems(res.items ?? []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

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
      if (editing) {
        await api(`${endpoint}/${editing.id}`, { method: "PUT", body: form });
        setSuccess("Perubahan tersimpan");
      } else {
        await api(endpoint, { method: "POST", body: form });
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

  const canWrite = user ? createRoles.includes(user.role) : false;

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        action={
          canWrite ? (
            <PrimaryButton type="button" onClick={openCreate}>
              <Plus className="h-4 w-4" aria-hidden /> Tambah
            </PrimaryButton>
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
                {fields.filter((f) => !f.hideInTable).map((f) => (
                  <th key={f.key} className="px-5 py-4 font-semibold">{f.label}</th>
                ))}
                <th className="px-5 py-4 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={String(row.id)} className="border-b border-brand-50 transition last:border-0 hover:bg-cream/60">
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
              {fields.map((f) => (
                <Field key={f.key} label={f.label} hint={f.hint} required={f.required}>
                  {f.type === "textarea" ? (
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
                      <TextInput
                        value={String(form[f.key] ?? "")}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                        placeholder="URL gambar (upload lewat menu Media)"
                      />
                      {typeof form[f.key] === "string" && Boolean(form[f.key]) && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={String(form[f.key])} alt="Pratinjau" className="mt-2 aspect-video w-full rounded-xl object-cover" />
                      )}
                    </div>
                  ) : f.type === "date" ? (
                    <TextInput
                      type="date"
                      value={String(form[f.key] ?? "").slice(0, 10)}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
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
                      required={f.required}
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
