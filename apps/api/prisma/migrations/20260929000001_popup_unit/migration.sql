-- AddPopupUnit — popup PPDB bisa menyasar jenjang tertentu (Ponpes/SMP/SMK) atau umum
ALTER TABLE "popups" ADD COLUMN "unit" "Unit";

-- Popup lama dianggap popup umum (unit NULL) — tidak perlu backfill data.
