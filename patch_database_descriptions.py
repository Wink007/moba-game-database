#!/usr/bin/env python3

with open('/Users/alexwink/my_work/game_database/database.py', 'r') as f:
    content = f.read()

# Update function signature - add short_description_uk and full_description_uk
content = content.replace(
    'name_uk=None):',
    'name_uk=None, short_description_uk=None, full_description_uk=None):'
)

# Update SET clause in UPDATE statement
content = content.replace(
    'name_uk = {ph}',
    'name_uk = {ph}, short_description_uk = {ph}, full_description_uk = {ph}'
)

# Update VALUES tuple - add new parameters before hero_id
content = content.replace(
    'name_uk, hero_id)',
    'name_uk, short_description_uk, full_description_uk, hero_id)'
)

with open('/Users/alexwink/my_work/game_database/database.py', 'w') as f:
    f.write(content)

print("✅ database.py successfully updated with Ukrainian description support!")
