import { PublikasiListing } from "@/components/publikasi-listing";

export const revalidate = 60;
export const metadata = {
  title: "Kegiatan Siswa SMK Mardhotillah Plus",
  description: "Event dan kegiatan siswa & santri di seluruh satuan pendidikan Mardhotillah.",
};

export default function KegiatanPage() {
  return (
    <PublikasiListing
      type="EVENT_KEGIATAN"
      title="Kegiatan Siswa SMK Mardhotillah Plus"
      description="Event dan kegiatan siswa & santri di seluruh satuan pendidikan Mardhotillah."
      basePath="/kegiatan"
    />
  );
}
