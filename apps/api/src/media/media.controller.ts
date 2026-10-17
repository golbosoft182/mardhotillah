import { ApiBearerAuth } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from './file-interceptor';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiBearerAuth() 
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('OSIS', 'EDITOR', 'ADMIN')
@Controller('media')
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: any) {
    return this.media.create(file, user?.sub);
  }

  @Get()
  async list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('q') q?: string,
    @Query('mimeType') mimeType?: string,
  ) {
    return this.media.list({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 24,
      q,
      mimeType,
    });
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.media.findById(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: { title?: string; alt?: string; folder?: string }) {
    return this.media.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.media.remove(id);
  }
}
