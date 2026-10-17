import { ApiPropertyOptional, PartialType, PickType } from '@nestjs/swagger';
import { IsArray, IsDateString, IsEnum, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePostDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsEnum(['YAYASAN', 'PONPES', 'SMP', 'SMK'])
  unit!: 'YAYASAN' | 'PONPES' | 'SMP' | 'SMK';

  @IsEnum(['BERITA', 'ARTIKEL', 'OPINI', 'POJOK_SISWA'])
  type!: 'BERITA' | 'ARTIKEL' | 'OPINI' | 'POJOK_SISWA';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  featuredImage?: string;

  @IsOptional()
  @IsString()
  ogImage?: string;

  @IsOptional()
  @IsEnum(['DRAFT', 'REVIEW', 'PUBLISHED'])
  status?: 'DRAFT' | 'REVIEW' | 'PUBLISHED';

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  authorId?: string;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @IsOptional()
  @IsString()
  seoTitle?: string;

  @IsOptional()
  @IsString()
  seoDescription?: string;

  @IsOptional()
  @IsString()
  ogTitle?: string;

  @IsOptional()
  @IsString()
  ogDescription?: string;

  @IsOptional()
  @IsArray()
  tagIds?: string[];
}

export class UpdatePostDto extends PartialType(CreatePostDto) {}
