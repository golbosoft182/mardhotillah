"use client";

import { ResourceCrud } from "@/components/resource-crud";
import { StatusBadge } from "@/components/ui";

export default function MitraIndustriAdminPage() {
  return (
    <ResourceCrud
      title="Mitra Industri"
      description="Kelola kemitraan dunia usaha dan industri (mitra industri)."
      endpoint="/industry-partners"
      listQuery={{ status: "ALL" }}
      initialForm={{ status: "PUBLISHED", order: 1 }}
      fields={[
        { key: "name", label: "Nama Perusahaan", required: true },
        {
          key: "logo",
          label: "Logo",
          type: "image",
          hint: "Logo perusahaan (tampil di listing dan detail).",
        },
        {
          key: "description",
          label: "Deskripsi Singkat",
          type: "textarea",
          hideInTable: true,
          hint: "Ringkasan singkat tentang perusahaan mitra.",
        },
        { key: "order", label: "Urutan", type: "number", hideInTable: true },
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
