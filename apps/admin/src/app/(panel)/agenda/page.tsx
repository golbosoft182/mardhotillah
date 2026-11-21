"use client";

import { ResourceCrud } from "@/components/resource-crud";

const DATE_LOCALE = "id-ID";

function fmtDate(value: unknown): string {
  if (!value) return "";
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(DATE_LOCALE, { day: "numeric", month: "short", year: "numeric" });
}

function timeSummary(row: Record<string, unknown>): string {
  if (row.timeType === "TEXT") {
    const text = row.timeText ? String(row.timeText).trim() : "";
    if (!text) return "—";
    const ref = row.startDate ? ` (acuan: ${fmtDate(row.startDate)})` : "";
    return `${text}${ref}`;
  }
  const start = fmtDate(row.startDate);
  const end = fmtDate(row.endDate);
  if (start && end && start !== end) return `${start} – ${end}`;
  return start || "—";
}

export default function AgendaAdminPage() {
  return (
    <ResourceCrud
      title="Agenda"
      description="Kalender kegiatan dan acara."
      endpoint="/events"
      initialForm={{ unit: "YAYASAN", status: "PUBLISHED", allDay: false, tercapai: false, timeType: "DATE" }}
      fields={[
        { key: "title", label: "Program/Kegiatan", required: true },
        { key: "description", label: "Uraian Kegiatan", type: "textarea", hideInTable: true },
        {
          key: "timeType",
          label: "Jenis Waktu",
          type: "select",
          options: [
            { value: "DATE", label: "Tanggal (Mulai–Selesai)" },
            { value: "TEXT", label: "Teks Kustom (berulang/kondisional)" },
          ],
        },
        {
          key: "startDate",
          label: "Mulai",
          type: "date",
          hideInTable: true,
          showIf: (f) => f.timeType !== "TEXT",
          formLabel: (f) => (f.timeType === "TEXT" ? "Tanggal Acuan (opsional)" : "Mulai"),
          formRequired: (f) => f.timeType !== "TEXT",
        },
        {
          key: "endDate",
          label: "Selesai",
          type: "date",
          hideInTable: true,
          showIf: (f) => f.timeType !== "TEXT",
        },
        {
          key: "timeText",
          label: "Waktu",
          hideInTable: true,
          hint: "Contoh: Tiap semester, Semester ganjil, Setiap hari, Sepanjang tahun, Setiap Senin, Harian, Mingguan, Bulanan, 1 hari saja",
          showIf: (f) => f.timeType === "TEXT",
          formRequired: (f) => f.timeType === "TEXT",
        },
        {
          key: "_time",
          label: "Waktu",
          showIf: () => false,
          render: (_value, row) => timeSummary(row),
        },
        { key: "indikator", label: "Indikator Keberhasilan", type: "textarea", hideInTable: true },
        { key: "buktiFisik", label: "Bukti Fisik", type: "textarea", hideInTable: true },
        { key: "tercapai", label: "Tercapai", type: "checkbox", hint: "Centang bila tercapai; biarkan kosong bila belum tercapai" },
        { key: "keterangan", label: "Keterangan / Tindak Lanjut", type: "textarea", hideInTable: true },
        { key: "location", label: "Lokasi", hideInTable: true },
        { key: "unit", label: "Unit", type: "select", options: [
          { value: "YAYASAN", label: "Yayasan" }, { value: "PONPES", label: "Ponpes" },
          { value: "SMP", label: "SMP" }, { value: "SMK", label: "SMK" },
        ]},
        { key: "featuredImage", label: "Gambar (URL)", type: "image", hideInTable: true },
        { key: "status", label: "Status", type: "select", hideInTable: true, options: [
          { value: "DRAFT", label: "Draft" }, { value: "PUBLISHED", label: "Publik" },
        ]},
      ]}
    />
  );
}
