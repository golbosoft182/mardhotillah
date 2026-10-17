"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Eye, ImageIcon, Save } from "lucide-react";
import { api, can, getSession, API_URL } from "@/lib/auth";
import { PageHeader } from "@/components/shell";
import { AdminCard, ErrorAlert, Field, PrimaryButton, SecondaryButton, Select, SuccessAlert, TextArea, TextInput } from "@/components/ui";

const UNITS = ["YAYASAN", "PONPES", "SMP", "SMK"];
const TYPES = [
  { value: "BERITA", label: "Berita" },
  { value: "ARTIKEL", label: "Artikel" },
  { value: "OPINI", label: "Opini Guru" },
  { value: "POJOK_SISWA", label: "Pojok Siswa" },
];

interface CatList {
  items: { id: string; name: string }[];
}

export interface PostForm {
  title: string;
  slug: string;
  unit: string;
  type: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  status: string;
  categoryId?: string;
  seoTitle: string;
  seoDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
}

export const EMPTY_POST: PostForm = {
  title: "",
  slug: "",
  unit: "YAYASAN",
  type: "BERITA",
  excerpt: "",
  content: "",
  featuredImage: "",
  status: "DRAFT",
  seoTitle: "",
  seoDescription: "",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
};

export function PostEditor({ mode, postId, initial }: { mode: "create" | "edit"; postId?: string; initial?: Partial<PostForm> }) {
  const router = useRouter();
  // Dibaca sekali via initializer agar identitas stabil antar-render.
  // Jika dipanggil langsung tiap render, efek [user] khusus OSIS memicu infinite loop
  // yang membuat navigasi (tombol Batal, link sidebar) tidak pernah selesai.
  const [user] = useState(() => getSession()?.user ?? null);
  const [form, setForm] = useState<PostForm>({ ...EMPTY_POST, ...initial });
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);

  const set = <K extends keyof PostForm>(key: K, value: PostForm[K]) => setForm((f) => ({ ...f, [key]: value }));

  // OSIS: unit terkunci sesuai profil; status tidak boleh PUBLISHED
  useEffect(() => {
    if (user?.role === "OSIS" && user.unit) set("unit", user.unit);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- jalankan sekali saat mount
  }, []);

  // Muat daftar kategori untuk dropdown
  useEffect(() => {
    api<CatList>("/categories?limit=100")
      .then((r) => setCategories(r.items ?? []))
      .catch(() => setCategories([]));
  }, []);

  const statusOptions = user?.role === "OSIS"
    ? [
        { value: "DRAFT", label: "Draft" },
        { value: "REVIEW", label: "Kirim untuk Review" },
      ]
    : [
        { value: "DRAFT", label: "Draft" },
        { value: "REVIEW", label: "Review" },
        { value: "PUBLISHED", label: "Publik" },
      ];

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const body = {
        ...form,
        status: user?.role === "OSIS" && form.status === "PUBLISHED" ? "REVIEW" : form.status,
        seoTitle: form.seoTitle || undefined,
        seoDescription: form.seoDescription || undefined,
        // "— Tanpa Kategori —" dikirim null agar bisa juga mengosongkan kategori;
        // string kosong tidak boleh dikirim (gagal FK)
        categoryId: form.categoryId || null,
      };
      if (mode === "create") {
        const created = await api<{ id: string }>("/posts", { method: "POST", body });
        setSuccess("Artikel berhasil dibuat");
        router.push(`/posts/${created.id}/edit`);
      } else if (postId) {
        await api(`/posts/${postId}`, { method: "PUT", body });
        setSuccess("Perubahan tersimpan");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  async function handleUploadImage(file: File) {
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
      set("featuredImage", media.url);
    } else {
      setError("Gagal mengunggah gambar");
    }
  }

  return (
    <form onSubmit={handleSave}>
      <PageHeader
        title={mode === "create" ? "Buat Artikel" : "Edit Artikel"}
        description="Isi konten, atur SEO dasar, lalu simpan."
        action={
          <div className="flex gap-2">
            <SecondaryButton type="button" onClick={() => router.push("/posts")}>Batal</SecondaryButton>
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
            <Field label="Judul" required>
              <TextInput value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Judul artikel" required />
            </Field>
            <Field label="Ringkasan (excerpt)" hint="Tampil di kartu berita & hasil pencarian. Biarkan kosong untuk dibuat otomatis.">
              <TextArea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} placeholder="Ringkasan singkat isi artikel..." />
            </Field>
            <Field label="Konten" hint="HTML sederhana didukung: <p>, <h2>, <h3>, <ul>, <img>, <blockquote>">
              <TextArea
                value={form.content}
                onChange={(e) => set("content", e.target.value)}
                className="min-h-[320px] font-mono text-[13px]"
                placeholder="<p>Tulis konten di sini...</p>"
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
                <span className="text-xs text-ink-soft">Judul & deskripsi untuk Google — opsional, otomatis dari judul bila kosong</span>
              </span>
              <ChevronDown className={`h-5 w-5 text-brand-500 transition-transform ${seoOpen ? "rotate-180" : ""}`} aria-hidden />
            </button>
            {seoOpen && (
              <div className="mt-4 space-y-4 border-t border-brand-100 pt-4">
                <div className="rounded-xl bg-cream p-4">
                  <p className="text-[11px] uppercase tracking-wide text-ink-soft">Pratinjau Google</p>
                  <p className="mt-1.5 truncate text-sm font-medium text-blue-800">{form.seoTitle || form.title || "Judul Artikel"}</p>
                  <p className="text-xs text-emerald-700">{form.slug || "url-artikel"}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-ink-soft">{form.seoDescription || form.excerpt || "Deskripsi meta akan muncul di sini..."}</p>
                </div>
                <Field label="SEO Title" hint={`Maks 60 karakter. Saat ini: ${(form.seoTitle || form.title).length}`}>
                  <TextInput value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} placeholder={form.title} />
                </Field>
                <Field label="Meta Description" hint={`Maks 160 karakter. Saat ini: ${(form.seoDescription || form.excerpt).length}`}>
                  <TextArea value={form.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} className="min-h-[70px]" />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="OG Title"><TextInput value={form.ogTitle} onChange={(e) => set("ogTitle", e.target.value)} /></Field>
                  <Field label="OG Image URL"><TextInput value={form.ogImage} onChange={(e) => set("ogImage", e.target.value)} /></Field>
                </div>
              </div>
            )}
          </AdminCard>
        </div>

        {/* Sidebar pengaturan */}
        <div className="space-y-6">
          <AdminCard className="space-y-4">
            <Field label="Status">
              <Select value={form.status} onChange={(e) => set("status", e.target.value)}>
                {statusOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </Select>
            </Field>
            <Field label="Jenis">
              <Select value={form.type} onChange={(e) => set("type", e.target.value)}>
                {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </Select>
            </Field>
            <Field label="Kategori" hint="Menggolongkan artikel — dikelola di menu Kategori & Tag">
              <Select value={form.categoryId ?? ""} onChange={(e) => set("categoryId", e.target.value || undefined)}>
                <option value="">— Tanpa Kategori —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </Field>
            <Field label="Unit" hint={user?.role === "OSIS" ? "Mengikuti unit akun OSIS Anda" : "Pilih unit pemilik konten"}>
              <Select value={form.unit} onChange={(e) => set("unit", e.target.value)} disabled={user?.role === "OSIS"}>
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </Select>
            </Field>
            <Field label="Slug (URL)" hint="Kosongkan untuk dibuat otomatis dari judul">
              <TextInput value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="judul-artikel" />
            </Field>
          </AdminCard>

          <AdminCard>
            <p className="mb-3 font-display text-sm font-bold text-ink">Gambar Utama</p>
            {form.featuredImage ? (
              <div className="relative mb-3 overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.featuredImage} alt="Gambar utama" className="aspect-video w-full object-cover" />
                <button
                  type="button"
                  onClick={() => set("featuredImage", "")}
                  className="absolute right-2 top-2 rounded-lg bg-white/90 px-2 py-1 text-xs font-medium text-red-600"
                >
                  Hapus
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-brand-200 bg-cream px-4 py-8 text-center transition hover:border-brand-400">
                <ImageIcon className="h-8 w-8 text-brand-300" aria-hidden />
                <span className="text-sm text-ink-soft">Klik untuk unggah gambar</span>
                <input type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadImage(f); }} />
              </label>
            )}
          </AdminCard>

          {/* Info peran */}
          <AdminCard className="bg-gold-100/40">
            <p className="flex items-start gap-2 text-xs text-gold-500">
              <Eye className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              {user?.role === "OSIS"
                ? "Artikel Anda akan direview Admin sebelum tampil di website."
                : can(user, "canPublish")
                  ? "Anda dapat mempublikasikan artikel langsung."
                  : "Artikel tersimpan sebagai draft/review sesuai pilihan."}
            </p>
          </AdminCard>
        </div>
      </div>
    </form>
  );
}
