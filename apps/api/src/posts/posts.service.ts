import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
import { slugify } from '../common/utils/slugify';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async list(params: {
    page?: number;
    limit?: number;
    unit?: string;
    type?: string;
    status?: string;
    category?: string;
    tag?: string;
    q?: string;
    year?: number;
  }) {
    const { page = 1, limit = 12, unit, type, status, category, tag, q, year } = params;
    const where: Record<string, unknown> = {};

    if (unit) where.unit = unit;
    if (type) where.type = type;
    if (status) where.status = status;
    if (category) where.category = { slug: category };
    if (tag) where.tags = { some: { tag: { slug: tag } } };
    if (year) {
      where.publishedAt = {
        gte: new Date(`${year}-01-01T00:00:00Z`),
        lt: new Date(`${year + 1}-01-01T00:00:00Z`),
      };
    }
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { excerpt: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        include: { author: { select: { id: true, name: true, avatar: true } }, category: true, tags: { include: { tag: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.post.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.post.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, name: true, avatar: true, bio: true } },
        category: true,
        tags: { include: { tag: true } },
      },
    });
    if (!post) throw new NotFoundException('Artikel tidak ditemukan');
    return post;
  }

  async findById(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true } }, category: true, tags: { include: { tag: true } } },
    });
    if (!post) throw new NotFoundException('Artikel tidak ditemukan');
    return post;
  }

  async create(dto: CreatePostDto, user?: { sub: string; role: string; unit: string | null }) {
    // OSIS hanya boleh membuat artikel sekolah dengan status REVIEW/DRAFT
    if (user?.role === 'OSIS') {
      if (!['BERITA', 'ARTIKEL', 'OPINI', 'POJOK_SISWA'].includes(dto.type)) {
        throw new ForbiddenException('OSIS hanya dapat membuat artikel sekolah');
      }
      if (dto.status && !['DRAFT', 'REVIEW'].includes(dto.status)) {
        throw new ForbiddenException('OSIS tidak dapat mempublikasikan artikel');
      }
    }
    const { tagIds, ...rest } = dto;
    const slug = rest.slug?.trim() || (await this.uniqueSlug(slugify(rest.title)));
    const data = {
      ...rest,
      slug,
      authorId: rest.authorId ?? user?.sub,
      publishedAt: rest.publishedAt ? new Date(rest.publishedAt) : undefined,
      tags: tagIds
        ? { create: tagIds.map((tagId) => ({ tagId })) }
        : undefined,
    };
    return this.prisma.post.create({ data, include: { tags: { include: { tag: true } } } });
  }

  async update(id: string, dto: UpdatePostDto, user?: { sub: string; role: string; unit: string | null }) {
    const post = await this.findById(id);
    if (user?.role === 'OSIS' && post.authorId !== user.sub) {
      throw new ForbiddenException('Anda hanya dapat mengubah artikel milik Anda sendiri');
    }
    if (user?.role === 'OSIS' && dto.status && !['DRAFT', 'REVIEW'].includes(dto.status)) {
      throw new ForbiddenException('OSIS tidak dapat mempublikasikan artikel');
    }
    const { tagIds, ...rest } = dto;
    const data: Record<string, unknown> = { ...rest };
    if (rest.publishedAt) data.publishedAt = new Date(rest.publishedAt);
    if (tagIds) {
      data.tags = { deleteMany: {}, create: tagIds.map((tagId) => ({ tagId })) };
    }
    return this.prisma.post.update({
      where: { id },
      data,
      include: { tags: { include: { tag: true } } },
    });
  }

  async remove(id: string, user?: { sub: string; role: string }) {
    const post = await this.findById(id);
    if (user?.role === 'OSIS' && post.authorId !== user.sub) {
      throw new ForbiddenException('Anda hanya dapat menghapus artikel milik Anda sendiri');
    }
    await this.prisma.post.delete({ where: { id } });
    return { success: true };
  }

  async incrementView(id: string) {
    await this.prisma.post.update({ where: { id }, data: { viewCount: { increment: 1 } } });
    return { success: true };
  }

  private async uniqueSlug(base: string): Promise<string> {
    let slug = base;
    let i = 1;
    while (await this.prisma.post.findUnique({ where: { slug } })) {
      slug = `${base}-${++i}`;
    }
    return slug;
  }
}
