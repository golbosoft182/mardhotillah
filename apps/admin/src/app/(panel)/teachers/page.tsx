"use client";

import { ResourceCrud } from "@/components/resource-crud";

export default function TeachersPage() {
  return (
    <>
      <ResourceCrud
        title="Guru & Pimpinan"
        description="Data guru dan pimpinan satuan pendidikan. Ubah urutan dengan menarik ikon gagang atau menekan tombol naik/turun, lalu klik Simpan Urutan."
        endpoint="/teachers"
        createRoles={["SUPER_ADMIN", "ADMIN"]}
        orderKey="order"
        initialForm={{ unit: "YAYASAN", isActive: true, order: 1 }}
        fields={[
          { key: "name", label: "Nama", required: true },
          { key: "position", label: "Jabatan" },
          { key: "unit", label: "Unit", type: "select", options: [
            { value: "YAYASAN", label: "Yayasan" }, { value: "PONPES", label: "Ponpes" },
            { value: "SMP", label: "SMP" }, { value: "SMK", label: "SMK" },
          ]},
          { key: "isPimpinan", label: "Pimpinan", type: "checkbox", hint: "Tandai bila termasuk pimpinan",
            render: (v) =>
              v ? (
                <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-700">Pimpinan</span>
              ) : (
                <span className="text-ink-soft/50">—</span>
              ) },
          { key: "subject", label: "Mata Pelajaran", hideInTable: true },
          { key: "education", label: "Pendidikan Terakhir", hideInTable: true },
          { key: "email", label: "Email", hideInTable: true },
          { key: "phone", label: "Telepon", hideInTable: true },
          { key: "bio", label: "Bio", type: "textarea", hideInTable: true },
          { key: "photo", label: "Foto (URL)", type: "image", hideInTable: true },
          { key: "order", label: "Urutan", type: "number", hideInTable: true },
        ]}
      />
      <div className="mt-8">
        <ResourceCrud
          title="Tenaga Kependidikan"
          description="Data staff dan tenaga kependidikan."
          endpoint="/staff"
          createRoles={["SUPER_ADMIN", "ADMIN"]}
          orderKey="order"
          initialForm={{ unit: "YAYASAN", isActive: true, order: 1 }}
          fields={[
            { key: "name", label: "Nama", required: true },
            { key: "position", label: "Jabatan" },
            { key: "unit", label: "Unit", type: "select", options: [
              { value: "YAYASAN", label: "Yayasan" }, { value: "PONPES", label: "Ponpes" },
              { value: "SMP", label: "SMP" }, { value: "SMK", label: "SMK" },
            ]},
            { key: "email", label: "Email", hideInTable: true },
            { key: "photo", label: "Foto (URL)", type: "image", hideInTable: true },
          ]}
        />
      </div>
    </>
  );
}
