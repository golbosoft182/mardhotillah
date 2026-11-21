import { notFound } from "next/navigation";
import { CtaBand, PageHero, Section } from "@/components/ui/section";
import { apiServer, type Page } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize-html";

export const revalidate = 60;

async function getPage() {
  const page = await apiServer<Page>(`/pages/slug/kurikulum`);
  if (!page || page.status !== "PUBLISHED") return null;
  return page;
}

export async function generateMetadata() {
  const page = await getPage();
  return {
    title: page?.seoTitle ?? page?.title ?? "Kurikulum",
    description: page?.seoDescription ?? undefined,
  };
}

export default async function KurikulumIndexPage() {
  const page = await getPage();
  if (!page) notFound();

  return (
    <>
      <PageHero
        title={page.title}
        description={page.seoDescription}
        breadcrumbs={[{ label: "Beranda", href: "/" }, { label: page.title }]}
      />
      <Section>
        <article className="cms-content mx-auto">
          {page.content ? (
            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content) }} />
          ) : (
            <div className="rounded-2xl border border-dashed border-brand-200 bg-white/60 px-6 py-14 text-center">
              <p className="font-display font-semibold text-ink">- COMING SOON -</p>
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
