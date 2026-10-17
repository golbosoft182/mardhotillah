-- Tambahkan item menu "Aktivitas" ke submenu Publikasi (idempotent).
-- Jalankan sekali: docker compose exec -T db psql -U mardhotillah -d mardhotillah -f - < scripts/add-activity-menu.sql
INSERT INTO "menu_items" ("id", "label", "url", "order", "menuId", "parentId")
SELECT
  'menu-aktivitas-' || m."id",
  'Aktivitas',
  '/aktivitas',
  6,
  m."id",
  p."id"
FROM "menus" m
JOIN "menu_items" p ON p."menuId" = m."id" AND p."label" = 'Publikasi' AND p."parentId" IS NULL
WHERE m."location" = 'HEADER'
  AND NOT EXISTS (
    SELECT 1 FROM "menu_items" x WHERE x."menuId" = m."id" AND x."url" = '/aktivitas'
  );

-- Geser urutan: Galeri yang lama (order 6) menjadi 7
UPDATE "menu_items" SET "order" = 7
WHERE "label" = 'Galeri' AND "url" = '/galeri' AND "parentId" IS NOT NULL
  AND "order" = 6
  AND EXISTS (SELECT 1 FROM "menu_items" a WHERE a."menuId" = "menu_items"."menuId" AND a."url" = '/aktivitas');
