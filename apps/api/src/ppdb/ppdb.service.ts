import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const VALID_UNITS = ['PONPES', 'SMP', 'SMK'];

@Injectable()
export class PpdbService {
  constructor(private prisma: PrismaService) {}

  // ================= Pendaftaran Online =================

  async createRegistration(dto: {
    fullName: string;
    nickname?: string;
    gender: string;
    birthPlace?: string;
    birthDate?: string;
    address?: string;
    unit: string;
    previousSchool?: string;
    parentName: string;
    parentPhone: string;
    parentEmail?: string;
    notes?: string;
  }) {
    if (!VALID_UNITS.includes(dto.unit)) {
      throw new BadRequestException('Unit tidak valid. Pilih PONPES, SMP, atau SMK.');
    }
    if (!/^[0-9+\-() ]{8,20}$/.test(dto.parentPhone)) {
      throw new BadRequestException('Nomor WhatsApp/telepon tidak valid.');
    }
    // Kode unik: PPDB-<tahun>-<6 karakter>, coba beberapa kali bila tabrakan
    let regCode = '';
    for (let i = 0; i < 5; i++) {
      const candidate = `PPDB-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const clash = await this.prisma.ppdbRegistration.findUnique({ where: { regCode: candidate } });
      if (!clash) {
        regCode = candidate;
        break;
      }
    }
    if (!regCode) throw new BadRequestException('Gagal membuat kode pendaftaran, coba lagi.');

    const activePeriod = await this.prisma.spmbPeriod.findFirst({ where: { isActive: true } });
    return this.prisma.ppdbRegistration.create({
      data: {
        regCode,
        fullName: dto.fullName.trim(),
        nickname: dto.nickname?.trim() || null,
        gender: dto.gender === 'FEMALE' ? 'FEMALE' : 'MALE',
        birthPlace: dto.birthPlace?.trim() || null,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
        address: dto.address?.trim() || null,
        unit: dto.unit,
        previousSchool: dto.previousSchool?.trim() || null,
        parentName: dto.parentName.trim(),
        parentPhone: dto.parentPhone.trim(),
        parentEmail: dto.parentEmail?.trim() || null,
        notes: dto.notes?.trim() || null,
        periodId: activePeriod?.id ?? null,
      },
    });
  }

  async listRegistrations(opts: {
    unit?: string;
    status?: string;
    q?: string;
    page?: number;
    limit?: number;
  }) {
    const where: Record<string, unknown> = {};
    if (opts.unit && VALID_UNITS.includes(opts.unit)) where.unit = opts.unit;
    if (opts.status && ['PENDING', 'VERIFIED', 'REJECTED'].includes(opts.status)) where.status = opts.status;
    if (opts.q) {
      where.OR = [
        { fullName: { contains: opts.q } },
        { regCode: { contains: opts.q } },
        { parentName: { contains: opts.q } },
        { parentPhone: { contains: opts.q } },
      ];
    }
    const page = Math.max(1, opts.page ?? 1);
    const limit = Math.min(100, Math.max(1, opts.limit ?? 20));
    const [items, total] = await Promise.all([
      this.prisma.ppdbRegistration.findMany({
        where,
        orderBy: { createdAt: 'desc' }, // terbaru → terlama
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.ppdbRegistration.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async registrationStats() {
    const [total, pending, verified, rejected, ponpes, smp, smk] = await Promise.all([
      this.prisma.ppdbRegistration.count(),
      this.prisma.ppdbRegistration.count({ where: { status: 'PENDING' } }),
      this.prisma.ppdbRegistration.count({ where: { status: 'VERIFIED' } }),
      this.prisma.ppdbRegistration.count({ where: { status: 'REJECTED' } }),
      this.prisma.ppdbRegistration.count({ where: { unit: 'PONPES' } }),
      this.prisma.ppdbRegistration.count({ where: { unit: 'SMP' } }),
      this.prisma.ppdbRegistration.count({ where: { unit: 'SMK' } }),
    ]);
    return { total, pending, verified, rejected, byUnit: { PONPES: ponpes, SMP: smp, SMK: smk } };
  }

  async getRegistration(id: string) {
    const reg = await this.prisma.ppdbRegistration.findUnique({ where: { id } });
    if (!reg) throw new NotFoundException('Pendaftaran tidak ditemukan');
    return reg;
  }

  async updateRegistrationStatus(
    id: string,
    status: 'VERIFIED' | 'REJECTED' | 'PENDING',
    actorName?: string,
  ) {
    const reg = await this.prisma.ppdbRegistration.findUnique({ where: { id } });
    if (!reg) throw new NotFoundException('Pendaftaran tidak ditemukan');
    return this.prisma.ppdbRegistration.update({
      where: { id },
      data: {
        status,
        verifiedAt: status === 'PENDING' ? null : new Date(),
        verifiedBy: status === 'PENDING' ? null : (actorName ?? 'Admin'),
      },
    });
  }

  async deleteRegistration(id: string) {
    const reg = await this.prisma.ppdbRegistration.findUnique({ where: { id } });
    if (!reg) throw new NotFoundException('Pendaftaran tidak ditemukan');
    await this.prisma.ppdbRegistration.delete({ where: { id } });
    return { success: true };
  }

  async getActivePeriod() {
    const period = await this.prisma.spmbPeriod.findFirst({
      where: { isActive: true },
      include: {
        content: { orderBy: { order: 'asc' } },
        faqs: { where: { isActive: true }, orderBy: { order: 'asc' } },
      },
    });
    if (!period) throw new NotFoundException('Belum ada periode SPMB aktif');
    return period;
  }

  async listPeriods() {
    return this.prisma.spmbPeriod.findMany({
      include: { _count: { select: { content: true, faqs: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createPeriod(dto: {
    name: string;
    year: string;
    startDate?: string;
    endDate?: string;
    brochureUrl?: string;
    isActive?: boolean;
  }) {
    const { startDate, endDate, ...rest } = dto;
    return this.prisma.spmbPeriod.create({
      data: {
        ...rest,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
    });
  }

  async updatePeriod(
    id: string,
    dto: {
      name?: string;
      year?: string;
      isActive?: boolean;
      startDate?: string;
      endDate?: string;
      brochureUrl?: string;
    },
  ) {
    await this.findPeriod(id);
    const { startDate, endDate, ...rest } = dto;
    // hanya satu periode aktif
    if (rest.isActive) {
      await this.prisma.spmbPeriod.updateMany({ where: { isActive: true }, data: { isActive: false } });
    }
    return this.prisma.spmbPeriod.update({
      where: { id },
      data: {
        ...rest,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
    });
  }

  async deletePeriod(id: string) {
    await this.findPeriod(id);
    await this.prisma.spmbPeriod.delete({ where: { id } });
    return { success: true };
  }

  async upsertContent(
    periodId: string,
    dto: { section: string; title?: string; body?: string; data?: any; order?: number },
  ) {
    await this.findPeriod(periodId);
    const existing = await this.prisma.spmbContent.findFirst({
      where: { periodId, section: dto.section },
    });
    if (existing) {
      return this.prisma.spmbContent.update({
        where: { id: existing.id },
        data: { title: dto.title, body: dto.body, data: dto.data ?? undefined, order: dto.order },
      });
    }
    return this.prisma.spmbContent.create({
      data: {
        periodId,
        section: dto.section,
        title: dto.title,
        body: dto.body,
        data: dto.data ?? undefined,
        order: dto.order ?? 0,
      },
    });
  }

  async listFaqs(activeOnly?: boolean) {
    return this.prisma.spmbFaq.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { order: 'asc' },
    });
  }

  async createFaq(dto: { periodId?: string; question: string; answer: string; order?: number }) {
    return this.prisma.spmbFaq.create({ data: dto });
  }

  async updateFaq(id: string, dto: { question?: string; answer?: string; order?: number; isActive?: boolean }) {
    await this.prisma.spmbFaq.findUnique({ where: { id } }).then((f) => {
      if (!f) throw new NotFoundException('FAQ tidak ditemukan');
    });
    return this.prisma.spmbFaq.update({ where: { id }, data: dto });
  }

  async deleteFaq(id: string) {
    await this.prisma.spmbFaq.findUnique({ where: { id } }).then((f) => {
      if (!f) throw new NotFoundException('FAQ tidak ditemukan');
    });
    await this.prisma.spmbFaq.delete({ where: { id } });
    return { success: true };
  }

  private async findPeriod(id: string) {
    const period = await this.prisma.spmbPeriod.findUnique({ where: { id } });
    if (!period) throw new NotFoundException('Periode SPMB tidak ditemukan');
    return period;
  }
}
