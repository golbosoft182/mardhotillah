"use client";

import { ResourceCrud } from "@/components/resource-crud";

export default function KaryaDkvAdminPage() {
  return (
    <ResourceCrud
      title="Showcase Karya DKV"
      description="Galeri karya desain komunikasi visual siswa SMK — tampil di beranda & halaman /karya-dkv."
      endpoint="/dkv-works"
      initialForm={{ unit: "SMK", status: "PUBLISHED" }}
      fields={[
        { key: "title", label: "Judul Karya", required: true },
        { key: "category", label: "Kategori (mis. Poster, Logo & Branding, Ilustrasi)", hint: "Dipisah per karya" },
        { key: "author", label: "Kreator / Siswa" },
        { key: "unit", label: "Unit", type: "select", options: [
          { value: "PONPES", label: "Ponpes" }, { value: "SMP", label: "SMP" }, { value: "SMK", label: "SMK" },
        ]},
        { key: "workDate", label: "Tanggal Karya", type: "date" },
        { key: "order", label: "Urutan", type: "number", hideInTable: true },
        { key: "description", label: "Keterangan / Deskripsi", type: "textarea", hideInTable: true },
        { key: "mediaType", label: "Jenis Media", type: "select", hideInTable: true, options: [
          { value: "IMAGE", label: "Gambar" }, { value: "PDF", label: "PDF" },
        ]},
        { key: "image", label: "Gambar / Cover (URL)", type: "image", hint: "Untuk PDF, isi sebagai thumbnail. Bila kosong, kartu menampilkan pratinjau halaman 1 PDF dari browser.", hideInTable: true },
        { key: "file", label: "Berkas PDF (URL)", hint: "Wajib bila Jenis Media = PDF. Unggah lewat menu Media lalu tempel URL-nya di sini.", hideInTable: true },
        { key: "status", label: "Status", type: "select", hideInTable: true, options: [
          { value: "DRAFT", label: "Draft" }, { value: "PUBLISHED", label: "Publik" },
        ]},
      ]}
    />
  );
}
