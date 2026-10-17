import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: { postId: string; name: string; email: string; body: string }) {
    return this.prisma.comment.create({ data: dto });
  }

  async list(approved?: boolean) {
    return this.prisma.comment.findMany({
      where: approved === undefined ? undefined : { isApproved: approved },
      include: { post: { select: { title: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approve(id: string) {
    return this.prisma.comment.update({ where: { id }, data: { isApproved: true } });
  }

  async remove(id: string) {
    await this.prisma.comment.delete({ where: { id } });
    return { success: true };
  }
}
