-- Showcase Karya DKV: dukung media PDF (selain gambar)
ALTER TABLE "dkv_works" ADD COLUMN "mediaType" TEXT NOT NULL DEFAULT 'IMAGE';
ALTER TABLE "dkv_works" ADD COLUMN "file" TEXT;
