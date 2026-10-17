import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { HomeSectionsService } from './home-sections.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('home-sections')
@Controller('home-sections')
export class HomeSectionsController {
  constructor(private readonly svc: HomeSectionsService) {}

  /** Semua section beranda untuk website publik */
  @Public()
  @Get()
  async all() {
    return this.svc.all();
  }

  @Public()
  @Get(':key')
  async byKey(@Param('key') key: string) {
    return this.svc.byKey(key);
  }

  /** Simpan konten section (ADMIN ke atas) */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put(':key')
  async upsert(@Param('key') key: string, @Body() body: { label?: string; data: unknown; isActive?: boolean }) {
    return this.svc.upsert(key, body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':key')
  async reset(@Param('key') key: string) {
    return this.svc.remove(key);
  }
}
