"use client";

import { useCallback, useEffect, useState } from "react";
import { Save, RotateCcw, Plus, Trash2, Pencil, ImageIcon, ChevronDown } from "lucide-react";
import { api } from "@/lib/auth";
import { PageHeader } from "@/components/shell";
import {
  AdminCard, DangerButton, ErrorAlert, Field, PrimaryButton, SecondaryButton, SuccessAlert, TextArea, TextInput,
} from "@/components/ui";

interface SectionRow {
  key: string;
  label: string;
  data: Record<string, unknown>;
  isActive: boolean;
}

interface ItemRow {
  [key: string]: unknown;
}

const SECTION_META: Record<string, { title: string; hint: string; itemType: "units" | "text" }> = {
  hero_slides: { title: "Hero Slider", hint: "Foto + caption beranda yang tampil bergantian (slider)", itemType: "units" },
  ecosystem: { title: "Ekosistem Pendidikan", hint: "3 kartu satuan pendidikan di beranda", itemType: "units" },
  benefits: { title: "Mengapa Mardhotillah?", hint: "6 keunggulan dengan ikon", itemType: "text" },
  spmb_cta: { title: "CTA SPMB", hint: "Bagian ajakan daftar di bawah beranda", itemType: "text" },
};

const UNIT_FIELDS = ["name", "tagline", "description", "href", "image"];
const SLIDE_FIELDS = ["image", "eyebrow", "title", "description", "primaryButton", "primaryLink", "secondaryButton", "secondaryLink"] as const;
const SLIDE_LABELS: Record<(typeof SLIDE_FIELDS)[number], string> = {
  image: "URL Gambar (1920×1080 disarankan)",
  eyebrow: "Eyebrow (label kecil di atas judul)",
  title: "Judul",
  description: "Deskripsi",
  primaryButton: "Tombol Utama",
  primaryLink: "Link Tombol Utama",
  secondaryButton: "Tombol Kedua",
  secondaryLink: "Link Tombol Kedua",
};
const ICON_OPTIONS = [
  { value: "book", label: "Buku (pesantren/tahfidz)" },
  { value: "heart", label: "Hati (karakter)" },
  { value: "medal", label: "Medali (leadership/prestasi)" },
  { value: "language", label: "Bahasa" },
  { value: "sparkles", label: "Bintang (bakat)" },
];

