"use client";

import { ResourceCrud } from "@/components/resource-crud";

export default function AktivitasAdminPage() {
  return (
    <ResourceCrud
      title="Aktivitas Siswa & Santri"
      description="Kegiatan siswa & santri per satuan pendidikan — tampil di halaman /aktivitas."
      endpoint="/activities"
      initialForm={{ unit: "YAYASAN", status: "PUBLISHED", order: 0 }}
      fields={[
        { key: "title", label: "Judul Aktivitas", required: true },
        { key: "category", label: "Kategori (mis. Tahfidz, Ekstrakurikuler)" },
        { key: "unit", label: "Unit", type: "select", options: [
          { value: "YAYASAN", label: "Yayasan" }, { value: "PONPES", label: "Ponpes" },
          { value: "SMP", label: "SMP" }, { value: "SMK", label: "SMK" },
        ]},
        { key: "order", label: "Urutan", type: "number" },
        { key: "description", label: "Deskripsi", type: "textarea", hideInTable: true },
        { key: "image", label: "Foto (URL)", type: "image", hideInTable: true },
        { key: "status", label: "Status", type: "select", hideInTable: true, options: [
          { value: "DRAFT", label: "Draft" }, { value: "PUBLISHED", label: "Publik" },
        ]},
      ]}
    />
  );
}
