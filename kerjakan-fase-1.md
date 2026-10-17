Build a production-ready modern Islamic education website ecosystem for:

**YAYASAN MARDHOTILLAH**

The website represents one education foundation with three education units:

1. Pondok Pesantren Mardhotillah
2. SMP Unggulan Mardhotillah
3. SMK Mardhotillah Plus

Reference websites:

* https://smkalikhwaniyah.sch.id/
* https://sekolahsabilillah.sch.id/
* Existing foundation website: https://yayasanmardhotillah.com/
* Existing Ponpes: https://yayasanmardhotillah.com/ponpes/
* Existing SMP: https://yayasanmardhotillah.com/smp/
* Existing SMK: https://yayasanmardhotillah.com/smk/

The new website must NOT look like a generic WordPress school template.

The visual direction is:

**Modern Islamic Education × Premium Institutional × Human-Centered × Clean Editorial**

Primary brand colors:

* Islamic Green: #006B3C
* Dark Green: #06452C
* Gold: #D4AF37
* Yellow Accent: #F4C430
* White: #FFFFFF
* Off White: #F7F8F4
* Dark Text: #1F2933

Green must be the dominant brand color.
Gold and yellow must be used as elegant accents, not as dominant background colors.

Use real school/student activity photography as the primary visual language.

Avoid excessive gradients, excessive animations, excessive Islamic ornaments, cartoonish illustrations, generic stock-school imagery, and template-looking sections.

Use subtle Islamic geometric patterns only as decorative accents.

---

## TECHNICAL ARCHITECTURE

IMPORTANT:

Do NOT build the entire system as a single monolithic frontend.

The system must be architected as two applications:

A. PUBLIC PUBLISHER FRONTEND
B. CMS BACKEND/API

PUBLIC FRONTEND:

* Next.js latest stable
* React
* TypeScript
* App Router
* Tailwind CSS
* shadcn/ui
* Framer Motion
* SEO optimized
* Server-side rendering / static generation where appropriate
* Responsive mobile-first
* Deployable to Vercel

CMS BACKEND:

* NestJS
* TypeScript
* REST API
* PostgreSQL
* Prisma ORM
* JWT authentication
* Role Based Access Control
* API validation
* OpenAPI/Swagger documentation

The frontend must consume content from the CMS API.

Do not hardcode all website content inside React components.

Use an API-driven CMS architecture.

Suggested architecture:

yayasanmardhotillah.com
|
v
Next.js Public Publisher
|
| HTTPS REST API
v
api.yayasanmardhotillah.com
|
v
NestJS CMS Backend
|
+---- PostgreSQL
|
+---- Object Storage

CMS admin can later be deployed at:

cms.yayasanmardhotillah.com

Do not use localStorage as the primary database.

Do not create fake CRUD functionality.

Design the codebase so that the backend can be separated from the frontend repository.

---

## MULTI UNIT CONTENT ARCHITECTURE

The CMS must support:

Organization:
Yayasan Mardhotillah

Education Units:

* Yayasan
* Pondok Pesantren
* SMP
* SMK

Most content types must have:

unit_id

Example:

Post

* id
* unit_id
* title
* slug
* excerpt
* content
* featured_image
* category_id
* author_id
* published_at
* status
* seo_title
* seo_description

The same architecture must be used for:

* Pages
* Posts
* Events
* Achievements
* Programs
* Extracurriculars
* Galleries
* Facilities
* Teachers
* Staff
* Documents
* SPMB content

Support GLOBAL content which can appear across all units.

---

## CMS CONTENT TYPES

Create CMS models for:

1. Pages
2. Posts / News
3. Categories
4. Tags
5. Events / Agenda
6. Achievements
7. Programs
8. Extracurriculars
9. Gallery
10. Gallery Items
11. Students / Achievement Profiles
12. Teachers
13. Staff
14. Facilities
15. Documents
16. Media Library
17. SPMB Period
18. SPMB Content
19. SPMB FAQ
20. Menus
21. Menu Items
22. SEO Settings
23. Redirects
24. Website Settings
25. Users
26. Roles
27. Permissions

---

## CMS ROLES

Implement RBAC:

SUPERADMIN
YAYASAN_ADMIN
PONPES_ADMIN
SMP_ADMIN
SMK_ADMIN
EDITOR
AUTHOR

Each education-unit administrator should only manage content assigned to their unit unless permission explicitly allows global access.

---

## PUBLIC WEBSITE INFORMATION ARCHITECTURE

Main navigation:

BERANDA

TENTANG KAMI

* Profil Yayasan
* Sejarah
* Visi & Misi
* Struktur Organisasi
* Pimpinan
* Legalitas

