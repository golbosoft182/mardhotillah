"use client";

import { useCallback, useEffect, useState } from "react";
import { Save, Search } from "lucide-react";
import { api } from "@/lib/auth";
import { PageHeader } from "@/components/shell";
import { AdminCard, ErrorAlert, Field, PrimaryButton, SuccessAlert, TextArea, TextInput } from "@/components/ui";

interface SeoRow {
  id?: string;
  pageKey: string;
  title?: string;
  description?: string;
  ogImage?: string;
}

const PAGE_KEYS = [
  { key: "home", label: "Beranda" },
  { key: "ponpes", label: "Ponpes" },
  { key: "smp", label: "SMP" },
  { key: "smk", label: "SMK" },
  { key: "spmb", label: "SPMB" },
  { key: "berita", label: "Berita" },
  { key: "kontak", label: "Kontak" },
];

export default function SeoPage() {
  const [rows, setRows] = useState<Record<string, SeoRow>>({});
  const [active, setActive] = useState("home");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const list = await api<SeoRow[]>("/seo");
      const map: Record<string, SeoRow> = {};
      for (const k of PAGE_KEYS) {
        map[k.key] = list.find((r) => r.pageKey === k.key) ?? { pageKey: k.key, title: "", description: "" };
      }
      setRows(map);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat SEO");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const current = rows[active] ?? { pageKey: active, title: "", description: "" };

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await api(`/seo/${active}`, {
        method: "PUT",
        body: { title: current.title, description: current.description, ogImage: current.ogImage },
      });
      setSuccess("Pengaturan SEO tersimpan");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="SEO"
        description="Judul & deskripsi meta per halaman utama. Artikel memiliki SEO tersendiri di editor."
      />
      <ErrorAlert message={error} />
      <SuccessAlert message={success} />

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <AdminCard className="h-fit p-2">
          <nav aria-label="Pilih halaman">
            {PAGE_KEYS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setActive(p.key)}
                aria-current={active === p.key ? "page" : undefined}
                className={`flex w-full items-center gap-2 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition ${
                  active === p.key ? "bg-brand-500 text-white" : "text-ink hover:bg-brand-50"
                }`}
              >
                <Search className="h-4 w-4" aria-hidden /> {p.label}
              </button>
            ))}
          </nav>
        </AdminCard>

        <AdminCard>
          <h2 className="mb-1 font-display text-lg font-bold text-ink">
            SEO — {PAGE_KEYS.find((p) => p.key === active)?.label}
          </h2>
          <p className="mb-5 text-sm text-ink-soft">Kosongkan untuk memakai nilai default dari sistem.</p>

          <div className="space-y-4">
            <Field label="SEO Title" hint={`${(current.title ?? "").length}/60 karakter`}>
              <TextInput
                value={current.title ?? ""}
                onChange={(e) => setRows({ ...rows, [active]: { ...current, title: e.target.value } })}
                placeholder="Judul di hasil pencarian Google"
              />
            </Field>
            <Field label="Meta Description" hint={`${(current.description ?? "").length}/160 karakter`}>
              <TextArea
                value={current.description ?? ""}
                onChange={(e) => setRows({ ...rows, [active]: { ...current, description: e.target.value } })}
                className="min-h-[80px]"
                placeholder="Deskripsi singkat halaman untuk Google"
              />
            </Field>
            <Field label="OG Image URL" hint="Gambar saat halaman dibagikan ke sosial media">
              <TextInput
                value={current.ogImage ?? ""}
                onChange={(e) => setRows({ ...rows, [active]: { ...current, ogImage: e.target.value } })}
                placeholder="https://..."
              />
            </Field>

            {/* Pratinjau Google */}
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-soft">Pratinjau Google</p>
              <div className="rounded-xl bg-white p-4 ring-1 ring-brand-100">
                <p className="text-xs text-ink-soft">yayasanmardhotillah.com › {active}</p>
                <p className="mt-1 text-lg text-blue-800">{current.title || "Judul halaman"}</p>
                <p className="mt-1 text-sm text-ink-soft">
                  {current.description || "Deskripsi meta halaman akan tampil di sini pada hasil pencarian."}
                </p>
              </div>
            </div>

            <PrimaryButton type="button" onClick={handleSave} loading={saving}>
              <Save className="h-4 w-4" aria-hidden /> Simpan SEO
            </PrimaryButton>
          </div>
        </AdminCard>
      </div>
    </>
  );
}
