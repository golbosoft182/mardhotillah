"use client";

import { ResourceCrud } from "@/components/resource-crud";

export default function JurnalDkvAdminPage() {
  return (
    <ResourceCrud
      title="Jurnal DKV"
      description="Arsip jurnal & dokumentasi DKV — tampil di halaman publik /jurnal-dkv sebagai daftar thumbnail dengan pratinjau PDF. Penghitung dilihat & diunduh bertambah otomatis."
      endpoint="/dkv-journals"
      initialForm={{ status: "PUBLISHED" }}
      fields={[
        { key: "title", label: "Judul", required: true },
        { key: "journalDate", label: "Tanggal Jurnal", type: "date" },
        { key: "publishedAt", label: "Tanggal Publish", type: "date", hint: "Bila dikosongkan, terisi otomatis saat status Publik." },
        { key: "author", label: "Dibuat Oleh" },
        { key: "status", label: "Status", type: "select", options: [
          { value: "DRAFT", label: "Draft" },
          { value: "PUBLISHED", label: "Publik" },
        ]},
        { key: "viewCount", label: "Dilihat", readOnly: true },
        { key: "downloadCount", label: "Diunduh", readOnly: true },
        { key: "summary", label: "Penjelasan Singkat", type: "textarea", hideInTable: true },
        { key: "content", label: "Isi Jurnal", type: "html", hideInTable: true, hint: "Isi lengkap jurnal (editor teks)." },
        { key: "fileUrl", label: "Berkas (PDF/DOC/DOCX)", type: "file", nameKey: "fileName", hideInTable: true, hint: "Unggah berkas PDF, DOC, atau DOCX." },
        { key: "fileName", label: "Nama Berkas", hideInTable: true, hint: "Terisi otomatis saat mengunggah; dapat diubah." },
        { key: "thumbnail", label: "Thumbnail (opsional)", type: "image", hideInTable: true, hint: "Bila kosong, kartu menampilkan pratinjau halaman 1 PDF." },
      ]}
    />
  );
}