PENDIDIKAN

* Pondok Pesantren Mardhotillah
* SMP Unggulan Mardhotillah
* SMK Mardhotillah Plus

PROGRAM

* Tahfidzul Qur'an
* Bilingual
* Leadership
* Mentorship
* Kepesantrenan
* Program Akademik
* Program Vokasi
* Ekstrakurikuler

PUBLIKASI

* Berita
* Artikel
* Opini Guru
* Pojok Siswa
* Agenda
* Galeri
* Video

PRESTASI

* Prestasi Siswa
* Prestasi Guru
* Prestasi Lembaga

FASILITAS

SPMB

* Informasi SPMB
* Persyaratan
* Jadwal
* Biaya
* Alur Pendaftaran
* FAQ
* Pendaftaran Online

KONTAK

Desktop navigation must support a polished mega menu/dropdown.

Mobile navigation must use a clean accordion drawer.

---

## HOMEPAGE

Build the homepage in this exact general order:

1. Announcement Bar

Example:
"SPMB 2027/2028 telah dibuka — Daftarkan putra-putri Anda sekarang"

CTA:
INFO SPMB

2. Premium Header

Logo + Yayasan Mardhotillah

Navigation + CTA SPMB

3. Hero Section

Headline:

"Membangun Generasi Qur'ani, Berilmu dan Berkarakter"

Subheadline:

"Pendidikan terpadu Mardhotillah menghadirkan lingkungan pendidikan yang mengintegrasikan nilai keislaman, ilmu pengetahuan, karakter, keterampilan dan pengembangan potensi peserta didik."

CTA:
JELAJAHI PENDIDIKAN
DAFTAR SPMB

Use a large real student/santri photography background.

4. Education Ecosystem

Three premium cards:

Pondok Pesantren Mardhotillah
SMP Unggulan Mardhotillah
SMK Mardhotillah Plus

5. Mengapa Mardhotillah?

Six benefits:

* Pendidikan Berbasis Pesantren
* Tahfidzul Qur'an
* Pendidikan Karakter
* Leadership
* Bahasa dan Kompetensi Global
* Pengembangan Bakat dan Prestasi

6. Program Unggulan

Visual cards for:

* Tahfidzul Qur'an
* Bilingual
* Leadership
* Mentorship
* Akademik
* Kepesantrenan
* Ekstrakurikuler
* Kompetensi Vokasi

7. Wall of Fame

Achievement carousel.

Each item:

Photo
Student Name
Education Unit
Class
Competition
Achievement
Year

8. Latest News

Editorial card layout.

9. Agenda

Upcoming events with date cards.

10. Gallery

Masonry grid.

11. Student / School Activities

Use real photography.

12. SPMB CTA

Large green/gold conversion section.

13. Contact

Address
Phone
WhatsApp
Email
Google Maps

14. Footer

Foundation identity
Education units
Navigation
Social media
Contact
Copyright

---

## EDUCATION UNIT PAGES

Create dedicated landing pages:

/ponpes/
/smp/
/smk/

Each unit has its own visual identity while maintaining the main Mardhotillah brand.

PONPES:

Focus on:

* Islamic education
* Pesantren environment
* Al-Qur'an
* Arabic
* English
* Character
* Boarding environment
* Daily activities
* Facilities
* Programs
* Gallery
* News
* SPMB

SMP:

Focus on:

* Tahfidzul Qur'an
* Bilingual Excellence
* Leadership
* Mentorship
* Academic achievement
* Character
* Extracurricular
* Facilities
* Student activities
* SPMB

SMK:

Focus on:

* SMK Mardhotillah Plus
* "Sekolah Plus Nyantren Makin Keren"
* DKV
* Creative industry
* Student portfolio
* Industry preparation
* Link and match
* Extracurricular
* Student achievements
* Career / BKK if applicable
* SPMB

---

## SMK DKV SHOWCASE

Create a premium portfolio section for SMK DKV.

Use masonry grid similar to Pinterest.

Categories:

* Graphic Design
* Illustration
* Photography
* Branding
* Poster
* 3D
* Digital Art
* Student Projects

Clicking an item opens a lightbox.

Each project has:

Title
Student
Class
Category
Description
Year

---

## ACHIEVEMENT SYSTEM

Create a reusable achievement component.

Achievement data:

* Student name
* Photo
* Education unit
* Class
* Competition
* Category
* Rank
* Organizer
* Date
* Year
* Description

Provide filters:

Unit
Year
Category

---

## NEWS / ARTICLE SYSTEM

Separate:

NEWS
ARTICLE
OPINION
STUDENT CORNER

