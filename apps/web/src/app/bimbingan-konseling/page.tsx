import { CtaBand, PageHero, Section } from "@/components/ui/section";
import { apiServer, type Page } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize-html";

export const revalidate = 60;

const FALLBACK_TITLE = "Bimbingan Konseling & Tata Tertib";
const FALLBACK_DESCRIPTION =
  "Layanan Bimbingan dan Konseling SMK Mardhotillah Plus — mendampingi peserta didik agar berkembang optimal, aman, dan mandiri.";

export async function generateMetadata() {
  const page = await apiServer<Page>("/pages/slug/bimbingan-konseling");
  return {
    title: page?.seoTitle ?? page?.title ?? FALLBACK_TITLE,
    description: page?.seoDescription ?? FALLBACK_DESCRIPTION,
  };
}

export default async function BimbinganKonselingPage() {
  const page = await apiServer<Page>("/pages/slug/bimbingan-konseling");
  const content = page?.status === "PUBLISHED" ? page.content : null;

  return (
    <>
      <PageHero
        title={page?.title ?? FALLBACK_TITLE}
        description={page?.seoDescription ?? FALLBACK_DESCRIPTION}
        breadcrumbs={[{ label: "Beranda", href: "/" }, { label: "Bimbingan Konseling & Tata Tertib" }]}
      />

      <Section className="bg-white">
        <article className="cms-content cms-rich mx-auto">
          {content ? (
            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
          ) : (
            <div className="rounded-2xl border border-dashed border-brand-200 bg-white/60 px-6 py-14 text-center">
              <p className="font-display font-semibold text-ink">[Konten Bimbingan Konseling &amp; Tata Tertib]</p>
              <p className="mt-1 text-sm text-ink-soft">
                Konten halaman ini dapat diatur melalui CMS Admin pada menu Halaman (slug: bimbingan-konseling).
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
