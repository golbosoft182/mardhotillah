import Image from "next/image";
import Link from "next/link";
import { Building2, CalendarDays, CalendarRange, MapPin, Trophy, UserRound } from "lucide-react";
import { Badge } from "./container";
import { formatDate, formatEventTime, UNIT_SHORT } from "@/lib/site";
import type { Achievement, Activity, DkvWork, EventItem, IndustryPartner, JobVacancy, KesiswaanProgram, Post, Program } from "@/lib/api";
import { resolveImageUrl } from "@/lib/api";
import type { ReactNode } from "react";

/* ---------- Base card ---------- */
export function CardShell({
  children,
  href,
  className = "",
}: {
  children: ReactNode;
  href?: string;
  className?: string;
}) {
  const cls = `group block overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-brand-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return <div className={cls}>{children}</div>;
}

export function CardImage({
  src,
  alt,
  ratio = "aspect-[16/10]",
}: {
  src?: string;
  alt: string;
  ratio?: string;
}) {
  return (
    <div className={`relative ${ratio} overflow-hidden bg-brand-100`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="pattern-islamic flex h-full items-center justify-center bg-brand-500">
          <span className="font-display text-4xl font-bold text-white/30" aria-hidden>
            ✦
          </span>
          <span className="sr-only">[Foto Kegiatan]</span>
        </div>
      )}
    </div>
  );
}

/* ---------- PDF thumbnail (memakai penampil PDF bawaan browser) ---------- */
export function PdfThumbnail({
  src,
  title,
  ratio = "aspect-[4/5]",
  className = "",
}: {
  src: string;
  title: string;
  ratio?: string;
  className?: string;
}) {
  return (
    <div className={`relative ${ratio} overflow-hidden bg-brand-50 ${className}`}>
      <iframe
        src={`${src}#page=1&toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
        title={`Pratinjau PDF: ${title}`}
        loading="lazy"
        tabIndex={-1}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full border-0"
      />
      <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
        PDF
      </span>
    </div>
  );
}

/* ---------- News / Article ---------- */
export function NewsCard({ post, basePath = "/berita" }: { post: Post; basePath?: string }) {
  return (
    <CardShell href={`${basePath}/${post.slug}`}>
      <CardImage src={resolveImageUrl(post.featuredImage)} alt={post.title} />
      <div className="p-5">
        <div className="mb-2.5 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
          {post.category && <Badge tone="brand">{post.category.name}</Badge>}
          {UNIT_SHORT[post.unit] && <span className="font-medium">{UNIT_SHORT[post.unit]}</span>}
          {post.publishedAt && <span aria-hidden>·</span>}
          {post.publishedAt && <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>}
        </div>
        <h3 className="font-display text-lg font-bold leading-snug text-ink transition-colors group-hover:text-brand-600">
          {post.title}
        </h3>
        {post.excerpt && <p className="mt-2 line-clamp-2 text-sm text-ink-soft">{post.excerpt}</p>}
      </div>
    </CardShell>
  );
}

/* ---------- Agenda / Event ---------- */
export function EventCard({ event }: { event: EventItem }) {
  const isText = event.timeType === "TEXT";
  const start = event.startDate ? new Date(event.startDate) : null;
  const day = start ? new Intl.DateTimeFormat("id-ID", { day: "numeric" }).format(start) : null;
  const month = start ? new Intl.DateTimeFormat("id-ID", { month: "short" }).format(start) : null;
  const img = resolveImageUrl(event.featuredImage);
  return (
    <CardShell className="flex gap-4 p-4" href={`/agenda/${event.slug}`}>
      {img && (
        <div className="relative hidden h-20 w-28 shrink-0 overflow-hidden rounded-xl sm:block md:h-24 md:w-36">
          <Image src={img} alt={`Foto agenda ${event.title}`} fill sizes="144px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>
      )}
      <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-500 text-white shadow-card">
        {isText || !start ? (
          <>
            <CalendarRange className="h-6 w-6" aria-hidden />
            <span className="mt-0.5 text-[10px] uppercase tracking-wider">Waktu</span>
          </>
        ) : (
          <>
            <span className="font-display text-2xl font-bold leading-none">{day}</span>
            <span className="text-xs uppercase tracking-wider">{month}</span>
          </>
        )}
      </div>
      <div className="min-w-0">
        <h3 className="font-display font-bold leading-snug text-ink group-hover:text-brand-600">
          {event.title}
        </h3>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden />
            {formatEventTime(event)}
          </span>
          {event.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              {event.location}
            </span>
          )}
        </p>
      </div>
    </CardShell>
  );
}

