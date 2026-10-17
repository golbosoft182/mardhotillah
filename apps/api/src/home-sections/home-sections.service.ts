import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HomeSectionsService {
  constructor(private prisma: PrismaService) {}

  async all() {
    return this.prisma.homeSection.findMany({ where: { isActive: true }, orderBy: { key: 'asc' } });
  }

  async byKey(key: string) {
    const row = await this.prisma.homeSection.findUnique({ where: { key } });
    if (!row) throw new NotFoundException('Section tidak ditemukan');
    return row;
  }

  async upsert(key: string, body: { label?: string; data: unknown; isActive?: boolean }) {
    return this.prisma.homeSection.upsert({
      where: { key },
      update: {
        ...(body.label !== undefined ? { label: body.label } : {}),
        ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
        data: body.data as object,
      },
      create: {
        key,
        label: body.label ?? key,
        data: body.data as object,
        isActive: body.isActive ?? true,
      },
    });
  }

  async remove(key: string) {
    await this.prisma.homeSection.deleteMany({ where: { key } });
    return { success: true };
  }
}
