"use client";

import { useEffect, useState } from "react";
import { Download, Eye, Loader2 } from "lucide-react";
import { API_PUBLIC_URL } from "@/lib/api";

/**
 * Panel aksi Jurnal DKV:
 * - menambah penghitung "dilihat" sekali saat halaman detail dibuka,
 * - menyediakan tombol unduh yang menambah penghitung "diunduh" lalu membuka berkas.
 */
export function JournalActions({
  id,
  fileUrl,
  fileName,
  initialViewCount,
  initialDownloadCount,
}: {
  id: string;
  fileUrl?: string | null;
  fileName?: string | null;
  initialViewCount: number;
  initialDownloadCount: number;
}) {
  const [views, setViews] = useState(initialViewCount);
  const [downloads, setDownloads] = useState(initialDownloadCount);
  const [downloading, setDownloading] = useState(false);

  // +1 dilihat setiap kali halaman detail dibuka (sekali per pemuatan halaman).
  useEffect(() => {
    let cancelled = false;
    fetch(`${API_PUBLIC_URL}/api/dkv-journals/${id}/view`, { method: "PATCH" })
      .then((res) => {
        if (res.ok && !cancelled) setViews((v) => v + 1);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleDownload() {
    if (!fileUrl) return;
    setDownloading(true);
    try {
      const res = await fetch(`${API_PUBLIC_URL}/api/dkv-journals/${id}/download`, { method: "PATCH" });
      if (res.ok) setDownloads((d) => d + 1);
    } catch {
      /* abaikan — unduhan tetap dilanjutkan */
    } finally {
      setDownloading(false);
    }
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-brand-900/5">
      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="rounded-xl bg-brand-50 p-3">
          <Eye className="mx-auto h-4 w-4 text-brand-500" aria-hidden />
          <p className="mt-1 font-display text-lg font-bold text-ink">{views}</p>
          <p className="text-xs text-ink-soft">dilihat</p>
        </div>
        <div className="rounded-xl bg-brand-50 p-3">
          <Download className="mx-auto h-4 w-4 text-brand-500" aria-hidden />
          <p className="mt-1 font-display text-lg font-bold text-ink">{downloads}</p>
          <p className="text-xs text-ink-soft">unduhan</p>
        </div>
      </div>
      {fileUrl ? (
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3 font-display font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {downloading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Download className="h-4 w-4" aria-hidden />}
          Unduh Berkas
        </button>
      ) : (
        <p className="mt-4 text-center text-xs text-ink-soft">Berkas belum tersedia.</p>
      )}
      {fileName && <p className="mt-2 truncate text-center text-xs text-ink-soft">{fileName}</p>}
    </div>
  );
}
