#!/usr/bin/env python3
"""
Patch script to add Ukrainian translation support to api_server.py for hero skills
"""

import re

API_FILE = '/Users/alexwink/my_work/game_database/api_server.py'

def main():
    print("🔧 Оновлюю api_server.py для підтримки Ukrainian skills...")
    
    with open(API_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Update PUT endpoint - add Ukrainian fields extraction
    old_put_extraction = r"(    transformation_order = data\.get\('transformation_order'\))\s+"
    
    new_put_extraction = r"""\1
    skill_name_uk = data.get('skill_name_uk')
    skill_description_uk = data.get('skill_description_uk')
    """
    
    if re.search(old_put_extraction, content):
        content = re.sub(old_put_extraction, new_put_extraction, content, count=1)
        print("✅ Додано extraction Ukrainian полів в PUT endpoint")
    else:
        print("⚠️ Не знайдено transformation_order extraction")
    
    # 2. Update PUT endpoint - modify validation check
    old_validation = r"    if all\(v is None for v in \[skill_name, skill_description, display_order, replaces_skill_id, is_transformed, transformation_order\]\):"
    
    new_validation = "    if all(v is None for v in [skill_name, skill_description, display_order, replaces_skill_id, is_transformed, transformation_order, skill_name_uk, skill_description_uk]):"
    
    if re.search(old_validation, content):
        content = re.sub(old_validation, new_validation, content)
        print("✅ Оновлено validation check в PUT endpoint")
    else:
        print("⚠️ Не знайдено validation check")
    
    # 3. Update PUT endpoint - add Ukrainian parameters to function call
    old_function_call = r"success = db\.update_hero_skill\(skill_id, skill_name, skill_description, display_order, replaces_skill_id, is_transformed, transformation_order\)"
    
    new_function_call = "success = db.update_hero_skill(skill_id, skill_name, skill_description, display_order, replaces_skill_id, is_transformed, transformation_order, skill_name_uk, skill_description_uk)"
    
    if re.search(old_function_call, content):
        content = re.sub(old_function_call, new_function_call, content)
        print("✅ Оновлено виклик update_hero_skill")
    else:
        print("⚠️ Не знайдено виклик update_hero_skill")
    
    # 4. Update POST endpoint - add Ukrainian fields extraction
    old_post_extraction = r"(    display_order = data\.get\('display_order', 0\))\s+"
    
    new_post_extraction = r"""\1
    skill_name_uk = data.get('skill_name_uk')
    skill_description_uk = data.get('skill_description_uk')
    """
    
    if re.search(old_post_extraction, content):
        content = re.sub(old_post_extraction, new_post_extraction, content, count=1)
        print("✅ Додано extraction Ukrainian полів в POST endpoint")
    else:
        print("⚠️ Не знайдено display_order extraction")
    
    # 5. Update POST endpoint - add Ukrainian fields to INSERT (Postgres)
    old_postgres_insert = r"INSERT INTO hero_skills \(hero_id, skill_name, skill_description, display_order\)"
    new_postgres_insert = "INSERT INTO hero_skills (hero_id, skill_name, skill_description, display_order, skill_name_uk, skill_description_uk)"
    
    # Update both occurrences (postgres and sqlite)
    content = re.sub(old_postgres_insert, new_postgres_insert, content)
    print("✅ Оновлено INSERT statements")
    
    # 6. Update POST endpoint - add placeholders and values (Postgres)
    old_postgres_values = r"VALUES \(\{ph\}, \{ph\}, \{ph\}, \{ph\}\)\s+RETURNING id\s+''', \(hero_id, skill_name, skill_description, display_order\)\)"
    
    new_postgres_values = "VALUES ({ph}, {ph}, {ph}, {ph}, {ph}, {ph})\n                RETURNING id\n            ''', (hero_id, skill_name, skill_description, display_order, skill_name_uk, skill_description_uk))"
    
    if re.search(old_postgres_values, content):
        content = re.sub(old_postgres_values, new_postgres_values, content)
        print("✅ Оновлено Postgres VALUES")
    else:
        print("⚠️ Не знайдено Postgres VALUES")
    
    # 7. Update POST endpoint - add placeholders and values (SQLite)
    old_sqlite_values = r"VALUES \(\{ph\}, \{ph\}, \{ph\}, \{ph\}\)\s+''', \(hero_id, skill_name, skill_description, display_order\)\)"
    
    new_sqlite_values = "VALUES ({ph}, {ph}, {ph}, {ph}, {ph}, {ph})\n            ''', (hero_id, skill_name, skill_description, display_order, skill_name_uk, skill_description_uk))"
    
    if re.search(old_sqlite_values, content):
        content = re.sub(old_sqlite_values, new_sqlite_values, content)
        print("✅ Оновлено SQLite VALUES")
    else:
        print("⚠️ Не знайдено SQLite VALUES")
    
    # Write the updated content
    with open(API_FILE, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("\n✅ api_server.py успішно оновлено!")

if __name__ == "__main__":
    main()
