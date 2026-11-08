import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GontakService } from './gontak.service';

const UNIT_LABEL: Record<string, string> = {
  PONPES: 'Pondok Pesantren',
  SMP: 'SMP Unggulan',
  SMK: 'SMK Mardhotillah Plus',
};

export type RegistrationNotice = {
  regCode: string;
  fullName: string;
  unit: string;
  parentName: string;
  parentPhone: string;
  previousSchool?: string | null;
  address?: string | null;
  createdAt?: Date;
};

/**
 * Notifikasi WhatsApp untuk SPMB:
 * - admin (nomor di Pengaturan → Notifikasi WhatsApp, dipisah koma/baris baru)
 * - orang tua/wali (nomor WhatsApp yang diisi di formulir)
 */
@Injectable()
export class WhatsappService {
  private readonly logger = new Logger('Whatsapp');

  constructor(
    private prisma: PrismaService,
    private gontak: GontakService,
  ) {}

  /** Nomor admin dari tabel settings (`whatsapp_admin_numbers`). */
  static parseNumbers(value: unknown): string[] {
    const raw = typeof value === 'string' ? value : '';
    return raw
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  private static formatDate(d: Date): string {
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: 'Asia/Jakarta',
    }).format(d);
  }

  /** Kirim notifikasi ke admin + orang tua. Tidak pernah melempar error. */
  async notifyNewRegistration(reg: RegistrationNotice): Promise<void> {
    try {
      if (!this.gontak.enabled) return;

      const rows = await this.prisma.setting.findMany({
        where: { key: { in: ['whatsapp_admin_numbers', 'site_name'] } },
      });
      const settings: Record<string, unknown> = {};
      for (const r of rows) settings[r.key] = r.value;

      const siteName =
        typeof settings.site_name === 'string' && settings.site_name.trim()
          ? settings.site_name.trim()
          : 'Yayasan Mardhotillah';
      const unitLabel = UNIT_LABEL[reg.unit] ?? reg.unit;
      const when = WhatsappService.formatDate(reg.createdAt ?? new Date());

      const adminMessage = [
        '🔔 Pendaftaran SPMB baru',
        '',
        `Kode: ${reg.regCode}`,
        `Nama: ${reg.fullName}`,
        `Jenjang: ${unitLabel}`,
        `Orang tua/wali: ${reg.parentName}`,
        `WhatsApp: ${reg.parentPhone}`,
        `Asal sekolah: ${reg.previousSchool?.trim() || '-'}`,
        `Alamat: ${reg.address?.trim() || '-'}`,
        `Waktu: ${when}`,
        '',
        'Buka CMS → SPMB → Pendaftaran untuk verifikasi.',
      ].join('\n');

      const parentMessage = [
        `Assalamu'alaikum Bpk/Ibu ${reg.parentName},`,
        '',
        `Pendaftaran SPMB ${siteName} untuk Ananda ${reg.fullName} (${unitLabel}) sudah kami terima.`,
        '',
        `Kode registrasi: ${reg.regCode}`,
        'Mohon simpan kode ini. Panitia akan menghubungi Bapak/Ibu melalui WhatsApp untuk verifikasi berkas.',
        '',
        'Terima kasih.',
      ].join('\n');

      const adminNumbers = WhatsappService.parseNumbers(settings.whatsapp_admin_numbers);
      const targets = [
        ...adminNumbers.map((n) => ({ to: n, message: adminMessage, role: 'admin' })),
        { to: reg.parentPhone, message: parentMessage, role: 'wali' },
      ];

      const results = await Promise.allSettled(targets.map((t) => this.gontak.sendText(t.to, t.message)));
      results.forEach((r, i) => {
        const t = targets[i];
        if (r.status === 'rejected') this.logger.warn(`[${t.role}] gagal: ${String(r.reason)}`);
        else if (!r.value.ok) this.logger.warn(`[${t.role}] ${t.to}: ${r.value.message ?? 'gagal'}`);
        else this.logger.log(`[${t.role}] terkirim ke ${t.to}`);
      });
    } catch (err) {
      // Notifikasi tidak boleh menggagalkan pendaftaran
      this.logger.warn(`Notifikasi WhatsApp dilewati: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}
