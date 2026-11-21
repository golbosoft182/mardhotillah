import { BadRequestException } from '@nestjs/common';
import { FileInterceptor as NestFileInterceptor } from '@nestjs/platform-express';
import type { Options } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomBytes } from 'crypto';

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? join(process.cwd(), 'uploads');

// MIME non-image yang tetap diizinkan (dokumen).
const ALLOWED_MIME = [
  'application/pdf',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-word', // sebagian OS lama
];

// Ekstensi yang diizinkan sebagai fallback — sebagian browser/OS mengirim MIME
// tidak standar (mis. "image/jpg" untuk berkas .JPG) atau "application/octet-stream"
// saat tipe tidak dikenali, sehingga ekstensi dipakai untuk memvalidasi.
const ALLOWED_EXT = [
  '.jpg', '.jpeg', '.jpe', '.jfif', '.png', '.webp', '.gif', '.svg',
  '.avif', '.heic', '.heif', '.bmp', '.tif', '.tiff', '.ico',
  '.pdf', '.doc', '.docx',
];

function isAllowed(file: { mimetype: string; originalname: string }): boolean {
  const mime = (file.mimetype ?? '').toLowerCase();
  if (mime.startsWith('image/') || ALLOWED_MIME.includes(mime)) return true;
  return ALLOWED_EXT.includes(extname(file.originalname).toLowerCase());
}

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
    fileFilter: (_req: any, file: { mimetype: string; originalname: string }, cb: (e: Error | null, ok?: boolean) => void) => {
      if (!isAllowed(file)) {
        return cb(new BadRequestException('Tipe file tidak diizinkan'));
      }
      cb(null, true);
    },
  } as Options);
