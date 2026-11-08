import { Injectable, Logger } from '@nestjs/common';

export type GontakResult = { ok: boolean; status: number; message?: string };

/**
 * Klien tipis untuk Gontak (https://gontak.com) — gateway WhatsApp.
 *
 * Endpoint: POST {GONTAK_API_URL} (default https://gontak.com/api/send/whatsapp)
 * Body: application/x-www-form-urlencoded
 *   secret    → API key dari dashboard Gontak (Tools → API Keys), butuh izin "wa_send"
 *   account   → ID akun WhatsApp di Gontak (WhatsApp → akun, lihat /api/get/wa.accounts)
 *   recipient → nomor tujuan format E.164 (+62812...)
 *   type      → "text"
 *   message   → isi pesan teks
 *
 * Bila GONTAK_SECRET / GONTAK_ACCOUNT belum diisi, pengiriman dilewati (tidak
 * menggagalkan proses pendaftaran) dan hanya dicatat di log.
 */
@Injectable()
export class GontakService {
  private readonly logger = new Logger('Gontak');
  private readonly apiUrl = process.env.GONTAK_API_URL?.trim() || 'https://gontak.com/api/send/whatsapp';
  private readonly secret = process.env.GONTAK_SECRET?.trim() ?? '';
  private readonly account = (process.env.GONTAK_ACCOUNT ?? process.env.GONTAK_SENDER ?? '').trim();

  /** Integrasi aktif bila kunci API dan ID akun WhatsApp tersedia. */
  get enabled(): boolean {
    return Boolean(this.secret && this.account);
  }

  /** 08xx / +62xx / 62xx → 62xxxxxxxxx (digit saja). */
  static normalizePhone(raw?: string | null): string | null {
    if (!raw) return null;
    let d = raw.replace(/[^0-9]/g, '');
    if (!d) return null;
    if (d.startsWith('0')) d = `62${d.slice(1)}`;
    else if (d.startsWith('8')) d = `62${d}`;
    if (!d.startsWith('62') || d.length < 9 || d.length > 15) return null;
    return d;
  }

  async sendText(to: string, message: string): Promise<GontakResult> {
    const number = GontakService.normalizePhone(to);
    if (!number) {
      this.logger.warn(`Nomor tujuan tidak valid: ${to}`);
      return { ok: false, status: 0, message: 'invalid-number' };
    }
    if (!this.enabled) {
      this.logger.warn('GONTAK_SECRET/GONTAK_ACCOUNT belum diisi — pesan WhatsApp dilewati.');
      return { ok: false, status: 0, message: 'not-configured' };
    }

    const body = new URLSearchParams({
      secret: this.secret,
      account: this.account,
      recipient: `+${number}`,
      type: 'text',
      message,
    });

    try {
      const res = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        signal: AbortSignal.timeout(15000),
      });
      const raw = await res.text();
      let parsed: { status?: unknown; message?: unknown } | null = null;
      try {
        parsed = JSON.parse(raw) as { status?: unknown; message?: unknown };
      } catch {
        parsed = null;
      }
      // Gontak membalas HTTP 200 dengan field status: 200 saat berhasil.
      const apiStatus = Number(parsed?.status ?? 0);
      const ok = res.ok && (apiStatus === 200 || apiStatus === 1);
      if (!ok) {
        this.logger.warn(`Gagal kirim ke ${number}: HTTP ${res.status} ${raw.slice(0, 200)}`);
        return { ok: false, status: res.status, message: typeof parsed?.message === 'string' ? parsed.message : raw.slice(0, 200) };
      }
      return { ok: true, status: apiStatus };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Gagal menghubungi Gontak: ${msg}`);
      return { ok: false, status: 0, message: msg };
    }
  }
}
