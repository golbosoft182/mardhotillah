import { apiServer, type DkvWork, type ListResponse } from "@/lib/api";
import { PageHero } from "@/components/ui/section";
import { KaryaDkvClient } from "./karya-dkv-client";

export const revalidate = 60;

export const metadata = {
  title: "Showcase Karya DKV",
  description:
    "Galeri karya desain komunikasi visual siswa SMK Mardhotillah Plus — poster, branding, ilustrasi, animasi, dan UI/UX.",
};

export default async function KaryaDkvPage() {
  const data = await apiServer<ListResponse<DkvWork>>("/dkv-works", { limit: 20, sort: "newest" });
  return (
    <>
      <PageHero
        title="Showcase Karya DKV"
        description="Galeri karya desain komunikasi visual siswa SMK Mardhotillah Plus."
        breadcrumbs={[{ label: "Beranda", href: "/" }, { label: "Karya DKV" }]}
      />
      <KaryaDkvClient initialItems={data?.items ?? []} initialTotalPages={data?.totalPages ?? 1} />
    </>
  );
}
