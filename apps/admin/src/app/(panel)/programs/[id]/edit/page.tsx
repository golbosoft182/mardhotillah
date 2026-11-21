"use client";

import { use, useEffect, useState } from "react";
import { api } from "@/lib/auth";
import { ProgramEditor } from "@/components/program-editor";
import { AdminEmptyState } from "@/components/ui";

interface ApiProgram {
  id: string;
  name: string;
  slug?: string;
  unit?: string | null;
  description?: string;
  content?: string;
  image?: string;
  icon?: string;
  order?: number;
  featured?: boolean;
  status: string;
  seoTitle?: string;
  seoDescription?: string;
}

export default function EditProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [program, setProgram] = useState<ApiProgram | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setProgram(await api<ApiProgram>(`/programs/${id}`));
      } catch {
        setProgram(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="py-20 text-center text-sm text-ink-soft">Memuat program...</div>;
  if (!program) return <AdminEmptyState title="Program tidak ditemukan" hint="Mungkin telah dihapus atau Anda tidak memiliki akses." />;

  return (
    <ProgramEditor
      mode="edit"
      programId={id}
      initial={{
        name: program.name,
        slug: program.slug ?? "",
        unit: program.unit ?? "",
        description: program.description ?? "",
        content: program.content ?? "",
        image: program.image ?? "",
        icon: program.icon ?? "",
        order: program.order ?? 1,
        featured: program.featured ?? true,
        status: program.status,
        seoTitle: program.seoTitle ?? "",
        seoDescription: program.seoDescription ?? "",
      }}
    />
  );
}