Do not mix these content types.

Use clean editorial layouts.

Each article must support:

Title
Slug
Featured image
Excerpt
Rich text
Author
Category
Tags
Published date
SEO title
SEO description
OpenGraph image

---

## SPMB LANDING PAGE

Create:

/spmb/

This must be a distraction-free landing page.

No traditional sidebar.

Sections:

Hero
Why Mardhotillah
Education Choices
Programs
Facilities
Admission Requirements
Timeline
Registration Process
Tuition / Fees
FAQ
Testimonials
Contact
Final CTA

Primary CTA:

"DAFTAR SPMB"

Secondary CTA:

"DOWNLOAD BROSUR"

Make the SPMB page editable from CMS.

---

## SEO

Implement technical SEO:

* Dynamic metadata
* OpenGraph
* Twitter Card
* Canonical URL
* XML sitemap
* robots.txt
* JSON-LD structured data
* Breadcrumb schema
* Organization schema
* EducationalOrganization schema
* Article schema
* Event schema
* Image alt text
* SEO-friendly slugs
* 301 redirect management

Each education unit should have its own SEO metadata.

---

## PERFORMANCE

Target:

Excellent Core Web Vitals.

Use:

* next/image
* responsive images
* lazy loading
* optimized fonts
* server rendering
* caching
* minimal JavaScript
* optimized animations

Do not load huge images unnecessarily.

---

## ACCESSIBILITY

Follow modern accessibility practices:

* semantic HTML
* keyboard navigation
* visible focus states
* proper heading hierarchy
* accessible dropdown menus
* alt text
* contrast
* accessible buttons
* mobile-friendly touch targets

---

## DESIGN SYSTEM

Create reusable components:

Button
Container
SectionHeading
Hero
Card
NewsCard
EventCard
AchievementCard
ProgramCard
GalleryCard
EducationUnitCard
TestimonialCard
CTA
MegaMenu
MobileMenu
Breadcrumb
Pagination
Search
Filter
Modal
Lightbox
Footer

Do not duplicate UI components unnecessarily.

---

## ANIMATION

Use subtle animations only:

* fade in
* slide up
* image reveal
* hover elevation
* card transform
* smooth navigation

Animations must never interfere with accessibility or performance.

---

## CONTENT

Use Indonesian language.

Do not invent factual claims about the institution.

Where real content is unavailable, use clearly marked placeholder content such as:

"[Konten Yayasan]"
"[Foto Kegiatan]"
"[Data Prestasi]"
"[Informasi SPMB]"

Do not fabricate accreditation, awards, statistics, facilities, alumni outcomes, tuition fees, or official claims.

---

## IMPORTANT UX PRINCIPLE

The website is not merely an information website.

It has three primary goals:

1. Establish trust in Yayasan Mardhotillah.
2. Clearly explain the education ecosystem and differences between Ponpes, SMP and SMK.
3. Convert prospective parents/students into SPMB applicants.

Therefore every major page should have a clear information hierarchy and relevant CTA.

---

## FREEBUFF IMPLEMENTATION REQUIREMENT

If Freebuff's default stack conflicts with this architecture, prioritize this specification.

Do not silently replace:

Next.js + TypeScript frontend
NestJS + TypeScript backend
PostgreSQL + Prisma

with a simplified mock/localStorage/Convex-only implementation.

If a complete two-application architecture cannot be generated in one project, create the project structure so the frontend and backend can be separated cleanly.

Generate production-quality TypeScript.

Avoid any JavaScript-only implementation.

Use environment variables for:

DATABASE_URL
JWT_SECRET
API_BASE_URL
STORAGE_ENDPOINT
STORAGE_ACCESS_KEY
STORAGE_SECRET_KEY
STORAGE_BUCKET

Never hardcode secrets.

---

## DELIVERABLE

Generate:

1. Public Next.js publisher
2. NestJS CMS backend
3. PostgreSQL Prisma schema
4. Authentication
5. RBAC
6. REST API
7. CMS CRUD architecture
8. Media library
9. SEO system
10. Multi-education-unit architecture
11. Responsive public website
12. Homepage
13. Ponpes landing page
14. SMP landing page
15. SMK landing page
16. SPMB landing page
17. News
18. Articles
19. Events
20. Achievements
21. Gallery
22. Programs
23. Extracurriculars
24. SMK DKV portfolio
25. CMS dashboard
26. API documentation
27. README
28. Environment example
29. Database migration
30. Seed data using clearly marked demo content

Prioritize clean architecture, maintainability, scalability, SEO, performance, accessibility, and visual quality.

The final result should look like a premium modern Islamic education institution website in 2026, not a generic school template.
