import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Daftar user (hanya ADMIN ke atas)' })
  async list(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('role') role?: string,
    @Query('q') q?: string,
  ) {
    return this.users.list(Number(page), Number(limit), role, q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail user' })
  async findById(@Param('id') id: string) {
    return this.users.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Buat user baru (ADMIN ke atas)' })
  async create(@Body() dto: CreateUserDto) {
    return this.users.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Perbarui user' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.users.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Nonaktifkan user (soft delete)' })
  async remove(@Param('id') id: string) {
    return this.users.deactivate(id);
  }
}
