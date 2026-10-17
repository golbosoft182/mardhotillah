import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService) {}

  async create(file: Express.Multer.File, uploadedById?: string) {
    const publicUrl = `${(process.env.API_PUBLIC_URL ?? '').replace(/\/$/, '')}/uploads/${file.filename}`;
    return this.prisma.media.create({
      data: {
        filename: file.filename,
        url: publicUrl,
        mimeType: file.mimetype,
        size: file.size,
        title: file.originalname,
        folder: '/',
        uploadedById,
      },
    });
  }

  async list(params: { page?: number; limit?: number; q?: string; mimeType?: string }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 24, 100);
    const where: Record<string, unknown> = {};
    if (params.q) {
      where.OR = [
        { title: { contains: params.q, mode: 'insensitive' } },
        { filename: { contains: params.q, mode: 'insensitive' } },
      ];
    }
    if (params.mimeType) where.mimeType = { contains: params.mimeType.split('/')[0] };

    const [items, total] = await Promise.all([
      this.prisma.media.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.media.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
  }

  async findById(id: string) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) throw new NotFoundException('Media tidak ditemukan');
    return media;
  }

  async update(id: string, data: { title?: string; alt?: string; folder?: string }) {
    await this.findById(id);
    return this.prisma.media.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.media.delete({ where: { id } });
    return { success: true };
  }
}