/* ---------- Program Kerja Waka Kesiswaan ---------- */
export function ProgramKerjaCard({ program }: { program: KesiswaanProgram }) {
  const isText = program.timeType === "TEXT";
  const start = program.startDate ? new Date(program.startDate) : null;
  const day = start ? new Intl.DateTimeFormat("id-ID", { day: "numeric" }).format(start) : null;
  const month = start ? new Intl.DateTimeFormat("id-ID", { month: "short" }).format(start) : null;
  return (
    <CardShell className="flex gap-4 p-4" href={`/program-kerja-waka-kesiswaan/${program.slug}`}>
      <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-500 text-white shadow-card">
        {isText || !start ? (
          <>
            <CalendarRange className="h-6 w-6" aria-hidden />
            <span className="mt-0.5 text-[10px] uppercase tracking-wider">Waktu</span>
          </>
        ) : (
          <>
            <span className="font-display text-2xl font-bold leading-none">{day}</span>
            <span className="text-xs uppercase tracking-wider">{month}</span>
          </>
        )}
      </div>
      <div className="min-w-0">
        <h3 className="font-display font-bold leading-snug text-ink group-hover:text-brand-600">
          {program.title}
        </h3>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden />
            {formatEventTime(program)}
          </span>
          {program.personInCharge && (
            <span className="inline-flex items-center gap-1">
              <UserRound className="h-3.5 w-3.5" aria-hidden />
              {program.personInCharge}
            </span>
          )}
        </p>
      </div>
    </CardShell>
  );
}

/* ---------- Lowongan Kerja (BKK) ---------- */
export function VacancyCard({ vacancy }: { vacancy: JobVacancy }) {
  const posted = vacancy.postedAt ? formatDate(vacancy.postedAt) : null;
  const deadline = vacancy.deadline ? formatDate(vacancy.deadline) : null;
  return (
    <CardShell href={`/bkk/${vacancy.id}`} className="flex h-full flex-col p-5">
      <div className="flex flex-wrap items-center gap-2 text-xs text-ink-soft">
        <span className="inline-flex items-center gap-1 font-semibold text-brand-600">
          <Building2 className="h-3.5 w-3.5" aria-hidden />
          {vacancy.company}
        </span>
        {posted && (
          <>
            <span aria-hidden>·</span>
            <time dateTime={vacancy.postedAt ?? undefined}>{posted}</time>
          </>
        )}
      </div>
      <h3 className="mt-1.5 font-display text-lg font-bold leading-snug text-ink transition-colors group-hover:text-brand-600">
        {vacancy.position}
      </h3>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {vacancy.employmentType && <Badge tone="brand">{vacancy.employmentType}</Badge>}
        {vacancy.location && (
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700">
            <MapPin className="h-3 w-3" aria-hidden />
            {vacancy.location}
          </span>
        )}
      </div>
      {vacancy.description && (
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-soft">{vacancy.description}</p>
      )}
      <dl className="mt-3 space-y-1 text-sm text-ink-soft">
        {vacancy.salary && (
          <div className="flex gap-1.5">
            <dt className="font-semibold text-ink">Gaji:</dt>
            <dd>{vacancy.salary}</dd>
          </div>
        )}
        {deadline && (
          <div className="flex gap-1.5">
            <dt className="font-semibold text-ink">Batas lamaran:</dt>
            <dd>{deadline}</dd>
          </div>
        )}
      </dl>
      <span className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-500 px-5 py-2.5 font-display text-sm font-semibold text-white shadow-card transition group-hover:bg-brand-700">
        Detail Lamaran
      </span>
    </CardShell>
  );
}

/* ---------- Mitra Industri (Kemitraan Dunia Usaha dan Industri) ---------- */
export function PartnerCard({ partner }: { partner: IndustryPartner }) {
  const logo = resolveImageUrl(partner.logo);
  return (
    <CardShell href={`/mitra-industri/${partner.slug}`} className="flex h-full flex-col items-center p-6 text-center">
      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-brand-50 ring-1 ring-brand-900/5">
        {logo ? (
          <Image
            src={logo}
            alt={`Logo ${partner.name}`}
            width={96}
            height={96}
            className="h-full w-full object-contain p-2"
          />
        ) : (
          <Building2 className="h-10 w-10 text-brand-300" aria-hidden />
        )}
      </div>
      <h3 className="mt-4 font-display text-base font-bold leading-snug text-ink transition-colors group-hover:text-brand-600">
        {partner.name}
      </h3>
      {partner.description && (
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-soft">{partner.description}</p>
      )}
    </CardShell>
  );
}

