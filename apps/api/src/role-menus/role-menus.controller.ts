import { Body, Controller, Get, Param, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleMenusService } from './role-menus.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';

@ApiTags('role-menus')
@ApiBearerAuth()
@Controller('role-menus')
export class RoleMenusController {
  constructor(private readonly svc: RoleMenusService) {}

  /** Semua pengaturan akses menu (hanya ADMIN ke atas). */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  listAll() {
    return this.svc.listAll();
  }

  /** Pengaturan menu untuk peran pengguna yang sedang login (semua peran terautentikasi). */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: { user: { role: string } }) {
    return this.svc.forRole(req.user.role);
  }

  /** Tetapkan menu yang boleh diakses sebuah peran (hanya ADMIN ke atas). */
  @Put(':role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  set(@Param('role') role: string, @Body() dto: { menus?: string[] }) {
    return this.svc.setForRole(role, dto?.menus ?? []);
  }
}
