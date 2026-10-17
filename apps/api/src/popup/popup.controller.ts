import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PopupService } from './popup.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { Public } from '../common/decorators/public.decorator';

interface PopupDto {
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
}

@ApiTags('popup')
@Controller('popup')
export class PopupController {
  constructor(private readonly svc: PopupService) {}

  /** Popup aktif saat ini. `?unit=PONPES|SMP|SMK` → popup khusus jenjang (fallback ke popup umum) */
  @Public()
  @Get('active')
  async active(@Query('unit') unit?: string) {
    return this.svc.active(unit);
  }

  /** Semua popup aktif yang sedang tayang — untuk tab pilihan jenjang di website */
  @Public()
  @Get('actives')
  async actives() {
    return this.svc.actives();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/all')
  async all() {
    return this.svc.all();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  async create(@Body() dto: PopupDto) {
    return this.svc.create(dto as { title: string; imageUrl: string });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: PopupDto) {
    return this.svc.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
