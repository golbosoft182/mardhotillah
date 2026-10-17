import { Injectable, NotFoundException } from '@nestjs/common';
import { Unit } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const UNIT_VALUES: Unit[] = ['YAYASAN', 'PONPES', 'SMP', 'SMK'];

/** Normalisasi input unit: null/''/invalid → null (popup umum/Yayasan) */
function normalizeUnit(unit?: string | null): Unit | null {
  if (!unit) return null;
  const upper = unit.toUpperCase();
  return (UNIT_VALUES as string[]).includes(upper) ? (upper as Unit) : null;
}

@Injectable()
export class PopupService {
  constructor(private prisma: PrismaService) {}

  /**
   * Popup aktif untuk jenjang tertentu.
   * Jika tidak ada popup khusus jenjang tersebut, jatuh ke popup umum (unit null).
   */
  async active(unit?: string | null) {
    const now = new Date();
    const target = normalizeUnit(unit);

    const candidates = await this.prisma.popup.findMany({
      where: {
        isActive: true,
        ...(target ? { OR: [{ unit: target }, { unit: null }] } : {}),
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });
    const inSchedule = candidates.filter(
      (p) =>
        (!p.startDate || p.startDate <= now) && (!p.endDate || p.endDate >= now),
    );
    // prioritaskan popup khusus jenjang di atas popup umum
    return inSchedule.find((p) => p.unit === target && target !== null) ?? inSchedule[0] ?? null;
  }

  /** Semua popup aktif yang sedang dalam jadwal tayang (untuk tab pilihan jenjang di website) */
  async actives() {
    const now = new Date();
    const popups = await this.prisma.popup.findMany({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });
    return popups.filter(
      (p) =>
        (!p.startDate || p.startDate <= now) && (!p.endDate || p.endDate >= now),
    );
  }

  async all() {
    return this.prisma.popup.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  async create(dto: {
    title: string;
    imageUrl: string;
    unit?: string | null;
    linkUrl?: string;
    buttonText?: string;
    widthDesktop?: number;
    widthTablet?: number;
    widthMobile?: number;
    isActive?: boolean;
    startDate?: string;
    endDate?: string;
  }) {
    const { startDate, endDate, unit, ...rest } = dto;
    // hanya satu popup aktif per jenjang pada satu waktu
    const normUnit = normalizeUnit(unit);
    if (rest.isActive !== false) {
      await this.deactivateOthers(normUnit);
    }
    return this.prisma.popup.create({
      data: {
        ...rest,
        unit: normUnit,
        isActive: rest.isActive ?? true,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
    });
  }

  async update(
    id: string,
    dto: {
      title?: string;
      imageUrl?: string;
      unit?: string | null;
      linkUrl?: string;
      buttonText?: string;
      widthDesktop?: number;
      widthTablet?: number;
      widthMobile?: number;
      isActive?: boolean;
      startDate?: string;
      endDate?: string;
    },
  ) {
    await this.find(id);
    const { startDate, endDate, unit, ...rest } = dto;
    const normUnit = 'unit' in dto ? normalizeUnit(unit) : undefined;
    if (rest.isActive) {
      await this.deactivateOthers(normUnit ?? null, id);
    }
    return this.prisma.popup.update({
      where: { id },
      data: {
        ...rest,
        ...(normUnit !== undefined ? { unit: normUnit } : {}),
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.find(id);
    await this.prisma.popup.delete({ where: { id } });
    return { success: true };
  }

  /** Nonaktifkan popup lain yang aktif pada jenjang yang sama */
  private async deactivateOthers(unit: Unit | null, exceptId?: string) {
    await this.prisma.popup.updateMany({
      where: {
        isActive: true,
        unit,
        ...(exceptId ? { NOT: { id: exceptId } } : {}),
      },
      data: { isActive: false },
    });
  }

  private async find(id: string) {
    const popup = await this.prisma.popup.findUnique({ where: { id } });
    if (!popup) throw new NotFoundException('Popup tidak ditemukan');
    return popup;
  }
}
