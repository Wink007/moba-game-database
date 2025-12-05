# 🎮 MOBA Game Database - Фінальна Інструкція

## ✅ Статус Проекту

**Deployment: УСПІШНО! 🎉**

- ✅ API + PostgreSQL на Railway (онлайн)
- ✅ 131 героїв, 101 equipment, 7 emblems мігровано
- ✅ Admin Panel працює локально з онлайн API
- ✅ Automatic deploy на кожен push в GitHub

---

## 🌐 Онлайн Доступ

### Railway API
**Base URL**: `https://web-production-8570.up.railway.app/api`

**Тестові ендпоінти**:
```bash
# Всі герої MLBB
curl "https://web-production-8570.up.railway.app/api/heroes?game_id=3&limit=5"

# Всі equipment
curl "https://web-production-8570.up.railway.app/api/items?game_id=3"

# Всі emblems
curl "https://web-production-8570.up.railway.app/api/emblems?game_id=3"
```

### Railway Dashboard
https://railway.app/project/2fce3be6-9533-4529-bc2c-859fb3bd4d26

### GitHub Repository
https://github.com/Wink007/moba-game-database

---

## 🚀 Швидкий Старт

### 1. Запустити Admin Panel (локально)

```bash
cd admin-panel
npm install
npm start
```

Відкриється браузер на `http://localhost:3000`

**Admin Panel автоматично підключиться до онлайн API на Railway!**

### 2. Перемкнути на Локальний API (опціонально)

Відредагуй `admin-panel/.env`:

```bash
# Закоментуй Railway API
# REACT_APP_API_URL=https://web-production-8570.up.railway.app/api

# Розкоментуй localhost
REACT_APP_API_URL=http://localhost:8080/api
```

Потім запусти локальний API:

```bash
python3 api_server.py
```

---

## 📊 Структура Бази Даних

### PostgreSQL на Railway (9 таблиць)

| Таблиця | Записів | Опис |
|---------|---------|------|
| `games` | 2 | Dota 2, MLBB |
| `heroes` | 131 | Всі герої MLBB |
| `items` | 2 | Legacy items (Dota) |
| `equipment` | 101 | MLBB equipment/items |
| `emblems` | 7 | Emblems системи |
| `battle_spells` | 12 | Battle spells |
| `hero_stats` | 1657 | Статистика героїв |
| `hero_skills` | 646 | Скіли героїв |
| `emblem_talents` | 26 | Таланти емблем |

---

## 🛠 Робочий Процес

### Розробка Локально

1. **Редагуй код**
2. **Тестуй локально** (admin panel на localhost:3000 + Railway API)
3. **Commit & Push**:
   ```bash
   git add .
   git commit -m "Update: опис змін"
   git push origin main
   ```
4. **Railway автоматично задеплоїть** нову версію API

### Робота з Базою Даних

**Локально (SQLite)**:
```bash
python3 interactive.py  # Інтерактивна робота з БД
```

**Railway (PostgreSQL)**:
```bash
railway connect Postgres  # Підключитись до Railway PostgreSQL
```

### Додати Нові Дані

**Через Admin Panel**:
1. Відкрий http://localhost:3000
2. Вибери гру (MLBB)
3. Додай героїв/items/emblems через форми

**Через API**:
```bash
curl -X POST https://web-production-8570.up.railway.app/api/heroes \
  -H "Content-Type: application/json" \
  -d '{"game_id": 3, "name": "New Hero", ...}'
```

---

## 📝 Доступні API Endpoints

### Games
- `GET /api/games` - всі ігри
- `GET /api/games/<id>` - конкретна гра
- `POST /api/games` - створити гру
- `PUT /api/games/<id>` - оновити гру
- `DELETE /api/games/<id>` - видалити гру

### Heroes
- `GET /api/heroes?game_id=<id>&limit=<n>` - герої гри
- `GET /api/heroes/<id>` - конкретний герой
- `POST /api/heroes` - створити героя
- `PUT /api/heroes/<id>` - оновити героя
- `DELETE /api/heroes/<id>` - видалити героя

