/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('>> Seeding database Yayasan Mardhotillah...');

  // ---------- USERS ----------
  const password = (p: string) => bcrypt.hashSync(p, 10);
  const users = [
    { name: 'Super Admin', email: 'superadmin@yayasanmardhotillah.com', password: password('SuperAdmin123!'), role: 'SUPER_ADMIN' as const, unit: null },
    { name: 'Admin Yayasan', email: 'admin@yayasanmardhotillah.com', password: password('Admin123!'), role: 'ADMIN' as const, unit: null },
    { name: 'Editor Konten', email: 'editor@yayasanmardhotillah.com', password: password('Editor123!'), role: 'EDITOR' as const, unit: null },
    { name: 'OSIS SMP', email: 'osis@yayasanmardhotillah.com', password: password('Osis123!'), role: 'OSIS' as const, unit: 'SMP' as const },
  ];
  for (const u of users) {
    await prisma.user.upsert({ where: { email: u.email }, update: {}, create: u });
  }

  // ---------- CATEGORIES ----------
  const catDefs = [
    { name: 'Berita Yayasan', unit: null, type: 'BERITA' },
    { name: 'Berita Ponpes', unit: 'PONPES', type: 'BERITA' },
    { name: 'Berita SMP', unit: 'SMP', type: 'BERITA' },
    { name: 'Berita SMK', unit: 'SMK', type: 'BERITA' },
    { name: 'Artikel Pendidikan', unit: null, type: 'ARTIKEL' },
    { name: 'Opini Guru', unit: null, type: 'OPINI' },
    { name: 'Pojok Siswa', unit: null, type: 'POJOK_SISWA' },
    { name: 'Event & Kegiatan', unit: null, type: 'BERITA' },
    { name: 'Prestasi & Capaian', unit: null, type: 'BERITA' },
  ];
  const cats: Record<string, string> = {};
  for (const c of catDefs) {
    const slug = c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const cat = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name: c.name, slug, unit: c.unit as any, type: c.type as any },
    });
    cats[c.name] = cat.id;
  }

  // ---------- TAGS ----------
  const tagDefs = ['Prestasi', 'Tahfidz', 'PPDB', 'Kegiatan', 'DKV', 'Beasiswa'];
  const tags: Record<string, string> = {};
  for (const t of tagDefs) {
    const slug = t.toLowerCase();
    const tag = await prisma.tag.upsert({ where: { slug }, update: {}, create: { name: t, slug } });
    tags[t] = tag.id;
  }

  // ---------- POSTS ----------
  const admin = await prisma.user.findUnique({ where: { email: 'admin@yayasanmardhotillah.com' } });
  const osis = await prisma.user.findUnique({ where: { email: 'osis@yayasanmardhotillah.com' } });
  const now = Date.now();
  const postDefs = [
    {
      unit: 'YAYASAN', type: 'BERITA', title: 'Yayasan Mardhotillah Mengadakan Kegiatan Pramuka',
      excerpt: 'Yayasan Mardhotillah menyelenggarakan kegiatan pramuka untuk membangun jiwa kepemimpinan.',
      content: '<p>[Konten Yayasan] — Silakan perbarui isi berita ini melalui CMS Admin.</p>',
      image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1200&q=75',
      categoryId: cats['Berita Yayasan'], status: 'PUBLISHED', daysAgo: 10,
    },
    {
      unit: 'PONPES', type: 'BERITA', title: 'Wisuda Tahfidzul Qur\'an Angkatan Ke-7',
      excerpt: 'Alhamdulillah, 40 santri telah menuntaskan hafalan 30 juz pada wisuda tahfidz tahun ini.',
      content: '<p>[Konten Yayasan] — Silakan perbarui isi berita ini melalui CMS Admin.</p>',
      image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=1200&q=75',
      categoryId: cats['Berita Ponpes'], status: 'PUBLISHED', daysAgo: 7,
    },
    {
      unit: 'SMP', type: 'BERITA', title: 'SMP Unggulan Mardhotillah Juara Umum O2SN',
      excerpt: 'SMP Unggulan Mardhotillah meraih juara umum pada Olimpiade Olahraga Siswa Nasional tingkat kabupaten.',
      content: '<p>[Data Prestasi] — Silakan perbarui isi berita ini melalui CMS Admin.</p>',
      image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&q=75',
      categoryId: cats['Berita SMP'], status: 'PUBLISHED', daysAgo: 5,
    },
    {
      unit: 'YAYASAN', type: 'BERITA', title: 'PPDB 2027/2028 Resmi Dibuka Gelombang 1',
      excerpt: 'Pendaftaran peserta didik baru Ponpes, SMP, dan SMK Mardhotillah gelombang 1 resmi dibuka. Kuota terbatas.',
      content: '<p>[Konten Yayasan] — Silakan perbarui isi berita ini melalui CMS Admin.</p>',
      image: 'https://images.unsplash.com/photo-1497633762265-9b1799600562?w=1200&q=75',
      categoryId: cats['Berita Yayasan'], status: 'PUBLISHED', daysAgo: 2,
    },
    {
      unit: 'PONPES', type: 'BERITA', title: 'Madrasah Diniyah Pagi: Ikrar Santri Baru',
      excerpt: 'Santri baru madrasah diniyah mengikuti ikrar dan pembinaan awal tahun ajaran bersama para ustadz.',
      content: '<p>[Konten Yayasan] — Silakan perbarui isi berita ini melalui CMS Admin.</p>',
      image: 'https://images.unsplash.com/photo-1542812714-2b0035a85d20?w=1200&q=75',
      categoryId: cats['Berita Ponpes'], status: 'PUBLISHED', daysAgo: 1,
    },
    {
      unit: 'SMK', type: 'ARTIKEL', title: 'Belajar Desain di SMK Mardhotillah Plus',
      excerpt: 'Program keahlian DKV SMK Mardhotillah Plus menyiapkan siswa memasuki industri kreatif.',
      content: '<p>[Konten Yayasan] — Silakan perbarui isi artikel ini melalui CMS Admin.</p>',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=75',
      categoryId: cats['Berita SMK'], status: 'PUBLISHED', daysAgo: 3,
    },
    {
      unit: 'SMP', type: 'POJOK_SISWA', title: 'Refleksi Seorang Santri: Belajar Ilmu dan Adab',
      excerpt: 'Tulisan siswa tentang pengalaman belajar di pesantren.',
      content: '<p>[Konten Siswa] — Silakan perbarui isi tulisan ini melalui CMS Admin.</p>',
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=75',
      categoryId: cats['Pojok Siswa'], status: 'REVIEW', daysAgo: 1, authorId: osis?.id,
    },
  ];
  for (const p of postDefs) {
    const slug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const existing = await prisma.post.findUnique({ where: { slug } });
    if (!existing) {
      await prisma.post.create({
        data: {
          unit: p.unit as any, type: p.type as any, title: p.title, slug,
          excerpt: p.excerpt, content: p.content, categoryId: p.categoryId,
          status: p.status as any, authorId: p.authorId ?? admin?.id,
          featuredImage: p.image, ogImage: p.image,
          publishedAt: p.status === 'PUBLISHED' ? new Date(now - p.daysAgo * 86400000) : null,
          seoTitle: p.title, seoDescription: p.excerpt,
          tags: p.unit === 'SMK' ? { create: [{ tagId: tags['DKV'] }] } : undefined,
        },
      });
    } else if (!existing.featuredImage) {
      // post dari seed lama: lengkapi gambar
      await prisma.post.update({ where: { id: existing.id }, data: { featuredImage: p.image, ogImage: p.image } });
    }
  }

  // ---------- PAGES ----------
  const pageDefs = [
    { unit: null, title: 'Profil Yayasan', slug: 'profil-yayasan', content: '<p>[Konten Yayasan] — Profil lengkap yayasan.</p>', seoTitle: 'Profil Yayasan Mardhotillah' },
    { unit: null, title: 'Sejarah', slug: 'sejarah', content: '<p>[Konten Yayasan] — Sejarah berdirinya yayasan.</p>' },
    { unit: null, title: 'Visi & Misi', slug: 'visi-misi', content: '<p>[Konten Yayasan] — Visi dan misi yayasan.</p>' },
    { unit: null, title: 'Struktur Organisasi', slug: 'struktur-organisasi', content: '<p>[Konten Yayasan] — Struktur organisasi.</p>' },
    { unit: null, title: 'Pimpinan', slug: 'pimpinan', content: '<p>[Konten Yayasan] — Profil pimpinan.</p>' },
    { unit: null, title: 'Legalitas', slug: 'legalitas', content: '<p>[Konten Yayasan] — Dokumen legalitas.</p>' },
    { unit: 'PONPES', title: 'Tentang Ponpes', slug: 'tentang-ponpes', content: '<p>[Konten Yayasan] — Profil Pondok Pesantren Mardhotillah.</p>' },
    { unit: 'SMP', title: 'Tentang SMP Unggulan', slug: 'tentang-smp', content: '<p>[Konten Yayasan] — Profil SMP Unggulan Mardhotillah.</p>' },
    { unit: 'SMK', title: 'Tentang SMK Mardhotillah Plus', slug: 'tentang-smk', content: '<p>[Konten Yayasan] — Profil SMK Mardhotillah Plus.</p>' },
  ];
  for (const pg of pageDefs) {
    const existing = await prisma.page.findUnique({ where: { slug: pg.slug } });
    if (!existing) {
      await prisma.page.create({
        data: { ...pg, unit: pg.unit as any, status: 'PUBLISHED', publishedAt: new Date(), seoTitle: pg.seoTitle ?? pg.title, authorId: admin?.id },
      });
    }
  }

  // ---------- PROGRAMS ----------
  const programDefs = [
    { unit: null, name: "Tahfidzul Qur'an", description: 'Program hafalan Al-Qur\'an terstruktur bagi seluruh peserta didik.', featured: true, order: 1 },
    { unit: null, name: 'Bilingual', description: 'Penguasaan bahasa Arab dan Inggris untuk komunikasi aktif.', featured: true, order: 2 },
    { unit: null, name: 'Leadership', description: 'Pembinaan jiwa kepemimpinan melalui organisasi dan kepemimpinan santri.', featured: true, order: 3 },
    { unit: null, name: 'Mentorship', description: 'Pendampingan intensif oleh mentor untuk capaian akademik dan karakter.', featured: true, order: 4 },
    { unit: null, name: 'Kepesantrenan', description: 'Pendidikan nilai keislaman, adab, dan kemandirian santri.', featured: true, order: 5 },
    { unit: null, name: 'Program Akademik', description: 'Pembelajaran kurikulum nasional dengan bimbingan intensif.', featured: true, order: 6 },
    { unit: null, name: 'Program Vokasi', description: 'Keahlian industri kreatif DKV untuk kesiapan kerja.', featured: true, order: 7 },
    { unit: null, name: 'Ekstrakurikuler', description: 'Beragam kegiatan bakat dan minat siswa.', featured: true, order: 8 },
  ];
  for (const p of programDefs) {
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await prisma.program.upsert({
      where: { slug },
      update: {},
      create: { ...p, unit: p.unit as any, slug, status: 'PUBLISHED' },
    });
  }

  // ---------- ACHIEVEMENTS (6 dummy dengan foto) ----------
  // hapus prestasi placeholder lama ("[Nama Siswa]") agar diganti data dummy berfoto
  await prisma.achievement.deleteMany({ where: { studentName: { startsWith: '[' } } });
  const achDefs = [
    { unit: 'SMP', studentName: 'Ahmad Fauzan Hakim', className: 'VIII-A', competition: 'O2SN Tingkat Kabupaten', category: 'Olahraga', rank: 'Juara 1', year: 2025, photo: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=75', organizer: 'Dinas Pendidikan Kabupaten' },
    { unit: 'SMK', studentName: 'Salsabila Putri Ramadhani', className: 'XII DKV', competition: 'Lomba Desain Poster Nasional', category: 'DKV', rank: 'Juara 2', year: 2025, photo: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&q=75', organizer: 'Kementerian Kreatif RI' },
    { unit: 'PONPES', studentName: 'Muhammad Rizki Maulana', className: 'Kelas Tahfidz', competition: "Musabaqah Hifzil Qur'an", category: 'Tahfidz', rank: 'Juara 3', year: 2024, photo: 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=400&q=75', organizer: 'PWNU Provinsi' },
    { unit: 'SMP', studentName: 'Naila Syakira Az Zahra', className: 'IX-B', competition: 'Olimpiade Sains Nasional (IPA)', category: 'Sains', rank: 'Juara 1', year: 2025, photo: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400&q=75', organizer: 'Puspresnas Kemdikbud' },
    { unit: 'SMK', studentName: 'Hafizh Abdurrahman', className: 'XI DKV', competition: 'Lomba Videografi Pelajar', category: 'DKV', rank: 'Juara 1', year: 2025, photo: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&q=75', organizer: 'Komunitas Film Pelajar' },
    { unit: 'PONPES', studentName: 'Umar Sayyidullah', className: 'Kelas Bahasa', competition: 'Muhadhoroh Bahasa Arab', category: 'Bahasa', rank: 'Harapan 1', year: 2024, photo: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&q=75', organizer: 'Ma`had Aly Mardhotillah' },
  ];
  for (const a of achDefs) {
    const exists = await prisma.achievement.findFirst({ where: { studentName: a.studentName, competition: a.competition } });
    if (!exists) {
      await prisma.achievement.create({
        data: { ...a, unit: a.unit as any, status: 'PUBLISHED', publishedAt: new Date() },
      });
    }
  }

  // ---------- ACTIVITIES (Aktivitas Siswa & Santri — 8 dummy per unit) ----------
  const actDefs = [
    { unit: 'PONPES', title: "Kegiatan Tahfidzul Qur'an", category: 'Tahfidz', featured: true, img: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=75', desc: "Setoran hafalan harian dengan target jelas dan mentoring intensif dari musyrif." },
    { unit: 'SMK', title: 'Praktik DKV & Portofolio', category: 'Akademik', featured: true, img: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=75', desc: 'Praktik desain grafis, fotografi, dan videografi di lab DKV untuk portofolio industri kreatif.' },
    { unit: 'SMP', title: 'Ekstrakurikuler & Panahan', category: 'Ekstrakurikuler', featured: true, img: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=75', desc: 'Pengembangan bakat-minat: panahan, futsal, pramuka, dan klub bahasa.' },
    { unit: 'PONPES', title: 'Kehidupan Asrama', category: 'Kepesantrenan', featured: true, img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=75', desc: 'Pembiasaan ibadah berjamaah, tahsin sore, dan musyawarah asrama yang membentuk kemandirian.' },
    { unit: 'SMP', title: 'Bilingual Club & Muhadhoroh', category: 'Bahasa', img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=75', desc: 'Latihan public speaking bahasa Arab dan Inggris setiap pekan.' },
    { unit: 'SMK', title: 'Magang & Kunjungan Industri', category: 'Industri', img: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=75', desc: 'Praktek kerja lapangan dan kunjungan industri mitra kreatif.' },
    { unit: 'PONPES', title: 'Kitab Kuning & Bahasa Arab', category: 'Kepesantrenan', img: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=75', desc: 'Kajian kitab kuning klasik dengan metode sorogan dan bandongan.' },
    { unit: 'YAYASAN', title: 'Open House & Wisuda', category: 'Event', img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=75', desc: 'Open house tahunan dan wisuda santri/siswa bersama seluruh keluarga besar Mardhotillah.' },
  ];
  for (const [i, a] of actDefs.entries()) {
    const slug = a.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await prisma.activity.upsert({
      where: { slug },
      update: {},
      create: {
        unit: a.unit as any, title: a.title, slug,
        description: a.desc, image: a.img, category: a.category,
        order: i + 1, featured: a.featured ?? false,
        status: 'PUBLISHED', publishedAt: new Date(),
      },
    });
  }

  // ---------- EXTRACURRICULARS ----------
  const ekstraDefs = ['Pramuka', 'Futsal', 'Panahan', 'English Club', 'Kaluwira/OSIS'];
  for (const name of ekstraDefs) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await prisma.extracurricular.upsert({
      where: { slug },
      update: {},
      create: { name, slug, description: `[Konten Yayasan] — Kegiatan ekstrakurikuler ${name}.`, status: 'PUBLISHED', order: 1 },
    });
  }

  // ---------- FACILITIES ----------
  const fasDefs = ['Masjid', 'Asrama Santri', 'Perpustakaan', 'Lab Komputer', 'Lab DKV', 'Lapangan Olahraga'];
  for (const name of fasDefs) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await prisma.facility.upsert({
      where: { slug },
      update: {},
      create: { name, slug, description: `[Konten Yayasan] — Fasilitas ${name}.`, status: 'PUBLISHED', order: 1 },
    });
  }

  // ---------- GALLERY (Momen Kegiatan — 8 foto dummy) ----------
  const g = await prisma.gallery.upsert({
    where: { slug: 'kegiatan-santri' },
    update: {},
    create: { title: 'Kegiatan Santri', slug: 'kegiatan-santri', description: '[Foto Kegiatan] — Momen kegiatan santri.', status: 'PUBLISHED', publishedAt: new Date() },
  });
  // ganti placeholder placehold.co lama dengan foto dummy yang lebih representatif
  await prisma.galleryItem.deleteMany({ where: { galleryId: g.id, url: { contains: 'placehold.co' } } });
  if ((await prisma.galleryItem.count({ where: { galleryId: g.id } })) === 0) {
    const momenDefs = [
      { label: 'Kegiatan Tahfidz', img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=75' },
      { label: 'Praktik DKV', img: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=75' },
      { label: 'Ekstrakurikuler Futsal', img: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=75' },
      { label: 'Belajar di Kelas', img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=75' },
      { label: 'Kegiatan Kepramukaan', img: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=75' },
      { label: 'Diskusi Kelompok', img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=75' },
      { label: 'Kegiatan Keagamaan', img: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=75' },
      { label: 'Wisuda Santri', img: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=75' },
    ];
    await prisma.galleryItem.createMany({
      data: momenDefs.map((m, i) => ({
        galleryId: g.id,
        url: m.img,
        caption: `[Foto] ${m.label}`,
        alt: m.label,
        order: i + 1,
      })),
    });
  }

  // ---------- EVENTS (5 agenda mendatang dengan foto) ----------
  const eventDefs = [
    { unit: 'YAYASAN', title: 'Open House Mardhotillah', slug: 'open-house-mardhotillah', desc: 'Kunjungan calon peserta didik dan orang tua untuk mengenal lingkungan pendidikan Mardhotillah.', loc: 'Kompleks Yayasan Mardhotillah', inDays: 14, img: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1200&q=75' },
    { unit: 'PONPES', title: 'Khataman & Syukuran Santri Tahfidz', slug: 'khataman-syukuran-santri-tahfidz', desc: 'Syukuran khataman 30 juz santri angkatan tahfidz bersama wali santri.', loc: 'Aula Masjid Mardhotillah', inDays: 21, img: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=1200&q=75' },
    { unit: 'SMP', title: 'Pentas Seni & Class Meeting SMP', slug: 'pentas-seni-class-meeting-smp', desc: 'Penampilan bakat siswa: musik, tari, dan band islami antar kelas.', loc: 'Lapangan SMP Unggulan', inDays: 30, img: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&q=75' },
    { unit: 'SMK', title: 'Expo Karya DKV SMK Mardhotillah Plus', slug: 'expo-karya-dkv-smk', desc: 'Pameran karya desain siswa DKV: poster, branding, animasi, dan fotografi.', loc: 'Lab DKV SMK Mardhotillah Plus', inDays: 45, img: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&q=75' },
    { unit: 'YAYASAN', title: 'Bimtek Orang Tua & Kaluwira', slug: 'bimtek-orang-tua-kaluwira', desc: 'Bimbingan teknis pendampingan pendidikan karakter di rumah dan di sekolah.', loc: 'Aula Yayasan', inDays: 60, img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=75' },
  ];
  for (const ev of eventDefs) {
    const existing = await prisma.event.findUnique({ where: { slug: ev.slug } });
    if (!existing) {
      const start = new Date(now + ev.inDays * 86400000);
      await prisma.event.create({
        data: {
          unit: ev.unit as any, title: ev.title, slug: ev.slug,
          description: ev.desc, location: ev.loc,
          featuredImage: ev.img,
          startDate: start, endDate: new Date(start.getTime() + 4 * 3600000),
          status: 'PUBLISHED', allDay: false,
        },
      });
    } else if (!existing.featuredImage) {
      await prisma.event.update({ where: { id: existing.id }, data: { featuredImage: ev.img } });
    }
  }

  // ---------- PPDB ----------
  const periodExists = await prisma.spmbPeriod.findFirst({ where: { isActive: true } });
  if (!periodExists) {
    const period = await prisma.spmbPeriod.create({
      data: { name: 'PPDB 2027/2028', year: '2027/2028', isActive: true },
    });
    const contents = [
      { section: 'hero', title: 'PPDB 2027/2028 Telah Dibuka', body: 'Daftarkan putra-putri Anda bergabung dengan ekosistem pendidikan Mardhotillah.', order: 1 },
      { section: 'why', title: 'Mengapa Mardhotillah?', body: 'Lingkungan pendidikan yang mengintegrasikan nilai keislaman, ilmu pengetahuan, dan karakter.', order: 2 },
      { section: 'requirements', title: 'Persyaratan Pendaftaran', body: '[Informasi PPDB] — Lengkapi persyaratan sesuai jenjang.', data: [{ text: 'Mengisi formulir pendaftaran' }, { text: 'Fotokopi ijazah/rapor' }, { text: 'Pas foto terbaru' }], order: 3 },
      { section: 'timeline', title: 'Jadwal Penting', body: '[Informasi PPDB]', data: [{ label: 'Gelombang 1', text: 'Januari – Maret' }, { label: 'Gelombang 2', text: 'April – Juni' }], order: 4 },
      { section: 'process', title: 'Alur Pendaftaran', body: '[Informasi PPDB]', data: [{ label: '1', text: 'Isi formulir online' }, { label: '2', text: 'Verifikasi berkas' }, { label: '3', text: 'Tes seleksi' }, { label: '4', text: 'Pengumuman & daftar ulang' }], order: 5 },
      { section: 'fees', title: 'Biaya Pendidikan', body: '[Informasi PPDB] — Rincian biaya menyesuaikan jenjang.', data: [{ label: 'Jenjang', text: 'Biaya' }], order: 6 },
      { section: 'contact', title: 'Kontak Panitia', body: '[Informasi PPDB] — Hubungi panitia untuk info lebih lanjut.', data: { wa: '', email: '' }, order: 7 },
    ];
    for (const c of contents) {
      await prisma.spmbContent.create({ data: { ...c, periodId: period.id } });
    }
    const faqs = [
      { question: 'Apakah harus menghafal Al-Qur\'an untuk mendaftar?', answer: '[Informasi PPDB] — Tidak wajib sudah menghafal, akan ada pembinaan tahfidz di sekolah.', order: 1 },
      { question: 'Apakah tersedia beasiswa?', answer: '[Informasi PPDB] — Informasi beasiswa akan diumumkan oleh panitia.', order: 2 },
      { question: 'Bagaimana alur pendaftaran?', answer: 'Isi formulir online, verifikasi berkas, tes seleksi, lalu daftar ulang.', order: 3 },
    ];
    for (const f of faqs) {
      await prisma.spmbFaq.create({ data: { ...f, periodId: period.id } });
    }
  }

  // ---------- MENUS ----------
  const headerExists = await prisma.menu.findFirst({ where: { location: 'HEADER' } });
  if (!headerExists) {
    const menu = await prisma.menu.create({ data: { name: 'Navigasi Utama', location: 'HEADER' } });
    const top = [
      { label: 'Beranda', url: '/', order: 1 },
      { label: 'Tentang Kami', url: '/tentang', order: 2 },
      { label: 'Pendidikan', url: '#pendidikan', order: 3 },
      { label: 'Program', url: '/program', order: 4 },
      { label: 'Publikasi', url: '#publikasi', order: 5 },
      { label: 'Prestasi', url: '/prestasi', order: 6 },
      { label: 'Fasilitas', url: '/fasilitas', order: 7 },
      { label: 'PPDB', url: '/ppdb', order: 8 },
      { label: 'Kontak', url: '/kontak', order: 9 },
    ];
    const created: Record<string, string> = {};
    for (const t of top) {
      const item = await prisma.menuItem.create({ data: { ...t, menuId: menu.id } });
      created[t.label] = item.id;
    }
    const children: [string, string, string, number][] = [
      ['Tentang Kami', 'Profil Yayasan', '/tentang/profil', 1],
      ['Tentang Kami', 'Sejarah', '/tentang/sejarah', 2],
      ['Tentang Kami', 'Visi & Misi', '/tentang/visi-misi', 3],
      ['Tentang Kami', 'Struktur Organisasi', '/tentang/struktur', 4],
      ['Pendidikan', 'Pondok Pesantren', '/ponpes', 1],
      ['Pendidikan', 'SMP Unggulan', '/smp', 2],
      ['Pendidikan', 'SMK Mardhotillah Plus', '/smk', 3],
      ['Publikasi', 'Berita', '/berita', 1],
      ['Publikasi', 'Artikel', '/artikel', 2],
      ['Publikasi', 'Opini Guru', '/opini', 3],
      ['Publikasi', 'Pojok Siswa', '/pojok-siswa', 4],
      ['Publikasi', 'Agenda', '/agenda', 5],
      ['Publikasi', 'Aktivitas', '/aktivitas', 6],
      ['Publikasi', 'Galeri', '/galeri', 7],
    ];
    for (const [parent, label, url, order] of children) {
      await prisma.menuItem.create({ data: { label, url, order, menuId: menu.id, parentId: created[parent] } });
    }
  }

  // ---------- SEO ----------
  const seoDefs = [
    { pageKey: 'home', title: 'Yayasan Mardhotillah — Pendidikan Qur\'ani, Berilmu, Berkarakter', description: 'Ekosistem pendidikan Islam terpadu: Pondok Pesantren, SMP Unggulan, dan SMK Mardhotillah Plus.' },
    { pageKey: 'ponpes', title: 'Pondok Pesantren Mardhotillah', description: 'Pendidikan pesantren dengan program tahfidzul Qur\'an, bahasa, dan karakter.' },
    { pageKey: 'smp', title: 'SMP Unggulan Mardhotillah', description: 'SMP dengan program Tahfidz, Bilingual, Leadership, dan Mentorship.' },
    { pageKey: 'smk', title: 'SMK Mardhotillah Plus', description: 'Sekolah Plus Nyantren Makin Keren — program keahlian DKV dengan kesiapan industri kreatif.' },
    { pageKey: 'ppdb', title: 'PPDB Mardhotillah', description: 'Informasi lengkap Seleksi Penerimaan Murid Baru Yayasan Mardhotillah.' },
  ];
  for (const s of seoDefs) {
    await prisma.seoSetting.upsert({ where: { pageKey: s.pageKey }, update: {}, create: s });
  }

  // ---------- SETTINGS ----------
  const settings = {
    site_name: 'Yayasan Mardhotillah',
    site_tagline: 'Membangun Generasi Qur\'ani, Berilmu dan Berkarakter',
    address: '[Alamat Lengkap Yayasan]',
    phone: '[Nomor Telepon]',
    whatsapp: '[Nomor WhatsApp]',
    email: '[Email Resmi]',
    maps_embed: '',
    facebook: '#', instagram: '#', youtube: '#',
    announcement_text: 'PPDB 2027/2028 telah dibuka — Daftarkan putra-putri Anda sekarang',
    announcement_link: '/ppdb',
    hero_title: "Membangun Generasi Qur'ani, Berilmu dan Berkarakter",
    hero_subtitle: 'Pendidikan terpadu Mardhotillah menghadirkan lingkungan pendidikan yang mengintegrasikan nilai keislaman, ilmu pengetahuan, karakter, keterampilan dan pengembangan potensi peserta didik.',
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.upsert({ where: { key }, update: {}, create: { key, value: value as any } });
  }

  // ---------- HOME SECTIONS (semua konten beranda dinamis + dummy) ----------
  const homeSections = [
    {
      key: 'hero_slides',
      label: 'Hero Slider (foto + caption bergantian)',
      data: {
        slides: [
          {
            eyebrow: 'Yayasan Mardhotillah · Ponpes · SMP · SMK',
            title: "Membangun Generasi Qur'ani, Berilmu dan Berkarakter",
            description: 'Pendidikan terpadu Mardhotillah menghadirkan lingkungan pendidikan yang mengintegrasikan nilai keislaman, ilmu pengetahuan, karakter, keterampilan dan pengembangan potensi peserta didik.',
            image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1920&q=80',
            primaryButton: 'JELAJAHI PENDIDIKAN', primaryLink: '#pendidikan',
            secondaryButton: 'DAFTAR PPDB', secondaryLink: '/ppdb',
          },
          {
            eyebrow: 'PPDB 2027/2028 Telah Dibuka',
            title: 'Wujudkan Masa Depan Cerah Putra-Putri Anda',
            description: 'Pendaftaran peserta didik baru Ponpes, SMP, dan SMK Mardhotillah gelombang 1 telah resmi dibuka. Kuota terbatas.',
            image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1920&q=80',
            primaryButton: 'DAFTAR SEKARANG', primaryLink: '/ppdb',
            secondaryButton: 'INFO PPDB', secondaryLink: '/ppdb',
          },
          {
            eyebrow: "Tahfidzul Qur'an · Bilingual · Leadership",
            title: 'Sekolah Plus Nyantren Makin Keren',
            description: 'Ekosistem asrama yang membina adab, kemandirian, dan prestasi akademik serta bakat siswa.',
            image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80',
            primaryButton: 'JELAJAHI PENDIDIKAN', primaryLink: '#pendidikan',
            secondaryButton: 'LIHAT PRESTASI', secondaryLink: '/prestasi',
          },
        ],
      },
    },
    {
      key: 'ecosystem',
      label: 'Ekosistem Pendidikan (3 kartu unit)',
      data: {
        heading: 'Tiga Jenjang, Satu Tujuan',
        eyebrow: 'Ekosistem Pendidikan',
        description: 'Satu ekosistem pendidikan terpadu dari pendidikan dasar hingga kejuruan dalam lingkungan pesantren.',
        items: [
          { name: 'Pondok Pesantren Mardhotillah', tagline: 'Pendidikan Pesantren', description: "Pendidikan berbasis pesantren dengan program tahfidzul Qur'an, bahasa Arab–Inggris, dan pembentukan karakter santri.", href: '/ponpes', image: 'https://images.unsplash.com/photo-1588072432836-e10032774350?w=800&q=75' },
          { name: 'SMP Unggulan Mardhotillah', tagline: 'Tahfidz · Bilingual · Leadership', description: 'SMP dengan program unggulan Tahfidzul Qur\'an, Bilingual Excellence, Leadership, dan Mentorship akademik.', href: '/smp', image: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&q=75' },
          { name: 'SMK Mardhotillah Plus', tagline: 'Sekolah Plus Nyantren Makin Keren', description: 'SMK program keahlian DKV dengan kesiapan industri kreatif, portofolio karya, dan link and match dunia kerja.', href: '/smk', image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=75' },
        ],
      },
    },
    {
      key: 'benefits',
      label: 'Mengapa Mardhotillah (6 keunggulan)',
      data: {
        heading: 'Mengapa Mardhotillah?',
        eyebrow: 'Keunggulan Kami',
        description: 'Enam alasan orang tua mempercayakan pendidikan putra-putrinya kepada kami.',
        items: [
          { icon: 'book', title: 'Pendidikan Berbasis Pesantren', description: 'Lingkungan asrama yang membangun adab, kemandirian, dan kebiasaan ibadah harian.' },
          { icon: 'book', title: "Tahfidzul Qur'an", description: 'Program hafalan Al-Qur\'an terstruktur dengan target jelas dan mentoring intensif.' },
          { icon: 'heart', title: 'Pendidikan Karakter', description: 'Pembiasaan akhlak mulia sebagai fondasi utama seluruh aktivitas pendidikan.' },
          { icon: 'medal', title: 'Leadership', description: 'Wadah kepemimpinan santri/siswa melalui organisasi dan kegiatan kepemimpinan.' },
          { icon: 'language', title: 'Bahasa & Kompetensi Global', description: 'Penguasaan bahasa Arab dan Inggris untuk komunikasi aktif sehari-hari.' },
          { icon: 'sparkles', title: 'Bakat & Prestasi', description: 'Pengembangan minat bakat hingga berprestasi di tingkat yang lebih tinggi.' },
        ],
      },
    },
    {
      key: 'spmb_cta',
      label: 'CTA PPDB',
      data: {
        heading: 'Siap menjadi bagian dari keluarga Mardhotillah?',
        description: 'Daftarkan putra-putri Anda melalui PPDB online atau hubungi kami untuk informasi lebih lanjut.',
        primaryButton: 'DAFTAR PPDB',
        primaryLink: '/ppdb',
        secondaryButton: 'HUBUNGI KAMI',
        secondaryLink: '/kontak',
      },
    },
  ];
  for (const s of homeSections) {
    await prisma.homeSection.upsert({ where: { key: s.key }, update: {}, create: s });
  }
  // section "activities" dihapus dari beranda — kini jadi halaman /aktivitas dengan CMS tersendiri
  await prisma.homeSection.deleteMany({ where: { key: 'activities' } });

  // ---------- POPUP PPDB (flyer demo — satu per jenjang + umum) ----------
  const popupCount = await prisma.popup.count();
  if (popupCount === 0) {
    const flyer = (text: string) =>
      `https://placehold.co/800x1000/006B3C/FFFFFF/png?text=${encodeURIComponent(text)}`;
    await prisma.popup.createMany({
      data: [
        {
          title: 'PPDB Yayasan 2027/2028 Telah Dibuka',
          imageUrl: flyer('Flyer PPDB Yayasan 2027/2028'),
          unit: null,
          linkUrl: '/ppdb',
          buttonText: 'DAFTAR SEKARANG',
          isActive: true,
        },
        {
          title: 'PPDB Ponpes 2027/2028 Telah Dibuka',
          imageUrl: flyer('Flyer PPDB Ponpes 2027/2028'),
          unit: 'PONPES',
          linkUrl: '/ppdb?unit=PONPES',
          buttonText: 'DAFTAR PONPES',
          isActive: true,
        },
        {
          title: 'PPDB SMP 2027/2028 Telah Dibuka',
          imageUrl: flyer('Flyer PPDB SMP 2027/2028'),
          unit: 'SMP',
          linkUrl: '/ppdb?unit=SMP',
          buttonText: 'DAFTAR SMP',
          isActive: true,
        },
        {
          title: 'PPDB SMK 2027/2028 Telah Dibuka',
          imageUrl: flyer('Flyer PPDB SMK 2027/2028'),
          unit: 'SMK',
          linkUrl: '/ppdb?unit=SMK',
          buttonText: 'DAFTAR SMK',
          isActive: true,
        },
      ],
    });
  }

  // ---------- PENDAFTARAN PPDB (dummy untuk demo CMS List PPDB) ----------
  const regCount = await prisma.ppdbRegistration.count();
  if (regCount === 0) {
    const activePeriod = await prisma.spmbPeriod.findFirst({ where: { isActive: true } });
    const unitCycle = ['SMP', 'PONPES', 'SMK', 'SMP', 'PONPES', 'SMP', 'SMK', 'PONPES'];
    const statusCycle = ['PENDING', 'VERIFIED', 'PENDING', 'PENDING', 'VERIFIED', 'PENDING', 'REJECTED', 'PENDING'];
    const regNames = [
      ['Ahmad Zaki Ramadhan', 'MALE', 'SMPN 1', 'Bpk. Hendra Wijaya'],
      ['Aisyah Nur Fadilah', 'FEMALE', 'SDIT Al-Fikri', 'Ibu Ratna Sari'],
      ['Muhammad Ilham Akbar', 'MALE', 'SDN 5', 'Bpk. Suparman'],
      ['Fatimah Az Zahra', 'FEMALE', 'MI Mardhotillah', 'Ibu Dewi Lestari'],
      ['Umar Faruq Al-Ghifari', 'MALE', 'SD Islam Terpadu', 'Bpk. Rahmat Hidayat'],
      ['Khadijah Salma Rahma', 'FEMALE', 'SDN 12', 'Ibu Yuni Astuti'],
      ['Bilal Arif Nugroho', 'MALE', 'SDN 3', 'Bpk. Agus Setiawan'],
      ['Hafshah binti Abdullah', 'FEMALE', 'MI Al-Hikmah', 'Bpk. Abdullah Fahmi'],
    ] as const;
    const now = Date.now();
    for (let i = 0; i < regNames.length; i++) {
      const [fullName, gender, prevSchool, parentName] = regNames[i];
      await prisma.ppdbRegistration.create({
        data: {
          regCode: `PPDB-2026-${String(1000 + i * 137).slice(0, 4)}${String.fromCharCode(65 + i)}`,
          fullName,
          gender,
          unit: unitCycle[i],
          previousSchool: prevSchool,
          parentName,
          parentPhone: `08${String(1234567890 + i * 7654321).slice(0, 10)}`,
          parentEmail: `ortu${i + 1}@example.com`,
          birthPlace: 'Kota Contoh',
          birthDate: new Date(2011 + (i % 3), i % 12, ((i * 7) % 27) + 1),
          address: 'Jl. Contoh Alamat No. ' + (i + 1),
          status: statusCycle[i],
          verifiedAt: statusCycle[i] === 'VERIFIED' ? new Date(now - i * 3600_000) : null,
          verifiedBy: statusCycle[i] === 'VERIFIED' ? 'Admin Demo' : null,
          periodId: activePeriod?.id ?? null,
          createdAt: new Date(now - i * 86_400_000), // berjarak 1 hari, terbaru dulu
        },
      });
    }
    console.log(`✅ ${regNames.length} pendaftaran PPDB dummy dibuat.`);
  }

  console.log('✅ Seeding selesai.');
}

main()
  .catch((e) => {
    console.error('❌ Seed gagal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
