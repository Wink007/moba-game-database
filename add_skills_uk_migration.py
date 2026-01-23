#!/usr/bin/env python3
"""
Migration script to add Ukrainian translation columns for hero_skills table
"""

import os
os.environ['DATABASE_TYPE'] = 'postgres'
os.environ['DATABASE_URL'] = 'postgresql://postgres:AgAAUwYzsOuUEzuKvjSQIUUXaxoTfGIn@crossover.proxy.rlwy.net:34790/railway'

from database import get_connection, release_connection

def main():
    print("🚀 Початок міграції для додавання ukrainian полів до hero_skills")
    
    connection = get_connection()
    cursor = connection.cursor()
    
    try:
        # Add skill_name_uk column
        print("📝 Додаю колонку skill_name_uk...")
        cursor.execute("""
            ALTER TABLE hero_skills 
            ADD COLUMN IF NOT EXISTS skill_name_uk TEXT;
        """)
        
        # Add skill_description_uk column
        print("📝 Додаю колонку skill_description_uk...")
        cursor.execute("""
            ALTER TABLE hero_skills 
            ADD COLUMN IF NOT EXISTS skill_description_uk TEXT;
        """)
        
        # Create indexes for Ukrainian columns
        print("📝 Створюю індекси для ukrainian колонок...")
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_hero_skills_skill_name_uk 
            ON hero_skills(skill_name_uk);
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_hero_skills_skill_description_uk 
            ON hero_skills(skill_description_uk);
        """)
        
        connection.commit()
        
        # Verify columns were added
        print("\n✅ Перевірка створення колонок...")
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'hero_skills' 
            AND column_name IN ('skill_name_uk', 'skill_description_uk')
            ORDER BY column_name;
        """)
        
        columns = cursor.fetchall()
        print(f"Знайдено колонок: {len(columns)}")
        for col in columns:
            print(f"  ✓ {col[0]}")
        
        if len(columns) == 2:
            print("\n✅ Міграція виконана успішно!")
        else:
            print("\n⚠️ Увага: не всі колонки були створені")
            
    except Exception as e:
        connection.rollback()
        print(f"\n❌ Помилка при міграції: {e}")
        raise
    finally:
        cursor.close()
        release_connection(connection)

if __name__ == "__main__":
    main()
