# Hero Metadata Update - createdAt & head

## Що було додано

Додано два нові поля для героїв у базі даних:

1. **`createdAt`** (INTEGER) - timestamp створення героя в мілісекундах з API
2. **`head`** (TEXT) - URL зображення аватара героя з офіційного API

## Джерело даних

Дані отримуються з офіційного API Mobile Legends:
```
https://mlbb-stats.ridwaanhall.com/api/hero-detail/{hero_name}/
```

Приклад для Hanabi:
```
https://mlbb-stats.ridwaanhall.com/api/hero-detail/hanabi/
```

## Структура змін

### 1. База даних
```sql
ALTER TABLE heroes ADD COLUMN createdAt INTEGER;
ALTER TABLE heroes ADD COLUMN head TEXT;
```

### 2. Backend (database.py, api_server.py)
- Оновлено функції `add_hero()` та `update_hero()` для підтримки нових полів
- API endpoints підтримують нові поля автоматично

### 3. Frontend (HeroForm.js)
- Додано поля для відображення `createdAt` та `head`
- `createdAt` відображається як читабельна дата
- `head` відображається як кругле зображення (аватар)

## Використання

### Автоматичне оновлення всіх героїв

Запустіть скрипт для оновлення даних з API:

```bash
python3 fetch_hero_metadata.py
```

Скрипт:
- Знайде всіх героїв з `game_id = 3` (Mobile Legends)
- Для кожного героя зробить запит до API
- Оновить поля `createdAt` та `head` в базі даних
- Виведе статистику оновлення

### Результат останнього запуску

✅ Оновлено: **131 герой**
- Всі герої Mobile Legends отримали дані з API
- Додано timestamps створення
- Додано URLs аватарів героїв

### Приклад даних

Для героя **Hanabi**:
```json
{
  "createdAt": 1710416511839,
  "head": "https://akmweb.youngjoygame.com/web/svnres/img/mlbb/homepage/100_8a9c1966feb34e85d7bdcc1ed01ffb5d.png"
}
```

Дата створення: `14 березня 2024, 08:55:11`

## Файли що були змінені

1. ✅ `database.py` - додано параметри до функцій героїв
2. ✅ `api_server.py` - оновлено API endpoints
3. ✅ `admin-panel/src/components/HeroForm.js` - UI для нових полів
4. ✅ `fetch_hero_metadata.py` - новий скрипт для завантаження даних

## Примітки

- Поля `createdAt` та `head` опціональні (можуть бути NULL)
- При створенні нового героя через админ-панель ці поля можна залишити порожніми
- Для оновлення даних існуючих героїв запустіть `fetch_hero_metadata.py`
- API має rate limiting, тому скрипт робить паузу 0.5 сек між запитами
