"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, GripVertical, Link2, Plus, Save, Trash2 } from "lucide-react";
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

type MenuLocation = "HEADER" | "FOOTER";

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

let uidCounter = 0;
function uid() {
  uidCounter += 1;
  return `new-${Date.now()}-${uidCounter}`;
}

function makeNode(label = "Menu Baru"): MenuNode {
  return { id: uid(), label, url: "/", order: 0 };
}

/** Ambil simpul pada `path` (daftar indeks dari akar). */
function nodeAtPath(nodes: MenuNode[], path: number[]): MenuNode | null {
  let current: MenuNode | undefined = nodes[path[0]];
  for (let d = 1; d < path.length && current; d++) {
    current = current.children?.[path[d]];
  }
  return current ?? null;
}

/** Daftar saudara (siblings) yang memuat simpul pada `path`. */
function siblingsAtPath(nodes: MenuNode[], path: number[]): MenuNode[] {
  if (path.length === 1) return nodes;
  return nodeAtPath(nodes, path.slice(0, -1))?.children ?? [];
}

/** Terapkan `fn` pada simpul `path`, kembalikan pohon baru (immutable). */
function mapAtPath(nodes: MenuNode[], path: number[], fn: (node: MenuNode) => MenuNode): MenuNode[] {
  const [head, ...rest] = path;
  return nodes.map((n, i) => {
    if (i !== head) return n;
    if (rest.length === 0) return fn(n);
    return { ...n, children: mapAtPath(n.children ?? [], rest, fn) };
  });
}

/** Hapus simpul pada `path`. */
function removeAtPath(nodes: MenuNode[], path: number[]): MenuNode[] {
  const parent = path.slice(0, -1);
  const idx = path[path.length - 1];
  if (parent.length === 0) return nodes.filter((_, i) => i !== idx);
  return mapAtPath(nodes, parent, (p) => ({ ...p, children: (p.children ?? []).filter((_, i) => i !== idx) }));
}

/** Pindahkan simpul `path` ke indeks `to` dalam daftar saudaranya. */
function moveWithinSiblings(nodes: MenuNode[], path: number[], to: number): MenuNode[] {
  const parent = path.slice(0, -1);
  const from = path[path.length - 1];
  if (from === to) return nodes;
  const reorder = (list: MenuNode[]) => {
    const next = [...list];
    const [moved] = next.splice(from, 1);
    if (!moved) return list;
    next.splice(to, 0, moved);
    return next;
  };
  if (parent.length === 0) return reorder(nodes);
  return mapAtPath(nodes, parent, (p) => ({ ...p, children: reorder(p.children ?? []) }));
}

function samePath(a: number[], b: number[]) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

/** Payload rekursif untuk API — kedalaman tidak dibatasi. */
function toPayload(nodes: MenuNode[]): unknown[] {
  return nodes.map((n, i) => ({
    label: n.label,
    url: n.url,
    order: i + 1,
    children: toPayload(n.children ?? []),
  }));
}

/** Editor satu lokasi menu (HEADER/FOOTER) — urutkan via drag & drop atau tombol naik/turun.
 *  Mendukung submenu bertingkat (rekursif). */
