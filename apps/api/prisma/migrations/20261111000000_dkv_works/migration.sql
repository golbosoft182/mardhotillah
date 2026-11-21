-- CreateDkvWork
CREATE TABLE "dkv_works" (
    "id" TEXT NOT NULL,
    "unit" "Unit" NOT NULL DEFAULT 'SMK',
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "category" TEXT,
    "author" TEXT,
    "workDate" TIMESTAMP(3),
    "order" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" "Status" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dkv_works_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "dkv_works_slug_key" ON "dkv_works"("slug");
CREATE INDEX "dkv_works_unit_order_idx" ON "dkv_works"("unit", "order");
