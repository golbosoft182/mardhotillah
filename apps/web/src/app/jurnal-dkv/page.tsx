import Image from "next/image";
import Link from "next/link";
import { Download, Eye } from "lucide-react";
import { apiServer, resolveImageUrl, type DkvJournal, type ListResponse } from "@/lib/api";
import { PdfThumbnail } from "@/components/ui/cards";
import { EmptyState, PageHero, Section } from "@/components/ui/section";
import { formatDate } from "@/lib/site";

export const revalidate = 60;

export const metadata = {
  title: "Jurnal DKV",
  description: "Arsip jurnal dan dokumentasi Desain Komunikasi Visual SMK Mardhotillah Plus.",
};

/** Ekstensi berkas (PDF/DOC/DOCX) untuk label, tanpa titik. */
function fileExt(url?: string | null): string | null {
  if (!url) return null;
  const m = url.split("?")[0].match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toUpperCase() : null;
}

export default async function JurnalDkvPage() {
  const data = await apiServer<ListResponse<DkvJournal>>("/dkv-journals", { limit: 100, sort: "newest" });
  const items = data?.items ?? [];

  return (
    <>
      <PageHero
        title="Jurnal DKV"
        description="Arsip jurnal dan dokumentasi Desain Komunikasi Visual SMK Mardhotillah Plus."
        breadcrumbs={[{ label: "Beranda", href: "/" }, { label: "Jurnal DKV" }]}
      />
      <Section>
        {items.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((j) => {
              const thumb = resolveImageUrl(j.thumbnail);
              const file = resolveImageUrl(j.fileUrl);
              const ext = fileExt(j.fileUrl);
              const dateLabel = formatDate(j.publishedAt ?? j.journalDate ?? undefined);
              return (
                <Link
                  key={j.id}
                  href={`/jurnal-dkv/${j.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-brand-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                >
                  {thumb ? (
                    <span className="relative block aspect-[4/5] overflow-hidden bg-brand-100">
                      <Image
                        src={thumb}
                        alt={j.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {ext && (
                        <span className="absolute left-2 top-2 rounded-md bg-brand-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                          {ext}
                        </span>
                      )}
                    </span>
                  ) : file && ext === "PDF" ? (
                    <PdfThumbnail src={file} title={j.title} />
                  ) : (
                    <span className="pattern-islamic flex aspect-[4/5] items-center justify-center bg-brand-600 font-display text-lg font-bold tracking-wide text-white/80">
                      {ext ?? "JURNAL"}
                    </span>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    {dateLabel && (
                      <p className="text-xs text-ink-soft">
                        {dateLabel}
                        {j.author ? ` · ${j.author}` : ""}
                      </p>
                    )}
                    <h3 className="mt-1 font-display font-bold leading-snug text-ink transition-colors group-hover:text-brand-600">
                      {j.title}
                    </h3>
                    {j.summary && <p className="mt-2 line-clamp-2 text-sm text-ink-soft">{j.summary}</p>}
                    <div className="mt-auto flex items-center gap-4 pt-4 text-xs text-ink-soft">
                      <span className="inline-flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5" aria-hidden /> {j.viewCount} dilihat
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Download className="h-3.5 w-3.5" aria-hidden /> {j.downloadCount} unduhan
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="Belum ada jurnal DKV"
            hint="Jurnal akan tampil di sini setelah dipublikasikan lewat CMS."
          />
        )}
      </Section>
    </>
  );
}
