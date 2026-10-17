import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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

  async upsertByLocation(
    location: 'HEADER' | 'FOOTER',
    items: {
      label: string;
      url: string;
      order?: number;
      children?: { label: string; url: string; order?: number }[];
    }[],
  ) {
    let menu = await this.prisma.menu.findFirst({ where: { location } });
    if (!menu) {
      menu = await this.prisma.menu.create({
        data: { location, name: location === 'HEADER' ? 'Navigasi Utama' : 'Footer' },
      });
    }
    await this.prisma.menuItem.deleteMany({ where: { menuId: menu.id } });
    for (const [i, item] of items.entries()) {
      const parent = await this.prisma.menuItem.create({
        data: {
          menuId: menu.id,
          label: item.label,
          url: item.url,
          order: item.order ?? i + 1,
        },
      });
      for (const [j, child] of (item.children ?? []).entries()) {
        await this.prisma.menuItem.create({
          data: {
            menuId: menu.id,
            label: child.label,
            url: child.url,
            order: child.order ?? j + 1,
            parentId: parent.id,
          },
        });
      }
    }
    return this.findByLocation(location);
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
