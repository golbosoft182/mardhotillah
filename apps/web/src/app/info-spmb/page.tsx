import { PageHero, Section } from "@/components/ui/section";
import { apiServer, type Page, type PpdbData, type Settings } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { SpmbInfoSections } from "@/components/spmb-info-sections";

export const revalidate = 60;

export async function generateMetadata() {
  const page = await apiServer<Page>("/pages/slug/info-spmb");
  return {
    title: page?.seoTitle ?? page?.title ?? "Info SPMB",
    description:
      page?.seoDescription ??
      "Informasi lengkap SPMB Yayasan Mardhotillah: persyaratan, jadwal, alur pendaftaran, biaya, dan kontak panitia.",
  };
}

export default async function InfoSpmbPage() {
  const [page, ppdb, settings] = await Promise.all([
    apiServer<Page>("/pages/slug/info-spmb"),
    apiServer<PpdbData>("/ppdb/active"),
    apiServer<Settings>("/settings"),
  ]);

  const content = page?.status === "PUBLISHED" ? page.content : null;

  return (
    <>
      <PageHero
        title={page?.title ?? "Info SPMB"}
        description={page?.seoDescription ?? "Informasi seputar Seleksi Penerimaan Murid Baru (SPMB) Yayasan Mardhotillah."}
        breadcrumbs={[{ label: "Beranda", href: "/" }, { label: "Info SPMB" }]}
      />

      <Section className="bg-white">
        <article className="cms-content mx-auto">
          {content ? (
            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
          ) : (
            <div className="rounded-2xl border border-dashed border-brand-200 bg-white/60 px-6 py-14 text-center">
              <p className="font-display font-semibold text-ink">[Konten Info SPMB]</p>
              <p className="mt-1 text-sm text-ink-soft">
                Konten halaman ini dapat diatur melalui CMS Admin pada menu Halaman (slug: info-spmb).
              </p>
            </div>
          )}
        </article>
      </Section>

      {ppdb ? <SpmbInfoSections ppdb={ppdb} settings={settings} /> : null}
    </>
  );
}
