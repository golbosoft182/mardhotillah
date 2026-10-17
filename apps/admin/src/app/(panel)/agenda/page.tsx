"use client";

import { ResourceCrud } from "@/components/resource-crud";

export default function AgendaAdminPage() {
  return (
    <ResourceCrud
      title="Agenda"
      description="Kalender kegiatan dan acara."
      endpoint="/events"
      initialForm={{ unit: "YAYASAN", status: "PUBLISHED", allDay: false }}
      fields={[
        { key: "title", label: "Judul", required: true },
        { key: "startDate", label: "Mulai", type: "date", required: true },
        { key: "endDate", label: "Selesai", type: "date" },
        { key: "location", label: "Lokasi" },
        { key: "unit", label: "Unit", type: "select", options: [
          { value: "YAYASAN", label: "Yayasan" }, { value: "PONPES", label: "Ponpes" },
          { value: "SMP", label: "SMP" }, { value: "SMK", label: "SMK" },
        ]},
        { key: "description", label: "Deskripsi", type: "textarea", hideInTable: true },
        { key: "featuredImage", label: "Gambar (URL)", type: "image", hideInTable: true },
        { key: "status", label: "Status", type: "select", hideInTable: true, options: [
          { value: "DRAFT", label: "Draft" }, { value: "PUBLISHED", label: "Publik" },
        ]},
      ]}
    />
  );
}
