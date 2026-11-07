import { Body, Controller, Delete, Get, Inject, Injectable, Module, NotFoundException, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard, Roles, type AppRole } from '../guards/roles.guard';
import { Public } from '../decorators/public.decorator';
import { slugify } from '../utils/slugify';

export interface CrudConfig {
  /** nama delegate prisma, mis. 'category' */
  model: string;
  /** field yang boleh diisi dari request body (anti mass-assignment) */
  fields: string[];
  /** field pencarian teks */
  searchFields?: string[];
  orderBy?: Record<string, 'asc' | 'desc'>;
  /** role minimal untuk tulis */
  writeRoles: AppRole[];
  /** GET list/detail publik? */
  publicRead?: boolean;
  /** filter status=PUBLISHED pada endpoint publik */
  publicStatusFilter?: boolean;
  /** unit=null (global) ikut ditampilkan saat filter unit */
  includeGlobal?: boolean;
  /** model punya kolom slug yang diisi otomatis dari field ini */
  slugFrom?: 'title' | 'name';
  /** field tanggal yang perlu dikonversi dari string ISO ke Date */
  dateFields?: string[];
  /** field opsional yang string kosong ("") dari form harus disimpan sebagai null */
  emptyToNull?: string[];
  /** relasi prisma yang disertakan pada list & detail */
  include?: Record<string, unknown>;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export function makeCrudService(cfg: CrudConfig) {
  @Injectable()
  class CrudService {
    constructor(public readonly prisma: PrismaService) {}

    private get delegate(): any {
      return (this.prisma as any)[cfg.model];
    }

    private buildWhere(params: { unit?: string; q?: string; status?: string; extra?: Record<string, any> }) {
      const where: Record<string, any> = { ...(params.extra ?? {}) };
      if (params.unit) {
        // includeGlobal: item global (unit=null) ikut tampil — pakai OR di dalam AND
        // karena Prisma menolak null di dalam `in` untuk kolom enum nullable,
        // dan agar tidak menimpa OR milik pencarian `q`.
        if (cfg.includeGlobal) {
          where.AND = [...(where.AND ?? []), { OR: [{ unit: params.unit }, { unit: null }] }];
        } else {
          where.unit = params.unit;
        }
      }
      if (params.status) where.status = params.status;
      if (params.q && cfg.searchFields?.length) {
        where.OR = cfg.searchFields.map((f) => ({ [f]: { contains: params.q, mode: 'insensitive' } }));
      }
      return where;
    }

    async list(params: {
      page?: number;
      limit?: number;
      unit?: string;
      status?: string;
      q?: string;
      extra?: Record<string, any>;
    }) {
      const page = params.page ?? 1;
      const limit = Math.min(params.limit ?? 20, 100);
      const where = this.buildWhere({ ...params, extra: params.extra });
      const [items, total] = await Promise.all([
        this.delegate.findMany({
          where,
          ...(cfg.include ? { include: cfg.include } : {}),
          skip: (page - 1) * limit,
          take: limit,
          orderBy: cfg.orderBy ?? { updatedAt: 'desc' },
        }),
        this.delegate.count({ where }),
      ]);
      return { items, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
    }

    async findById(id: string) {
      const item = await this.delegate.findUnique({
        where: { id },
        ...(cfg.include ? { include: cfg.include } : {}),
      });
      if (!item) throw new NotFoundException('Data tidak ditemukan');
      return item;
    }

    async findBySlug(idOrSlug: string) {
      const item =
        (await this.delegate.findUnique({ where: { slug: idOrSlug }, ...(cfg.include ? { include: cfg.include } : {}) })) ??
        (await this.delegate.findUnique({ where: { id: idOrSlug }, ...(cfg.include ? { include: cfg.include } : {}) }));
      if (!item) throw new NotFoundException('Data tidak ditemukan');
      return item;
    }

    private async uniqueSlug(base: string): Promise<string> {
      let slug = base || 'item';
      let i = 1;
      while (await this.delegate.findUnique({ where: { slug } })) {
        slug = `${base}-${++i}`;
      }
      return slug;
    }

    private pick(dto: Record<string, any>): Record<string, any> {
      const data: Record<string, any> = {};
      for (const f of cfg.fields) {
        if (dto[f] !== undefined) data[f] = dto[f];
      }
      // Form web mengirim "" untuk pilihan yang dikosongkan (mis. unit global).
      // Kolom enum/relasi opsional menolak string kosong — simpan sebagai null.
      for (const f of cfg.emptyToNull ?? []) {
        if (data[f] === '') data[f] = null;
      }
      return data;
    }

    async create(dto: Record<string, any>, user?: { sub: string }) {
      const data = this.pick(dto);
      if (cfg.slugFrom && !data.slug) {
        data.slug = await this.uniqueSlug(slugify(String(data[cfg.slugFrom] ?? '')));
      }
      for (const f of cfg.dateFields ?? []) {
        if (typeof data[f] === 'string') data[f] = data[f] ? new Date(data[f]) : null;
      }
      if (data.status === 'PUBLISHED' && cfg.fields.includes('publishedAt') && !data.publishedAt) {
        data.publishedAt = new Date();
      }
      if (cfg.fields.includes('authorId') && !data.authorId && user) {
        data.authorId = user.sub;
      }
      return this.delegate.create({ data });
    }

    async update(id: string, dto: Record<string, any>) {
      const current = await this.findById(id);
      const data = this.pick(dto);
      if (data.slug && cfg.slugFrom) {
        const clash = await this.delegate.findUnique({ where: { slug: data.slug } });
        if (clash && clash.id !== id) data.slug = await this.uniqueSlug(data.slug);
      }
      for (const f of cfg.dateFields ?? []) {
        if (typeof data[f] === 'string') data[f] = data[f] ? new Date(data[f]) : null;
      }
      if (data.status === 'PUBLISHED' && cfg.fields.includes('publishedAt') && !current.publishedAt) {
        data.publishedAt = new Date();
      }
      return this.delegate.update({ where: { id }, data });
    }

    async remove(id: string) {
      await this.findById(id);
      await this.delegate.delete({ where: { id } });
      return { success: true };
    }
  }
  return CrudService;
}

export function makeCrudController(prefix: string, tag: string, cfg: CrudConfig) {
  const Service = makeCrudService(cfg);

  @ApiTags(tag)
  @Controller(prefix)
  class FactoryController {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(@Inject(Service) public readonly svc: any) {}

    @Get()
    @Public()
    list(
      @Query('page') page?: string,
      @Query('limit') limit?: string,
      @Query('unit') unit?: string,
      @Query('status') status?: string,
      @Query('q') q?: string,
    ) {
      return this.svc.list({
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
        unit,
        status: status ?? (cfg.publicStatusFilter ? 'PUBLISHED' : undefined),
        q,
      });
    }

    @Get('slug/:slug')
    @Public()
    bySlug(@Param('slug') slug: string) {
      return this.svc.findBySlug(slug);
    }

    @Get(':id')
    @Public()
    findById(@Param('id') id: string) {
      return this.svc.findById(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(...cfg.writeRoles)
    @ApiBearerAuth()
    create(@Body() dto: Record<string, any>) {
      return this.svc.create(dto);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(...cfg.writeRoles)
    @ApiBearerAuth()
    update(@Param('id') id: string, @Body() dto: Record<string, any>) {
      return this.svc.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(...cfg.writeRoles)
    @ApiBearerAuth()
    remove(@Param('id') id: string) {
      return this.svc.remove(id);
    }
  }
  return { Controller: FactoryController, Service };
}

export function makeCrudModule(prefix: string, tag: string, cfg: CrudConfig) {
  const { Controller, Service } = makeCrudController(prefix, tag, cfg);
  @Module({
    controllers: [Controller],
    providers: [Service],
    exports: [Service],
  })
  class FactoryModule {}
  return FactoryModule;
}
