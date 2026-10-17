import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class UnitGateMiddleware implements NestMiddleware {
  use(req: Request & { user?: any }, _res: Response, next: NextFunction) {
    const user = req.user;
    if (user && user.unit && req.method !== 'GET') {
      const body = req.body as { unit?: string } | undefined;
      const unit: string | undefined =
        body?.unit ?? (req.params?.unit as string | undefined);
      if (unit && unit !== user.unit) {
        throw new ForbiddenException(
          'Akses ditolak: Anda hanya dapat mengelola konten unit Anda sendiri',
        );
      }
    }
    next();
  }
}
