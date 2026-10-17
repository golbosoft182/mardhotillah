import { Body, Controller, Delete, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SeoService } from './seo.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('seo')
@Controller('seo')
export class SeoController {
  constructor(private readonly seo: SeoService) {}

  @Public()
  @Get()
  async list() {
    return this.seo.list();
  }

  @Public()
  @Get(':pageKey')
  async get(@Param('pageKey') pageKey: string) {
    return this.seo.get(pageKey);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put(':pageKey')
  async upsert(
    @Param('pageKey') pageKey: string,
    @Body() dto: { title?: string; description?: string; ogImage?: string; noIndex?: boolean; canonicalOverride?: string },
  ) {
    return this.seo.upsert(pageKey, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':pageKey')
  async remove(@Param('pageKey') pageKey: string) {
    return this.seo.remove(pageKey);
  }
}
