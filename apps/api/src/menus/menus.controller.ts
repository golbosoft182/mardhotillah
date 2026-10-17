import { Body, Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MenusService } from './menus.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('menus')
@Controller('menus')
export class MenusController {
  constructor(private readonly menus: MenusService) {}

  @Public()
  @Get()
  async byLocation(@Query('location') location: 'HEADER' | 'FOOTER' = 'HEADER') {
    return this.menus.findByLocation(location);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/all')
  async all() {
    return this.menus.listAll();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put(':location')
  async save(
    @Param('location') location: 'HEADER' | 'FOOTER',
    @Body() body: { items: { label: string; url: string; order?: number; parentId?: string | null }[] },
  ) {
    return this.menus.upsertByLocation(location, body.items ?? []);
  }
}
