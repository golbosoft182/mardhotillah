import { PublikasiListing } from "@/components/publikasi-listing";

export const revalidate = 60;
export const metadata = { title: "Artikel", description: "Artikel pendidikan dan keislaman." };

export default function ArtikelPage() {
  return (
    <PublikasiListing
      type="ARTIKEL"
      title="Artikel"
      description="Artikel pendidikan, keislaman, dan catatan perjalanan pendidikan kami."
      basePath="/artikel"
    />
  );
}