export default function HomepageAdminPage() {
  const [sections, setSections] = useState<Record<string, SectionRow>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  // Editor slide hero: null = daftar; angka = sedang mengedit slide index tersebut
  const [slideEditor, setSlideEditor] = useState<number | null>(null);
  const [slideIsNew, setSlideIsNew] = useState(false);

  const load = useCallback(async () => {
    try {
      const list = await api<SectionRow[]>("/home-sections");
      const map: Record<string, SectionRow> = {};
      for (const s of list) map[s.key] = s;
      setSections(map);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat section beranda");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const get = (key: string): SectionRow | null => sections[key] ?? null;
  const items = (key: string): ItemRow[] => {
    const s = get(key);
    if (key === "hero_slides") {
      return Array.isArray(s?.data?.slides) ? (s!.data.slides as ItemRow[]) : [];
    }
    return Array.isArray(s?.data?.items) ? (s!.data.items as ItemRow[]) : [];
  };

  function updateItem(key: string, idx: number, field: string, value: unknown) {
    setSections((prev) => {
      const s = prev[key];
      if (!s) return prev;
      const arrKey = key === "hero_slides" ? "slides" : "items";
      const arr = [...((s.data[arrKey] as ItemRow[]) ?? [])];
      arr[idx] = { ...arr[idx], [field]: value };
      return { ...prev, [key]: { ...s, data: { ...s.data, [arrKey]: arr } } };
    });
  }

  function addItem(key: string, template: ItemRow) {
    setSections((prev) => {
      const s = prev[key];
      if (!s) return prev;
      const arrKey = key === "hero_slides" ? "slides" : "items";
      const arr = [...((s.data[arrKey] as ItemRow[]) ?? []), template];
      return { ...prev, [key]: { ...s, data: { ...s.data, [arrKey]: arr } } };
    });
  }

  function removeItem(key: string, idx: number) {
    setSections((prev) => {
      const s = prev[key];
      if (!s) return prev;
      const arrKey = key === "hero_slides" ? "slides" : "items";
      const arr = ((s.data[arrKey] as ItemRow[]) ?? []).filter((_, i) => i !== idx);
      return { ...prev, [key]: { ...s, data: { ...s.data, [arrKey]: arr } } };
    });
  }

  function updateHead(key: string, field: string, value: string) {
    setSections((prev) => {
      const s = prev[key];
      if (!s) return prev;
      return { ...prev, [key]: { ...s, data: { ...s.data, [field]: value } } };
    });
  }

  async function save(key: string, after?: () => void) {
    setSavingKey(key);
    setError(null);
    try {
      const s = sections[key];
      await api(`/home-sections/${key}`, { method: "PUT", body: { label: s.label, data: s.data, isActive: true } });
      setSuccess(`Section "${SECTION_META[key]?.title ?? key}" tersimpan`);
      after?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSavingKey(null);
    }
  }

  if (!Object.keys(sections).length) {
    return (
      <>
        <PageHeader title="Konten Beranda" description="Kelola isi setiap section halaman depan." />
        <ErrorAlert message={error} />
        <div className="rounded-2xl border border-dashed border-brand-200 bg-white px-6 py-12 text-center">
          <p className="font-display font-semibold text-ink">Section beranda belum tersedia</p>
          <p className="mt-1 text-sm text-ink-soft">Jalankan ulang seed database (docker compose restart api) untuk mengisi section default.</p>
        </div>
      </>
    );
  }

  const slides = items("hero_slides");

  return (
    <>
      <PageHeader
        title="Konten Beranda"
        description="Kelola isi setiap section halaman depan — hero slider, kartu unit, keunggulan, dan CTA SPMB."
      />
      <ErrorAlert message={error} />
      <SuccessAlert message={success} />

      <div className="space-y-6">
        {/* ============ HERO SLIDER — listing ringkas dengan aksi edit/hapus ============ */}
        {(() => {
          const key = "hero_slides";
          const s = get(key);
          if (!s) return null;
          return (
            <AdminCard>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-bold text-ink">Hero Slider</h2>
                  <p className="text-xs text-ink-soft">{slides.length} slide banner — klik Edit untuk mengubah isi slide</p>
                </div>
                <PrimaryButton
                  type="button"
                  loading={savingKey === key}
                  onClick={() => {
                    if (slideEditor === null) {
                      addItem(key, { image: "", eyebrow: "", title: "Slide Baru", description: "", primaryButton: "DAFTAR SPMB", primaryLink: "/ppdb", secondaryButton: "", secondaryLink: "" });
                      setSlideIsNew(true);
                      setSlideEditor(slides.length);
                    } else {
                      // tombol berubah jadi "Simpan & Tutup" saat mode edit
                      save(key, () => { setSlideEditor(null); setSlideIsNew(false); });
                    }
                  }}
                >
                  {slideEditor === null
                    ? <><Plus className="h-4 w-4" aria-hidden /> Tambah Slide</>
                    : <><Save className="h-4 w-4" aria-hidden /> Simpan &amp; Tutup</>}
                </PrimaryButton>
              </div>

              {slideEditor === null ? (
                /* ---------- LISTING ---------- */
                slides.length ? (
                  <div className="overflow-x-auto rounded-xl ring-1 ring-brand-100">
                    <table className="w-full min-w-[640px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-brand-100 bg-mint text-xs uppercase tracking-wider text-ink-soft">
                          <th className="px-4 py-3 font-semibold">Gambar</th>
                          <th className="px-4 py-3 font-semibold">Judul Slide</th>
                          <th className="px-4 py-3 font-semibold">Eyebrow</th>
                          <th className="px-4 py-3 text-right font-semibold">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {slides.map((item, idx) => (
                          <tr key={idx} className="border-b border-brand-50 transition last:border-0 hover:bg-cream/60">
                            <td className="px-4 py-3">
                              {item.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={String(item.image)} alt="" className="h-10 w-16 rounded-lg object-cover" />
                              ) : (
                                <span className="flex h-10 w-16 items-center justify-center rounded-lg bg-cream text-brand-300" aria-hidden>
                                  <ImageIcon className="h-4 w-4" />
                                </span>
                              )}
                            </td>
                            <td className="max-w-[260px] px-4 py-3">
                              <p className="truncate font-medium text-ink">{String(item.title ?? "—")}</p>
                            </td>
                            <td className="max-w-[200px] px-4 py-3">
                              <p className="truncate text-xs text-ink-soft">{String(item.eyebrow ?? "—")}</p>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSlideEditor(idx)}                                  className="rounded-lg p-2 text-brand-600 transition hover:bg-brand-50"
                                  title="Edit slide"
                                  aria-label={`Edit slide ${idx + 1}`}
                                >
                                  <Pencil className="h-4 w-4" aria-hidden />
                                </button>
                                <DangerButton
                                  onClick={() => removeItem(key, idx)}
                                  className="!border-0 !px-2 !py-2"
                                  aria-label={`Hapus slide ${idx + 1}`}
                                >
                                  <Trash2 className="h-4 w-4" aria-hidden />
                                </DangerButton>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-brand-200 bg-cream px-6 py-8 text-center">
                    <p className="text-sm font-medium text-ink">Belum ada slide</p>
                    <p className="mt-1 text-xs text-ink-soft">Klik "Tambah Slide" untuk membuat banner hero pertama.</p>
                  </div>
                )
              ) : (
                /* ---------- FORM EDIT 1 SLIDE ---------- */
                <div className="rounded-xl bg-cream p-4 ring-1 ring-brand-900/5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">
                      {slideIsNew ? "Slide Baru" : `Edit Slide ${slideEditor + 1}`}
                    </p>
                    <button
                      type="button"
                      onClick={() => { if (slideIsNew) removeItem(key, slideEditor); setSlideIsNew(false); setSlideEditor(null); }}
                      className="text-xs font-medium text-ink-soft underline hover:text-ink"
                    >
                      Batal
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {SLIDE_FIELDS.map((f) => (
                      <Field key={f} label={SLIDE_LABELS[f]} className={f === "description" ? "sm:col-span-2" : undefined}>
                        {f === "description" ? (
                          <TextArea className="!min-h-[60px]" value={String(slides[slideEditor]?.[f] ?? "")} onChange={(e) => updateItem(key, slideEditor, f, e.target.value)} />
                        ) : (
                          <TextInput value={String(slides[slideEditor]?.[f] ?? "")} onChange={(e) => updateItem(key, slideEditor, f, e.target.value)} />
                        )}
                      </Field>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-ink-soft">Klik "Simpan &amp; Tutup" untuk menyimpan perubahan slide.</p>
                </div>
              )}
            </AdminCard>
          );
        })()}

        {/* ============ SECTION LAIN (ringkas, heading bisa dilipat) ============ */}
        {Object.entries(SECTION_META).filter(([key]) => key !== "hero_slides").map(([key, meta]) => (
          <CollapsibleSection key={key} title={meta.title} hint={meta.hint} saving={savingKey === key} onSave={() => save(key)}>
            {get(key) && (
              <>
                <div className="mb-5 grid gap-4 sm:grid-cols-3">
                  <Field label="Eyebrow"><TextInput value={String(get(key)!.data.eyebrow ?? "")} onChange={(e) => updateHead(key, "eyebrow", e.target.value)} /></Field>
                  <Field label="Judul"><TextInput value={String(get(key)!.data.heading ?? "")} onChange={(e) => updateHead(key, "heading", e.target.value)} /></Field>
                  <Field label="Deskripsi"><TextInput value={String(get(key)!.data.description ?? "")} onChange={(e) => updateHead(key, "description", e.target.value)} /></Field>
                </div>

                {key === "spmb_cta" && (
                  <div className="mb-5 grid gap-4 sm:grid-cols-2">
                    <Field label="Tombol Utama">
                      <div className="flex gap-2">
                        <TextInput className="!w-36" value={String(get(key)!.data.primaryButton ?? "")} onChange={(e) => updateHead(key, "primaryButton", e.target.value)} />
                        <TextInput value={String(get(key)!.data.primaryLink ?? "")} onChange={(e) => updateHead(key, "primaryLink", e.target.value)} />
                      </div>
                    </Field>
                    <Field label="Tombol Kedua">
                      <div className="flex gap-2">
                        <TextInput className="!w-36" value={String(get(key)!.data.secondaryButton ?? "")} onChange={(e) => updateHead(key, "secondaryButton", e.target.value)} />
                        <TextInput value={String(get(key)!.data.secondaryLink ?? "")} onChange={(e) => updateHead(key, "secondaryLink", e.target.value)} />
                      </div>
                    </Field>
                  </div>
                )}

                <div className="space-y-3">
                  {items(key).map((item, idx) => (
                    <div key={idx} className="rounded-xl bg-cream p-4 ring-1 ring-brand-900/5">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">Item {idx + 1}</p>
                        <button type="button" onClick={() => removeItem(key, idx)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" aria-label={`Hapus item ${idx + 1}`}>
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {meta.itemType === "units" &&
                          UNIT_FIELDS.map((f) => (
                            <Field key={f} label={f === "href" ? "Link" : f === "image" ? "URL Gambar" : f}>
                              <TextInput value={String(item[f] ?? "")} onChange={(e) => updateItem(key, idx, f, e.target.value)} />
                            </Field>
                          ))}
                        {meta.itemType === "text" && (
                          <>
                            <Field label="Ikon">
                              <select
                                value={String(item.icon ?? "sparkles")}
                                onChange={(e) => updateItem(key, idx, "icon", e.target.value)}
                                className="w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500"
                              >
                                {ICON_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                              </select>
                            </Field>
                            <Field label="Judul"><TextInput value={String(item.title ?? "")} onChange={(e) => updateItem(key, idx, "title", e.target.value)} /></Field>
                            <div className="sm:col-span-2">
                              <Field label="Deskripsi"><TextArea className="!min-h-[60px]" value={String(item.description ?? "")} onChange={(e) => updateItem(key, idx, "description", e.target.value)} /></Field>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <SecondaryButton
                  type="button"
                  className="mt-3"
                  onClick={() =>
                    addItem(
                      key,
                      meta.itemType === "units"
                        ? { name: "Unit Baru", tagline: "", description: "", href: "/", image: "" }
                        : { icon: "sparkles", title: "Keunggulan Baru", description: "" },
                    )
                  }
                >
                  <Plus className="h-4 w-4" aria-hidden /> Tambah Item
                </SecondaryButton>
              </>
            )}
          </CollapsibleSection>
        ))}
      </div>

      <p className="mt-6 flex items-center gap-2 text-xs text-ink-soft">
        <RotateCcw className="h-3.5 w-3.5" aria-hidden />
        Perubahan tampil di website dalam maksimal 60 detik (cache halaman beranda).
      </p>
    </>
  );
}

/** Section panel yang bisa dilipat agar halaman CMS ringkas */
function CollapsibleSection({
  title, hint, children, onSave, saving,
}: {
  title: string; hint: string; children: React.ReactNode; onSave: () => void; saving: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <AdminCard>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex flex-1 items-center justify-between gap-3 text-left">
          <span>
            <span className="block font-display text-lg font-bold text-ink">{title}</span>
            <span className="text-xs text-ink-soft">{hint}</span>
          </span>
          <ChevronDown className={`h-5 w-5 shrink-0 text-brand-500 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
        </button>
        <PrimaryButton type="button" loading={saving} onClick={onSave}>
          <Save className="h-4 w-4" aria-hidden /> Simpan
        </PrimaryButton>
      </div>
      {open && <div className="mt-5 border-t border-brand-100 pt-5">{children}</div>}
    </AdminCard>
  );
}
