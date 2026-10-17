import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsEmail({}, { message: 'Format email tidak valid' })
  email!: string;

  @ApiProperty({ minLength: 8 })
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  password!: string;

  @ApiProperty({ enum: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'OSIS'] })
  @IsEnum(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'OSIS'])
  role!: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'OSIS';

  @ApiPropertyOptional({ enum: ['YAYASAN', 'PONPES', 'SMP', 'SMK'], nullable: true })
  @IsOptional()
  @IsEnum(['YAYASAN', 'PONPES', 'SMP', 'SMK'])
  unit?: 'YAYASAN' | 'PONPES' | 'SMP' | 'SMK' | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bio?: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
