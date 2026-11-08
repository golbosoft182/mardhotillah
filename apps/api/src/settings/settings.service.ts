import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  /** Key yang tidak boleh tampil di endpoint publik (mis. nomor admin WhatsApp). */
  private static readonly PRIVATE_KEYS = new Set(['whatsapp_admin_numbers']);

  async all(): Promise<Record<string, unknown>> {
    const rows = await this.prisma.setting.findMany();
    const out: Record<string, unknown> = {};
    for (const r of rows) out[r.key] = r.value;
    return out;
  }

  /** Versi untuk situs publik: tanpa key sensitif. */
  async publicAll(): Promise<Record<string, unknown>> {
    const all = await this.all();
    for (const key of SettingsService.PRIVATE_KEYS) delete all[key];
    return all;
  }

  async updateMany(body: Record<string, unknown>) {
    for (const [key, value] of Object.entries(body)) {
      await this.prisma.setting.upsert({
        where: { key },
        update: { value: value as object },
        create: { key, value: value as object },
      });
    }
    return this.all();
  }
}
