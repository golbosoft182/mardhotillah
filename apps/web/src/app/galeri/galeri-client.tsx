"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { EmptyState, PageHero, Section } from "@/components/ui/section";
import { resolveImageUrl, type Gallery } from "@/lib/api";

type FlatItem = { url: string; caption?: string; alt?: string; gallery: string };

export function GaleriClient({
  galleries,
  unit = "",
  units = [],
}: {
  galleries: Gallery[] | null;
  unit?: string;
  units?: { key: string; label: string }[];
}) {
  const [active, setActive] = useState<FlatItem | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filterBar = units.length > 0 && (
    <div className="mb-10 flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Filter unit">
      {units.map((u) => (
        <a
          key={u.key}
          href={`/galeri${u.key ? `?unit=${u.key}` : ""}`}
          aria-pressed={unit === u.key}
          className={`rounded-full px-5 py-2.5 text-sm font-display font-semibold transition ${
            unit === u.key
              ? "bg-brand-500 text-white shadow-card"
              : "bg-white text-brand-700 ring-1 ring-brand-200 hover:bg-brand-50"
          }`}
        >
          {u.label}
        </a>
      ))}
    </div>
  );

  if (!galleries?.length) {
    return (
      <>
        <PageHero title="Galeri" breadcrumbs={[{ label: "Beranda", href: "/" }, { label: "Galeri" }]} />
        <Section>
          {filterBar}
          <EmptyState title="Belum ada galeri" hint="Galeri kegiatan akan tampil di sini." />
        </Section>
      </>
    );
  }

  const items: FlatItem[] = galleries.flatMap((g) =>
    (g.items ?? []).map((item) => ({ url: item.url, caption: item.caption, alt: item.alt, gallery: g.title })),
  );
  const index = active ? items.findIndex((i) => i.url === active.url) : -1;

  return (
    <>
      <PageHero
        title="Galeri"
        description="Momen dan kegiatan di lingkungan Yayasan Mardhotillah."
        breadcrumbs={[{ label: "Beranda", href: "/" }, { label: "Galeri" }]}
      />
      <Section>
        {filterBar}
        {galleries.map((g) => (
          <div key={g.id} className="mb-12 last:mb-0">
            <h2 className="mb-6 font-display text-xl font-bold text-brand-700">{g.title}</h2>
            <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">
              {(g.items ?? []).map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActive({ url: item.url, caption: item.caption, alt: item.alt, gallery: g.title })}
                  className="group block w-full break-inside-avoid overflow-hidden rounded-2xl shadow-card transition hover:shadow-lift"
                  aria-label={`Perbesar foto: ${item.alt ?? item.caption ?? "kegiatan"}`}
                >
                  <span className={`relative block ${i % 3 === 0 ? "aspect-[3/4]" : i % 3 === 1 ? "aspect-square" : "aspect-[4/3]"}`}>
                    <Image
                      src={resolveImageUrl(item.url)!}
                      alt={item.alt ?? item.caption ?? "Foto kegiatan"}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </Section>

      {active && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-brand-900/90 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau foto"
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            onClick={() => setActive(null)}
            aria-label="Tutup"
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>
          {index > 0 && (
            <button
              type="button"
              aria-label="Foto sebelumnya"
              onClick={(e) => { e.stopPropagation(); setActive(items[index - 1]); }}
              className="absolute left-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          <figure className="max-h-[85vh] max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <Image
              src={resolveImageUrl(active.url)!}
              alt={active.alt ?? "Foto kegiatan"}
              width={1200}
              height={800}
              className="max-h-[75vh] w-auto rounded-2xl object-contain"
            />
            {active.caption && <figcaption className="mt-3 text-center text-sm text-white/80">{active.caption}</figcaption>}
          </figure>
          {index >= 0 && index < items.length - 1 && (
            <button
              type="button"
              aria-label="Foto berikutnya"
              onClick={(e) => { e.stopPropagation(); setActive(items[index + 1]); }}
              className="absolute right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
      )}
    </>
  );
}
