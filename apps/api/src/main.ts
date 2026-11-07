import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true });

  // ---------- Static files (uploads) ----------
  const uploadDir = process.env.UPLOAD_DIR ?? join(process.cwd(), 'uploads');
  app.useStaticAssets(uploadDir, { prefix: '/uploads' });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({ transform: true, whitelist: true, transformOptions: { enableImplicitConversion: true } }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  // ---------- Swagger / OpenAPI ----------
  const config = new DocumentBuilder()
    .setTitle('Yayasan Mardhotillah — CMS API')
    .setDescription(
      [
        'REST API untuk CMS Website Yayasan Mardhotillah (Ponpes · SMP · SMK).',
        '',
        '## Ringkasan',
        '- **Autentikasi**: JWT Bearer. Login via `POST /api/auth/login`, lalu klik tombol **Authorize** di kanan atas dan tempel token (tanpa kata "Bearer").',
        '- **RBAC 4 role**: `SUPER_ADMIN` (semua akses), `ADMIN` (semua konten + user + SEO + menu + SPMB), `EDITOR` (buat/ubah, tidak bisa hapus), `OSIS` (hanya artikel sekolah miliknya, status wajib DRAFT/REVIEW).',
        '- **Unit konten**: `YAYASAN`, `PONPES`, `SMP`, `SMK` — hampir semua resource ber-filter `?unit=`.',
        '- **Pagination**: semua endpoint list mendukung `?page=`, `?limit=`, `?q=` (pencarian), `?status=`, `?unit=`.',
        '',
        '## Alur konten OSIS',
        'OSIS membuat artikel → `POST /api/posts` (status `DRAFT`/`REVIEW`) → Admin/Editor mereview dan mengubah status menjadi `PUBLISHED` via `PUT /api/posts/:id`.',
        '',
        '## Konten beranda & popup',
        '- Section beranda: `GET /api/home-sections` (publik) · `PUT /api/home-sections/:key` (admin) — key: `ecosystem`, `benefits`, `activities`, `spmb_cta`.',
        '- Popup SPMB: `GET /api/popup/active` (publik) · CRUD `/api/popup` (admin) — hanya satu popup aktif.',
      ].join('\n'),
    )
    .setVersion('1.1.0')
    .setContact('Yayasan Mardhotillah', 'https://yayasanmardhotillah.com', 'info@yayasanmardhotillah.com')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Tempel JWT dari POST /api/auth/login' },
      'bearer',
    )
    .addTag('auth', 'Login & sesi pengguna CMS')
    .addTag('posts', 'Berita, Artikel, Opini, Pojok Siswa')
    .addTag('pages', 'Halaman statis (profil, sejarah, visi-misi, dll.)')
    .addTag('events', 'Agenda kegiatan')
    .addTag('achievements', 'Prestasi siswa & santri')
    .addTag('programs', 'Program unggulan & ekstrakurikuler')
    .addTag('galleries', 'Album & momen kegiatan (galeri foto)')
    .addTag('teachers', 'Guru & tendik')
    .addTag('facilities', 'Fasilitas')
    .addTag('categories', 'Kategori publikasi')
    .addTag('ppdb', 'SPMB: periode, konten halaman, FAQ')
    .addTag('home-sections', 'Section konten beranda (dinamis)')
    .addTag('popup', 'Popup flyer SPMB tampil di semua halaman')
    .addTag('menus', 'Menu navigasi header/footer')
    .addTag('seo', 'Metadata SEO per halaman')
    .addTag('settings', 'Pengaturan situs (kontak, hero, pengumuman, dll.)')
    .addTag('media', 'Media library (unggahan gambar)')
    .addTag('users', 'Manajemen pengguna CMS (SUPER_ADMIN/ADMIN)')
    .addTag('health', 'Health check')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'CMS API — Yayasan Mardhotillah',
    swaggerOptions: { persistAuthorization: true, tagsSorter: 'alpha', operationsSorter: 'alpha' },
  });

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
  console.log(`✅ API berjalan di http://localhost:${port}/api — Swagger: /docs`);
}

bootstrap();