/* ---------- Achievement / Wall of Fame ---------- */
export function AchievementCard({ item }: { item: Achievement }) {
  const img = resolveImageUrl(item.photo);
  const meta = [UNIT_SHORT[item.unit], item.className, item.year].filter(Boolean).join(" · ");
  return (
    <CardShell className="flex h-full flex-col">
      <div className="relative aspect-[4/5] overflow-hidden bg-brand-100">
        {img ? (
          <Image
            src={img}
            alt={`Foto ${item.studentName}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="pattern-islamic flex h-full items-center justify-center bg-brand-500 text-6xl font-display font-bold text-white/40" aria-hidden>
            {item.studentName.charAt(0)}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-base font-bold leading-snug text-ink transition-colors group-hover:text-brand-600">
          {item.studentName}
        </h3>
        {meta && <p className="mt-1 text-xs text-ink-soft">{meta}</p>}
        <div className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-gold-100 px-3 py-1 text-sm font-display font-semibold text-gold-500">
          <Trophy className="h-4 w-4" aria-hidden />
          {item.rank ?? "Prestasi"}
        </div>
        <p className="mt-3 text-sm font-medium text-ink">{item.competition}</p>
        {item.organizer && <p className="mt-auto pt-2 text-xs text-ink-soft">{item.organizer}</p>}
      </div>
    </CardShell>
  );
}

/* ---------- Activity (Aktivitas Siswa & Santri) ---------- */
export function ActivityCard({ item }: { item: Activity }) {
  return (
    <article className="group overflow-hidden rounded-2xl bg-white shadow-card transition hover:shadow-lift">
      <div className="relative aspect-[4/3] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image ?? "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=75"}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {item.category && (
          <span className="absolute left-3 top-3 rounded-full bg-brand-500/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
            {item.category}
          </span>
        )}
      </div>
      <div className="p-5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-gold-500">{UNIT_SHORT[item.unit] ?? item.unit}</p>
        <h3 className="mt-1 font-display text-base font-bold text-ink">{item.title}</h3>
        {item.description && <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-ink-soft">{item.description}</p>}
      </div>
    </article>
  );
}

/* ---------- Karya DKV (Showcase) ---------- */
export function DkvWorkCard({ work }: { work: DkvWork }) {
  const img = resolveImageUrl(work.image);
  const pdf = resolveImageUrl(work.file);
  const isPdf = work.mediaType === "PDF";
  const meta = [work.author, work.workDate ? formatDate(work.workDate) : null].filter(Boolean).join(" · ");
  return (
    <CardShell href="/karya-dkv" className="flex h-full flex-col">
      {isPdf && !img && pdf ? (
        <PdfThumbnail src={pdf} title={work.title} ratio="aspect-[4/5]" />
      ) : (
        <CardImage src={img} alt={work.title} ratio="aspect-[4/5]" />
      )}
      <div className="flex flex-1 flex-col p-5">
        {(work.category || isPdf) && (
          <div className="flex flex-wrap items-center gap-2">
            {work.category && <Badge tone="gold">{work.category}</Badge>}
            {isPdf && <Badge tone="brand">PDF</Badge>}
          </div>
        )}
        <h3 className="mt-2.5 font-display text-base font-bold leading-snug text-ink transition-colors group-hover:text-brand-600">
          {work.title}
        </h3>
        {meta && <p className="mt-auto pt-3 text-xs text-ink-soft">{meta}</p>}
      </div>
    </CardShell>
  );
}

/* ---------- Program ---------- */
export function ProgramCard({ program }: { program: Program }) {
  return (
    <CardShell href={`/program/${program.slug}`}>
      <CardImage src={resolveImageUrl(program.image)} alt={`Foto program ${program.name}`} />
      <div className="p-5">
        <h3 className="font-display text-lg font-bold leading-snug text-ink transition-colors group-hover:text-brand-600">
          {program.name}
        </h3>
        {program.description && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-soft">{program.description}</p>}
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-display font-semibold text-brand-600">
          Selengkapnya
          <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="currentColor" aria-hidden>
            <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h9.19l-3.22-3.22a.75.75 0 011.06-1.06l4.5 4.5a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 11-1.06-1.06l3.22-3.22H3.75A.75.75 0 013 10z" clipRule="evenodd" />
          </svg>
        </span>
      </div>
    </CardShell>
  );
}

/* ---------- Education Unit ---------- */
export function EducationUnitCard({
  name,
  tagline,
  description,
  href,
  image,
}: {
  name: string;
  tagline: string;
  description: string;
  href: string;
  image?: string;
}) {
  return (
    <CardShell href={href} className="flex h-full flex-col">
      <CardImage src={image} alt={`Foto ${name}`} ratio="aspect-[4/3]" />
      <div className="flex flex-1 flex-col p-6">
        <Badge tone="gold" >{tagline}</Badge>
        <h3 className="mt-3 font-display text-xl font-bold text-brand-700 group-hover:text-brand-600">{name}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{description}</p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-display font-semibold text-brand-600">
          Pelajari lebih lanjut
          <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="currentColor" aria-hidden>
            <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h9.19l-3.22-3.22a.75.75 0 011.06-1.06l4.5 4.5a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 11-1.06-1.06l3.22-3.22H3.75A.75.75 0 013 10z" clipRule="evenodd" />
          </svg>
        </span>
      </div>
    </CardShell>
  );
}
