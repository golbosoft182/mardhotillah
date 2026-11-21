-- CreateJobVacancy
CREATE TABLE "job_vacancies" (
    "id" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "location" TEXT,
    "employmentType" TEXT,
    "salary" TEXT,
    "description" TEXT,
    "requirements" TEXT,
    "contact" TEXT,
    "applyUrl" TEXT,
    "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deadline" TIMESTAMP(3),
    "status" "Status" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_vacancies_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "job_vacancies_status_postedAt_idx" ON "job_vacancies"("status", "postedAt");
