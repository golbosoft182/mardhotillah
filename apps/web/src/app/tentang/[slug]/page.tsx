import { notFound } from "next/navigation";
import { CtaBand, PageHero, Section } from "@/components/ui/section";
import { apiServer, type Page } from "@/lib/api";

export const revalidate = 60;

const PAGES: Record<string, { title: string; description: string }> = {
  profil: { title: "Profil Yayasan", description: "Mengenal lebih dekat Yayasan Mardhotillah." },
  sejarah: { title: "Sejarah", description: "Perjalanan berdirinya Yayasan Mardhotillah." },
  "visi-misi": { title: "Visi & Misi", description: "Arah dan tujuan pendidikan kami." },
  struktur: { title: "Struktur Organisasi", description: "Susunan organisasi Yayasan Mardhotillah." },
  pimpinan: { title: "Pimpinan", description: "Para pimpinan satuan pendidikan." },
  legalitas: { title: "Legalitas", description: "Dokumen legalitas yayasan." },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = PAGES[slug];
  const cms = await apiServer<Page>(`/pages/slug/${slug}`);
  const title = cms?.seoTitle ?? cms?.title ?? page?.title ?? "Tentang Kami";
  return {
    title,
    description: cms?.seoDescription ?? page?.description,
  };
}

export default async function TentangPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = PAGES[slug];
  if (!meta) notFound();

  const page = await apiServer<Page>(`/pages/slug/${slug}`);
  const content = page?.status === "PUBLISHED" ? page.content : null;

  return (
    <>
      <PageHero
        title={page?.title ?? meta.title}
        description={meta.description}
        breadcrumbs={[{ label: "Beranda", href: "/" }, { label: "Tentang Kami", href: "/tentang/profil" }, { label: meta.title }]}
      />
      <Section>
        <article className="cms-content mx-auto max-w-3xl">
          {content ? (
            <div dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            <div className="rounded-2xl border border-dashed border-brand-200 bg-white/60 px-6 py-14 text-center">
              <p className="font-display font-semibold text-ink">[Konten Yayasan]</p>
              <p className="mt-1 text-sm text-ink-soft">
                Konten halaman ini dapat diatur melalui CMS Admin pada menu Halaman.
              </p>
            </div>
          )}
        </article>
      </Section>
      <Section className="bg-cream">
        <CtaBand />
      </Section>
    </>
  );
}
