/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** Field yang boleh diisi dari request body (anti mass-assignment). */
const WRITABLE = [
  'company',
  'position',
  'location',
  'employmentType',
  'salary',
  'description',
  'requirements',
  'contact',
  'applyUrl',
  'image',
  'postedAt',
  'deadline',
  'status',
] as const;

/** Field teks opsional: string kosong dari form disimpan sebagai null. */
const NULLABLE_TEXT = ['location', 'employmentType', 'salary', 'description', 'requirements', 'contact', 'applyUrl', 'image'];

export interface JobVacancyListParams {
  page?: number;
  limit?: number;
  q?: string;
  company?: string;
  position?: string;
  from?: string;
  to?: string;
  status?: string;
  sort?: string;
}

@Injectable()
export class JobVacanciesService {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(p: JobVacancyListParams) {
    const where: any = {};
    if (p.status) where.status = p.status;
    if (p.company) where.company = p.company;
    if (p.position) where.position = p.position;
    if (p.q) {
      where.OR = [
        { company: { contains: p.q, mode: 'insensitive' } },
        { position: { contains: p.q, mode: 'insensitive' } },
        { location: { contains: p.q, mode: 'insensitive' } },
      ];
    }
    // Filter rentang tanggal terbit: ?from=YYYY-MM-DD&to=YYYY-MM-DD
    if (p.from || p.to) {
      const range: any = {};
      if (p.from) range.gte = new Date(`${p.from}T00:00:00.000Z`);
      if (p.to) range.lte = new Date(`${p.to}T23:59:59.999Z`);
      where.postedAt = range;
    }
    return where;
  }

  async list(p: JobVacancyListParams) {
    const page = p.page ?? 1;
    const limit = Math.min(p.limit ?? 20, 100);
    const where = this.buildWhere(p);
    const orderBy = p.sort === 'oldest' ? { postedAt: 'asc' as const } : { postedAt: 'desc' as const };
    const [items, total] = await Promise.all([
      this.prisma.jobVacancy.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy }),
      this.prisma.jobVacancy.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
  }

  /** Daftar nilai unik untuk dropdown filter (perusahaan & posisi). */
  async filters() {
    const rows = await this.prisma.jobVacancy.findMany({
      where: { status: 'PUBLISHED' },
      select: { company: true, position: true },
    });
    const uniq = (vals: string[]) =>
      [...new Set(vals)].sort((a, b) => a.localeCompare(b, 'id'));
    return {
      companies: uniq(rows.map((r) => r.company)),
      positions: uniq(rows.map((r) => r.position)),
    };
  }

  async findById(id: string) {
    const item = await this.prisma.jobVacancy.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Lowongan tidak ditemukan');
    return item;
  }

  private pick(dto: Record<string, any>) {
    const data: any = {};
    for (const f of WRITABLE) if (dto[f] !== undefined) data[f] = dto[f];
    for (const f of NULLABLE_TEXT) if (data[f] === '') data[f] = null;
    for (const f of ['postedAt', 'deadline']) {
      if (typeof data[f] === 'string') data[f] = data[f] ? new Date(data[f]) : null;
    }
    // postedAt wajib (non-null) — buang bila kosong agar memakai default kolom.
    if (!data.postedAt) delete data.postedAt;
    return data;
  }

  async create(dto: Record<string, any>) {
    const data = this.pick(dto);
    if (data.status === 'PUBLISHED' && !dto.postedAt) data.postedAt = new Date();
    return this.prisma.jobVacancy.create({ data });
  }

  async update(id: string, dto: Record<string, any>) {
    await this.findById(id);
    return this.prisma.jobVacancy.update({ where: { id }, data: this.pick(dto) });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.jobVacancy.delete({ where: { id } });
    return { success: true };
  }
}
