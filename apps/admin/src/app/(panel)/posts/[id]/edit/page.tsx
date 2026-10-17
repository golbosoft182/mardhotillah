"use client";

import { use, useEffect, useState } from "react";
import { api } from "@/lib/auth";
import { PostEditor, type PostForm } from "@/components/post-editor";
import { AdminEmptyState } from "@/components/ui";

interface ApiPost {
  id: string;
  title: string;
  slug?: string;
  unit: string;
  type: string;
  categoryId?: string | null;
  excerpt?: string;
  content?: string;
  featuredImage?: string;
  status: string;
  seoTitle?: string;
  seoDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [post, setPost] = useState<ApiPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api<ApiPost>(`/posts/admin/${id}`);
        setPost(res);
      } catch {
        setPost(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="py-20 text-center text-sm text-ink-soft">Memuat artikel...</div>;
  if (!post) return <AdminEmptyState title="Artikel tidak ditemukan" hint="Mungkin telah dihapus atau Anda tidak memiliki akses." />;

  return (
    <PostEditor
      mode="edit"
      postId={id}
      initial={{
        title: post.title,
        slug: post.slug ?? "",
        unit: post.unit,
        type: post.type,
        categoryId: post.categoryId ?? "",
        excerpt: post.excerpt ?? "",
        content: post.content ?? "",
        featuredImage: post.featuredImage ?? "",
        status: post.status,
        seoTitle: post.seoTitle ?? "",
        seoDescription: post.seoDescription ?? "",
        ogTitle: post.ogTitle ?? "",
        ogDescription: post.ogDescription ?? "",
        ogImage: post.ogImage ?? "",
      }}
    />
  );
}
