#!/usr/bin/env python3
"""Імпорт даних в Railway PostgreSQL через Python"""
import psycopg2
import sys

DATABASE_URL = "postgresql://postgres:AgAAUwYzsOuUEzuKvjSQIUUXaxoTfGIn@crossover.proxy.rlwy.net:34790/railway"

print("🚀 Підключаюсь до Railway PostgreSQL...")

try:
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    print("✅ Підключено!")
    print("📦 Читаю postgres_import.sql...")
    
    with open('postgres_import.sql', 'r', encoding='utf-8') as f:
        sql = f.read()
    
    print("⚙️  Виконую SQL запити...")
    cursor.execute(sql)
    conn.commit()
    
    print("✅ Імпорт завершено!")
    
    # Перевіряємо таблиці
    print("\n📊 Перевіряю створені таблиці...")
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
    """)
    
    tables = cursor.fetchall()
    print(f"\n✅ Створено {len(tables)} таблиць:")
    for table in tables:
        print(f"   - {table[0]}")
    
    cursor.close()
    conn.close()
    
    print("\n🎉 Готово! База даних Railway готова до роботи!")
    
except Exception as e:
    print(f"❌ Помилка: {e}")
    sys.exit(1)
