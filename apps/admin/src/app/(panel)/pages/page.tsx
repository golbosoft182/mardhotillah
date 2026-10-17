"use client";

import { ResourceCrud } from "@/components/resource-crud";
import { StatusBadge } from "@/components/ui";

const UNIT_OPTIONS = [
  { value: "", label: "Global (semua unit)" },
  { value: "YAYASAN", label: "Yayasan" },
  { value: "PONPES", label: "Ponpes" },
  { value: "SMP", label: "SMP" },
  { value: "SMK", label: "SMK" },
];

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Publik" },
];

export default function PagesPage() {
  return (
    <ResourceCrud
      title="Halaman"
      description="Halaman statis seperti Profil, Sejarah, Visi & Misi."
      endpoint="/pages"
      initialForm={{ status: "DRAFT" }}
      fields={[
        { key: "title", label: "Judul", required: true },
        { key: "slug", label: "Slug", hint: "Kosongkan untuk otomatis" },
        { key: "unit", label: "Unit", type: "select", options: UNIT_OPTIONS },
        { key: "status", label: "Status", type: "select", options: STATUS_OPTIONS, render: (v) => <StatusBadge status={String(v ?? "DRAFT")} /> },
        { key: "content", label: "Konten (HTML)", type: "textarea", hideInTable: true },
        { key: "seoTitle", label: "SEO Title", hideInTable: true, hint: "Opsional — untuk judul di Google" },
        { key: "seoDescription", label: "Meta Description", type: "textarea", hideInTable: true, hint: "Maks 160 karakter" },
        { key: "heroImage", label: "Gambar Hero (URL)", type: "image", hideInTable: true },
      ]}
    />
  );
}
