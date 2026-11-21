-- CreateDkvJournal
CREATE TABLE "dkv_journals" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "journalDate" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "summary" TEXT,
    "author" TEXT,
    "content" TEXT,
    "thumbnail" TEXT,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "status" "Status" NOT NULL DEFAULT 'DRAFT',
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dkv_journals_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "dkv_journals_slug_key" ON "dkv_journals"("slug");
CREATE INDEX "dkv_journals_status_publishedAt_idx" ON "dkv_journals"("status", "publishedAt");
