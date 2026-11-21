import { Module } from '@nestjs/common';
import { RoleMenusController } from './role-menus.controller';
import { RoleMenusService } from './role-menus.service';

@Module({
  controllers: [RoleMenusController],
  providers: [RoleMenusService],
  exports: [RoleMenusService],
})
export class RoleMenusModule {}
