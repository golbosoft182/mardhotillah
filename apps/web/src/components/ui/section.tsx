import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

export function Section({
  children,
  className = "",
  id,
  compact,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  /** Padding vertikal lebih kecil untuk halaman yang perlu ringkas */
  compact?: boolean;
}) {
  return (
    <section id={id} className={`${compact ? "py-10 sm:py-12" : "py-16 sm:py-20"} ${className}`}>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-brand-200 bg-white/60 px-6 py-14 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-500">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6" aria-hidden>
          <path d="M4 6h16v12H4zM4 10h16" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="font-display font-semibold text-ink">{title}</p>
      {hint && <p className="mt-1 text-sm text-ink-soft">{hint}</p>}
    </div>
  );
}

export function CtaBand({
  title = "Siap menjadi bagian dari keluarga Mardhotillah?",
  description = "Daftarkan putra-putri Anda melalui PPDB online atau hubungi kami untuk informasi lebih lanjut.",
  primaryLabel = "DAFTAR PPDB",
  primaryHref = "/ppdb",
  secondaryLabel = "HUBUNGI KAMI",
  secondaryHref = "/kontak",
}: {
  title?: string;
  description?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}) {
  return (
    <div className="pattern-islamic relative overflow-hidden rounded-3xl bg-brand-700 px-6 py-12 text-center shadow-lift sm:px-12 sm:py-16">
      <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-gold-400/15 blur-2xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-20 -right-10 h-56 w-56 rounded-full bg-brand-500/40 blur-2xl" aria-hidden />
      <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">{description}</p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={primaryHref}
          className="inline-flex items-center justify-center rounded-full bg-gold-400 px-7 py-3.5 font-display font-semibold text-brand-800 shadow-card transition hover:bg-sun-400 hover:shadow-lift"
        >
          {primaryLabel}
        </Link>
        <Link
          href={secondaryHref}
          className="inline-flex items-center justify-center rounded-full border border-white/30 px-7 py-3.5 font-display font-semibold text-white transition hover:bg-white/10"
        >
          {secondaryLabel}
        </Link>
      </div>
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-white/70">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden>/</span>}
            {item.href ? (
              <Link href={item.href} className="transition hover:text-gold-400">
                {item.label}
              </Link>
            ) : (
              <span className="text-white" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Logo unit pendidikan (ditampilkan di hero halaman unit) */
export function UnitLogo({ unit }: { unit: "ponpes" | "smp" | "smk" }) {
  const logos = {
    ponpes: { src: "/images/logos/ponpes.webp", alt: "Logo Pondok Pesantren Mardhotillah" },
    smp: { src: "/images/logos/smp.png", alt: "Logo SMP Unggulan Mardhotillah" },
    smk: { src: "/images/logos/smk.png", alt: "Logo SMK Mardhotillah Plus" },
  };
  const logo = logos[unit];
  return (
    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-2 shadow-lift ring-1 ring-brand-900/10 sm:h-20 sm:w-20">
      <Image src={logo.src} alt={logo.alt} width={64} height={64} className="h-full w-full object-contain" />
    </div>
  );
}

export function PageHero({
  title,
  description,
  breadcrumbs,
  image,
}: {
  title: string;
  description?: string;
  breadcrumbs: { label: string; href?: string }[];
  image?: string;
}) {
  return (
    <div className="pattern-islamic relative overflow-hidden bg-brand-700 pb-14 pt-12 sm:pb-20 sm:pt-16">
      {image && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-800/70 via-brand-700/80 to-brand-700" aria-hidden />
        </>
      )}
      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbs} />
        <h1 className="font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">{title}</h1>
        {description && <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">{description}</p>}
      </div>
    </div>
  );
}
