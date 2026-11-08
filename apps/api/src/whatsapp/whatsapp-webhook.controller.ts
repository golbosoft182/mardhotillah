import { Body, Controller, Get, Headers, HttpCode, Logger, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';

/**
 * Webhook Gontak — daftarkan URL ini di dashboard Gontak
 * (Webhooks): https://<domain>/api/webhooks/whatsapp
 *
 * Gontak mengirim POST JSON untuk event pesan masuk / status pengiriman.
 * Endpoint ini hanya menerima, mencatat ke log, dan membalas 200 agar
 * Gontak tidak menganggap pengiriman webhook gagal.
 *
 * Bila env GONTAK_WEBHOOK_SECRET diisi, request wajib menyertakan nilai yang
 * sama pada header `X-Webhook-Secret` atau query `?secret=`.
 */
@ApiTags('whatsapp')
@Controller('webhooks/whatsapp')
export class WhatsappWebhookController {
  private readonly logger = new Logger('GontakWebhook');
  private readonly token = process.env.GONTAK_WEBHOOK_SECRET?.trim() ?? '';

  private authorized(header?: string, query?: string): boolean {
    if (!this.token) return true;
    return header === this.token || query === this.token;
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Cek endpoint webhook WhatsApp (publik)' })
  ping(@Query('secret') secret?: string, @Headers('x-webhook-secret') header?: string) {
    if (!this.authorized(header, secret)) return { status: 401, message: 'invalid secret', data: false };
    return { status: 200, message: 'WhatsApp webhook siap', data: true };
  }

  @Public()
  @Post()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Terima event webhook dari Gontak (publik)',
    description: 'Menerima payload pesan masuk/status pengiriman WhatsApp, mencatatnya di log, lalu membalas 200.',
  })
  receive(
    @Body() body: unknown,
    @Query('secret') query?: string,
    @Headers('x-webhook-secret') header?: string,
  ) {
    if (!this.authorized(header, query)) {
      return { status: 401, message: 'invalid secret', data: false };
    }
    try {
      this.logger.log(`Event masuk: ${JSON.stringify(body).slice(0, 1000)}`);
    } catch {
      this.logger.log('Event masuk (payload tidak dapat diserialisasi)');
    }
    return { status: 200, message: 'ok', data: true };
  }
}
