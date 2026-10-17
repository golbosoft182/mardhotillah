#!/bin/sh
set -e
echo ">> Menjalankan migrasi database..."
npx prisma migrate deploy
echo ">> Menjalankan seed (idempotent)..."
node dist-seed/seed.js || echo "Seed dilewati (mungkin sudah ada data)."
echo ">> Memulai API..."
exec "${@:-node dist/src/main.js}"
