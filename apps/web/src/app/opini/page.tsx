import { PublikasiListing } from "@/components/publikasi-listing";

export const revalidate = 60;
export const metadata = { title: "Opini Guru", description: "Opini dan catatan para guru Mardhotillah." };

export default function OpiniPage() {
  return (
    <PublikasiListing
      type="OPINI"
      title="Opini Guru"
      description="Perspektif dan refleksi para pendidik Mardhotillah."
      basePath="/opini"
    />
  );
}
