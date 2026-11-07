# Yayasan Mardhotillah — Website & CMS

Situs resmi **Yayasan Mardhotillah** (Ponpes · SMP · SMK) yang dibangun sebagai **3 aplikasi terpisah** agar mudah di-maintain, dikembangkan, dan di-deploy:

| App | Teknologi | Port Lokal | Keterangan |
| --- | --- | --- | --- |
| `apps/web` | Next.js 15 (App Router) + Tailwind v4 | **3100** | Website publik — SSR/ISR, SEO-ready |
| `apps/admin` | Next.js 15 | **3101** | CMS Admin (UI user-friendly) |
| `apps/api` | NestJS 11 + Prisma + PostgreSQL 16 | **3102** | REST API — dokumentasi Swagger di **`/docs`** |
| `db` | PostgreSQL 16 (Docker) | 5433 → 5432 | Volume `pgdata` |

---

## ✨ Fitur Utama

### Website Publik (apps/web)
- **Semua konten dinamis dari CMS** — tidak ada teks hardcode: hero, section beranda, berita, agenda, prestasi, galeri, program, fasilitas, guru, halaman tentang, SPMB, menu navigasi, kontak, pengumuman.
- **Mega menu** desktop (panel multi-kolom + kartu promo) dan drawer accordion di mobile.
- **Popup SPMB** — flyer + link tampil di semua halaman tiap refresh, bisa ditutup (✕ pojok kanan atas), jadwal tayang & ukuran per perangkat (desktop/tablet/mobile) diatur dari CMS.
- **Multi-bahasa otomatis** — Indonesia (default) / English / Arabic via Google Translate, tombol bendera di topbar.
- **Topbar**: jam sistem live (hari, tanggal, jam WIB) + pemilih bahasa.
- **SEO lengkap**: metadata & OpenGraph dinamis per halaman, JSON-LD Article, sitemap.xml, robots.txt, redirect 301, canonical.
- **Responsive penuh** — desktop / tablet / mobile.
- ISR (cache 60 detik) sehingga perubahan CMS tampil otomatis maksimal 1 menit.

### CMS Admin (apps/admin)
Panel sederhana — tidak rumit — dengan menu:

| Menu | Fungsi |
| --- | --- |
| **Berita & Artikel** | Buat/edit berita, artikel, opini, pojok siswa + panel SEO (judul, deskripsi, OG image + pratinjau Google) |
| **Halaman** | Profil, sejarah, visi-misi, struktur, dll. |
| **Agenda / Prestasi / Galeri** | Kegiatan mendatang, wall of fame, album & momen foto |
| **Konten Beranda** | Edit semua section beranda (kartu unit, keunggulan, aktivitas, CTA) |
| **Popup SPMB** | Ganti flyer/link/jadwal/ukuran popup setiap tahun ajaran |
| **Media** | Upload & kelola gambar |
| **Kategori & Tag / Program / Guru / Fasilitas** | Master data konten |
| **SPMB** | Periode SPMB, persyaratan, jadwal, alur, biaya, FAQ |
| **Menu Navigasi** | Susun menu header (sub-menu otomatis jadi mega menu) |
| **SEO** | Metadata tiap halaman kunci |
| **Pengguna** | Kelola user & role (Super Admin/Admin saja) |
| **Pengaturan** | Nama situs, kontak, sosmed, pengumuman, hero beranda |

### API (apps/api)
- REST + **Swagger UI** di `/docs` (OpenAPI 3).
- **RBAC 4 role** dengan guard per-endpoint + pembatasan per-unit.
- CRUD generik via factory (konsisten: `?page= &limit= &q= &unit= &status=`).
- Upload media ke volume `uploads`, JWT auth, migrasi & seed otomatis.

### RBAC — Hak Akses Role

| Role | Baca | Buat/Ubah | Hapus | Khusus |
| --- | --- | --- | --- | --- |
| **SUPER_ADMIN** | ✅ semua | ✅ | ✅ | User, pengaturan, semua unit |
| **ADMIN** | ✅ semua | ✅ | ✅ | SEO, menu, SPMB, media |
| **EDITOR** | ✅ semua | ✅ | ❌ | Tidak bisa hapus data |
| **OSIS** | ✅ | Hanya artikel sekolah miliknya | ❌ | Status wajib **Draft/Review** → Admin yang mem-publish |

**Akun demo (seed):**

| Role | Email | Password |
| --- | --- | --- |
| Super Admin | `superadmin@yayasanmardhotillah.com` | `SuperAdmin123!` |
| Admin | `admin@yayasanmardhotillah.com` | `Admin123!` |
| Editor | `editor@yayasanmardhotillah.com` | `Editor123!` |
| OSIS | `osis@yayasanmardhotillah.com` | `Osis123!` |

