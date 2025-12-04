#!/usr/bin/env python3
"""
Міграція даних з SQLite в PostgreSQL для Railway
"""
import sqlite3
import psycopg2
from psycopg2.extras import execute_values
import json

# Railway PostgreSQL
PG_URL = "postgresql://postgres:AgAAUwYzsOuUEzuKvjSQIUUXaxoTfGIn@crossover.proxy.rlwy.net:34790/railway"

# SQLite
SQLITE_DB = "test_games.db"

print("🚀 Починаю міграцію з SQLite в PostgreSQL...")
print()

# Підключення
print("📡 Підключаюсь до баз даних...")
sqlite_conn = sqlite3.connect(SQLITE_DB)
sqlite_conn.row_factory = sqlite3.Row
pg_conn = psycopg2.connect(PG_URL)
pg_cursor = pg_conn.cursor()

print("✅ Підключено!")
print()

# Отримуємо список таблиць з SQLite
sqlite_cursor = sqlite_conn.cursor()
sqlite_cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
tables = [row[0] for row in sqlite_cursor.fetchall()]

print(f"📊 Знайдено {len(tables)} таблиць для міграції:")
for table in tables:
    print(f"   - {table}")
print()

# Створюємо таблиці в PostgreSQL та копіюємо дані
for table_name in tables:
    print(f"⚙️  Обробляю таблицю '{table_name}'...")
    
    # Отримуємо схему таблиці
    sqlite_cursor.execute(f"PRAGMA table_info({table_name})")
    columns_info = sqlite_cursor.fetchall()
    
    # Створюємо таблицю в PostgreSQL
    columns_def = []
    for col in columns_info:
        col_name = col[1]
        col_type = col[2].upper()
        
        # Конвертуємо типи SQLite -> PostgreSQL
        if 'INT' in col_type:
            pg_type = 'BIGINT'  # BIGINT замість INTEGER для великих чисел
        elif 'TEXT' in col_type or 'CHAR' in col_type:
            pg_type = 'TEXT'
        elif 'REAL' in col_type or 'FLOAT' in col_type or 'DOUBLE' in col_type:
            pg_type = 'DOUBLE PRECISION'
        elif 'BLOB' in col_type:
            pg_type = 'BYTEA'
        elif 'TIMESTAMP' in col_type:
            pg_type = 'TIMESTAMP'
        else:
            pg_type = 'TEXT'
        
        # PRIMARY KEY
        if col[5]:  # pk
            columns_def.append(f"{col_name} SERIAL PRIMARY KEY")
        else:
            default = col[4]
            not_null = " NOT NULL" if col[3] else ""
            columns_def.append(f"{col_name} {pg_type}{not_null}")
    
    create_table_sql = f"CREATE TABLE IF NOT EXISTS {table_name} ({', '.join(columns_def)})"
    
    try:
        pg_cursor.execute(f"DROP TABLE IF EXISTS {table_name} CASCADE")
        pg_cursor.execute(create_table_sql)
        pg_conn.commit()
        print(f"   ✅ Таблиця створена")
    except Exception as e:
        print(f"   ⚠️  Помилка створення: {e}")
        continue
    
    # Копіюємо дані
    sqlite_cursor.execute(f"SELECT * FROM {table_name}")
    rows = sqlite_cursor.fetchall()
    
    if rows:
        columns = [description[0] for description in sqlite_cursor.description]
        # Видаляємо id з вставки якщо це autoincrement
        if 'id' in columns and columns_info[0][5]:  # перша колонка і primary key
            columns_without_id = [col for col in columns if col != 'id']
            placeholders = ', '.join(['%s'] * len(columns_without_id))
            insert_sql = f"INSERT INTO {table_name} ({', '.join(columns_without_id)}) VALUES ({placeholders})"
            
            data = [[row[col] for col in columns_without_id] for row in rows]
        else:
            placeholders = ', '.join(['%s'] * len(columns))
            insert_sql = f"INSERT INTO {table_name} ({', '.join(columns)}) VALUES ({placeholders})"
            data = [tuple(row) for row in rows]
        
        try:
            pg_cursor.executemany(insert_sql, data)
            pg_conn.commit()
            print(f"   ✅ Скопійовано {len(rows)} записів")
        except Exception as e:
            print(f"   ⚠️  Помилка копіювання даних: {e}")
            pg_conn.rollback()
    else:
        print(f"   ℹ️  Таблиця порожня")
    
    print()

# Закриваємо з'єднання
sqlite_conn.close()
pg_cursor.close()
pg_conn.close()

print("🎉 Міграція завершена!")
print()
print("✅ Всі дані перенесено в Railway PostgreSQL!")
