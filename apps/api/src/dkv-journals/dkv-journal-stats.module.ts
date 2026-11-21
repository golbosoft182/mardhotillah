import { Controller, Module, Param, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../common/decorators/public.decorator';

// Endpoint publik khusus penghitung Jurnal DKV (dilihat & diunduh).
// Dipisah dari CRUD generik karena operasinya increment, bukan set field biasa.
@ApiTags('dkv-journals')
@Controller('dkv-journals')
export class DkvJournalStatsController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Patch(':id/view')
  @ApiOperation({ summary: 'Tambah penghitung dilihat (view) Jurnal DKV' })
  async view(@Param('id') id: string) {
    await this.prisma.dkvJournal.update({ where: { id }, data: { viewCount: { increment: 1 } } });
    return { success: true };
  }

  @Public()
  @Patch(':id/download')
  @ApiOperation({ summary: 'Tambah penghitung unduhan (download) & kembalikan berkas Jurnal DKV' })
  async download(@Param('id') id: string) {
    const journal = await this.prisma.dkvJournal.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
      select: { fileUrl: true, fileName: true, downloadCount: true },
    });
    return { success: true, ...journal };
  }
}

@Module({ controllers: [DkvJournalStatsController] })
export class DkvJournalStatsModule {}
