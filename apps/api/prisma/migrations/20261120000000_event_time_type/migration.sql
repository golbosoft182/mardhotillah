-- AlterTable: jenis waktu Agenda (DATE | TEXT) + teks waktu bebas
ALTER TABLE "events" ADD COLUMN "timeType" TEXT NOT NULL DEFAULT 'DATE';
ALTER TABLE "events" ADD COLUMN "timeText" TEXT;
ALTER TABLE "events" ALTER COLUMN "startDate" DROP NOT NULL;
