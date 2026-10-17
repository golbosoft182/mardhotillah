import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SeoService {
  constructor(private prisma: PrismaService) {}

  async list() {
    return this.prisma.seoSetting.findMany({ orderBy: { pageKey: 'asc' } });
  }

  async get(pageKey: string) {
    const seo = await this.prisma.seoSetting.findUnique({ where: { pageKey } });
    if (!seo) throw new NotFoundException('Pengaturan SEO tidak ditemukan');
    return seo;
  }

  async upsert(
    pageKey: string,
    dto: { title?: string; description?: string; ogImage?: string; noIndex?: boolean; canonicalOverride?: string },
  ) {
    return this.prisma.seoSetting.upsert({
      where: { pageKey },
      update: dto,
      create: { pageKey, ...dto },
    });
  }

  async remove(pageKey: string) {
    await this.get(pageKey);
    await this.prisma.seoSetting.delete({ where: { pageKey } });
    return { success: true };
  }
}
