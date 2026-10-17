"use client";

import { ResourceCrud } from "@/components/resource-crud";

export default function GaleriAdminPage() {
  return (
    <ResourceCrud
      title="Galeri"
      description="Album foto kegiatan."
      endpoint="/galleries"
      initialForm={{ unit: "YAYASAN", status: "PUBLISHED", kind: "FOTO" }}
      fields={[
        { key: "title", label: "Judul Album", required: true },
        { key: "unit", label: "Unit", type: "select", options: [
          { value: "YAYASAN", label: "Yayasan" }, { value: "PONPES", label: "Ponpes" },
          { value: "SMP", label: "SMP" }, { value: "SMK", label: "SMK" },
        ]},
        { key: "description", label: "Deskripsi", type: "textarea", hideInTable: true },
        { key: "coverImage", label: "Cover (URL)", type: "image", hideInTable: true },
        { key: "status", label: "Status", type: "select", hideInTable: true, options: [
          { value: "DRAFT", label: "Draft" }, { value: "PUBLISHED", label: "Publik" },
        ]},
      ]}
    />
  );
}
