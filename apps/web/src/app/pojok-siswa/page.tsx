import { PublikasiListing } from "@/components/publikasi-listing";

export const revalidate = 60;
export const metadata = { title: "Pojok Siswa", description: "Tulisan dan karya siswa Mardhotillah." };

export default function PojokSiswaPage() {
  return (
    <PublikasiListing
      type="POJOK_SISWA"
      title="Pojok Siswa"
      description="Karya tulis dan ekspresi siswa-siswi Mardhotillah."
      basePath="/pojok-siswa"
    />
  );
}
