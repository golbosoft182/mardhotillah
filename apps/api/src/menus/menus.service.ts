import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** Satu simpul menu (rekursif) — dipakai untuk menyimpan pohon menu dari CMS. */
export type MenuItemInput = {
  label: string;
  url: string;
  order?: number;
  children?: MenuItemInput[];
};

type MenuItemNode = {
  id: string;
  label: string;
  url: string;
  order: number;
  children: MenuItemNode[];
};

@Injectable()
export class MenusService {
  constructor(private prisma: PrismaService) {}

  async findByLocation(location: 'HEADER' | 'FOOTER') {
    const menu = await this.prisma.menu.findFirst({
      where: { location },
      include: { items: { orderBy: { order: 'asc' } } },
    });
    if (!menu) return { id: null, name: null, location, items: [] as MenuItemNode[] };
    return { id: menu.id, name: menu.name, location: menu.location, items: this.buildTree(menu.items) };
  }

  async listAll() {
    return this.prisma.menu.findMany({
      include: { items: { orderBy: { order: 'asc' } } },
      orderBy: { location: 'asc' },
    });
  }

  async upsertByLocation(location: 'HEADER' | 'FOOTER', items: MenuItemInput[]) {
    let menu = await this.prisma.menu.findFirst({ where: { location } });
    if (!menu) {
      menu = await this.prisma.menu.create({
        data: { location, name: location === 'HEADER' ? 'Navigasi Utama' : 'Footer' },
      });
    }
    await this.prisma.menuItem.deleteMany({ where: { menuId: menu.id } });
    await this.createItems(menu.id, items, null);
    return this.findByLocation(location);
  }

  /** Simpan pohon menu secara rekursif — kedalaman tidak dibatasi. */
  private async createItems(menuId: string, items: MenuItemInput[], parentId: string | null) {
    for (const [i, item] of items.entries()) {
      const created = await this.prisma.menuItem.create({
        data: {
          menuId,
          label: item.label,
          url: item.url ?? '/',
          order: item.order ?? i + 1,
          parentId,
        },
      });
      if (item.children?.length) {
        await this.createItems(menuId, item.children, created.id);
      }
    }
  }

  private buildTree(items: { id: string; label: string; url: string; order: number; parentId: string | null }[]): MenuItemNode[] {
    const map = new Map<string, MenuItemNode>();
    const roots: MenuItemNode[] = [];
    for (const i of items) {
      map.set(i.id, { id: i.id, label: i.label, url: i.url, order: i.order, children: [] });
    }
    for (const i of items) {
      const node = map.get(i.id)!;
      if (i.parentId && map.has(i.parentId)) {
        map.get(i.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }
}
