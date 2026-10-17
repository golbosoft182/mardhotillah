"use client";

import { ResourceCrud } from "@/components/resource-crud";

export default function PrestasiAdminPage() {
  return (
    <ResourceCrud
      title="Prestasi"
      description="Wall of Fame — capaian siswa, guru, dan lembaga."
      endpoint="/achievements"
      initialForm={{ unit: "YAYASAN", type: "SISWA", status: "PUBLISHED" }}
      fields={[
        { key: "studentName", label: "Nama", required: true },
        { key: "competition", label: "Kompetisi", required: true },
        { key: "rank", label: "Peringkat" },
        { key: "year", label: "Tahun", type: "number" },
        { key: "unit", label: "Unit", type: "select", options: [
          { value: "YAYASAN", label: "Yayasan" }, { value: "PONPES", label: "Ponpes" },
          { value: "SMP", label: "SMP" }, { value: "SMK", label: "SMK" },
        ]},
        { key: "type", label: "Jenis", type: "select", options: [
          { value: "SISWA", label: "Siswa" }, { value: "GURU", label: "Guru" }, { value: "LEMBAGA", label: "Lembaga" },
        ]},
        { key: "className", label: "Kelas" },
        { key: "category", label: "Kategori" },
        { key: "organizer", label: "Penyelenggara", hideInTable: true },
        { key: "description", label: "Deskripsi", type: "textarea", hideInTable: true },
        { key: "photo", label: "Foto (URL)", type: "image", hideInTable: true },
        { key: "status", label: "Status", type: "select", hideInTable: true, options: [
          { value: "DRAFT", label: "Draft" }, { value: "PUBLISHED", label: "Publik" },
        ]},
      ]}
    />
  );
}
