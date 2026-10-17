"use client";

import { ResourceCrud } from "@/components/resource-crud";
import { Field } from "@/components/ui";

export default function ProgramsPage() {
  return (
    <>
      <ResourceCrud
        title="Program"
        description="Program unggulan pendidikan (tampil di beranda & halaman unit)."
        endpoint="/programs"
        initialForm={{ unit: "", status: "PUBLISHED", featured: true, order: 1 }}
        fields={[
          { key: "name", label: "Nama", required: true },
          { key: "unit", label: "Unit", type: "select", options: [
            { value: "", label: "Global (semua unit)" },
            { value: "YAYASAN", label: "Yayasan" }, { value: "PONPES", label: "Ponpes" },
            { value: "SMP", label: "SMP" }, { value: "SMK", label: "SMK" },
          ]},
          { key: "order", label: "Urutan", type: "number" },
          { key: "description", label: "Deskripsi", type: "textarea", hideInTable: true },
          { key: "icon", label: "Ikon (URL)", type: "image", hideInTable: true },
          { key: "status", label: "Status", type: "select", hideInTable: true, options: [
            { value: "DRAFT", label: "Draft" }, { value: "PUBLISHED", label: "Publik" },
          ]},
        ]}
      />
    </>
  );
}
