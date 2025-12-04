# Railway Deployment Guide

## 🚀 Деплой на Railway.app

### Крок 1: Підготовка
1. Створи акаунт на [railway.app](https://railway.app)
2. Встанови Railway CLI (опціонально):
   ```bash
   npm install -g @railway/cli
   ```

### Крок 2: Створення проєкту
1. Натисни "New Project"
2. Вибери "Deploy from GitHub repo"
3. Підключи свій GitHub репозиторій
4. Railway автоматично визначить Python проєкт

### Крок 3: Додай PostgreSQL
1. В проєкті натисни "New"
2. Вибери "Database" → "PostgreSQL"
3. Railway автоматично створить БД та встановить `DATABASE_URL`

### Крок 4: Налаштування змінних середовища
В Settings → Variables додай:
```
DATABASE_TYPE=postgres
PORT=8080
```

`DATABASE_URL` вже встановлена автоматично Railway!

### Крок 5: Міграція даних
1. Підключись до Railway PostgreSQL через CLI:
   ```bash
   railway login
   railway link
   railway connect postgres
   ```

2. Або через веб-консоль:
   - Відкрий PostgreSQL сервіс
   - Натисни "Data" → "Query"
   - Скопіюй вміст `postgres_import.sql`
   - Виконай запити

### Крок 6: Деплой
```bash
git add .
git commit -m "Deploy to Railway"
git push
```

Railway автоматично задеплоїть!

### 🔗 Отримання URL
Після деплою отримаєш URL типу:
```
https://твій-проект.railway.app
```

Зміни в `admin-panel/src/App.js`:
```javascript
const API_URL = 'https://твій-проект.railway.app/api';
```

### 📊 Моніторинг
- Логи: Railway Dashboard → Deployments → Logs
- Метрики: Dashboard → Metrics
- База даних: PostgreSQL → Data

### 💰 Безкоштовний план
- $5 кредитів/місяць
- ~500 годин роботи
- PostgreSQL включена
- Unlimited deployments

---

## 🔧 Локальна розробка з Railway БД

Встанови змінні локально:
```bash
export DATABASE_TYPE=postgres
export DATABASE_URL="postgresql://user:pass@host:5432/dbname"
python3 api_server.py
```

Або створи `.env` файл:
```
DATABASE_TYPE=postgres
DATABASE_URL=postgresql://...
```

---

## ⚠️ Troubleshooting

**Помилка: "ModuleNotFoundError: No module named 'psycopg2'"**
- Перевір що `requirements_api.txt` містить `psycopg2-binary`

**Помилка: "relation does not exist"**
- БД порожня, потрібно імпортувати дані з `postgres_import.sql`

**API не відповідає**
- Перевір логи: Dashboard → Logs
- Перевір що PORT встановлений в змінних середовища
