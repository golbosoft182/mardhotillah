"use client";

import { useCallback, useEffect, useState } from "react";
import { GripVertical, Link2, Plus, Save, Trash2 } from "lucide-react";
import { api } from "@/lib/auth";
import { PageHeader } from "@/components/shell";
import { AdminCard, AdminEmptyState, DangerButton, ErrorAlert, PrimaryButton, SecondaryButton, SuccessAlert, TextInput } from "@/components/ui";

interface MenuNode {
  id: string;
  label: string;
  url: string;
  order: number;
  children?: MenuNode[];
}

const QUICK_LINKS = [
  { label: "Beranda", url: "/" },
  { label: "Profil Yayasan", url: "/tentang/profil" },
  { label: "Sejarah", url: "/tentang/sejarah" },
  { label: "Visi & Misi", url: "/tentang/visi-misi" },
  { label: "Ponpes", url: "/ponpes" },
  { label: "SMP", url: "/smp" },
  { label: "SMK", url: "/smk" },
  { label: "Berita", url: "/berita" },
  { label: "Artikel", url: "/artikel" },
  { label: "Agenda", url: "/agenda" },
  { label: "Prestasi", url: "/prestasi" },
  { label: "Galeri", url: "/galeri" },
  { label: "SPMB", url: "/ppdb" },
  { label: "Kontak", url: "/kontak" },
];

export default function MenusPage() {
  const [items, setItems] = useState<MenuNode[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api<{ items: MenuNode[] }>("/menus?location=HEADER");
      setItems(res.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat menu");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function updateItem(idx: number, patch: Partial<MenuNode>) {
    setItems((arr) => arr.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  function removeItem(idx: number) {
    setItems((arr) => arr.filter((_, i) => i !== idx));
  }

  function addChild(parentIdx: number) {
    setItems((arr) =>
      arr.map((it, i) =>
        i === parentIdx
          ? { ...it, children: [...(it.children ?? []), { id: `new-${Date.now()}`, label: "Menu Baru", url: "/", order: (it.children?.length ?? 0) + 1 }] }
          : it,
      ),
    );
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await api("/menus/HEADER", {
        method: "PUT",
        body: {
          items: items.map((it, i) => ({
            label: it.label,
            url: it.url,
            order: i + 1,
            children: (it.children ?? []).map((c, j) => ({ label: c.label, url: c.url, order: j + 1 })),
          })),
        },
      });
      setSuccess("Menu tersimpan");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan menu");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Menu Navigasi"
        description="Atur menu header website. Menu dengan anak akan tampil sebagai dropdown."
        action={
          <div className="flex gap-2">
            <SecondaryButton
              type="button"
              onClick={() =>
                setItems((arr) => [...arr, { id: `new-${Date.now()}`, label: "Menu Baru", url: "/", order: arr.length + 1 }])
              }
            >
              <Plus className="h-4 w-4" aria-hidden /> Tambah Menu
            </SecondaryButton>
            <PrimaryButton type="button" onClick={handleSave} loading={saving}>
              <Save className="h-4 w-4" aria-hidden /> Simpan Menu
            </PrimaryButton>
          </div>
        }
      />
      <ErrorAlert message={error} />
      <SuccessAlert message={success} />

      {items.length ? (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <AdminCard key={item.id} className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <GripVertical className="h-5 w-5 text-ink-soft/40" aria-hidden />
                <TextInput
                  value={item.label}
                  onChange={(e) => updateItem(idx, { label: e.target.value })}
                  className="!w-44"
                  aria-label="Label menu"
                />
                <div className="relative flex-1 min-w-[200px]">
                  <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft/50" aria-hidden />
                  <TextInput
                    value={item.url}
                    onChange={(e) => updateItem(idx, { url: e.target.value })}
                    className="!pl-9"
                    aria-label="URL menu"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => addChild(idx)}
                  className="rounded-lg p-2 text-brand-600 hover:bg-brand-50"
                  title="Tambah submenu"
                  aria-label="Tambah submenu"
                >
                  <Plus className="h-4 w-4" aria-hidden />
                </button>
                <DangerButton onClick={() => removeItem(idx)} className="!border-0 !p-2" aria-label="Hapus menu">
                  <Trash2 className="h-4 w-4" aria-hidden />
                </DangerButton>
              </div>
              {item.children && item.children.length > 0 && (
                <div className="ml-8 space-y-2 border-l-2 border-brand-100 pl-4">
                  {item.children.map((child, cIdx) => (
                    <div key={child.id} className="flex items-center gap-2">
                      <TextInput
                        value={child.label}
                        onChange={(e) => {
                          const children = [...(item.children ?? [])];
                          children[cIdx] = { ...child, label: e.target.value };
                          updateItem(idx, { children });
                        }}
                        className="!w-40 text-sm"
                        aria-label="Label submenu"
                      />
                      <TextInput
                        value={child.url}
                        onChange={(e) => {
                          const children = [...(item.children ?? [])];
                          children[cIdx] = { ...child, url: e.target.value };
                          updateItem(idx, { children });
                        }}
                        className="flex-1 text-sm"
                        aria-label="URL submenu"
                      />
                      <button
                        type="button"
                        onClick={() => updateItem(idx, { children: item.children?.filter((_, j) => j !== cIdx) })}
                        className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                        aria-label="Hapus submenu"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </AdminCard>
          ))}
        </div>
      ) : (
        <AdminEmptyState title="Belum ada menu" hint="Tambahkan menu pertama atau periksa koneksi API." />
      )}

      {/* Referensi link cepat */}
      <AdminCard className="mt-6">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-soft">Referensi URL Halaman</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_LINKS.map((l) => (
            <code key={l.url} className="rounded-lg bg-cream px-2.5 py-1 text-xs text-brand-700 ring-1 ring-brand-100">
              {l.label}: {l.url}
            </code>
          ))}
        </div>
      </AdminCard>
    </>
  );
}
