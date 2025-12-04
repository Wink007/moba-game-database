#!/bin/bash

# Скрипт для експорту SQLite в PostgreSQL формат

echo "📦 Експортую базу даних SQLite в PostgreSQL формат..."

# Експорт даних
sqlite3 test_games.db .dump > backup_sqlite.sql

# Конвертація для PostgreSQL
cat backup_sqlite.sql | \
  sed 's/AUTOINCREMENT//' | \
  sed 's/INTEGER PRIMARY KEY/SERIAL PRIMARY KEY/' | \
  sed 's/PRAGMA foreign_keys=OFF;//' | \
  sed 's/BEGIN TRANSACTION;//' | \
  sed 's/COMMIT;//' \
  > postgres_import.sql

echo "✅ Експорт завершено!"
echo "📄 Файл: postgres_import.sql"
echo ""
echo "🔄 Для імпорту в PostgreSQL використовуй:"
echo "psql \$DATABASE_URL < postgres_import.sql"
