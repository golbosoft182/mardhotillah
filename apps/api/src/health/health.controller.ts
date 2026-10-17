import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', service: 'yayasan-api', timestamp: new Date().toISOString() };
  }

  @Get('ping')
  ping(@Res() res: Response) {
    res.status(200).send('pong');
  }
}
