import { Module } from '@nestjs/common';
import { PpdbController } from './ppdb.controller';
import { PpdbService } from './ppdb.service';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [WhatsappModule],
  controllers: [PpdbController],
  providers: [PpdbService],
  exports: [PpdbService],
})
export class PpdbModule {}
