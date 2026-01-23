#!/usr/bin/env python3
"""
Patch script to add Ukrainian translation support to HeroForm.js for hero skills
"""

import re

HEROFORM_FILE = '/Users/alexwink/my_work/game_database/admin-panel/src/components/HeroForm.js'

def main():
    print("🔧 Оновлюю HeroForm.js для підтримки Ukrainian skills...")
    
    with open(HEROFORM_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Add Ukrainian fields to newSkill state
    old_newskill_state = r"(  const \[newSkill, setNewSkill\] = useState\(\{\s+skill_name: '',\s+skill_description: '',)"
    
    new_newskill_state = r"\1\n    skill_name_uk: '',\n    skill_description_uk: '',"
    
    if re.search(old_newskill_state, content):
        content = re.sub(old_newskill_state, new_newskill_state, content)
        print("✅ Додано Ukrainian поля до newSkill state")
    else:
        print("⚠️ Не знайдено newSkill state")
    
    # 2. Add Ukrainian fields when resetting newSkill (after adding skill)
    old_reset_after_add = r"(      skill_name: '',\s+skill_description: '',\s+effect: \[\],)"
    new_reset_after_add = r"\1\n      skill_name_uk: '',\n      skill_description_uk: '',"
    
    if re.search(old_reset_after_add, content):
        content = re.sub(old_reset_after_add, new_reset_after_add, content)
        print("✅ Додано Ukrainian поля до reset після додавання")
    else:
        print("⚠️ Не знайдено reset після додавання")
    
    # 3. Add Ukrainian fields when setting editingSkill
    old_editing_skill = r"(      skill_name: skill\.skill_name \|\| '',\s+skill_description: skill\.skill_description \|\| '',)"
    new_editing_skill = r"\1\n      skill_name_uk: skill.skill_name_uk || '',\n      skill_description_uk: skill.skill_description_uk || '',"
    
    if re.search(old_editing_skill, content):
        content = re.sub(old_editing_skill, new_editing_skill, content)
        print("✅ Додано Ukrainian поля при редагуванні")
    else:
        print("⚠️ Не знайдено editing skill")
    
    # 4. Add Ukrainian fields when syncing from external data
    old_external_sync = r"(              skill_name: externalSkill\.skillname,\s+skill_description: externalSkill\.skilldesc \|\| '',)"
    new_external_sync = r"\1\n              skill_name_uk: '',\n              skill_description_uk: '',"
    
    if re.search(old_external_sync, content):
        content = re.sub(old_external_sync, new_external_sync, content)
        print("✅ Додано Ukrainian поля при синхронізації")
    else:
        print("⚠️ Не знайдено external sync")
    
    # 5. Add Ukrainian fields to updatePayload when updating skills
    old_update_payload = r"(            updatePayload\.skill_description = newDescription;)"
    new_update_payload = r"""\1
            const newNameUk = newSkill.skill_name_uk?.trim();
            const newDescriptionUk = newSkill.skill_description_uk?.trim();
            if (newNameUk !== undefined && newNameUk !== (matchingSkill.skill_name_uk || '')) {
              updatePayload.skill_name_uk = newNameUk;
            }
            if (newDescriptionUk !== undefined && newDescriptionUk !== (matchingSkill.skill_description_uk || '')) {
              updatePayload.skill_description_uk = newDescriptionUk;
            }"""
    
    if re.search(old_update_payload, content):
        content = re.sub(old_update_payload, new_update_payload, content)
        print("✅ Додано Ukrainian поля до updatePayload")
    else:
        print("⚠️ Не знайдено updatePayload")
    
    # 6. Add Ukrainian input fields to the form (after skill_description textarea)
    old_form_fields = r"(              <small style=\{\{ color: '#666', display: 'block', marginTop: '4px' \}\}>\s+Supports HTML: &lt;font color=\"a6aafb\"&gt;Passive&lt;/font&gt; for colored text, \\n for new lines\s+</small>)"
    
    new_form_fields = r"""\1
              
              <input
                type="text"
                name="skill_name_uk"
                placeholder="Skill Name (Ukrainian) 🇺🇦"
                value={newSkill.skill_name_uk}
                onChange={handleSkillChange}
                style={{ marginTop: '1rem' }}
              />
              
              <textarea
                name="skill_description_uk"
                placeholder="Skill Description (Ukrainian) 🇺🇦 - supports HTML tags"
                value={newSkill.skill_description_uk}
                onChange={handleSkillChange}
                rows="4"
                style={{ marginTop: '0.5rem' }}
              />"""
    
    if re.search(old_form_fields, content, re.MULTILINE | re.DOTALL):
        content = re.sub(old_form_fields, new_form_fields, content, flags=re.MULTILINE | re.DOTALL)
        print("✅ Додано Ukrainian input поля до форми")
    else:
        print("⚠️ Не знайдено form fields")
    
    # Write the updated content
    with open(HEROFORM_FILE, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("\n✅ HeroForm.js успішно оновлено!")

if __name__ == "__main__":
    main()
