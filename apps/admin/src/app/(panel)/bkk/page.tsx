"use client";

import { ResourceCrud } from "@/components/resource-crud";
import { StatusBadge } from "@/components/ui";

function fmtDate(value: unknown): string {
  if (!value) return "—";
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function BkkAdminPage() {
  return (
    <ResourceCrud
      title="Bursa Kerja Khusus"
      description="Kelola informasi lowongan kerja dari mitra industri dan perusahaan."
      endpoint="/job-vacancies"
      listQuery={{ status: "ALL" }}
      initialForm={{ status: "PUBLISHED", employmentType: "Penuh Waktu" }}
      fields={[
        { key: "company", label: "Perusahaan", required: true },
        { key: "position", label: "Posisi", required: true },
        { key: "location", label: "Lokasi" },
        {
          key: "employmentType",
          label: "Jenis",
          type: "select",
          options: [
            { value: "Penuh Waktu", label: "Penuh Waktu" },
            { value: "Paruh Waktu", label: "Paruh Waktu" },
            { value: "Kontrak", label: "Kontrak" },
            { value: "Magang", label: "Magang" },
            { value: "Freelance", label: "Freelance" },
          ],
        },
        { key: "salary", label: "Gaji", hint: "Contoh: Rp3.000.000 – Rp4.500.000 / bulan" },
        { key: "contact", label: "Kontak" },
        { key: "applyUrl", label: "Link Lamaran", hideInTable: true },
        {
          key: "image",
          label: "Gambar",
          type: "image",
          hideInTable: true,
          hint: "Gambar/brosur lowongan. Hanya tampil di halaman detail lowongan.",
        },
        {
          key: "description",
          label: "Deskripsi",
          type: "textarea",
          hideInTable: true,
          hint: "Deskripsi pekerjaan, tanggung jawab, fasilitas, dsb.",
        },
        {
          key: "requirements",
          label: "Persyaratan",
          type: "textarea",
          hideInTable: true,
          hint: "Kualifikasi dan persyaratan pelamar.",
        },
        {
          key: "postedAt",
          label: "Tanggal Terbit",
          type: "date",
          hint: "Kosongkan untuk memakai tanggal hari ini saat status Publik.",
          render: (value) => fmtDate(value),
        },
        {
          key: "deadline",
          label: "Batas Lamaran",
          type: "date",
          hideInTable: true,
        },
        {
          key: "status",
          label: "Status",
          type: "select",
          hideInTable: true,
          options: [
            { value: "PUBLISHED", label: "Publik" },
            { value: "DRAFT", label: "Draft" },
          ],
        },
        {
          key: "_status",
          label: "Status",
          showIf: () => false,
          render: (value, row) => <StatusBadge status={String(row.status ?? "DRAFT")} />,
        },
      ]}
    />
  );
}