> ⚠️ **Ganti semua password demo sebelum production** (menu Pengguna di CMS).

---

## 🚀 Jalankan Lokal (Docker)

```bash
cp .env.example .env          # sesuaikan password & JWT_SECRET
docker compose up --build -d
```

| Layanan | URL |
| --- | --- |
| Website | http://localhost:3100 |
| CMS Admin | http://localhost:3101 |
| API + Swagger | http://localhost:3102/docs |

Saat container API pertama kali jalan: **migrasi + seed demo berjalan otomatis** (idempotent — tidak menimpa data yang sudah ada).

### Development tanpa Docker

```bash
docker compose up db -d                  # 1. database saja
cd apps/api                              # 2. API
npm install
# ubah DATABASE_URL host menjadi localhost:5433 di .env
npx prisma migrate deploy && npx prisma db seed
npm run start:dev
cd ../web   && npm i && npm run dev      # 3. terminal terpisah :3100
cd ../admin && npm i && npm run dev      #    :3101
```

---

## 🌐 Akses Publik via Tunnel Cloudflare

Untuk mengakses web/admin/API dari **luar jaringan lokal** (HP, kantor, dll.), repo ini memakai **3 tunnel Cloudflare quick-tunnel** yang berjalan sebagai container Docker:

| Layanan | Container | Mengarah ke |
| --- | --- | --- |
| API | `ym_tunnel` | `host.docker.internal:3102` |
| Website publik | `ym_tunnel_web` | `host.docker.internal:3100` |
| CMS Admin | `ym_tunnel_admin` | `host.docker.internal:3101` |

### Cara cek URL tunnel yang aktif

```bash
# URL API
docker logs ym_tunnel 2>&1 | grep -o "https://[a-z0-9-]*\.trycloudflare\.com" | head -1

# URL web & admin
docker logs ym_tunnel_web 2>&1   | grep -o "https://[a-z0-9-]*\.trycloudflare\.com" | head -1
docker logs ym_tunnel_admin 2>&1 | grep -o "https://[a-z0-9-]*\.trycloudflare\.com" | head -1
```

### Perilaku saat internet terputus

| Kondisi | Apa yang terjadi | Yang perlu dilakukan |
| --- | --- | --- |
| Internet putus **sebentar** lalu nyala kembali | Container tetap jalan; cloudflared **auto-reconnect** ke edge Cloudflare dan **URL tetap sama** | ❌ Tidak perlu apa-apa, tunggu 1–2 menit |
| Container tunnel di-restart (`docker restart ...`) | URL quick tunnel **BERUBAH** (nama acak baru) | Update URL di `.env` → rebuild `web admin` (lihat bawah) |
| Docker / mesin restart, atau container di-recreate | Sama seperti di atas — URL **BERUBAH** | Sama seperti di atas |
| Container berstatus `Exited` | Tunnel mati total | Start ulang: `docker start ym_tunnel ym_tunnel_web ym_tunnel_admin` |

> ⚠️ Karena URL quick tunnel acak dan berubah setiap container dibuat ulang, URL ini **hanya untuk demo/testing**, bukan produksi. Untuk URL tetap, gunakan **named tunnel** Cloudflare dengan domain sendiri, atau deploy ke hosting permanen.

### Cara menghidupkan kembali setelah mati

```bash
# 1. Pastikan container tunnel jalan
docker ps --format "{{.Names}} {{.Status}}" | grep tunnel

# 2. Kalau Exited, hidupkan lagi (auto-restart juga aktif)
docker start ym_tunnel ym_tunnel_web ym_tunnel_admin

# 3. Kalau ingin tunnel benar-benar baru (URL baru), buat ulang:
docker rm -f ym_tunnel_web
docker run -d --name ym_tunnel_web --restart unless-stopped \
  cloudflare/cloudflared:latest tunnel --no-autoupdate --url http://host.docker.internal:3100

# 4. Ambil URL baru, lalu update .env (NEXT_PUBLIC_API_URL & API_PUBLIC_URL untuk API)
docker logs ym_tunnel 2>&1 | grep -o "https://[a-z0-9-]*\.trycloudflare\.com" | head -1

# 5. Rebuild frontend supaya URL API baru dibake ke bundle browser
#    (HANYA perlu jika URL API yang berubah; tunnel web/admin tidak dibake)
docker compose build web admin && docker compose up -d web admin
```

### Checklist cepat kalau "Failed to fetch" muncul lagi

