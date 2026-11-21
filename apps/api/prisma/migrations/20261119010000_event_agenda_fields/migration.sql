-- AlterTable: field Agenda Kesiswaan (Indikator, Bukti Fisik, Tercapai, Keterangan)
ALTER TABLE "events"
  ADD COLUMN "indikator" TEXT,
  ADD COLUMN "buktiFisik" TEXT,
  ADD COLUMN "tercapai" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "keterangan" TEXT;
