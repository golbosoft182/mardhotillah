import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Daftar post (filter unit/type/status/q dll)' })
  async list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('unit') unit?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('tag') tag?: string,
    @Query('q') q?: string,
    @Query('year') year?: string,
  ) {
    return this.posts.list({
      page: page ? Number(page) : 1,
      limit: Math.min(limit ? Number(limit) : 12, 50),
      unit,
      type,
      status: status ?? 'PUBLISHED',
      category,
      tag,
      q,
      year: year ? Number(year) : undefined,
    });
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Detail post berdasarkan slug' })
  async bySlug(@Param('slug') slug: string) {
    return this.posts.findBySlug(slug);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OSIS', 'EDITOR', 'ADMIN')
  @Get('admin/all')
  @ApiOperation({ summary: 'Daftar semua post untuk admin (termasuk draft/review)' })
  async adminList(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('unit') unit?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('q') q?: string,
  ) {
    return this.posts.list({
      page: page ? Number(page) : 1,
      limit: Math.min(limit ? Number(limit) : 20, 100),
      unit,
      type,
      status,
      q,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OSIS', 'EDITOR', 'ADMIN')
  @Get('admin/:id')
  @ApiOperation({ summary: 'Detail post untuk admin' })
  async adminFind(@Param('id') id: string, @CurrentUser() user: any) {
    const post = await this.posts.findById(id);
    if (user.role === 'OSIS' && post.authorId !== user.sub) {
      return { ...post, _restricted: true };
    }
    return post;
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Detail post berdasarkan id' })
  async findById(@Param('id') id: string) {
    return this.posts.findById(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OSIS', 'EDITOR', 'ADMIN')
  @Post()
  @ApiOperation({ summary: 'Buat post/artikel (OSIS hanya status Draft/Review)' })
  async create(@Body() dto: CreatePostDto, @CurrentUser() user: any) {
    return this.posts.create(dto, user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OSIS', 'EDITOR', 'ADMIN')
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePostDto, @CurrentUser() user: any) {
    return this.posts.update(id, dto, user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.posts.remove(id, user);
  }

  @Public()
  @Patch(':id/view')
  async view(@Param('id') id: string) {
    return this.posts.incrementView(id);
  }
}
