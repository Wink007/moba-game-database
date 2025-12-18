# Hero Ranks Auto-Update Guide

## 🎯 Проблема

Hero ranks змінюються **щодня** на основі актуальних матчів у Mobile Legends. Потрібно регулярно оновлювати статистику, щоб показувати користувачам актуальні дані.

---

## ✅ Рішення: Admin Panel + API Endpoint

### 1. **Admin Panel UI** (Ручне оновлення)

#### Доступ:
```
https://your-admin-panel.com
→ Вкладка "🏆 Hero Ranks"
```

#### Функції:
- **Налаштування періоду** (days: 1, 3, 7, 15, 30)
- **Вибір рангу** (all, epic, legend, mythic, honor, glory)
- **Сортування** (win_rate, ban_rate, pick_rate)
- **Кнопка оновлення** з progress indicator
- **Перегляд поточних даних**
- **Статистика** після оновлення (inserted/updated/skipped)

#### Як використовувати:
1. Зайти в admin panel
2. Обрати гру (Mobile Legends)
3. Перейти на вкладку "Hero Ranks"
4. Налаштувати параметри (наприклад: days=7, rank=all)
5. Натиснути "🔄 Оновити статистику"
6. Почекати ~5-10 секунд
7. Побачити результат: ✅ Додано: X, Оновлено: Y

---

### 2. **API Endpoint** (Програмне оновлення)

#### Request:
```bash
POST https://web-production-8570.up.railway.app/api/hero-ranks/update
Content-Type: application/json

{
  "game_id": 2,
  "days": 7,
  "rank": "all",
  "sort_field": "win_rate"
}
```

#### Response:
```json
{
  "success": true,
  "inserted": 5,
  "updated": 125,
  "skipped": 0,
  "message": "Successfully updated 5 hero ranks"
}
```

#### cURL приклад:
```bash
curl -X POST https://web-production-8570.up.railway.app/api/hero-ranks/update \
  -H "Content-Type: application/json" \
  -d '{
    "game_id": 2,
    "days": 7,
    "rank": "all",
    "sort_field": "win_rate"
  }'
```

---

## 🤖 Автоматизація (Рекомендовано)

### Варіант 1: GitHub Actions (Найпростіший)

Створіть файл `.github/workflows/update-hero-ranks.yml`:

```yaml
name: Update Hero Ranks Daily

on:
  schedule:
    # Runs every day at 3:00 AM UTC (6:00 AM Kyiv time)
    - cron: '0 3 * * *'
  workflow_dispatch: # Allows manual trigger

jobs:
  update-ranks:
    runs-on: ubuntu-latest
    steps:
      - name: Update Hero Ranks
        run: |
          curl -X POST https://web-production-8570.up.railway.app/api/hero-ranks/update \
            -H "Content-Type: application/json" \
            -d '{
              "game_id": 2,
              "days": 7,
              "rank": "all",
              "sort_field": "win_rate"
            }'
```

**Переваги:**
- ✅ Безкоштовно
- ✅ Надійно
- ✅ Не потребує сервера
- ✅ Можна запустити вручну
- ✅ Логи в GitHub

---

### Варіант 2: Railway Cron Job

Railway підтримує cron jobs через `railway.json`:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "python api_server.py"
  },
  "cron": [
    {
      "schedule": "0 3 * * *",
      "command": "python -c \"import requests; requests.post('http://localhost:8080/api/hero-ranks/update', json={'game_id': 2, 'days': 7})\""
    }
  ]
}
```

---

### Варіант 3: Python Script на сервері

```python
#!/usr/bin/env python3
"""
update_ranks_cron.py - Щоденне оновлення hero ranks
Додайте до crontab: 0 3 * * * /path/to/update_ranks_cron.py
"""

import requests
import datetime

API_URL = "https://web-production-8570.up.railway.app/api/hero-ranks/update"

