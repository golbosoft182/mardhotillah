import { BadRequestException } from '@nestjs/common';
import { FileInterceptor as NestFileInterceptor } from '@nestjs/platform-express';
import type { Options } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomBytes } from 'crypto';

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? join(process.cwd(), 'uploads');

const ALLOWED = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
];

export function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const FileInterceptor = (fieldName: string) =>
  NestFileInterceptor(fieldName, {
    storage: diskStorage({
      destination: (_req, _file, cb) => {
        ensureUploadDir();
        cb(null, UPLOAD_DIR);
      },
      filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${randomBytes(6).toString('hex')}`;
        cb(null, `${unique}${extname(file.originalname).toLowerCase()}`);
      },
    }),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (_req: any, file: { mimetype: string }, cb: (e: Error | null, ok?: boolean) => void) => {
      if (!ALLOWED.includes(file.mimetype)) {
        return cb(new BadRequestException('Tipe file tidak diizinkan'));
      }
      cb(null, true);
    },
  } as Options);
