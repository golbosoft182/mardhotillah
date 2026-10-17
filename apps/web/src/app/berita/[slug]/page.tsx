import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/container";
import { NewsCard } from "@/components/ui/cards";
import { CtaBand, Section } from "@/components/ui/section";
import { apiServer, resolveImageUrl, SITE_URL, type ListResponse, type Post } from "@/lib/api";
import { POST_TYPE_LABELS, POST_TYPE_PATHS, formatDate, UNIT_SHORT } from "@/lib/site";

export const revalidate = 60;

async function getPost(slug: string) {
  const post = await apiServer<Post>(`/posts/slug/${slug}`);
  if (!post || post.status !== "PUBLISHED") return null;
  return post;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Artikel tidak ditemukan" };
  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt ?? undefined,
    openGraph: {
      title: post.ogTitle ?? post.seoTitle ?? post.title,
      description: post.ogDescription ?? post.seoDescription ?? post.excerpt ?? undefined,
      images: [resolveImageUrl(post.ogImage ?? post.featuredImage)].filter(Boolean) as string[],
      type: "article",
    },
    alternates: { canonical: `${SITE_URL}${POST_TYPE_PATHS[post.type] ?? "/berita"}/${post.slug}` },
  };
}

export default async function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const related = await apiServer<ListResponse<Post>>("/posts", { limit: 4, type: post.type });

  const basePath = POST_TYPE_PATHS[post.type] ?? "/berita";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seoDescription ?? post.excerpt,
    image: resolveImageUrl(post.ogImage ?? post.featuredImage),
    datePublished: post.publishedAt,
    author: post.author ? { "@type": "Person", name: post.author.name } : undefined,
    publisher: { "@type": "Organization", name: "Yayasan Mardhotillah" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="pattern-islamic bg-brand-700 pb-12 pt-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-white/70">
            <a href="/" className="transition hover:text-gold-400">Beranda</a>
            <span aria-hidden>/</span>
            <a href={basePath} className="transition hover:text-gold-400">{POST_TYPE_LABELS[post.type] ?? "Publikasi"}</a>
            <span aria-hidden>/</span>
            <span className="text-white" aria-current="page">{post.title}</span>
          </nav>
          <div className="flex flex-wrap items-center gap-2">
            {post.category && <Badge tone="gold">{post.category.name}</Badge>}
            <Badge tone="light">{UNIT_SHORT[post.unit]}</Badge>
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">{post.title}</h1>
          <p className="mt-3 text-sm text-white/70">
            {post.publishedAt && <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>}
            {post.author && <> · Oleh {post.author.name}</>}
          </p>
        </div>
      </div>

      <Section>
        <article className="mx-auto max-w-3xl">
          {post.featuredImage && (
            <Image
              src={resolveImageUrl(post.featuredImage)!}
              alt={post.title}
              width={1024}
              height={576}
              priority
              className="mb-8 w-full rounded-2xl shadow-card"
            />
          )}
          {post.excerpt && <p className="mb-6 text-lg leading-relaxed text-ink-soft">{post.excerpt}</p>}
          {post.content ? (
            <div className="cms-content" dangerouslySetInnerHTML={{ __html: post.content }} />
          ) : (
            <p className="text-ink-soft">[Konten artikel sedang diperbarui]</p>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2 border-t border-brand-100 pt-6">
              {post.tags.map(({ tag }) => (
                <Badge key={tag.id} tone="brand">#{tag.name}</Badge>
              ))}
            </div>
          )}

          <a
            href={basePath}
            className="mt-10 inline-flex items-center gap-2 font-display text-sm font-semibold text-brand-600 transition hover:text-brand-700"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden /> Kembali ke {POST_TYPE_LABELS[post.type] ?? "publikasi"}
          </a>
        </article>
      </Section>

      {related?.items && related.items.filter((p) => p.id !== post.id).length > 0 && (
        <Section className="bg-cream">
          <h2 className="mb-8 text-center font-display text-2xl font-bold text-brand-700">Publikasi Lainnya</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {related.items.filter((p) => p.id !== post.id).slice(0, 3).map((p) => (
              <NewsCard key={p.id} post={p} basePath={POST_TYPE_PATHS[p.type] ?? basePath} />
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