1. `docker ps` — apakah `ym_api` & tunnel jalan (bukan `Exited`)?
2. `curl http://localhost:3102/api/health` — balas 200?
3. Bandingkan URL di `.env` dengan `docker logs ym_tunnel` — sama?
4. Kalau beda → update `.env` → `docker compose build web admin && docker compose up -d web admin`

---

## 🔌 API & Swagger

Buka **http://localhost:3102/docs** — semua endpoint terdokumentasi + bisa dicoba langsung (klik **Authorize** → tempel token login).

**Endpoint utama:**

| Method | Endpoint | Akses | Fungsi |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | publik | Login → JWT |
| GET | `/api/posts` | publik | Berita/artikel (`?type= &unit= &q=`) |
| POST | `/api/posts` | EDITOR+ | Buat artikel (OSIS otomatis Review) |
| PUT | `/api/posts/:id` | EDITOR+ | Edit / publish (ubah `status`) |
| GET/POST/PUT/DELETE | `/api/events` | publik / EDITOR+ | Agenda |
| GET/POST/PUT/DELETE | `/api/achievements` | publik / EDITOR+ | Prestasi |
| GET | `/api/galleries` | publik | Galeri (termasuk `items` foto) |
| GET | `/api/home-sections` | publik | Section beranda |
| PUT | `/api/home-sections/:key` | ADMIN | Update section (key: `ecosystem`, `benefits`, `activities`, `spmb_cta`) |
| GET | `/api/popup/active` | publik | Popup SPMB aktif |
| GET/POST/PUT/DELETE | `/api/popup` | ADMIN | Kelola popup (satu aktif) |
| GET | `/api/ppdb/active` | publik | Konten SPMB + FAQ periode aktif |
| GET/PUT | `/api/settings` | publik / ADMIN | Pengaturan situs |
| GET/PUT | `/api/seo/:pageKey` | publik / ADMIN | SEO per halaman |
| GET/POST | `/api/menus` | publik / ADMIN | Menu navigasi (nested) |
| POST | `/api/media/upload` | EDITOR+ | Upload gambar |

**Contoh cepat (curl):**

```bash
# login & simpan token
TOKEN=$(curl -s -X POST http://localhost:3102/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yayasanmardhotillah.com","password":"Admin123!"}' | node -pe "JSON.parse(require('fs').readFileSync(0)).access_token")

# ambil 5 berita terbaru
curl "http://localhost:3102/api/posts?limit=5&status=PUBLISHED"

# update pengumuman berjalan
curl -X PUT http://localhost:3102/api/settings \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"announcement_text":"SPMB gelombang 2 dibuka 1 April"}'
```

---

## 📦 Deploy Production

### A. Docker di VPS (server punya akses git/repo)

```bash
# di server
git clone <repo-url> yayasan && cd yayasan
cp .env.example .env && nano .env     # WAJIB ganti: POSTGRES_PASSWORD, JWT_SECRET, domain di API_PUBLIC_URL & NEXT_PUBLIC_SITE_URL
docker compose up --build -d
```

Selesai — API otomatis migrasi + seed saat pertama jalan.

**Deploy ulang (update aplikasi):**

```bash
git pull
docker compose up --build -d api web admin
docker compose exec api npx prisma migrate deploy   # jika ada migrasi baru
```

### B. Deploy Manual via SCP (tanpa git di server)

**Cara B1 — build image di lokal, kirim file image (server hanya butuh Docker):**

```bash
# 1. Build semua image di mesin lokal
docker compose build

# 2. Simpan image menjadi file .tar (± kompres)
docker save yayasan-mardhotillah-api  | gzip > api.tar.gz
docker save yayasan-mardhotillah-web  | gzip > web.tar.gz
docker save yayasan-mardhotillah-admin| gzip > admin.tar.gz

# 3. Kirim ke server (beserta compose & env)
scp api.tar.gz web.tar.gz admin.tar.gz user@server:/home/user/yayasan/
scp docker-compose.yml .env.example   user@server:/home/user/yayasan/

# 4. Di server: load & jalankan
ssh user@server
cd ~/yayasan
docker load < api.tar.gz && docker load < web.tar.gz && docker load < admin.tar.gz
cp .env.example .env && nano .env     # isi credential production
docker compose up -d                  # db + api + web + admin
```

> Nama image mengikuti `<nama-project-compose>-<service>`; cek dengan `docker images` jika berbeda, atau tambahkan `image: yayasan-api` pada tiap service di `docker-compose.yml` agar namanya pasti.

**Cara B2 — kirim source code via SCP, build di server:**

