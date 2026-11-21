-- AlterTable: gambar lowongan (hanya tampil di halaman detail BKK)
ALTER TABLE "job_vacancies" ADD COLUMN "image" TEXT;

-- CreateTable: Kemitraan Dunia Usaha dan Industri (mitra industri)
CREATE TABLE "industry_partners" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" "Status" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "industry_partners_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "industry_partners_slug_key" ON "industry_partners"("slug");