### Items
- `GET /api/items?game_id=<id>` - предмети гри
- `GET /api/items/<id>` - конкретний предмет
- `POST /api/items` - створити предмет
- `PUT /api/items/<id>` - оновити предмет
- `DELETE /api/items/<id>` - видалити предмет

### Emblems
- `GET /api/emblems?game_id=<id>` - емблеми гри
- `GET /api/emblems/<id>` - конкретна емблема
- `POST /api/emblems` - створити емблему
- `PUT /api/emblems/<id>` - оновити емблему
- `DELETE /api/emblems/<id>` - видалити емблему

### Emblem Talents
- `GET /api/emblem-talents?emblem_id=<id>` - таланти емблеми
- `GET /api/emblem-talents/<id>` - конкретний талант
- `POST /api/emblem-talents` - створити талант
- `PUT /api/emblem-talents/<id>` - оновити талант
- `DELETE /api/emblem-talents/<id>` - видалити талант

### Battle Spells
- `GET /api/battle-spells?game_id=<id>` - заклинання гри
- `GET /api/battle-spells/<id>` - конкретне заклинання
- `POST /api/battle-spells` - створити заклинання
- `PUT /api/battle-spells/<id>` - оновити заклинання
- `DELETE /api/battle-spells/<id>` - видалити заклинання

---

## 🔧 Railway CLI Commands

### Перегляд логів
```bash
railway logs --service web
```

### Перегляд змінних
```bash
railway variables --service web
```

### Встановити змінну
```bash
railway variables --set KEY=VALUE --service web
```

### Підключитись до PostgreSQL
```bash
railway connect Postgres
```

### Перезапустити сервіс
```bash
railway restart --service web
```

---

## 💰 Railway Pricing

**Поточний план**: Free Trial  
**Credits**: $5/місяць  
**Термін**: 30 днів  

**Після trial**:
- Hobby Plan: $5/місяць
- Pro Plan: $20/місяць (більше ресурсів)

**Що входить**:
- PostgreSQL database
- API hosting
- Auto-deploy from GitHub
- HTTPS з Let's Encrypt
- 500MB RAM, 1GB storage

---

## 📁 Структура Проекту

```
game_database/
├── api_server.py          # Flask API server
├── database.py            # Database operations (SQLite + PostgreSQL)
├── interactive.py         # CLI для роботи з БД
├── Procfile              # Railway deployment config
├── railway.json          # Railway build settings
├── runtime.txt           # Python version
├── requirements.txt      # Python dependencies
├── .gitignore           # Git ignore
├── DEPLOYMENT_SUCCESS.md # Deployment документація
└── admin-panel/
    ├── src/
    │   ├── App.js        # Main admin panel app
    │   └── components/   # React components
    ├── package.json
    └── .env             # API URL config
```

---

## 🎯 Що Працює Зараз

✅ API на Railway з PostgreSQL  
✅ Auto-deploy з GitHub  
✅ Admin Panel локально підключений до онлайн API  
✅ Всі CRUD операції для games, heroes, items, emblems  
✅ 131 героїв MLBB з повними даними  
✅ 101 equipment з характеристиками  
✅ 7 emblems з талантами  
✅ CORS налаштовано для frontend  

---

## 🔮 Майбутні Можливості

📌 **Frontend Deployment**:
- Deploy admin-panel на Vercel/Netlify
- Публічний доступ до admin панелі

📌 **Authentication**:
- JWT токени
- User roles (admin, editor, viewer)

📌 **Caching**:
- Redis для кешування запитів
- Швидша робота API

📌 **Analytics**:
- Відстеження популярності героїв
- Статистика використання API

---

## 📞 Підтримка

**GitHub Issues**: https://github.com/Wink007/moba-game-database/issues  
**Railway Support**: https://railway.app/help  

---

## 🎉 Готово!

Проект повністю налаштовано та працює онлайн!

**Admin Panel**: `npm start` → http://localhost:3000  
**API**: https://web-production-8570.up.railway.app/api  
**Database**: PostgreSQL на Railway  

**Enjoy! 🚀**
