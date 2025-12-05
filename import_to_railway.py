#!/usr/bin/env python3
"""
Скрипт для імпорту даних з SQLite в Railway PostgreSQL
"""
import os
import subprocess
import sys

print("🚀 Імпорт даних в Railway PostgreSQL...")
print()

# Отримуємо DATABASE_URL з Railway
print("📡 Отримую connection string з Railway...")
result = subprocess.run(['railway', 'variables', 'get', 'DATABASE_URL'], 
                       capture_output=True, text=True)

if result.returncode != 0:
    print("❌ Помилка: Не вдалося отримати DATABASE_URL")
    print("Переконайся що виконав: railway link")
    sys.exit(1)

database_url = result.stdout.strip()
print(f"✅ DATABASE_URL отримано")
print()

# Імпортуємо дані
print("📦 Імпортую дані з postgres_import.sql...")
with open('postgres_import.sql', 'r') as f:
    sql_content = f.read()

# Використовуємо psql через Railway
import_cmd = f'railway run -- psql "{database_url}"'
process = subprocess.Popen(import_cmd, shell=True, stdin=subprocess.PIPE, 
                          stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
stdout, stderr = process.communicate(input=sql_content)

if process.returncode == 0:
    print("✅ Дані успішно імпортовано!")
    print()
    print("📊 Перевіряємо таблиці...")
    
    # Перевіряємо таблиці
    check_cmd = f'railway run -- psql "{database_url}" -c "\\dt"'
    subprocess.run(check_cmd, shell=True)
    
else:
    print("❌ Помилка при імпорті:")
    print(stderr)
    sys.exit(1)

print()
print("🎉 Готово! База даних Railway заповнена даними!")
