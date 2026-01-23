#!/usr/bin/env python3

with open('/Users/alexwink/my_work/game_database/api_server.py', 'r') as f:
    content = f.read()

# Add short_description_uk and full_description_uk after name_uk
old_call = """            data.get('name_uk', None)  # Ukrainian name
        )"""

new_call = """            data.get('name_uk', None),  # Ukrainian name
            data.get('short_description_uk', None),  # Ukrainian short description
            data.get('full_description_uk', None)  # Ukrainian full description
        )"""

content = content.replace(old_call, new_call)

with open('/Users/alexwink/my_work/game_database/api_server.py', 'w') as f:
    f.write(content)

print("✅ api_server.py successfully updated!")
