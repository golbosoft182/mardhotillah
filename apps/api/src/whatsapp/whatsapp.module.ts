import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { GontakService } from './gontak.service';
import { WhatsappService } from './whatsapp.service';
import { WhatsappWebhookController } from './whatsapp-webhook.controller';

@Module({
  imports: [PrismaModule],
  controllers: [WhatsappWebhookController],
  providers: [GontakService, WhatsappService],
  exports: [GontakService, WhatsappService],
})
export class WhatsappModule {}
