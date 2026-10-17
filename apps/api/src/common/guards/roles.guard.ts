import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export type AppRole = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'OSIS';

const ROLE_WEIGHT: Record<AppRole, number> = {
  OSIS: 1,
  EDITOR: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4,
};

export const ROLES_KEY = 'roles';
export const Roles = (...roles: AppRole[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<AppRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user as { role?: AppRole; unit?: string | null; sub?: string } | undefined;
    if (!user) return false;

    if (user.role === 'SUPER_ADMIN') return true;

    // weight check: user.role >= minimum weight of required roles
    const userWeight = ROLE_WEIGHT[user.role as AppRole] ?? 0;
    const minRequiredWeight = Math.min(...required.map((r) => ROLE_WEIGHT[r] ?? 99));
    if (userWeight < minRequiredWeight) return false;

    // unit-gate: user dengan unit terbatas hanya boleh mengelola konten unitnya
    if (user.unit && request.method !== 'GET') {
      const bodyUnit = (request.body as { unit?: string })?.unit;
      if (bodyUnit && bodyUnit !== user.unit) return false;
    }

    return true;
    }
}
