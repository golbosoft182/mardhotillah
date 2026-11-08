"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { api } from "@/lib/auth";
import { PageHeader } from "@/components/shell";
import { AdminCard, ErrorAlert, Field, PrimaryButton, SuccessAlert, TextArea, TextInput } from "@/components/ui";

export default function SettingsPage() {
  const [form, setForm] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api<Record<string, unknown>>("/settings/admin");
        const map: Record<string, string> = {};
        for (const [k, v] of Object.entries(data)) {
          map[k] = typeof v === "string" ? v : JSON.stringify(v);
        }
        setForm(map);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Gagal memuat pengaturan");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api("/settings", { method: "PUT", body: form });
      setSuccess("Pengaturan tersimpan");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <>
      <PageHeader title="Pengaturan" description="Identitas website dan informasi kontak." />
      <ErrorAlert message={error} />
      <SuccessAlert message={success} />
      {loading ? (
        <div className="p-10 text-center text-sm text-ink-soft">Memuat...</div>
      ) : (
        <form onSubmit={handleSave}>
          <div className="grid gap-6 lg:grid-cols-2">
            <AdminCard className="space-y-4">
              <h2 className="font-display font-bold text-ink">Identitas Situs</h2>
              <Field label="Nama Situs">
                <TextInput value={form.site_name ?? ""} onChange={(e) => set("site_name", e.target.value)} />
              </Field>
              <Field label="Subjudul Nama Situs" hint="Baris kedua di bawah nama situs (header). Contoh: Ponpes · SMP · SMK">
                <TextInput
                  value={form.site_subtitle ?? ""}
                  onChange={(e) => set("site_subtitle", e.target.value)}
                  placeholder="Ponpes · SMP · SMK"
                />
              </Field>
              <Field label="Tagline">
                <TextInput value={form.site_tagline ?? ""} onChange={(e) => set("site_tagline", e.target.value)} />
              </Field>
            </AdminCard>

            <AdminCard className="space-y-4">
              <h2 className="font-display font-bold text-ink">Kontak</h2>
              <Field label="Alamat">
                <TextArea value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} className="min-h-[70px]" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Telepon">
                  <TextInput value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} />
                </Field>
                <Field label="WhatsApp">
                  <TextInput value={form.whatsapp ?? ""} onChange={(e) => set("whatsapp", e.target.value)} />
                </Field>
              </div>
              <Field label="Email">
                <TextInput type="email" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} />
              </Field>
              <Field
                label="Google Maps Embed"
                hint="Tempel kode embed HTML lengkap dari Google Maps (Bagikan → Sematkan peta) atau URL-nya saja. Kosongkan untuk menyembunyikan peta."
              >
                <TextArea
                  value={form.maps_embed ?? ""}
                  onChange={(e) => set("maps_embed", e.target.value)}
                  className="font-mono text-xs"
                  rows={6}
                  placeholder={'<iframe src="https://www.google.com/maps/embed?pb=..." ...></iframe>'}
                />
              </Field>
            </AdminCard>

            <AdminCard className="space-y-4">
              <h2 className="font-display font-bold text-ink">Pengumuman & Hero Beranda</h2>
              <Field label="Teks Pengumuman (bar atas)" hint="Kosongkan untuk menyembunyikan bar pengumuman">
                <TextInput value={form.announcement_text ?? ""} onChange={(e) => set("announcement_text", e.target.value)} placeholder="SPMB 2027/2028 telah dibuka — ..." />
              </Field>
              <Field label="Link Pengumuman" hint="Contoh: /ppdb">
                <TextInput value={form.announcement_link ?? ""} onChange={(e) => set("announcement_link", e.target.value)} />
              </Field>
              <Field label="Judul Hero Beranda">
                <TextInput value={form.hero_title ?? ""} onChange={(e) => set("hero_title", e.target.value)} placeholder="Membangun Generasi Qur'ani, Berilmu dan Berkarakter" />
              </Field>
              <Field label="Subjudul Hero Beranda">
                <TextArea value={form.hero_subtitle ?? ""} onChange={(e) => set("hero_subtitle", e.target.value)} className="min-h-[70px]" />
              </Field>
            </AdminCard>

            <AdminCard className="space-y-4">
              <h2 className="font-display font-bold text-ink">Notifikasi WhatsApp</h2>
              <Field
                label="Nomor WhatsApp Admin"
                hint="Nomor yang menerima notifikasi setiap pendaftaran SPMB baru. Pisahkan beberapa nomor dengan koma atau baris baru. Contoh: 081234567890, 081298765432"
              >
                <TextArea
                  value={form.whatsapp_admin_numbers ?? ""}
                  onChange={(e) => set("whatsapp_admin_numbers", e.target.value)}
                  className="font-mono text-xs"
                  rows={3}
                  placeholder="081234567890"
                />
              </Field>
              <p className="text-xs leading-relaxed text-ink-soft">
                Setiap pendaftaran SPMB mengirim WhatsApp ke nomor admin di atas dan ke nomor WhatsApp orang tua/wali
                yang diisi pendaftar. Integrasi memakai gateway Gontak — kunci API dan ID akun WhatsApp diatur di server
                (variabel <code className="rounded bg-brand-50 px-1">GONTAK_SECRET</code> dan{" "}
                <code className="rounded bg-brand-50 px-1">GONTAK_ACCOUNT</code>).
              </p>
            </AdminCard>

            <AdminCard className="space-y-4">
              <h2 className="font-display font-bold text-ink">Media Sosial</h2>
              <Field label="Facebook"><TextInput value={form.facebook ?? ""} onChange={(e) => set("facebook", e.target.value)} /></Field>
              <Field label="Instagram"><TextInput value={form.instagram ?? ""} onChange={(e) => set("instagram", e.target.value)} /></Field>
              <Field label="YouTube"><TextInput value={form.youtube ?? ""} onChange={(e) => set("youtube", e.target.value)} /></Field>
            </AdminCard>
          </div>
          <div className="mt-6">
            <PrimaryButton type="submit" loading={saving}><Save className="h-4 w-4" aria-hidden /> Simpan Pengaturan</PrimaryButton>
          </div>
        </form>
      )}
    </>
  );
}
