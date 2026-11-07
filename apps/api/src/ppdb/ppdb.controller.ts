import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PpdbService } from './ppdb.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('ppdb')
@Controller('ppdb')
export class PpdbController {
  constructor(private readonly spmb: PpdbService) {}

  // ---------- Public ----------
  @Public()
  @Get('active')
  @ApiOperation({ summary: 'Periode SPMB aktif beserta seluruh kontennya' })
  async getActive() {
    return this.spmb.getActivePeriod();
  }

  @Public()
  @Get('faqs')
  @ApiOperation({ summary: 'FAQ SPMB aktif' })
  async faqs() {
    return this.spmb.listFaqs(true);
  }

  /** Pendaftaran online — dikirim calon peserta didik dari website */
  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Daftar SPMB online (publik)',
    description:
      'Formulir pendaftaran online untuk unit PONPES, SMP, atau SMK. ' +
      'Mengembalikan data pendaftaran termasuk kode registrasi unik (regCode) yang ditampilkan ke pendaftar.',
  })
  async register(
    @Body()
    dto: {
      fullName: string;
      nickname?: string;
      gender: string;
      birthPlace?: string;
      birthDate?: string;
      address?: string;
      unit: string;
      previousSchool?: string;
      parentName: string;
      parentPhone: string;
      parentEmail?: string;
      notes?: string;
    },
  ) {
    return this.spmb.createRegistration(dto);
  }

  // ================= Pendaftaran — Admin =================

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('registrations/stats')
  @ApiOperation({ summary: 'Statistik pendaftaran (total, per status, per unit)' })
  async registrationStats() {
    return this.spmb.registrationStats();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('registrations')
  @ApiOperation({
    summary: 'Daftar pendaftaran SPMB (terbaru → terlama)',
    description: 'Filter: unit (PONPES/SMP/SMK), status (PENDING/VERIFIED/REJECTED), pencarian q, paginasi page & limit.',
  })
  @ApiQuery({ name: 'unit', required: false, enum: ['PONPES', 'SMP', 'SMK'] })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'VERIFIED', 'REJECTED'] })
  @ApiQuery({ name: 'q', required: false, type: String, description: 'Cari nama, kode, nama ortu, atau no. WA' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async listRegistrations(
    @Query('unit') unit?: string,
    @Query('status') status?: string,
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.spmb.listRegistrations({
      unit,
      status,
      q,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('registrations/:id')
  @ApiOperation({ summary: 'Detail satu pendaftaran' })
  async getRegistration(@Param('id') id: string) {
    return this.spmb.getRegistration(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('registrations/:id/status')
  @ApiOperation({
    summary: 'Verifikasi / tolak / reset pendaftaran',
    description: 'status: VERIFIED | REJECTED | PENDING. Mencatat verifiedAt & verifiedBy otomatis.',
  })
  async setRegistrationStatus(
    @Param('id') id: string,
    @Body() dto: { status: 'VERIFIED' | 'REJECTED' | 'PENDING' },
    @CurrentUser() user?: { name?: string },
  ) {
    return this.spmb.updateRegistrationStatus(id, dto.status, user?.name);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('registrations/:id')
  @ApiOperation({ summary: 'Hapus pendaftaran' })
  async deleteRegistration(@Param('id') id: string) {
    return this.spmb.deleteRegistration(id);
  }

  // ---------- Admin ----------
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('periods')
  async listPeriods() {
    return this.spmb.listPeriods();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('periods')
  async createPeriod(@Body() dto: { name: string; year: string; startDate?: string; endDate?: string; brochureUrl?: string }) {
    return this.spmb.createPeriod(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put('periods/:id')
  async updatePeriod(
    @Param('id') id: string,
    @Body() dto: { name?: string; year?: string; isActive?: boolean; startDate?: string; endDate?: string; brochureUrl?: string },
  ) {
    return this.spmb.updatePeriod(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('periods/:id')
  async deletePeriod(@Param('id') id: string) {
    return this.spmb.deletePeriod(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put('periods/:id/content')
  async upsertContent(
    @Param('id') id: string,
    @Body() dto: { section: string; title?: string; body?: string; data?: any; order?: number },
  ) {
    return this.spmb.upsertContent(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('faqs/all')
  async allFaqs() {
    return this.spmb.listFaqs();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('faqs')
  async createFaq(@Body() dto: { periodId?: string; question: string; answer: string; order?: number }) {
    return this.spmb.createFaq(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put('faqs/:id')
  async updateFaq(@Param('id') id: string, @Body() dto: { question?: string; answer?: string; order?: number; isActive?: boolean }) {
    return this.spmb.updateFaq(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('faqs/:id')
  async deleteFaq(@Param('id') id: string) {
    return this.spmb.deleteFaq(id);
  }
}
