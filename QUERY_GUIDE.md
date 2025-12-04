# 🔍 ШПАРГАЛКА: Як робити запити до бази даних

## 📚 Способи роботи з базою даних

---

## 1️⃣ Через Python API (Найпростіше)

### Підключення:
```python
from database import GameDatabase

db = GameDatabase("test_games.db")
db.connect()

# ... ваші запити ...

db.disconnect()
```

### Готові методи:

#### 🎮 ІГРИ:
```python
# Всі ігри
games = db.get_all_games()

# Гра за ID
game = db.get_game(1)

# Гра за назвою
game = db.get_game_by_name("Dota 2")

# Додати гру
game_id = db.add_game("Minecraft", "Sandbox game", genre="Sandbox")
```

#### 👥 ГЕРОЇ:
```python
# Герої гри (без навичок)
heroes = db.get_heroes_by_game(game_id, include_skills=False)

# Герої гри (з навичками)
heroes = db.get_heroes_by_game(game_id, include_skills=True)

# Один герой з навичками
hero = db.get_hero(hero_id, include_skills=True)

# Додати героя
hero_id = db.add_hero(game_id, "Zeus", role="Intelligence")
```

#### ⚔️ НАВИЧКИ:
```python
# Додати навичку
skill_id = db.add_hero_skill(
    hero_id=1,
    skill_name="Lightning Bolt",
    damage=350.0,
    mana_cost=150,
    cooldown=6.0,
    skill_type="Active"
)
```

#### 🎒 ПРЕДМЕТИ:
```python
# Всі предмети гри
items = db.get_items_by_game(game_id)

# Один предмет
item = db.get_item(item_id)

# Пошук предметів
results = db.search_items(game_id, "sword")

# Додати предмет
item_id = db.add_item(
    game_id=1,
    name="Divine Rapier",
    cost=5600,
    stats={"damage": 350, "drop_on_death": True}
)
```

#### 📊 СТАТИСТИКА:
```python
# Статистика гри
stats = db.get_game_stats(game_id)
print(f"Героїв: {stats['heroes_count']}")
print(f"Предметів: {stats['items_count']}")
print(f"Навичок: {stats['skills_count']}")
```

---

## 2️⃣ Власні SQL запити через Python

```python
from database import GameDatabase

db = GameDatabase("test_games.db")
db.connect()

# Виконати SQL запит
db.cursor.execute("""
    SELECT name, cost 
    FROM items 
    WHERE cost > 3000
    ORDER BY cost DESC
""")

# Отримати результати
results = db.cursor.fetchall()
for row in results:
    print(f"{row['name']}: {row['cost']} золота")

db.disconnect()
```

### Корисні SQL запити:

#### Топ найдорожчих предметів:
```python
db.cursor.execute("""
    SELECT name, cost 
    FROM items 
    WHERE game_id = ?
    ORDER BY cost DESC 
    LIMIT 5
""", (game_id,))
```

#### Герої з кількістю навичок:
```python
db.cursor.execute("""
    SELECT h.name, COUNT(s.id) as skills_count
    FROM heroes h
    LEFT JOIN hero_skills s ON h.id = s.hero_id
    GROUP BY h.id
    ORDER BY skills_count DESC
""")
```

#### Середній урон по героям:
```python
db.cursor.execute("""
    SELECT h.name, AVG(s.damage) as avg_damage
    FROM heroes h
    JOIN hero_skills s ON h.id = s.hero_id
    WHERE s.damage IS NOT NULL
    GROUP BY h.id
""")
```

#### Пошук героїв по ролі:
```python
db.cursor.execute("""
    SELECT name, role, description
    FROM heroes
    WHERE role LIKE ?
""", ("%Intelligence%",))
```

#### Найсильніші навички:
```python
db.cursor.execute("""
    SELECT h.name as hero, s.skill_name, s.damage
    FROM hero_skills s
    JOIN heroes h ON s.hero_id = h.id
    WHERE s.damage IS NOT NULL
    ORDER BY s.damage DESC
    LIMIT 10
""")
```

---

## 3️⃣ Через SQLite CLI (Командний рядок)

### Відкрити базу даних:
```bash
sqlite3 test_games.db
```

