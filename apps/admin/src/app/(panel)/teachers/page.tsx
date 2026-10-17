"use client";

import { ResourceCrud } from "@/components/resource-crud";

export default function TeachersPage() {
  return (
    <>
      <ResourceCrud
        title="Guru & Pimpinan"
        description="Data guru dan pimpinan satuan pendidikan."
        endpoint="/teachers"
        createRoles={["SUPER_ADMIN", "ADMIN"]}
        initialForm={{ unit: "YAYASAN", isActive: true, order: 1 }}
        fields={[
          { key: "name", label: "Nama", required: true },
          { key: "position", label: "Jabatan" },
          { key: "unit", label: "Unit", type: "select", options: [
            { value: "YAYASAN", label: "Yayasan" }, { value: "PONPES", label: "Ponpes" },
            { value: "SMP", label: "SMP" }, { value: "SMK", label: "SMK" },
          ]},
          { key: "subject", label: "Mata Pelajaran", hideInTable: true },
          { key: "education", label: "Pendidikan Terakhir", hideInTable: true },
          { key: "email", label: "Email", hideInTable: true },
          { key: "phone", label: "Telepon", hideInTable: true },
          { key: "bio", label: "Bio", type: "textarea", hideInTable: true },
          { key: "photo", label: "Foto (URL)", type: "image", hideInTable: true },
          { key: "order", label: "Urutan", type: "number", hideInTable: true },
          { key: "isPimpinan", label: "Pimpinan", type: "checkbox", hideInTable: true, hint: "Tandai bila termasuk pimpinan" },
        ]}
      />
      <div className="mt-8">
        <ResourceCrud
          title="Tenaga Kependidikan"
          description="Data staff dan tenaga kependidikan."
          endpoint="/staff"
          createRoles={["SUPER_ADMIN", "ADMIN"]}
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
