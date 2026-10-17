-- AddPopupSizes — lebar popup dapat diatur per perangkat (desktop/tablet/mobile) via CMS
ALTER TABLE "popups" ADD COLUMN "widthDesktop" INTEGER NOT NULL DEFAULT 440;
ALTER TABLE "popups" ADD COLUMN "widthTablet" INTEGER NOT NULL DEFAULT 360;
ALTER TABLE "popups" ADD COLUMN "widthMobile" INTEGER NOT NULL DEFAULT 300;
