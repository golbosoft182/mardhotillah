export const UNIT_LABELS: Record<string, string> = {
  YAYASAN: "Yayasan",
  PONPES: "Pondok Pesantren",
  SMP: "SMP Unggulan",
  SMK: "SMK Mardhotillah Plus",
};

export const UNIT_SHORT: Record<string, string> = {
  YAYASAN: "Yayasan",
  PONPES: "Ponpes",
  SMP: "SMP",
  SMK: "SMK",
};

export const POST_TYPE_LABELS: Record<string, string> = {
  BERITA: "Berita",
  ARTIKEL: "Artikel",
  OPINI: "Opini Guru",
  POJOK_SISWA: "Pojok Siswa",
};

export const POST_TYPE_PATHS: Record<string, string> = {
  BERITA: "/berita",
  ARTIKEL: "/artikel",
  OPINI: "/opini",
  POJOK_SISWA: "/pojok-siswa",
};

export function formatDate(iso?: string): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatEventDate(start: string, end?: string, allDay?: boolean): string {
  const d1 = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(start));
  if (end && new Date(end).toDateString() !== new Date(start).toDateString()) {
    const d2 = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(end));
    return `${d1} — ${d2}`;
  }
  if (allDay) return `${d1} · Sepanjang hari`;
  const t = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(new Date(start));
  return `${d1} · ${t}`;
}
