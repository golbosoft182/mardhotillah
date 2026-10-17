"use client";

import { ResourceCrud } from "@/components/resource-crud";

export default function FacilitiesPage() {
  return (
    <ResourceCrud
      title="Fasilitas"
      description="Sarana prasarana penunjang pendidikan."
      endpoint="/facilities"
      createRoles={["SUPER_ADMIN", "ADMIN"]}
      initialForm={{ unit: "YAYASAN", status: "PUBLISHED", order: 1 }}
      fields={[
        { key: "name", label: "Nama", required: true },
        { key: "unit", label: "Unit", type: "select", options: [
          { value: "YAYASAN", label: "Yayasan" }, { value: "PONPES", label: "Ponpes" },
          { value: "SMP", label: "SMP" }, { value: "SMK", label: "SMK" },
        ]},
        { key: "description", label: "Deskripsi", type: "textarea", hideInTable: true },
        { key: "image", label: "Foto (URL)", type: "image", hideInTable: true },
        { key: "order", label: "Urutan", type: "number", hideInTable: true },
      ]}
    />
  );
}