def update_ranks():
    print(f"[{datetime.datetime.now()}] Starting hero ranks update...")
    
    try:
        response = requests.post(API_URL, json={
            "game_id": 2,
            "days": 7,
            "rank": "all",
            "sort_field": "win_rate"
        }, timeout=30)
        
        response.raise_for_status()
        data = response.json()
        
        print(f"✅ Success!")
        print(f"   Inserted: {data['inserted']}")
        print(f"   Updated: {data['updated']}")
        print(f"   Skipped: {data['skipped']}")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    update_ranks()
```

**Crontab:**
```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 3 AM)
0 3 * * * /usr/bin/python3 /path/to/update_ranks_cron.py >> /var/log/hero-ranks-update.log 2>&1
```

---

### Варіант 4: Vercel Cron (якщо фронтенд на Vercel)

```typescript
// /api/cron/update-ranks.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verify cron secret
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const response = await fetch(
      'https://web-production-8570.up.railway.app/api/hero-ranks/update',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_id: 2,
          days: 7,
          rank: 'all',
          sort_field: 'win_rate'
        })
      }
    );

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

**vercel.json:**
```json
{
  "crons": [
    {
      "path": "/api/cron/update-ranks",
      "schedule": "0 3 * * *"
    }
  ]
}
```

---

## 📊 Моніторинг

### Перевірка останнього оновлення:

```bash
# Get current stats
curl "https://web-production-8570.up.railway.app/api/hero-ranks?game_id=2&size=1"

# Response shows updated_at timestamp
{
  "id": 1,
  "hero_id": 104,
  "name": "Gloo",
  "win_rate": 0.5556,
  "updated_at": "2025-12-12T03:00:00Z"  # <-- Check this
}
```

### Логування:

Додайте webhook для notification (Discord, Slack, Telegram):

```python
def send_notification(data):
    webhook_url = "YOUR_DISCORD_WEBHOOK_URL"
    
    message = {
        "content": f"🏆 Hero Ranks Updated!\n"
                  f"✅ Inserted: {data['inserted']}\n"
                  f"🔄 Updated: {data['updated']}\n"
                  f"⏭️ Skipped: {data['skipped']}"
    }
    
    requests.post(webhook_url, json=message)
```

---

## 🎯 Рекомендований підхід

### Для Production:

1. **GitHub Actions** (основний метод)
   - Щоденне оновлення о 3:00 AM
   - Безкоштовно та надійно

2. **Admin Panel** (резервний метод)
   - Ручне оновлення при потребі
   - Перевірка даних
   - Зміна параметрів

3. **Моніторинг**
   - Перевірка `updated_at` timestamp
   - Discord/Slack notifications
   - Error logging

---

## 📅 Розклад оновлень

**Рекомендований schedule:**

```
🕒 03:00 AM UTC (06:00 Kyiv) - Основне оновлення (days=7, rank=all)
🕐 13:00 PM UTC (16:00 Kyiv) - Додаткове оновлення (days=1, rank=mythic)
```

**Чому о 3:00 AM?**
- Мінімальне навантаження на сервер
- Після нічних ігор у Mobile Legends
- Перед ранковим трафіком користувачів

---

## ✅ Checklist для налаштування

- [ ] Admin panel працює і має вкладку Hero Ranks
- [ ] API endpoint `/hero-ranks/update` відповідає
- [ ] GitHub Actions workflow створено
- [ ] Cron schedule налаштовано (3:00 AM)
- [ ] Тестове ручне оновлення успішне
- [ ] Моніторинг `updated_at` працює
- [ ] Notification webhook налаштовано (optional)

---

## 🚀 Quick Start

**1. Тестове оновлення:**
```bash
curl -X POST https://web-production-8570.up.railway.app/api/hero-ranks/update \
  -H "Content-Type: application/json" \
  -d '{"game_id": 2, "days": 7}'
```

**2. Перевірка результату:**
```bash
curl "https://web-production-8570.up.railway.app/api/hero-ranks?game_id=2&size=3"
```

**3. Налаштувати GitHub Actions** (скопіювати workflow файл вище)

**Done!** 🎉

Тепер hero ranks оновлюються автоматично щодня!
