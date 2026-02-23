#!/usr/bin/env python3
"""Find ALL incorrect hero name transliterations in descriptions"""
import psycopg2
import re

DB_URL = 'postgresql://postgres:AgAAUwYzsOuUEzuKvjSQIUUXaxoTfGIn@crossover.proxy.rlwy.net:34790/railway?sslmode=require'

conn = psycopg2.connect(DB_URL)
cur = conn.cursor()

cur.execute("""
    SELECT h.name, hs.skill_name, hs.skill_name_uk, hs.skill_description_uk, hs.id
    FROM hero_skills hs
    JOIN heroes h ON h.id = hs.hero_id
    WHERE h.game_id = 2
    ORDER BY h.name, hs.display_order
""")
skills = cur.fetchall()
conn.close()

# Collect all Cyrillic words that look like hero name transliterations
# group by hero  
hero_skills = {}
for hero, sname, sname_uk, desc_uk, sid in skills:
    if hero not in hero_skills:
        hero_skills[hero] = []
    hero_skills[hero].append((sname, sname_uk, desc_uk, sid))

# Check each hero's descriptions for transliteration of their name
print("=== HERO NAME TRANSLITERATIONS FOUND IN OWN SKILL DESCRIPTIONS ===")
for hero in sorted(hero_skills.keys()):
    found_names = set()
    for sname, sname_uk, desc, sid in hero_skills[hero]:
        if not desc:
            continue
        # Check first 50 chars for hero name (usually at start)
        text = desc[:500]
        # Extract capitalized Cyrillic words that could be hero names
        words = re.findall(r'[А-ЯІЇЄҐ][а-яіїєґ\']+(?:\s[А-ЯІЇЄҐ][а-яіїєґ\']+)?', text)
        for w in words:
            found_names.add(w)
    if found_names:
        # Filter to likely hero name transliterations
        # (first word in many descriptions is the hero name)
        first_words = set()
        for sname, sname_uk, desc, sid in hero_skills[hero]:
            if desc:
                m = re.match(r'(?:<[^>]+>)?(?:<[^>]+>)?\s*([А-ЯІЇЄҐ][а-яіїєґ\'-]+)', desc)
                if m:
                    first_words.add(m.group(1))
        if first_words:
            print(f"  {hero}: {', '.join(sorted(first_words))}")

# Check for English names left in descriptions
print("\n\n=== ENGLISH HERO/SKILL NAMES IN UK DESCRIPTIONS (samples) ===")
en_names_found = {}
for hero, sname, sname_uk, desc, sid in skills:
    if not desc:
        continue
    # Find English words that seem like proper nouns
    en_words = re.findall(r'\b[A-Z][a-z]{2,}\b', desc)
    # Filter out HTML tags, color values
    en_words = [w for w in en_words if w not in ['Passive', 'HP', 'Stack', 'Stacks']]
    for w in en_words:
        if w not in en_names_found:
            en_names_found[w] = []
        en_names_found[w].append(f"{hero}/{sname}")

print("Most common English words left:")
for word, locations in sorted(en_names_found.items(), key=lambda x: -len(x[1]))[:40]:
    if len(locations) >= 2:
        print(f"  '{word}': {len(locations)} occurrences — {', '.join(locations[:3])}")

# Also check specific bad translations
print("\n\n=== SPECIFIC BAD TRANSLATIONS ===")
bad_patterns = [
    ('Бета-версія', 'Alpha'),  # "Beta version" instead of "Beta" (the robot)
    ('Щелепеголова', 'Jawhead'),  # word-by-word translation
    ('Фригідне', 'Atlas/Aurora'),  # "frigid" has wrong connotation
    ('Фрідний', 'Aurora'),  # misspelling
    ('Авл ', 'Aulus'),  # wrong transliteration
    ('Баксія', 'Baxia'),  # wrong transliteration
    ('Олдос', 'Aldous'),  # wrong transliteration
    ('Марк Баксія', 'Baxia'),
]
for pattern, context in bad_patterns:
    count = 0
    for hero, sname, sname_uk, desc, sid in skills:
        if desc and pattern in desc:
            count += 1
            if count <= 2:
                idx = desc.index(pattern)
                start = max(0, idx - 20)
                end = min(len(desc), idx + len(pattern) + 30)
                print(f"  '{pattern}' in {hero}/{sname}: ...{desc[start:end]}...")
        if sname_uk and pattern in sname_uk:
            print(f"  '{pattern}' in SKILL NAME: {hero}/{sname} → {sname_uk}")
    if count:
        print(f"  Total: {count} occurrences\n")

with open('/tmp/names_audit_done.txt', 'w') as f:
    f.write("DONE\n")
