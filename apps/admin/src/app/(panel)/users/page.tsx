"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { api, can, getSession } from "@/lib/auth";
import { PageHeader } from "@/components/shell";
import { RoleBadge } from "@/components/ui-extra";
import {
  AdminCard, AdminEmptyState, ErrorAlert, Field, PrimaryButton,
  SecondaryButton, Select, SuccessAlert, TextInput,
} from "@/components/ui";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  unit: string | null;
  isActive: boolean;
}

const ROLE_OPTIONS = [
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "ADMIN", label: "Admin" },
  { value: "EDITOR", label: "Editor" },
  { value: "OSIS", label: "OSIS" },
];

const UNIT_OPTIONS = [
  { value: "", label: "Semua Unit" },
  { value: "YAYASAN", label: "Yayasan" },
  { value: "PONPES", label: "Ponpes" },
  { value: "SMP", label: "SMP" },
  { value: "SMK", label: "SMK" },
];

const EMPTY = { name: "", email: "", password: "", role: "EDITOR", unit: "" };

export default function UsersPage() {
  const me = getSession()?.user ?? null;
  const [users, setUsers] = useState<UserRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api<{ items: UserRow[] }>("/users?limit=100");
      setUsers(res.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY });
    setModalOpen(true);
  }

  function openEdit(u: UserRow) {
    setEditing(u);
    setForm({ name: u.name, email: u.email, password: "", role: u.role, unit: u.unit ?? "" });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        const body: Record<string, unknown> = { name: form.name, role: form.role, unit: form.unit || null };
        if (form.password) body.password = form.password;
        await api(`/users/${editing.id}`, { method: "PUT", body });
        setSuccess("Pengguna diperbarui");
      } else {
        await api("/users", { method: "POST", body: { ...form, unit: form.unit || null } });
        setSuccess("Pengguna ditambahkan");
      }
      setModalOpen(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  if (!can(me, "canManageUsers")) {
    return <AdminEmptyState title="Akses ditolak" hint="Hanya Admin dan Super Admin yang dapat mengelola pengguna." />;
  }

  return (
    <>
      <PageHeader
        title="Pengguna"
        description="Kelola akun dan hak akses tim CMS."
        action={<PrimaryButton type="button" onClick={openCreate}><Plus className="h-4 w-4" aria-hidden /> Tambah Pengguna</PrimaryButton>}
      />
      <ErrorAlert message={error} />
      <SuccessAlert message={success} />

      <AdminCard className="overflow-x-auto p-0">
        {users.length ? (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-brand-100 text-xs uppercase tracking-wider text-ink-soft">
                <th className="px-5 py-4 font-semibold">Nama</th>
                <th className="px-5 py-4 font-semibold">Peran</th>
                <th className="px-5 py-4 font-semibold">Unit</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-brand-50 last:border-0 hover:bg-cream/60">
                  <td className="px-5 py-4">
                    <p className="font-medium text-ink">{u.name}</p>
                    <p className="text-xs text-ink-soft">{u.email}</p>
                  </td>
                  <td className="px-5 py-4"><RoleBadge role={u.role} /></td>
                  <td className="px-5 py-4">{UNIT_OPTIONS.find((o) => o.value === u.unit)?.label ?? "—"}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${u.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                      {u.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button type="button" onClick={() => openEdit(u)} className="rounded-lg p-2 text-brand-600 transition hover:bg-brand-50" aria-label={`Edit ${u.name}`}>
                      <Pencil className="h-4 w-4" aria-hidden />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6"><AdminEmptyState title="Belum ada pengguna" /></div>
        )}
      </AdminCard>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-brand-900/50 backdrop-blur-sm" onClick={() => setModalOpen(false)} aria-hidden />
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-lift">
            <h2 className="mb-5 font-display text-lg font-bold text-ink">{editing ? "Edit Pengguna" : "Tambah Pengguna"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Nama" required>
                <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </Field>
              <Field label="Email" required>
                <TextInput type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required disabled={Boolean(editing)} />
              </Field>
              <Field label={editing ? "Password Baru (opsional)" : "Password"} required={!editing} hint="Min. 8 karakter">
                <TextInput type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={editing ? 0 : 8} required={!editing} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Peran" required hint="OSIS hanya bisa membuat artikel sekolah">
                  <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    {ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </Select>
                </Field>
                <Field label="Unit" hint="Batasi akun ke satu unit (opsional)">
                  <Select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                    {UNIT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </Select>
                </Field>
              </div>
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
