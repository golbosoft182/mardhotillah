import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, Trophy } from "lucide-react";
import { Badge } from "./container";
import { formatDate, formatEventDate, UNIT_SHORT } from "@/lib/site";
import type { Achievement, EventItem, Post, Program } from "@/lib/api";
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
  const start = new Date(event.startDate);
  const day = new Intl.DateTimeFormat("id-ID", { day: "numeric" }).format(start);
  const month = new Intl.DateTimeFormat("id-ID", { month: "short" }).format(start);
  const img = resolveImageUrl(event.featuredImage);
  return (
    <CardShell className="flex gap-4 p-4" href={`/agenda/${event.slug}`}>
      {img && (
        <div className="relative hidden h-20 w-28 shrink-0 overflow-hidden rounded-xl sm:block md:h-24 md:w-36">
          <Image src={img} alt={`Foto agenda ${event.title}`} fill sizes="144px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>
      )}
      <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-500 text-white shadow-card">
        <span className="font-display text-2xl font-bold leading-none">{day}</span>
        <span className="text-xs uppercase tracking-wider">{month}</span>
      </div>
      <div className="min-w-0">
        <h3 className="font-display font-bold leading-snug text-ink group-hover:text-brand-600">
          {event.title}
        </h3>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden />
            {formatEventDate(event.startDate, event.endDate, event.allDay)}
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

/* ---------- Achievement / Wall of Fame ---------- */
export function AchievementCard({ item }: { item: Achievement }) {
  return (
    <CardShell className="text-center">
      <div className="relative mx-auto mt-6 h-24 w-24 overflow-hidden rounded-full ring-4 ring-gold-400/40">
        {item.photo ? (
          <Image src={resolveImageUrl(item.photo)!} alt={`Foto ${item.studentName}`} fill sizes="96px" className="object-cover" />
        ) : (
          <div className="pattern-islamic flex h-full items-center justify-center bg-brand-500 text-2xl font-display font-bold text-white">
            {item.studentName.charAt(0)}
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-bold text-ink">{item.studentName}</h3>
        <p className="mt-0.5 text-xs text-ink-soft">
          {UNIT_SHORT[item.unit]}
          {item.className ? ` · ${item.className}` : ""}
          {item.year ? ` · ${item.year}` : ""}
        </p>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gold-100 px-3 py-1 text-sm font-display font-semibold text-gold-500">
          <Trophy className="h-4 w-4" aria-hidden />
          {item.rank ?? "Prestasi"}
        </div>
        <p className="mt-3 text-sm font-medium text-ink">{item.competition}</p>
        {item.organizer && <p className="text-xs text-ink-soft">{item.organizer}</p>}
      </div>
    </CardShell>
  );
}

/* ---------- Program ---------- */
export function ProgramCard({ program }: { program: Program }) {
  return (
    <CardShell className="p-6">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
        {program.icon ? (
          <Image src={resolveImageUrl(program.icon)!} alt="" width={28} height={28} className="object-contain" />
        ) : (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M12 3l1.9 5.8H20l-4.9 3.6 1.9 5.8-5-3.6-5 3.6 1.9-5.8L4 8.8h6.1L12 3z" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <h3 className="font-display text-lg font-bold text-ink group-hover:text-brand-600">{program.name}</h3>
      {program.description && <p className="mt-2 text-sm leading-relaxed text-ink-soft">{program.description}</p>}
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
