"use client";

import { ResourceCrud } from "@/components/resource-crud";

export default function CategoriesPage() {
  return (
    <ResourceCrud
      title="Kategori"
      description="Kategori berita & artikel."
      endpoint="/categories"
      initialForm={{ type: "BERITA" }}
      fields={[
        { key: "name", label: "Nama", required: true },
        { key: "unit", label: "Unit", type: "select", options: [
          { value: "", label: "Global" },
          { value: "YAYASAN", label: "Yayasan" }, { value: "PONPES", label: "Ponpes" },
          { value: "SMP", label: "SMP" }, { value: "SMK", label: "SMK" },
        ]},
        { key: "type", label: "Jenis", type: "select", options: [
          { value: "BERITA", label: "Berita" }, { value: "ARTIKEL", label: "Artikel" },
          { value: "OPINI", label: "Opini" }, { value: "POJOK_SISWA", label: "Pojok Siswa" },
        ]},
      ]}
    />
  );
}