function MenuSection({
  location,
  title,
  description,
  allowChildren = true,
  className = "",
}: {
  location: MenuLocation;
  title: string;
  description: string;
  allowChildren?: boolean;
  className?: string;
}) {
  const [items, setItems] = useState<MenuNode[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState<number[] | null>(null);
  const [over, setOver] = useState<number[] | null>(null);

  const newLabel = allowChildren ? "Menu Baru" : "Tautan Baru";
  const addLabel = allowChildren ? "Tambah Menu" : "Tambah Tautan";

  const load = useCallback(async () => {
    try {
      const res = await api<{ items: MenuNode[] }>(`/menus?location=${location}`);
      setItems(res.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat menu");
    }
  }, [location]);

  useEffect(() => { load(); }, [load]);

  function updateNode(path: number[], patch: Partial<MenuNode>) {
    setItems((arr) => mapAtPath(arr, path, (n) => ({ ...n, ...patch })));
  }

  function removeNode(path: number[]) {
    setItems((arr) => removeAtPath(arr, path));
  }

  function addChild(path: number[]) {
    setItems((arr) => mapAtPath(arr, path, (n) => ({ ...n, children: [...(n.children ?? []), makeNode()] })));
  }

  /** Geser simpul `path` naik (-1) atau turun (+1) dalam daftar saudaranya. */
  function moveNode(path: number[], delta: number) {
    setItems((arr) => {
      const to = path[path.length - 1] + delta;
      if (to < 0 || to >= siblingsAtPath(arr, path).length) return arr;
      return moveWithinSiblings(arr, path, to);
    });
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await api(`/menus/${location}`, { method: "PUT", body: { items: toPayload(items) } });
      setSuccess("Menu tersimpan");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan menu");
    } finally {
      setSaving(false);
    }
  }

  function renderNode(node: MenuNode, path: number[], depth: number): React.ReactNode {
    const idx = path[path.length - 1];
    const sibs = siblingsAtPath(items, path);
    const isRoot = depth === 0;
    const isDragging = !!dragging && samePath(dragging, path);
    const isOver =
      !!over &&
      samePath(over, path) &&
      !!dragging &&
      samePath(dragging.slice(0, -1), path.slice(0, -1)) &&
      !samePath(dragging, path);
    const kids = node.children ?? [];

    const row = (
      <div className="flex flex-wrap items-center gap-2">
        <span
          draggable
          onDragStart={(e) => {
            setDragging(path);
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", node.label);
          }}
          onDragEnd={() => {
            setDragging(null);
            setOver(null);
          }}
          className="cursor-grab text-ink-soft/40 transition hover:text-brand-500 active:cursor-grabbing"
          title="Tarik untuk mengatur urutan"
          aria-label="Tarik untuk mengatur urutan"
        >
          <GripVertical className={isRoot ? "h-5 w-5" : "h-4 w-4"} aria-hidden />
        </span>
        <span className="flex flex-col">
          <button
            type="button"
            onClick={() => moveNode(path, -1)}
            disabled={idx === 0}
            className="rounded p-0.5 text-ink-soft/50 transition hover:bg-brand-50 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
            title="Naikkan"
            aria-label="Naikkan"
          >
            <ChevronUp className={isRoot ? "h-3.5 w-3.5" : "h-3 w-3"} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => moveNode(path, 1)}
            disabled={idx === sibs.length - 1}
            className="rounded p-0.5 text-ink-soft/50 transition hover:bg-brand-50 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
            title="Turunkan"
            aria-label="Turunkan"
          >
            <ChevronDown className={isRoot ? "h-3.5 w-3.5" : "h-3 w-3"} aria-hidden />
          </button>
        </span>
        <TextInput
          value={node.label}
          onChange={(e) => updateNode(path, { label: e.target.value })}
          className={isRoot ? "!w-44" : "!w-40 text-sm"}
          aria-label="Label menu"
        />
        <div className="relative min-w-[180px] flex-1">
          <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft/50" aria-hidden />
          <TextInput
            value={node.url}
            onChange={(e) => updateNode(path, { url: e.target.value })}
            className={`!pl-9${isRoot ? "" : " text-sm"}`}
            aria-label="URL menu"
          />
        </div>
        {allowChildren && (
          <button
            type="button"
            onClick={() => addChild(path)}
            className="rounded-lg p-2 text-brand-600 hover:bg-brand-50"
            title="Tambah submenu"
            aria-label="Tambah submenu"
          >
            <Plus className="h-4 w-4" aria-hidden />
          </button>
        )}
        <DangerButton onClick={() => removeNode(path)} className="!border-0 !p-2" aria-label="Hapus menu">
          <Trash2 className="h-4 w-4" aria-hidden />
        </DangerButton>
      </div>
    );

    return (
      <div
        key={node.id}
        onDragOver={(e) => {
          if (!dragging) return;
          if (!samePath(dragging.slice(0, -1), path.slice(0, -1))) return;
          e.preventDefault();
          setOver(path);
        }}
        onDrop={(e) => {
          if (dragging && samePath(dragging.slice(0, -1), path.slice(0, -1))) {
            e.preventDefault();
            const to = path[path.length - 1];
            setItems((arr) => moveWithinSiblings(arr, dragging, to));
          }
          setDragging(null);
          setOver(null);
        }}
        className={`rounded-2xl transition ${isOver ? "ring-2 ring-brand-400" : ""} ${isDragging ? "opacity-50" : ""}`}
      >
        {isRoot ? (
          <AdminCard className="space-y-2">
            {row}
            {allowChildren && kids.length > 0 && (
              <div className="ml-6 space-y-1 border-l-2 border-brand-100 pl-4">
                {kids.map((k, j) => renderNode(k, [...path, j], depth + 1))}
              </div>
            )}
          </AdminCard>
        ) : (
          <div className="space-y-1">
            {row}
            {allowChildren && kids.length > 0 && (
              <div className="ml-6 space-y-1 border-l-2 border-brand-100 pl-4">
                {kids.map((k, j) => renderNode(k, [...path, j], depth + 1))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <section className={className}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
          <p className="mt-1 text-sm text-ink-soft">{description}</p>
        </div>
        <div className="flex gap-2">
          <SecondaryButton
            type="button"
            onClick={() => setItems((arr) => [...arr, makeNode(newLabel)])}
          >
            <Plus className="h-4 w-4" aria-hidden /> {addLabel}
          </SecondaryButton>
          <PrimaryButton type="button" onClick={handleSave} loading={saving}>
            <Save className="h-4 w-4" aria-hidden /> Simpan
          </PrimaryButton>
        </div>
      </div>
      <ErrorAlert message={error} />
      <SuccessAlert message={success} />

      {items.length ? (
        <div className="space-y-3">{items.map((item, idx) => renderNode(item, [idx], 0))}</div>
      ) : (
        <AdminEmptyState title="Belum ada menu" hint="Tambahkan menu pertama atau periksa koneksi API." />
      )}
    </section>
  );
}

export default function MenusPage() {
  return (
    <>
      <PageHeader
        title="Menu Navigasi"
        description="Atur menu header dan tautan footer website. Submenu bisa bertingkat. Ubah urutan dengan menarik ikon gagang atau menekan tombol naik/turun."
      />

      <MenuSection
        location="HEADER"
        title="Menu Header"
        description="Menu utama di bagian atas website. Klik tombol + pada menu untuk menambah submenu (bisa bertingkat)."
      />

      <MenuSection
        location="FOOTER"
        title="Tautan Footer"
        description="Daftar tautan pada kolom 'Tautan' di footer website."
        allowChildren={false}
        className="mt-10"
      />

      {/* Referensi link cepat */}
      <AdminCard className="mt-10">
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
