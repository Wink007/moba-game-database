#!/usr/bin/env python3

with open('/Users/alexwink/my_work/game_database/admin-panel/src/components/HeroForm.js', 'r') as f:
    content = f.read()

# 1. Add fields to initial state
content = content.replace(
    "    name_uk: '',",
    "    name_uk: '',\n    short_description_uk: '',\n    full_description_uk: '',"
)

# 2. Add fields when loading hero
content = content.replace(
    "        name_uk: hero.name_uk || '',",
    "        name_uk: hero.name_uk || '',\n        short_description_uk: hero.short_description_uk || '',\n        full_description_uk: hero.full_description_uk || '',"
)

# 3. Add input fields after name_uk field - find the closing </input> tag and add new fields
old_name_uk_field = """            <label>Hero Name (Ukrainian) 🇺🇦</label>
            <input
              type="text"
              name="name_uk"
              placeholder="Українська назва героя"
              value={formData.name_uk}
              onChange={handleInputChange}
            />
            
            <label>Hero Game ID</label>"""

new_with_descriptions = """            <label>Hero Name (Ukrainian) 🇺🇦</label>
            <input
              type="text"
              name="name_uk"
              placeholder="Українська назва героя"
              value={formData.name_uk}
              onChange={handleInputChange}
            />
            
            <label>Short Description (Ukrainian) 🇺🇦</label>
            <textarea
              name="short_description_uk"
              placeholder="Короткий опис героя українською"
              value={formData.short_description_uk}
              onChange={handleInputChange}
              rows="3"
            />
            
            <label>Full Description (Ukrainian) 🇺🇦</label>
            <textarea
              name="full_description_uk"
              placeholder="Повний опис героя українською"
              value={formData.full_description_uk}
              onChange={handleInputChange}
              rows="6"
            />
            
            <label>Hero Game ID</label>"""

content = content.replace(old_name_uk_field, new_with_descriptions)

with open('/Users/alexwink/my_work/game_database/admin-panel/src/components/HeroForm.js', 'w') as f:
    f.write(content)

print("✅ HeroForm.js successfully updated with description fields!")
