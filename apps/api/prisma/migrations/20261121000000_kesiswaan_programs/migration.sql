-- CreateKesiswaanProgram
CREATE TABLE "kesiswaan_programs" (
    "id" TEXT NOT NULL,
    "unit" "Unit" NOT NULL DEFAULT 'SMK',
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "objective" TEXT,
    "description" TEXT,
    "personInCharge" TEXT,
    "timeType" TEXT NOT NULL DEFAULT 'DATE',
    "timeText" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" "Status" NOT NULL DEFAULT 'DRAFT',
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kesiswaan_programs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "kesiswaan_programs_slug_key" ON "kesiswaan_programs"("slug");
CREATE INDEX "kesiswaan_programs_unit_startDate_idx" ON "kesiswaan_programs"("unit", "startDate");
