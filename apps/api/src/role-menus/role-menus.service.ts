/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** Daftar semua pengaturan akses menu per peran. */
@Injectable()
export class RoleMenusService {
  constructor(private readonly prisma: PrismaService) {}

  listAll() {
    return this.prisma.roleMenu.findMany({ orderBy: { role: 'asc' } });
  }

  /** Pengaturan menu untuk satu peran. `menus` null bila peran belum diatur. */
  async forRole(role: string) {
    const row = await this.prisma.roleMenu.findUnique({ where: { role: role as any } });
    return { role, menus: row?.menus ?? null };
  }

  /** Simpan (upsert) daftar key menu yang diizinkan untuk sebuah peran. */
  setForRole(role: string, menus: string[]) {
    const clean = [...new Set((menus ?? []).map((m) => String(m)))];
    return this.prisma.roleMenu.upsert({
      where: { role: role as any },
      create: { role: role as any, menus: clean },
      update: { menus: clean },
    });
  }
}
