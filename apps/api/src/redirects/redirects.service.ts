import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RedirectsService {
  constructor(private prisma: PrismaService) {}

  async list() {
    return this.prisma.redirect.findMany({ orderBy: { fromPath: 'asc' } });
  }

  async create(dto: { fromPath: string; toPath: string; statusCode?: number }) {
    return this.prisma.redirect.create({
      data: { fromPath: dto.fromPath, toPath: dto.toPath, statusCode: dto.statusCode ?? 301 },
    });
  }

  async update(id: string, dto: { fromPath?: string; toPath?: string; statusCode?: number }) {
    await this.find(id);
    return this.prisma.redirect.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.find(id);
    await this.prisma.redirect.delete({ where: { id } });
    return { success: true };
  }

  private async find(id: string) {
    const r = await this.prisma.redirect.findUnique({ where: { id } });
    if (!r) throw new NotFoundException('Redirect tidak ditemukan');
    return r;
  }
}
