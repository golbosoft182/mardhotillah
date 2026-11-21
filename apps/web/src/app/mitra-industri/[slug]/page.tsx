import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2 } from "lucide-react";
import { PageHero, Section } from "@/components/ui/section";
import { apiServer, resolveImageUrl, type IndustryPartner } from "@/lib/api";

export const revalidate = 60;

async function getPartner(slug: string): Promise<IndustryPartner | null> {
  return apiServer<IndustryPartner>(`/industry-partners/slug/${slug}`);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const partner = await getPartner(slug);
  return {
    title: partner?.name ?? "Mitra Industri",
    description: partner?.description ?? undefined,
  };
}

export default async function MitraIndustriDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const partner = await getPartner(slug);
  if (!partner) notFound();

  const logo = resolveImageUrl(partner.logo);

  return (
    <>
      <PageHero
        title={partner.name}
        description="Mitra Dunia Usaha dan Industri Yayasan Mardhotillah"
        breadcrumbs={[
          { label: "Beranda", href: "/" },
          { label: "Mitra Industri", href: "/mitra-industri" },
          { label: partner.name },
        ]}
      />
      <Section className="bg-cream">
        <div className="mx-auto max-w-3xl">
          <article className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-brand-900/5">
            <div className="flex items-center justify-center bg-brand-50/60 p-8">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl bg-white ring-1 ring-brand-900/5">
                {logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logo} alt={`Logo ${partner.name}`} className="h-full w-full object-contain p-3" />
                ) : (
                  <Building2 className="h-12 w-12 text-brand-300" aria-hidden />
                )}
              </div>
            </div>
            <div className="p-6 sm:p-8">
              <h1 className="font-display text-xl font-bold text-ink">{partner.name}</h1>
              {partner.description && (
                <p className="mt-3 whitespace-pre-line leading-relaxed text-ink-soft">{partner.description}</p>
              )}
            </div>
          </article>

          <div className="mt-6 text-center">
            <Link href="/mitra-industri" className="text-sm font-semibold text-brand-600 underline-offset-4 hover:underline">
              ← Kembali ke daftar mitra industri
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
