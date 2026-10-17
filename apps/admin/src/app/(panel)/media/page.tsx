"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, Copy, Trash2, Check, Search } from "lucide-react";
import { api, can, getSession, API_URL } from "@/lib/auth";
import { PageHeader } from "@/components/shell";
import { AdminCard, AdminEmptyState, DangerButton, ErrorAlert, PrimaryButton, SuccessAlert } from "@/components/ui";

interface MediaRow {
  id: string;
  filename: string;
  url: string;
  title?: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export default function MediaPage() {
  const me = getSession()?.user ?? null;
  const fileRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<MediaRow[]>([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await api<{ items: MediaRow[] }>(`/media?limit=60${q ? `&q=${encodeURIComponent(q)}` : ""}`);
      setItems(res.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat media");
    }
  }, [q]);

  useEffect(() => { load(); }, [load]);

  async function handleUpload(files: FileList | null) {
    if (!files?.length) return;
    const session = getSession();
    if (!session) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch(`${API_URL}/api/media/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${session.accessToken}` },
          body: fd,
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message ?? `Gagal mengunggah ${file.name}`);
        }
      }
      setSuccess("Berhasil mengunggah");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengunggah");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleDelete(m: MediaRow) {
    if (!confirm(`Hapus ${m.filename}?`)) return;
    try {
      await api(`/media/${m.id}`, { method: "DELETE" });
      setSuccess("Media dihapus");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menghapus");
    }
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 1500);
  }

  if (!can(me, "canDelete") && me?.role !== "EDITOR" && me?.role !== "OSIS") {
    return <AdminEmptyState title="Akses terbatas" />;
  }

  return (
    <>
      <PageHeader
        title="Media"
        description="Pustaka gambar & dokumen. Salin URL untuk dipakai di konten."
        action={
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf"
              multiple
              className="sr-only"
              onChange={(e) => handleUpload(e.target.files)}
              aria-label="Unggah file"
            />
            <PrimaryButton type="button" loading={uploading} onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" aria-hidden /> Unggah
            </PrimaryButton>
          </>
        }
      />
      <ErrorAlert message={error} />
      <SuccessAlert message={success} />

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft/50" aria-hidden />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari media..."
          aria-label="Cari media"
          className="w-full rounded-xl border border-brand-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand-500"
        />
      </div>

      {items.length ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((m) => {
            const isImage = m.mimeType.startsWith("image/");
            return (
              <AdminCard key={m.id} className="group overflow-hidden p-0">
                <div className="relative aspect-square bg-cream">
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.url} alt={m.title ?? m.filename} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-3xl">📄</div>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="truncate text-xs font-medium text-ink" title={m.filename}>{m.filename}</p>
                  <p className="text-[10px] text-ink-soft">{(m.size / 1024).toFixed(0)} KB</p>
                  <div className="mt-2 flex gap-1">
                    <button
                      type="button"
                      onClick={() => copyUrl(m.url)}
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-brand-50 py-1.5 text-[11px] font-semibold text-brand-700 transition hover:bg-brand-100"
                      aria-label={`Salin URL ${m.filename}`}
                    >
                      {copied === m.url ? <Check className="h-3 w-3" aria-hidden /> : <Copy className="h-3 w-3" aria-hidden />}
                      {copied === m.url ? "Tersalin" : "URL"}
                    </button>
                    {can(me, "canDelete") && (
                      <DangerButton onClick={() => handleDelete(m)} className="!border-0 !p-1.5" aria-label={`Hapus ${m.filename}`}>
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      </DangerButton>
                    )}
                  </div>
                </div>
              </AdminCard>
            );
          })}
        </div>
      ) : (
        <AdminEmptyState title="Belum ada media" hint="Unggah gambar untuk digunakan di artikel dan halaman." />
      )}
    </>
  );
}