### Корисні команди SQLite:
```sql
-- Показати всі таблиці
.tables

-- Структура таблиці
.schema heroes

-- Гарний вивід
.mode column
.headers on

-- Всі ігри
SELECT * FROM games;

-- Герої та навички
SELECT h.name, s.skill_name, s.damage
FROM heroes h
LEFT JOIN hero_skills s ON h.id = s.hero_id;

-- Експорт у CSV
.mode csv
.output heroes.csv
SELECT * FROM heroes;
.output stdout

-- Вихід
.quit
```

### Швидкий запит без входу в SQLite:
```bash
sqlite3 test_games.db "SELECT name, genre FROM games;"
```

---

## 4️⃣ Інтерактивний режим

Найпростіший спосіб для початківців:

```bash
python3 interactive.py
```

Виберіть опцію з меню для перегляду/додавання даних.

---

## 5️⃣ Приклади складних запитів

### Повна інформація про гру:
```python
from database import GameDatabase

db = GameDatabase("test_games.db")
db.connect()

game_id = 1

# Гра
game = db.get_game(game_id)
print(f"🎮 {game['name']}")

# Герої з навичками
heroes = db.get_heroes_by_game(game_id, include_skills=True)
print(f"\n👥 Герої ({len(heroes)}):")
for hero in heroes:
    print(f"  • {hero['name']} ({hero['role']})")
    for skill in hero.get('skills', []):
        print(f"    - {skill['skill_name']}: {skill['damage']} урону")

# Предмети
items = db.get_items_by_game(game_id)
print(f"\n🎒 Предмети ({len(items)}):")
for item in items:
    print(f"  • {item['name']}: {item['cost']} золота")

db.disconnect()
```

### Аналіз балансу:
```python
# Найсильніші герої (по середньому урону)
db.cursor.execute("""
    SELECT 
        h.name,
        h.role,
        COUNT(s.id) as skills_count,
        AVG(s.damage) as avg_damage,
        MAX(s.damage) as max_damage,
        SUM(s.damage) as total_damage
    FROM heroes h
    LEFT JOIN hero_skills s ON h.id = s.hero_id
    WHERE h.game_id = ? AND s.damage IS NOT NULL
    GROUP BY h.id
    ORDER BY avg_damage DESC
""", (game_id,))

for row in db.cursor.fetchall():
    print(f"{row['name']} ({row['role']})")
    print(f"  Середній урон: {row['avg_damage']:.1f}")
    print(f"  Макс урон: {row['max_damage']}")
    print(f"  Всього урону: {row['total_damage']}")
```

### Економіка предметів:
```python
db.cursor.execute("""
    SELECT 
        item_type,
        COUNT(*) as count,
        AVG(cost) as avg_cost,
        MIN(cost) as min_cost,
        MAX(cost) as max_cost
    FROM items
    WHERE game_id = ? AND cost IS NOT NULL
    GROUP BY item_type
    ORDER BY avg_cost DESC
""", (game_id,))
```

---

## 6️⃣ Швидкі команди

### Python one-liner:
```bash
python3 -c "from database import GameDatabase; db = GameDatabase('test_games.db'); db.connect(); print([g['name'] for g in db.get_all_games()])"
```

### SQL one-liner:
```bash
sqlite3 test_games.db "SELECT COUNT(*) FROM heroes;"
```

---

## 💡 Підказки

1. **Для простих запитів** - використовуйте готові методи API
2. **Для складних запитів** - пишіть SQL через cursor.execute()
3. **Для навчання** - використовуйте інтерактивний режим
4. **Для дебагу** - SQLite CLI
5. **Завжди** закривайте з'єднання: `db.disconnect()`

---

## 📖 Корисні посилання

- SQLite документація: https://www.sqlite.org/docs.html
- DB Browser for SQLite: https://sqlitebrowser.org/
- SQL Tutorial: https://www.w3schools.com/sql/

---

## 🚀 Швидкий старт

```bash
# Подивитись приклади всіх запитів
python3 query_examples.py

# Інтерактивна робота
python3 interactive.py

# SQL в терміналі
sqlite3 test_games.db
```
