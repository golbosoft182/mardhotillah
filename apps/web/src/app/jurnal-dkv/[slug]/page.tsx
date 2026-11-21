import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, User } from "lucide-react";
import { apiServer, resolveImageUrl, type DkvJournal } from "@/lib/api";
import { PageHero, Section } from "@/components/ui/section";
import { formatDate } from "@/lib/site";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { JournalActions } from "./journal-actions";

export const revalidate = 60;

async function getJournal(slug: string): Promise<DkvJournal | null> {
  const journal = await apiServer<DkvJournal>(`/dkv-journals/slug/${slug}`);
  if (!journal || journal.status !== "PUBLISHED") return null;
  return journal;
}

function fileExt(url?: string | null): string | null {
  if (!url) return null;
  const m = url.split("?")[0].match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toUpperCase() : null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const journal = await getJournal(slug);
  return {
    title: journal?.title ?? "Jurnal DKV",
    description: journal?.summary ?? undefined,
  };
}

export default async function JurnalDkvDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const journal = await getJournal(slug);
  if (!journal) notFound();

  const thumb = resolveImageUrl(journal.thumbnail);
  const file = resolveImageUrl(journal.fileUrl);
  const ext = fileExt(journal.fileUrl);
  const isPdf = ext === "PDF";
  const html = sanitizeHtml(journal.content);
  const dateLabel = formatDate(journal.journalDate ?? journal.publishedAt ?? undefined);

  return (
    <>
      <PageHero
        title={journal.title}
        description={journal.summary ?? undefined}
        breadcrumbs={[
          { label: "Beranda", href: "/" },
          { label: "Jurnal DKV", href: "/jurnal-dkv" },
          { label: journal.title },
        ]}
        image={thumb ?? undefined}
      />
      <Section className="bg-cream">
        <div className="grid gap-8 lg:grid-cols-[1fr,320px]">
          <article className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-brand-900/5">
            {isPdf && file && (
              <div className="border-b border-brand-100 bg-brand-50 p-4">
                <iframe
                  src={`${file}#toolbar=1&navpanes=0&view=FitH`}
                  title={`Pratinjau PDF: ${journal.title}`}
                  className="h-[70vh] w-full rounded-xl border-0 bg-white"
                />
              </div>
            )}
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft">
                {dateLabel && (
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-brand-500" aria-hidden />
                    {dateLabel}
                  </span>
                )}
                {journal.author && (
                  <span className="inline-flex items-center gap-2">
                    <User className="h-4 w-4 text-brand-500" aria-hidden />
                    {journal.author}
                  </span>
                )}
                {ext && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                    {ext}
                  </span>
                )}
              </div>

              {html && <div className="cms-content mt-6" dangerouslySetInnerHTML={{ __html: html }} />}

              {!html && journal.summary && <p className="mt-6 leading-relaxed text-ink-soft">{journal.summary}</p>}
            </div>
          </article>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <JournalActions
              id={journal.id}
              fileUrl={file}
              fileName={journal.fileName}
              initialViewCount={journal.viewCount}
              initialDownloadCount={journal.downloadCount}
            />
          </aside>
        </div>

        <div className="mt-8 text-center">
          <Link href="/jurnal-dkv" className="text-sm font-semibold text-brand-600 underline-offset-4 hover:underline">
            ← Kembali ke daftar Jurnal DKV
          </Link>
        </div>
      </Section>
    </>
  );
}
