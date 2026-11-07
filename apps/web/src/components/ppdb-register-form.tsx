"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ChevronDown, ClipboardCopy, Loader2, Send, UserRound } from "lucide-react";

/**
 * Formulir pendaftaran online SPMB — publik, untuk unit PONPES / SMP / SMK.
 * Mengirim ke POST /api/ppdb/register dan menampilkan kode registrasi setelah sukses.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3102";

type Unit = "PONPES" | "SMP" | "SMK";

const UNITS: { value: Unit; label: string; desc: string }[] = [
  { value: "PONPES", label: "Pondok Pesantren", desc: "Tahfidzul Qur'an & kajian kitab kuning" },
  { value: "SMP", label: "SMP Unggulan", desc: "Tahfidz · Bilingual · Leadership" },
  { value: "SMK", label: "SMK Mardhotillah Plus", desc: "DKV & industri kreatif" },
];

const inputCls =
  "w-full rounded-xl border border-brand-900/15 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink-soft/50 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

const labelCls = "mb-1.5 block text-sm font-semibold text-ink";

const EMPTY = {
  fullName: "",
  nickname: "",
  gender: "",
  birthPlace: "",
  birthDate: "",
  address: "",
  unit: "" as Unit | "",
  previousSchool: "",
  parentName: "",
  parentPhone: "",
  parentEmail: "",
  notes: "",
};

export function PpdbRegisterForm() {
  const [form, setForm] = useState({ ...EMPTY });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ regCode: string; fullName: string; unit: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Preselect jenjang dari query param (?unit=PONPES|SMP|SMK) — mis. dari tombol popup SPMB
  const searchParams = useSearchParams();
  useEffect(() => {
    const u = searchParams.get("unit")?.toUpperCase();
    if (u === "PONPES" || u === "SMP" || u === "SMK") {
      setForm((f) => (f.unit ? f : { ...f, unit: u }));
    }
  }, [searchParams]);

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.gender) return setError("Silakan pilih jenis kelamin.");
    if (!form.unit) return setError("Silakan pilih satuan pendidikan yang dituju.");
    if (!/^(\+62|62|0)8[0-9]{7,12}$/.test(form.parentPhone.replace(/[\s-]/g, ""))) {
      return setError("Nomor WhatsApp tidak valid. Contoh: 081234567890");
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/ppdb/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          nickname: form.nickname || undefined,
          gender: form.gender,
          birthPlace: form.birthPlace || undefined,
          birthDate: form.birthDate || undefined,
          address: form.address || undefined,
          unit: form.unit,
          previousSchool: form.previousSchool || undefined,
          parentName: form.parentName,
          parentPhone: form.parentPhone,
          parentEmail: form.parentEmail || undefined,
          notes: form.notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "Gagal mengirim pendaftaran. Coba lagi.");
      setSuccess({ regCode: data.regCode, fullName: data.fullName, unit: data.unit });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  // ============ Layar sukses ============
  if (success) {
    const unitLabel = UNITS.find((u) => u.value === success.unit)?.label ?? success.unit;
    return (
      <div className="rounded-3xl bg-mint p-8 text-center ring-1 ring-brand-500/20 sm:p-12" role="status">
        <CheckCircle2 className="mx-auto h-16 w-16 text-brand-500" aria-hidden />
        <h3 className="mt-4 font-display text-2xl font-bold text-ink">Pendaftaran Berhasil!</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
          Terima kasih, <strong className="text-ink">{success.fullName}</strong>. Pendaftaran untuk{" "}
          <strong className="text-ink">{unitLabel}</strong> telah kami terima. Simpan kode registrasi berikut —
          panitia akan menghubungi via WhatsApp untuk langkah selanjutnya.
        </p>
        <div className="mx-auto mt-6 flex max-w-sm items-center justify-center gap-3 rounded-2xl bg-white p-4 shadow-card ring-1 ring-brand-900/10">
          <span className="font-display text-xl font-extrabold tracking-wider text-brand-700">{success.regCode}</span>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(success.regCode).then(() => {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 2000);
              });
            }}
            className="rounded-lg p-2 text-brand-600 transition hover:bg-brand-50"
            aria-label="Salin kode registrasi"
          >
            <ClipboardCopy className="h-5 w-5" aria-hidden />
          </button>
        </div>
        {copied && <p className="mt-2 text-xs font-semibold text-brand-600">Kode tersalin!</p>}
        <button
          type="button"
          onClick={() => {
            setSuccess(null);
            setForm({ ...EMPTY });
          }}
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-brand-500/40 px-6 py-3 font-display text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
        >
          <UserRound className="h-4 w-4" aria-hidden /> Daftarkan calon lain
        </button>
      </div>
    );
  }

  // ============ Formulir ============
  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200" role="alert">
          {error}
        </div>
      )}

      {/* Pilihan unit — kartu radio */}
      <fieldset>
        <legend className={labelCls}>Satuan Pendidikan yang Dituju *</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {UNITS.map((u) => (
            <label
              key={u.value}
              className={`cursor-pointer rounded-2xl border-2 p-4 transition ${
                form.unit === u.value
                  ? "border-brand-500 bg-mint shadow-card"
                  : "border-brand-900/10 bg-white hover:border-brand-300"
              }`}
            >
              <input
                type="radio"
                name="unit"
                value={u.value}
                checked={form.unit === u.value}
                onChange={set("unit")}
                className="sr-only"
              />
              <span className="block font-display text-sm font-bold text-ink">{u.label}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-ink-soft">{u.desc}</span>
              {form.unit === u.value && (
                <CheckCircle2 className="mt-2 h-4 w-4 text-brand-500" aria-hidden />
              )}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Data calon peserta didik */}
      <fieldset className="rounded-2xl bg-mint/60 p-5 ring-1 ring-brand-500/10">
        <legend className="rounded-lg bg-brand-500 px-3 py-1 font-display text-xs font-bold uppercase tracking-wider text-white">
          Data Calon Peserta Didik
        </legend>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="reg-fullname" className={labelCls}>Nama Lengkap *</label>
            <input id="reg-fullname" className={inputCls} value={form.fullName} onChange={set("fullName")} placeholder="Sesuai akta kelahiran" required />
          </div>
          <div>
            <label htmlFor="reg-nickname" className={labelCls}>Nama Panggilan</label>
            <input id="reg-nickname" className={inputCls} value={form.nickname} onChange={set("nickname")} placeholder="Opsional" />
          </div>
          <div>
            <label htmlFor="reg-gender" className={labelCls}>Jenis Kelamin *</label>
            <div className="relative">
              <select id="reg-gender" className={`${inputCls} appearance-none pr-10`} value={form.gender} onChange={set("gender")} required>
                <option value="">Pilih…</option>
                <option value="MALE">Laki-laki</option>
                <option value="FEMALE">Perempuan</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" aria-hidden />
            </div>
          </div>
          <div>
            <label htmlFor="reg-birthplace" className={labelCls}>Tempat Lahir</label>
            <input id="reg-birthplace" className={inputCls} value={form.birthPlace} onChange={set("birthPlace")} placeholder="Kota kelahiran" />
          </div>
          <div>
            <label htmlFor="reg-birthdate" className={labelCls}>Tanggal Lahir</label>
            <input id="reg-birthdate" type="date" className={inputCls} value={form.birthDate} onChange={set("birthDate")} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="reg-address" className={labelCls}>Alamat Rumah</label>
            <input id="reg-address" className={inputCls} value={form.address} onChange={set("address")} placeholder="Alamat lengkap domisili" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="reg-prevschool" className={labelCls}>Asal Sekolah</label>
            <input id="reg-prevschool" className={inputCls} value={form.previousSchool} onChange={set("previousSchool")} placeholder="Sekolah terakhir (SD/MI untuk SMP & Ponpes, SMP/MTs untuk SMK)" />
          </div>
        </div>
      </fieldset>

      {/* Data orang tua / wali */}
      <fieldset className="rounded-2xl bg-mint/60 p-5 ring-1 ring-brand-500/10">
        <legend className="rounded-lg bg-brand-600 px-3 py-1 font-display text-xs font-bold uppercase tracking-wider text-white">
          Data Orang Tua / Wali
        </legend>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="reg-parentname" className={labelCls}>Nama Orang Tua / Wali *</label>
            <input id="reg-parentname" className={inputCls} value={form.parentName} onChange={set("parentName")} required />
          </div>
          <div>
            <label htmlFor="reg-parentphone" className={labelCls}>Nomor WhatsApp Aktif *</label>
            <input id="reg-parentphone" type="tel" inputMode="tel" className={inputCls} value={form.parentPhone} onChange={set("parentPhone")} placeholder="081234567890" required />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="reg-parentemail" className={labelCls}>Email (opsional)</label>
            <input id="reg-parentemail" type="email" className={inputCls} value={form.parentEmail} onChange={set("parentEmail")} placeholder="email@contoh.com" />
          </div>
        </div>
      </fieldset>

      {/* Catatan */}
      <div>
        <label htmlFor="reg-notes" className={labelCls}>Catatan Tambahan (opsional)</label>
        <textarea id="reg-notes" rows={3} className={inputCls} value={form.notes} onChange={set("notes")} placeholder="Pertanyaan, kebutuhan khusus, atau informasi lain untuk panitia" />
      </div>

      <p className="text-xs leading-relaxed text-ink-soft">
        Dengan mengirim formulir ini, Anda menyetujui data yang diisi digunakan untuk proses pendaftaran SPMB.
        Panitia akan menghubungi melalui WhatsApp untuk verifikasi berkas.
      </p>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-500 px-8 py-4 font-display text-base font-bold text-white shadow-card transition hover:bg-brand-700 hover:shadow-lift disabled:opacity-60 sm:w-auto"
      >
        {submitting ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Send className="h-5 w-5" aria-hidden />}
        {submitting ? "Mengirim…" : "Kirim Pendaftaran"}
      </button>
    </form>
  );
}
