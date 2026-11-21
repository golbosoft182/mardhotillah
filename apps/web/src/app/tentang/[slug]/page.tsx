import { notFound } from "next/navigation";
import { CtaBand, PageHero, Section } from "@/components/ui/section";
import { apiServer, resolveImageUrl, type ListResponse, type Page, type Teacher } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize-html";

export const revalidate = 60;

const PAGES: Record<string, { title: string; description: string }> = {
  profil: { title: "Profil Yayasan", description: "Mengenal lebih dekat Yayasan Mardhotillah." },
  sejarah: { title: "Sejarah", description: "Perjalanan berdirinya Yayasan Mardhotillah." },
  "visi-misi": { title: "Visi & Misi", description: "Arah dan tujuan pendidikan kami." },
  "struktur-organisasi": { title: "Struktur Organisasi", description: "Susunan organisasi Yayasan Mardhotillah." },
  pimpinan: { title: "Pimpinan", description: "Para pimpinan satuan pendidikan." },
  "profil-sekolah": { title: "Profil Sekolah", description: "Profil satuan pendidikan Mardhotillah." },
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

/** Guru & pimpinan yang ditandai sebagai pimpinan (checkbox "Tandai bila termasuk pimpinan"). */
async function getPimpinan() {
  const data = await apiServer<ListResponse<Teacher>>("/teachers", { limit: 100 });
  return (data?.items ?? []).filter((t) => t.isPimpinan);
}

function PimpinanCard({ person }: { person: Teacher }) {
  const photo = person.photo?.startsWith("/") ? person.photo : resolveImageUrl(person.photo);
  return (
    <article className="flex flex-col items-center gap-5 text-center">
      <div className="relative h-72 w-64 shrink-0 overflow-hidden rounded-2xl bg-brand-500 sm:h-96 sm:w-80">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={`Foto ${person.name}`} className="h-full w-full object-cover object-top" />
        ) : (
          <div className="pattern-islamic flex h-full w-full items-center justify-center">
            <span className="font-display text-6xl font-bold text-white/70" aria-hidden>
              {person.name.charAt(0)}
            </span>
          </div>
        )}
      </div>
      <div className="min-w-0">
        <h3 className="font-display text-2xl font-bold leading-snug text-ink">{person.name}</h3>
        {person.position && <p className="mt-2 text-lg font-medium text-brand-600">{person.position}</p>}
        {person.subject && <p className="mt-1 text-base text-ink-soft">{person.subject}</p>}
      </div>
    </article>
  );
}

export default async function TentangPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = PAGES[slug];
  if (!meta) notFound();

  const page = await apiServer<Page>(`/pages/slug/${slug}`);
  const content = page?.status === "PUBLISHED" ? page.content : null;

  // Halaman Pimpinan: tampilkan profil pimpinan lebih dulu, lalu konten halaman itu sendiri.
  const pimpinan = slug === "pimpinan" ? await getPimpinan() : [];

  return (
    <>
      <PageHero
        title={page?.title ?? meta.title}
        description={meta.description}
        breadcrumbs={[{ label: "Beranda", href: "/" }, { label: "Tentang Kami", href: "/tentang/profil" }, { label: meta.title }]}
      />

      {pimpinan.length > 0 && (
        <Section className="pb-0">
          <div className="grid gap-8 lg:grid-cols-2">
            {pimpinan.map((p) => (
              <PimpinanCard key={p.id} person={p} />
            ))}
          </div>
        </Section>
      )}

      <Section className={slug === "pimpinan" ? "!pt-0" : undefined}>
        <article className="cms-content mx-auto">
          {content ? (
            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
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
