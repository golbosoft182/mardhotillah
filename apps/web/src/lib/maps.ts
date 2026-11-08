/**
 * Google Maps embed dari CMS disimpan di Pengaturan → Kontak (maps_embed).
 * Nilainya boleh berupa URL embed saja atau kode HTML <iframe> utuh yang
 * ditempel dari Google Maps → "Bagikan → Sematkan peta".
 * Fungsi ini mengambil URL src-nya agar peta tetap dirender sebagai iframe
 * dengan styling situs (responsif, tanpa border).
 */
export function mapEmbedSrc(value?: string | null): string | null {
  if (!value) return null;
  const raw = value.trim();
  if (!raw) return null;

  const srcMatch = raw.match(/src\s*=\s*["']([^"']+)["']/i);
  const candidate = (srcMatch ? srcMatch[1] : raw).trim();

  if (!/^https?:\/\//i.test(candidate)) return null;
  if (/[<>]/.test(candidate)) return null;
  return candidate;
}
