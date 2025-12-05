#!/usr/bin/env python3
"""
Автоматична конвертація database.py для підтримки PostgreSQL
"""

with open('database.py', 'r') as f:
    content = f.read()

# Замінюємо всі cursor.execute з ? на динамічні плейсхолдери
import re

def replace_placeholders(match):
    """Замінює ? на {ph} в SQL запитах"""
    full_match = match.group(0)
    sql_query = match.group(1) if match.lastindex >= 1 else ""
    
    # Підраховуємо кількість ?
    question_marks = sql_query.count('?')
    
    if question_marks == 0:
        return full_match
    
    # Замінюємо ? на {ph}
    new_query = sql_query.replace('?', '{ph}')
    
    # Повертаємо оновлений код
    return full_match.replace(sql_query, f'f"""{new_query}"""' if '"""' in full_match else f'f"{new_query}"')

# Патерн для пошуку cursor.execute з SQL запитами
pattern = r'cursor\.execute\((["\']""".*?"""|""".*?"""|"[^"]*"|\'[^\']*\')["\']?(?:,|\))'

# Спочатку додаємо RealDictCursor для всіх cursor
content_lines = content.split('\n')
new_lines = []

for i, line in enumerate(content_lines):
    new_lines.append(line)
    
    # Після кожного cursor = conn.cursor() додаємо RealDictCursor для PostgreSQL
    if 'cursor = conn.cursor()' in line and 'cursor_factory' not in line:
        indent = len(line) - len(line.lstrip())
        new_lines.insert(-1, line.replace('cursor = conn.cursor()', 
            'if DATABASE_TYPE == \'postgres\':\n' + ' ' * (indent + 4) + 'from psycopg2.extras import RealDictCursor\n' + 
            ' ' * (indent + 4) + 'cursor = conn.cursor(cursor_factory=RealDictCursor)\n' + 
            ' ' * indent + 'else:\n' + 
            ' ' * (indent + 4) + 'cursor = conn.cursor()'))
        new_lines.pop()

content = '\n'.join(new_lines)

# Замінюємо всі [dict(row) for row in ...] на [dict_from_row(row) for row in ...]
content = content.replace('[dict(row) for row in', '[dict_from_row(row) for row in')
content = content.replace('dict(row) if row', 'dict_from_row(row) if row')
content = content.replace('= dict(row)', '= dict_from_row(row)')

# Замінюємо всі ? на плейсхолдери в SQL запитах
def replace_execute(match):
    full = match.group(0)
    
    # Підраховуємо ?
    if '?' not in full:
        return full
    
    # Додаємо ph = get_placeholder() перед execute якщо немає
    indent = len(full) - len(full.lstrip())
    
    # Замінюємо всі ? на {ph}
    new_full = full.replace('?', '{ph}')
    
    # Робимо запит f-string
    new_full = new_full.replace('("', '(f"').replace("('", "(f'").replace('("""', '(f"""')
    
    return new_full

content = re.sub(r'cursor\.execute\([^)]+\)', replace_execute, content)

# Додаємо ph = get_placeholder() перед кожним cursor.execute якщо є {ph}
lines = content.split('\n')
new_lines = []
for i, line in enumerate(lines):
    if 'cursor.execute' in line and '{ph}' in line:
        # Перевіряємо чи немає вже ph = get_placeholder()
        prev_lines = '\n'.join(lines[max(0, i-5):i])
        if 'ph = get_placeholder()' not in prev_lines:
            indent = len(line) - len(line.lstrip())
            new_lines.append(' ' * indent + 'ph = get_placeholder()')
    new_lines.append(line)

content = '\n'.join(new_lines)

# Зберігаємо
with open('database.py', 'w') as f:
    f.write(content)

print("✅ database.py оновлено для підтримки PostgreSQL!")
