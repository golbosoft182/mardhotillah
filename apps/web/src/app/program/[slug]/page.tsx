import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/container";
import { ProgramCard } from "@/components/ui/cards";
import { CtaBand, Section } from "@/components/ui/section";
import { apiServer, resolveImageUrl, SITE_URL, type ListResponse, type Program } from "@/lib/api";
import { UNIT_SHORT } from "@/lib/site";
import { sanitizeHtml } from "@/lib/sanitize-html";

export const revalidate = 60;

async function getProgram(slug: string) {
  const program = await apiServer<Program>(`/programs/slug/${slug}`);
  if (!program || program.status !== "PUBLISHED") return null;
  return program;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = await getProgram(slug);
  if (!program) return { title: "Program tidak ditemukan" };
  return {
    title: program.seoTitle ?? program.name,
    description: program.seoDescription ?? program.description ?? undefined,
    openGraph: {
      title: program.seoTitle ?? program.name,
      description: program.seoDescription ?? program.description ?? undefined,
      images: [resolveImageUrl(program.image)].filter(Boolean) as string[],
      type: "article",
    },
    alternates: { canonical: `${SITE_URL}/program/${program.slug}` },
  };
}

export default async function ProgramDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = await getProgram(slug);
  if (!program) notFound();

  const others = await apiServer<ListResponse<Program>>("/programs", { limit: 4 });
  const related = others?.items?.filter((p) => p.id !== program.id) ?? [];

  return (
    <>
      <div className="pattern-islamic bg-brand-700 pb-12 pt-10">
        <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-white/70">
            <a href="/" className="transition hover:text-gold-400">Beranda</a>
            <span aria-hidden>/</span>
            <a href="/program" className="transition hover:text-gold-400">Program</a>
            <span aria-hidden>/</span>
            <span className="text-white" aria-current="page">{program.name}</span>
          </nav>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="gold">Program</Badge>
            {program.unit && UNIT_SHORT[program.unit] && <Badge tone="light">{UNIT_SHORT[program.unit]}</Badge>}
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">{program.name}</h1>
          {program.description && <p className="mt-3 text-sm leading-relaxed text-white/80">{program.description}</p>}
        </div>
      </div>

      <Section>
        <article className="mx-auto">
          {program.image && (
            <Image
              src={resolveImageUrl(program.image)!}
              alt={`Foto program ${program.name}`}
              width={1024}
              height={576}
              priority
              className="mb-8 w-full rounded-2xl shadow-card"
            />
          )}
          {program.content ? (
            <div className="cms-content" dangerouslySetInnerHTML={{ __html: sanitizeHtml(program.content) }} />
          ) : (
            <p className="text-ink-soft">[Konten program sedang diperbarui]</p>
          )}

          <a
            href="/program"
            className="mt-10 inline-flex items-center gap-2 font-display text-sm font-semibold text-brand-600 transition hover:text-brand-700"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden /> Kembali ke Program
          </a>
        </article>
      </Section>

      {related.length > 0 && (
        <Section className="bg-cream">
          <h2 className="mb-8 text-center font-display text-2xl font-bold text-brand-700">Program Lainnya</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {related.slice(0, 2).map((p) => (
              <ProgramCard key={p.id} program={p} />
            ))}
          </div>
        </Section>
      )}

      <Section className="bg-white">
        <CtaBand />
      </Section>
    </>
  );
}
