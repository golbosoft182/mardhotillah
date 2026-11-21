import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JobVacanciesService, type JobVacancyListParams } from './job-vacancies.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('job-vacancies')
@Controller('job-vacancies')
export class JobVacanciesController {
  constructor(private readonly svc: JobVacanciesService) {}

  /**
   * Daftar lowongan. Default hanya PUBLISHED (aman untuk publik).
   * CMS memakai `?status=ALL` untuk melihat seluruh status (termasuk draft).
   */
  @Get()
  @Public()
  list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('q') q?: string,
    @Query('company') company?: string,
    @Query('position') position?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('status') status?: string,
    @Query('sort') sort?: string,
  ) {
    const statusParam = status === 'ALL' ? undefined : (status ?? 'PUBLISHED');
    const params: JobVacancyListParams = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      q,
      company,
      position,
      from,
      to,
      status: statusParam,
      sort,
    };
    return this.svc.list(params);
  }

  /** Daftar nilai unik untuk dropdown filter (perusahaan & posisi). */
  @Get('filters')
  @Public()
  filters() {
    return this.svc.filters();
  }

  @Get(':id')
  @Public()
  findById(@Param('id') id: string) {
    return this.svc.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EDITOR')
  @ApiBearerAuth()
  create(@Body() dto: Record<string, unknown>) {
    return this.svc.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EDITOR')
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() dto: Record<string, unknown>) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EDITOR')
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
