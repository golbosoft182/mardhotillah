-- CreateTable
CREATE TABLE "ppdb_registrations" (
    "id" TEXT NOT NULL,
    "regCode" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "nickname" TEXT,
    "gender" TEXT NOT NULL,
    "birthPlace" TEXT,
    "birthDate" TIMESTAMP(3),
    "address" TEXT,
    "unit" TEXT NOT NULL,
    "previousSchool" TEXT,
    "parentName" TEXT NOT NULL,
    "parentPhone" TEXT NOT NULL,
    "parentEmail" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "periodId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ppdb_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ppdb_registrations_regCode_key" ON "ppdb_registrations"("regCode");

-- CreateIndex
CREATE INDEX "ppdb_registrations_createdAt_idx" ON "ppdb_registrations"("createdAt");
CREATE INDEX "ppdb_registrations_status_idx" ON "ppdb_registrations"("status");
CREATE INDEX "ppdb_registrations_unit_idx" ON "ppdb_registrations"("unit");