```bash
# 1. Di lokal: bersihkan artefak lalu arsipkan source
tar --exclude=node_modules --exclude=.next --exclude=dist --exclude=.git \
    -czf yayasan-src.tar.gz .

# 2. Kirim & ekstrak di server
scp yayasan-src.tar.gz user@server:~/
ssh user@server
mkdir -p ~/yayasan && tar -xzf yayasan-src.tar.gz -C ~/yayasan
cd ~/yayasan
cp .env.example .env && nano .env
docker compose up --build -d          # build terjadi di server
```

### Konfigurasi `.env` Production

```env
POSTGRES_PASSWORD=<password-kuat-unik>
DATABASE_URL=postgresql://mardhotillah:<password>@db:5432/mardhotillah?schema=public
JWT_SECRET=<string-acak-min-32-karakter>
API_PUBLIC_URL=https://api.domainanda.com        # URL publik API
NEXT_PUBLIC_API_URL=https://api.domainanda.com   # diakses browser pengunjung
NEXT_PUBLIC_SITE_URL=https://domainanda.com
```

> `NEXT_PUBLIC_API_URL` **harus URL yang bisa diakses browser pengunjung** (bukan `localhost` / IP internal), karena admin & browser memanggil API langsung.

### Nginx Reverse Proxy + HTTPS (rekomendasi)

Arahkan domain ke server, lalu pasang Nginx di host:

```nginx
server {
    server_name domainanda.com www.domainanda.com;

    location / {
        proxy_pass http://127.0.0.1:3100;   # web
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
server {
    server_name api.domainanda.com;
    client_max_body_size 50M;               # upload media

    location / {
        proxy_pass http://127.0.0.1:3102;   # api
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo certbot --nginx -d domainanda.com -d api.domainanda.com   # SSL gratis Let's Encrypt
```

### Backup Rutin

```bash
# backup database (jalankan via cron, mis. tiap malam)
docker compose exec -T db pg_dump -U mardhotillah mardhotillah | gzip > backup-$(date +%F).sql.gz

# backup upload media
docker run --rm -v yayasan-mardhotillah_uploads:/data -v $PWD:/backup alpine \
  tar czf /backup/uploads-$(date +%F).tar.gz -C /data .

# restore database
gunzip -c backup-2026-09-27.sql.gz | docker compose exec -T db psql -U mardhotillah -d mardhotillah
```

---

## ✅ Checklist Sebelum Go-Live

- [ ] Ganti `POSTGRES_PASSWORD` & `JWT_SECRET` (min. 32 karakter acak)
- [ ] Ganti password semua akun demo / buat akun baru, hapus yang tak terpakai
- [ ] Isi data asli di CMS: Pengaturan (alamat, telp, WA, email, maps), SEO, SPMB, flyer popup
- [ ] Ganti foto dummy (prestasi, galeri, aktivitas) dengan foto asli via Media
- [ ] `NEXT_PUBLIC_API_URL` & `NEXT_PUBLIC_SITE_URL` memakai domain + HTTPS
- [ ] Aktifkan HTTPS (certbot) & firewall (hanya 80/443; port DB **tidak** diekspos publik — hapus mapping `5433` di production)
- [ ] Siapkan cron backup database
- [ ] Cek `https://api.domainanda.com/docs` tetap terbatas untuk internal (opsional: blok `/docs` publik via Nginx)

## 🛠 Perintah Berguna

```bash
docker compose logs -f api                       # log API
docker compose ps                                # status semua container
docker compose exec api npx prisma studio        # UI database
docker compose exec api npx prisma db seed       # isi ulang seed (idempotent)
docker compose restart web                       # restart satu layanan
docker compose down                              # matikan (data aman di volume)
docker compose down -v                           # ⚠️ hapus seluruh data
```

## 🧯 Troubleshooting

| Masalah | Solusi |
| --- | --- |
| Perubahan CMS belum tampil di web | Tunggu ≤60 detik (ISR) atau `docker compose restart web` |
| Gambar tidak muncul | Pastikan `NEXT_PUBLIC_API_URL` bisa diakses browser; cek tab Network |
| `401 Unauthorized` di admin | Sesi kadaluarsa → login ulang; cek `JWT_SECRET` sama untuk semua container |
| API gagal start, koneksi DB | `docker compose ps` — pastikan `db` healthy; cek `DATABASE_URL` |
| "Failed to fetch" saat login CMS | URL tunnel API berubah → ikuti **Checklist cepat** di bagian *Akses Publik via Tunnel Cloudflare* |
| Gambar upload 404 (`/uploads/...`) | Pastikan `ym_api` jalan versi terbaru (static assets sudah didukung sejak perbaikan `main.ts`); cek `curl http://localhost:3102/uploads/<nama-file>` |
| Port bentrok | Ubah mapping port di `docker-compose.yml` (format `host:container`) |
