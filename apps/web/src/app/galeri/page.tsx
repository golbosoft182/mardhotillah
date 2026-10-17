import { apiServer, type Gallery, type ListResponse } from "@/lib/api";
import { GaleriClient } from "./galeri-client";

export const revalidate = 60;

export async function generateMetadata() {
  return {
    title: "Galeri",
    description: "Galeri foto dan video kegiatan Yayasan Mardhotillah.",
  };
}

const UNITS = [
  { key: "", label: "Semua Unit" },
  { key: "YAYASAN", label: "Yayasan" },
  { key: "PONPES", label: "Ponpes" },
  { key: "SMP", label: "SMP" },
  { key: "SMK", label: "SMK" },
];

export default async function GaleriPage({
  searchParams,
}: {
  searchParams: Promise<{ unit?: string }>;
}) {
  const params = await searchParams;
  const unit = params.unit ?? "";
  const data = await apiServer<ListResponse<Gallery>>("/galleries", {
    limit: 12,
    unit: unit || undefined,
  });
  return <GaleriClient galleries={data?.items ?? null} unit={unit} units={UNITS} />;
}
