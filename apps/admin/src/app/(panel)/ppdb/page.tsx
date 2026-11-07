"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Save, Trash2, CheckCircle2, CalendarDays, HelpCircle, FileText } from "lucide-react";
import { api } from "@/lib/auth";
import { PageHeader } from "@/components/shell";
import { AdminCard, AdminEmptyState, DangerButton, ErrorAlert, Field, PrimaryButton, SecondaryButton, SuccessAlert, TextArea, TextInput } from "@/components/ui";

interface Period {
  id: string;
  name: string;
  year: string;
  isActive: boolean;
  brochureUrl?: string;
}

interface ContentRow {
  id: string;
  section: string;
  title?: string;
  body?: string;
  data?: unknown;
  order: number;
}

interface FaqRow {
  id: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
}

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero (Pembuka)",
  why: "Mengapa Kami",
  requirements: "Persyaratan",
  timeline: "Jadwal / Timeline",
  process: "Alur Pendaftaran",
  fees: "Biaya",
  contact: "Kontak Panitia",
};

export default function PpdbPage() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [activePeriod, setActivePeriod] = useState<Period | null>(null);
  const [contents, setContents] = useState<ContentRow[]>([]);
  const [faqs, setFaqs] = useState<FaqRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" });

  const load = useCallback(async () => {
    try {
      const list = await api<Period[]>("/ppdb/periods");
      setPeriods(list);
      const active = list.find((p) => p.isActive) ?? list[0] ?? null;
      setActivePeriod(active);
      if (active) {
        const detail = await api<{ content: ContentRow[]; faqs: FaqRow[] }>(`/ppdb/active`);
        setContents(detail.content ?? []);
        setFaqs(detail.faqs ?? []);
      }
    } catch {
      setPeriods([]);
      setActivePeriod(null);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function activate(p: Period) {
    try {
      await api(`/ppdb/periods/${p.id}`, { method: "PUT", body: { isActive: true } });
      setSuccess(`Periode ${p.name} diaktifkan`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengaktifkan");
    }
  }

  async function saveContent(c: ContentRow) {
    if (!activePeriod) return;
    try {
      await api(`/ppdb/periods/${activePeriod.id}/content`, {
        method: "PUT",
        body: { section: c.section, title: c.title, body: c.body, data: c.data, order: c.order },
      });
      setSuccess(`Bagian "${SECTION_LABELS[c.section] ?? c.section}" tersimpan`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan");
    }
  }

  async function addFaq() {
    if (!newFaq.question || !newFaq.answer) return;
    try {
      await api("/ppdb/faqs", {
        method: "POST",
        body: { ...newFaq, periodId: activePeriod?.id, order: faqs.length + 1 },
      });
      setNewFaq({ question: "", answer: "" });
      setSuccess("FAQ ditambahkan");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menambah FAQ");
    }
  }

  async function deleteFaq(id: string) {
    if (!confirm("Hapus FAQ ini?")) return;
    try {
      await api(`/ppdb/faqs/${id}`, { method: "DELETE" });
      setSuccess("FAQ dihapus");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menghapus");
    }
  }

  if (!activePeriod) {
    return (
      <>
        <PageHeader title="SPMB" description="Kelola konten halaman SPMB." />
        <AdminEmptyState title="Belum ada periode SPMB" hint="Jalankan ulang seed atau buat periode melalui API admin." />
      </>
    );
  }

  const sectionContent = (key: string) => contents.find((c) => c.section === key);

  return (
    <>
      <PageHeader title="SPMB" description="Kelola konten halaman SPMB: periode, bagian, dan FAQ." />

      {/* Periode */}
      <AdminCard className="mb-6">
        <h2 className="mb-3 flex items-center gap-2 font-display font-bold text-ink">
          <CalendarDays className="h-5 w-5 text-brand-500" aria-hidden /> Periode Aktif
        </h2>
        <div className="flex flex-wrap gap-2">
          {periods.map((p) => (
            <span
              key={p.id}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                p.isActive ? "bg-emerald-100 text-emerald-700" : "bg-cream text-ink-soft ring-1 ring-brand-100"
              }`}
            >
              {p.isActive && <CheckCircle2 className="h-4 w-4" aria-hidden />}
              {p.name}
              {!p.isActive && (
                <button type="button" onClick={() => activate(p)} className="text-xs text-brand-600 underline">
                  Aktifkan
                </button>
              )}
            </span>
          ))}
        </div>
      </AdminCard>

      <ErrorAlert message={error} />
      <SuccessAlert message={success} />

      {/* Bagian konten */}
      <div className="grid gap-6 lg:grid-cols-2">
        {Object.entries(SECTION_LABELS).map(([key, label]) => {
          const c: ContentRow = sectionContent(key) ?? { id: `new-${key}`, section: key, title: "", body: "", order: 0 };
          return (
            <AdminCard key={key} className="space-y-3">
              <h3 className="flex items-center gap-2 font-display font-bold text-ink">
                <FileText className="h-4 w-4 text-gold-400" aria-hidden /> {label}
              </h3>
              <Field label="Judul">
                <TextInput
                  defaultValue={c.title ?? ""}
                  onBlur={(e) => { c.title = e.target.value; }}
                />
              </Field>
              <Field label="Isi">
                <TextArea
                  defaultValue={c.body ?? ""}
                  onBlur={(e) => { c.body = e.target.value; }}
                  className="min-h-[80px]"
                />
              </Field>
              <div className="flex justify-end">
                <SecondaryButton type="button" onClick={() => saveContent(c)}>
                  <Save className="h-4 w-4" aria-hidden /> Simpan
                </SecondaryButton>
              </div>
            </AdminCard>
          );
        })}
      </div>

      {/* FAQ */}
      <AdminCard className="mt-6">
        <h2 className="mb-4 flex items-center gap-2 font-display font-bold text-ink">
          <HelpCircle className="h-5 w-5 text-brand-500" aria-hidden /> FAQ SPMB
        </h2>
        <ul className="mb-5 space-y-3">
          {faqs.map((f) => (
            <li key={f.id} className="flex items-start justify-between gap-4 rounded-xl bg-cream p-4">
              <div>
                <p className="text-sm font-semibold text-ink">{f.question}</p>
                <p className="mt-1 text-sm text-ink-soft">{f.answer}</p>
              </div>
              <DangerButton onClick={() => deleteFaq(f.id)} className="!px-2 !py-1.5" aria-label={`Hapus FAQ ${f.question}`}>
                <Trash2 className="h-4 w-4" aria-hidden />
              </DangerButton>
            </li>
          ))}
          {!faqs.length && <p className="text-sm text-ink-soft">Belum ada FAQ.</p>}
        </ul>
        <div className="grid gap-3 rounded-xl border border-dashed border-brand-200 p-4 sm:grid-cols-[1fr_1fr_auto]">
          <Field label="Pertanyaan">
            <TextInput value={newFaq.question} onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })} />
          </Field>
          <Field label="Jawaban">
            <TextInput value={newFaq.answer} onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })} />
          </Field>
          <div className="flex items-end">
            <PrimaryButton type="button" onClick={addFaq}><Plus className="h-4 w-4" aria-hidden /> Tambah</PrimaryButton>
          </div>
        </div>
      </AdminCard>
    </>
  );
}
