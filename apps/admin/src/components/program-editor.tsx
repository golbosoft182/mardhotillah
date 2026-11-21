"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Eye, ImageIcon, Save } from "lucide-react";
import { api, getSession, API_URL } from "@/lib/auth";
import { PageHeader } from "@/components/shell";
import { AdminCard, ErrorAlert, Field, PrimaryButton, SecondaryButton, Select, SuccessAlert, TextArea, TextInput } from "@/components/ui";
import { RichTextEditor } from "@/components/rich-text-editor";

const UNITS = ["YAYASAN", "PONPES", "SMP", "SMK"];

export interface ProgramForm {
  name: string;
  slug: string;
  unit: string;
  description: string;
  content: string;
  image: string;
  icon: string;
  order: number;
  featured: boolean;
  status: string;
  seoTitle: string;
  seoDescription: string;
}

export const EMPTY_PROGRAM: ProgramForm = {
  name: "",
  slug: "",
  unit: "",
  description: "",
  content: "",
  image: "",
  icon: "",
  order: 1,
  featured: true,
  status: "DRAFT",
  seoTitle: "",
  seoDescription: "",
};

export function ProgramEditor({ mode, programId, initial }: { mode: "create" | "edit"; programId?: string; initial?: Partial<ProgramForm> }) {
  const router = useRouter();
  const [form, setForm] = useState<ProgramForm>({ ...EMPTY_PROGRAM, ...initial });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);

  const set = <K extends keyof ProgramForm>(key: K, value: ProgramForm[K]) => setForm((f) => ({ ...f, [key]: value }));

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const body = {
        ...form,
        slug: form.slug || undefined,
        seoTitle: form.seoTitle || undefined,
        seoDescription: form.seoDescription || undefined,
      };
      if (mode === "create") {
        const created = await api<{ id: string }>("/programs", { method: "POST", body });
        setSuccess("Program berhasil dibuat");
        router.push(`/programs/${created.id}/edit`);
      } else if (programId) {
        await api(`/programs/${programId}`, { method: "PUT", body });
        setSuccess("Perubahan tersimpan");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  /** Unggah gambar ke media library, lalu simpan URL-nya ke field terkait. */
  async function handleUpload(file: File, key: "image" | "icon") {
    const session = getSession();
    if (!session) return;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${API_URL}/api/media/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session.accessToken}` },
      body: fd,
    });
    if (res.ok) {
      const media = await res.json();
      set(key, media.url);
    } else {
      setError("Gagal mengunggah gambar");
    }
  }

  return (
    <form onSubmit={handleSave}>
      <PageHeader
        title={mode === "create" ? "Buat Program" : "Edit Program"}
        description="Isi konten program, unggah gambar, atur SEO dasar, lalu simpan."
        action={
          <div className="flex gap-2">
            <SecondaryButton type="button" onClick={() => router.push("/programs")}>Batal</SecondaryButton>
            <PrimaryButton type="submit" loading={saving}>
              <Save className="h-4 w-4" aria-hidden /> Simpan
            </PrimaryButton>
          </div>
        }
      />
      <ErrorAlert message={error} />
      <SuccessAlert message={success} />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Konten utama */}
        <div className="space-y-6 lg:col-span-2">
          <AdminCard className="space-y-4">
            <Field label="Nama Program" required>
              <TextInput value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Contoh: Tahfidzul Qur'an" required />
            </Field>
            <Field label="Deskripsi Singkat" hint="Tampil di kartu program, halaman Program, dan hasil pencarian.">
              <TextArea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Ringkasan singkat program..." />
            </Field>
            <Field label="Konten" hint="Editor visual — HTML sederhana (paragraf, judul, daftar, gambar, kutipan) didukung.">
              <RichTextEditor
                value={form.content}
                onChange={(html) => set("content", html)}
                placeholder="Tulis konten program di sini..."
              />
            </Field>
          </AdminCard>

          {/* Panel SEO */}
          <AdminCard>
            <button
              type="button"
              onClick={() => setSeoOpen(!seoOpen)}
              aria-expanded={seoOpen}
              className="flex w-full items-center justify-between"
            >
              <span className="text-left">
                <span className="block font-display font-bold text-ink">SEO Dasar</span>
                <span className="text-xs text-ink-soft">Judul & deskripsi untuk Google — opsional, otomatis dari nama bila kosong</span>
              </span>
              <ChevronDown className={`h-5 w-5 text-brand-500 transition-transform ${seoOpen ? "rotate-180" : ""}`} aria-hidden />
            </button>
            {seoOpen && (
              <div className="mt-4 space-y-4 border-t border-brand-100 pt-4">
                <div className="rounded-xl bg-cream p-4">
                  <p className="text-[11px] uppercase tracking-wide text-ink-soft">Pratinjau Google</p>
                  <p className="mt-1.5 truncate text-sm font-medium text-blue-800">{form.seoTitle || form.name || "Nama Program"}</p>
                  <p className="text-xs text-emerald-700">{form.slug || "url-program"}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-ink-soft">{form.seoDescription || form.description || "Deskripsi meta akan muncul di sini..."}</p>
                </div>
                <Field label="SEO Title" hint={`Maks 60 karakter. Saat ini: ${(form.seoTitle || form.name).length}`}>
                  <TextInput value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} placeholder={form.name} />
                </Field>
                <Field label="Meta Description" hint={`Maks 160 karakter. Saat ini: ${(form.seoDescription || form.description).length}`}>
                  <TextArea value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} className="min-h-[70px]" />
                </Field>
              </div>
            )}
          </AdminCard>
        </div>

        {/* Sidebar pengaturan */}
        <div className="space-y-6">
          <AdminCard className="space-y-4">
            <Field label="Status">
              <Select value={form.status} onChange={(e) => set("status", e.target.value)}>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Publik</option>
              </Select>
            </Field>
            <Field label="Unit" hint="Kosongkan untuk tampil di semua unit (global).">
              <Select value={form.unit} onChange={(e) => set("unit", e.target.value)}>
                <option value="">Global (semua unit)</option>
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </Select>
            </Field>
            <Field label="Urutan">
              <TextInput type="number" value={String(form.order)} onChange={(e) => set("order", Number(e.target.value))} />
            </Field>
            <Field label="Unggulan">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => set("featured", e.target.checked)}
                  className="h-4 w-4 rounded border-brand-300 text-brand-500"
                />
                Tampilkan sebagai program unggulan
              </label>
            </Field>
            <Field label="Slug (URL)" hint="Kosongkan untuk dibuat otomatis dari nama">
              <TextInput value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="tahfidzul-quran" />
            </Field>
          </AdminCard>

          <AdminCard>
            <p className="mb-3 font-display text-sm font-bold text-ink">Gambar Utama</p>
            {form.image ? (
              <div className="relative mb-3 overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.image} alt="Gambar utama" className="aspect-video w-full object-cover" />
                <button
                  type="button"
                  onClick={() => set("image", "")}
                  className="absolute right-2 top-2 rounded-lg bg-white/90 px-2 py-1 text-xs font-medium text-red-600"
                >
                  Hapus
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-brand-200 bg-cream px-4 py-8 text-center transition hover:border-brand-400">
                <ImageIcon className="h-8 w-8 text-brand-300" aria-hidden />
                <span className="text-sm text-ink-soft">Klik untuk unggah gambar</span>
                <input type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f, "image"); }} />
              </label>
            )}
          </AdminCard>

          <AdminCard className="space-y-3">
            <p className="font-display text-sm font-bold text-ink">Ikon (opsional)</p>
            {form.icon ? (
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.icon} alt="Ikon" className="h-12 w-12 rounded-lg object-contain ring-1 ring-brand-100" />
                <button type="button" onClick={() => set("icon", "")} className="text-xs font-medium text-red-600">Hapus</button>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
                <ImageIcon className="h-5 w-5 text-brand-300" aria-hidden />
                <span>Unggah ikon</span>
                <input type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f, "icon"); }} />
              </label>
            )}
          </AdminCard>

          <AdminCard className="bg-gold-100/40">
            <p className="flex items-start gap-2 text-xs text-gold-500">
              <Eye className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              Program berstatus Publik akan tampil di halaman Program dan section Program Unggulan di beranda.
            </p>
          </AdminCard>
        </div>
      </div>
    </form>
  );
}
