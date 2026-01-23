#!/usr/bin/env python3
"""
Patch script to add Ukrainian translation support to database.py for hero skills
"""

import re

DATABASE_FILE = '/Users/alexwink/my_work/game_database/database.py'

def main():
    print("🔧 Оновлюю database.py для підтримки Ukrainian skills...")
    
    with open(DATABASE_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Update add_hero_skill function signature
    old_add_signature = r'def add_hero_skill\(hero_id, skill_name, skill_description, effect, preview, skill_type, skill_parameters, level_scaling, effect_types=None, is_transformed=None, transformation_order=None, display_order=None, replaces_skill_id=None\):'
    
    new_add_signature = 'def add_hero_skill(hero_id, skill_name, skill_description, effect, preview, skill_type, skill_parameters, level_scaling, effect_types=None, is_transformed=None, transformation_order=None, display_order=None, replaces_skill_id=None, skill_name_uk=None, skill_description_uk=None):'
    
    if re.search(old_add_signature, content):
        content = re.sub(old_add_signature, new_add_signature, content)
        print("✅ Оновлено сигнатуру add_hero_skill")
    else:
        print("⚠️ Не знайдено сигнатуру add_hero_skill")
    
    # 2. Update INSERT statement in add_hero_skill
    old_insert = r'INSERT INTO hero_skills \(hero_id, skill_name, skill_description, effect, preview, image,\s+skill_type, skill_parameters, level_scaling, effect_types, is_transformed, transformation_order, display_order, replaces_skill_id\)'
    
    new_insert = '''INSERT INTO hero_skills (hero_id, skill_name, skill_description, effect, preview, image,
                                skill_type, skill_parameters, level_scaling, effect_types, is_transformed, transformation_order, display_order, replaces_skill_id, skill_name_uk, skill_description_uk)'''
    
    if re.search(old_insert, content):
        content = re.sub(old_insert, new_insert, content, flags=re.MULTILINE)
        print("✅ Оновлено INSERT statement в add_hero_skill")
    else:
        print("⚠️ Не знайдено INSERT statement")
    
    # 3. Update VALUES in add_hero_skill - need to add 2 more placeholders and parameters
    # Find the VALUES line with 14 placeholders
    old_values = r'VALUES \(\{ph\}(, \{ph\}){13}\)'
    new_values = 'VALUES ({ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph}, {ph})'
    
    if re.search(old_values, content):
        content = re.sub(old_values, new_values, content)
        print("✅ Оновлено VALUES placeholders")
    else:
        print("⚠️ Не знайдено VALUES statement")
    
    # 4. Update the tuple in cursor.execute to include new parameters
    old_tuple = r'\(hero_id, skill_name, skill_description, effect_json, preview, preview, skill_type, parameters_json, scaling_json, effect_types_json, is_transformed or 0, transformation_order or 0, display_order or 0, replaces_skill_id\)'
    
    new_tuple = '(hero_id, skill_name, skill_description, effect_json, preview, preview, skill_type, parameters_json, scaling_json, effect_types_json, is_transformed or 0, transformation_order or 0, display_order or 0, replaces_skill_id, skill_name_uk, skill_description_uk)'
    
    if re.search(old_tuple, content):
        content = re.sub(old_tuple, new_tuple, content)
        print("✅ Оновлено параметри в execute tuple")
    else:
        print("⚠️ Не знайдено execute tuple")
    
    # 5. Update update_hero_skill function signature
    old_update_signature = r'def update_hero_skill\(skill_id, skill_name=None, skill_description=None, display_order=None, replaces_skill_id=None, is_transformed=None, transformation_order=None\):'
    
    new_update_signature = 'def update_hero_skill(skill_id, skill_name=None, skill_description=None, display_order=None, replaces_skill_id=None, is_transformed=None, transformation_order=None, skill_name_uk=None, skill_description_uk=None):'
    
    if re.search(old_update_signature, content):
        content = re.sub(old_update_signature, new_update_signature, content)
        print("✅ Оновлено сигнатуру update_hero_skill")
    else:
        print("⚠️ Не знайдено сигнатуру update_hero_skill")
    
    # 6. Add Ukrainian parameters to UPDATE statement in update_hero_skill
    # Find the transformation_order check and add after it
    transformation_check = r'(        if transformation_order is not None:\s+updates\.append\(f"transformation_order = \{ph\}"\)\s+params\.append\(transformation_order\))'
    
    ukrainian_checks = r'''\1
        
        if skill_name_uk is not None:
            updates.append(f"skill_name_uk = {ph}")
            params.append(skill_name_uk)
        
        if skill_description_uk is not None:
            updates.append(f"skill_description_uk = {ph}")
            params.append(skill_description_uk)'''
    
    if re.search(transformation_check, content):
        content = re.sub(transformation_check, ukrainian_checks, content, flags=re.MULTILINE | re.DOTALL)
        print("✅ Додано Ukrainian параметри до update_hero_skill")
    else:
        print("⚠️ Не знайдено transformation_order check")
    
    # Write the updated content
    with open(DATABASE_FILE, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("\n✅ database.py успішно оновлено!")

if __name__ == "__main__":
    main()
