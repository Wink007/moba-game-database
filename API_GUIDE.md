# 🌐 REST API для бази даних ігор

## 📖 Що це?

REST API сервер для отримання даних з бази даних через HTTP GET запити. Можна використовувати з:
- curl (командний рядок)
- Python (requests)
- JavaScript (fetch)
- Будь-який HTTP клієнт

---

## 🚀 Швидкий старт

### 1. Встановити залежності:
```bash
pip3 install flask requests
```

### 2. Запустити сервер:
```bash
cd /tmp/game_database
python3 api_server.py
```

Сервер запуститься на: **http://localhost:5000**

### 3. Відкрити у браузері:
```
http://localhost:5000
```

Ви побачите документацію з усіма доступними endpoints.

---

## 📋 Доступні API endpoints

### Ігри:
```bash
GET /api/games              # Всі ігри
GET /api/games/<id>         # Гра за ID
GET /api/games/<id>/heroes  # Герої гри
GET /api/games/<id>/items   # Предмети гри
GET /api/games/<id>/stats   # Статистика гри
```

### Герої та предмети:
```bash
GET /api/heroes/<id>        # Герой за ID
GET /api/items/<id>         # Предмет за ID
GET /api/search/items       # Пошук предметів
```

---

## 💡 Приклади використання

### 1️⃣ CURL (командний рядок)

```bash
# Всі ігри
curl http://localhost:5000/api/games

# Гра за ID (красивий JSON)
curl http://localhost:5000/api/games/1 | python3 -m json.tool

# Герої з навичками
curl 'http://localhost:5000/api/games/1/heroes?include_skills=true'

# Предмети гри
curl http://localhost:5000/api/games/1/items

# Статистика
curl http://localhost:5000/api/games/1/stats

# Пошук предметів
curl 'http://localhost:5000/api/search/items?game_id=1&query=Black'
```

### 2️⃣ Python

```python
import requests

# Отримати всі ігри
response = requests.get('http://localhost:5000/api/games')
data = response.json()

if data['success']:
    for game in data['data']:
        print(f"{game['name']} ({game['genre']})")

# Отримати героїв з навичками
response = requests.get(
    'http://localhost:5000/api/games/1/heroes',
    params={'include_skills': 'true'}
)
heroes = response.json()['data']

for hero in heroes:
    print(f"\n{hero['name']} - {hero['role']}")
    for skill in hero.get('skills', []):
        print(f"  • {skill['skill_name']}: {skill['damage']} урону")
```

**Запустити готові приклади:**
```bash
python3 api_client_examples.py
```

### 3️⃣ JavaScript (fetch)

```javascript
// Отримати всі ігри
fetch('http://localhost:5000/api/games')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            data.data.forEach(game => {
                console.log(`${game.name} (${game.genre})`);
            });
        }
    });

// Отримати героїв з навичками
fetch('http://localhost:5000/api/games/1/heroes?include_skills=true')
    .then(response => response.json())
    .then(data => {
        data.data.forEach(hero => {
            console.log(hero.name, hero.skills);
        });
    });
```

### 4️⃣ JavaScript (async/await)

```javascript
async function getGameData() {
    try {
        // Отримати гру
        const gameResponse = await fetch('http://localhost:5000/api/games/1');
        const gameData = await gameResponse.json();
        console.log('Гра:', gameData.data.name);
        
        // Отримати героїв
        const heroesResponse = await fetch('http://localhost:5000/api/games/1/heroes?include_skills=true');
        const heroesData = await heroesResponse.json();
        console.log('Героїв:', heroesData.count);
        
        // Отримати предмети
        const itemsResponse = await fetch('http://localhost:5000/api/games/1/items');
        const itemsData = await itemsResponse.json();
        console.log('Предметів:', itemsData.count);
        
    } catch (error) {
        console.error('Помилка:', error);
    }
}

getGameData();
```

---

## 📊 Формат відповіді

Всі endpoints повертають JSON у форматі:

### Успішна відповідь:
```json
{
  "success": true,
  "count": 2,
  "data": [...]
}
```

### Помилка:
```json
{
  "success": false,
  "error": "Опис помилки"
}
```

---

## 🔧 Параметри запитів

### GET /api/games/\<id\>/heroes
**Параметри:**
- `include_skills` (true/false) - включити навички героїв

**Приклад:**
```bash
curl 'http://localhost:5000/api/games/1/heroes?include_skills=true'
```

### GET /api/heroes/\<id\>
**Параметри:**
- `include_skills` (true/false) - включити навички

### GET /api/search/items
**Параметри (обов'язкові):**
- `game_id` (int) - ID гри
- `query` (string) - пошуковий запит

**Приклад:**
```bash
curl 'http://localhost:5000/api/search/items?game_id=1&query=sword'
```

---

## 🧪 Тестування API

### Автоматичний тест (bash):
```bash
bash test_api.sh
```

### Автоматичний тест (Python):
```bash
python3 api_client_examples.py
```

### Ручне тестування у браузері:
1. Запустити сервер: `python3 api_server.py`
2. Відкрити: http://localhost:5000
3. Клікати на посилання для тестування різних endpoints

---

## 📁 Структура проекту

```
game_database/
├── api_server.py              # REST API сервер
├── api_client_examples.py     # Приклади Python запитів
├── test_api.sh                # Bash скрипт для тестування
├── API_GUIDE.md              # Ця документація
├── requirements_api.txt       # Залежності для API
└── test_games.db             # База даних
```

---

## 🔒 Налаштування

### Змінити порт:
У файлі `api_server.py` змініть:
```python
app.run(debug=True, host='0.0.0.0', port=5000)  # Змініть 5000 на інший порт
```

### Змінити базу даних:
У файлі `api_server.py` змініть:
```python
DB_PATH = "test_games.db"  # Змініть на ваш файл
```

### Додати CORS (для доступу з браузера):
```bash
pip3 install flask-cors
```

У `api_server.py` додайте:
```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Додати після створення app
```

---

## 🚦 Коди відповідей

- `200 OK` - Успішний запит
- `404 Not Found` - Ресурс не знайдено
- `400 Bad Request` - Невірні параметри
- `500 Internal Server Error` - Помилка сервера

---

## 💾 Приклади реальних сценаріїв

### Сценарій 1: Отримати повну інформацію про гру
```python
import requests

game_id = 1
base_url = 'http://localhost:5000'

# Гра
game = requests.get(f'{base_url}/api/games/{game_id}').json()['data']

# Герої з навичками
heroes = requests.get(
    f'{base_url}/api/games/{game_id}/heroes',
    params={'include_skills': 'true'}
).json()['data']

# Предмети
items = requests.get(f'{base_url}/api/games/{game_id}/items').json()['data']

# Статистика
stats = requests.get(f'{base_url}/api/games/{game_id}/stats').json()['data']

print(f"Гра: {game['name']}")
print(f"Героїв: {len(heroes)}, Предметів: {len(items)}")
```

### Сценарій 2: Знайти всі предмети дорожче 3000
```python
import requests

response = requests.get('http://localhost:5000/api/games/1/items')
items = response.json()['data']

expensive_items = [item for item in items if item.get('cost', 0) > 3000]

for item in expensive_items:
    print(f"{item['name']}: {item['cost']} золота")
```

### Сценарій 3: Знайти героїв певної ролі
```python
import requests

response = requests.get('http://localhost:5000/api/games/1/heroes')
heroes = response.json()['data']

intelligence_heroes = [h for h in heroes if 'Intelligence' in h.get('role', '')]

for hero in intelligence_heroes:
    print(f"{hero['name']} - {hero['role']}")
```

---

## 🐛 Troubleshooting

### Помилка: "Connection refused"
- Перевірте чи запущено сервер: `python3 api_server.py`
- Перевірте чи правильний порт (5000)

### Помилка: "ModuleNotFoundError: No module named 'flask'"
```bash
pip3 install flask
```

### Помилка: "Database file not found"
- Створіть БД: `python3 test_database.py`

### Порт зайнятий
- Змініть порт у `api_server.py` або зупиніть процес на порту 5000:
```bash
lsof -ti:5000 | xargs kill -9
```

---

## 📚 Додаткові ресурси

- Flask документація: https://flask.palletsprojects.com/
- REST API best practices: https://restfulapi.net/
- HTTP статус коди: https://httpstatuses.com/

---

## ✅ Готово!

Тепер у вас є повнофункціональний REST API для роботи з базою даних ігор! 🎮

**Запустіть сервер:**
```bash
python3 api_server.py
```

**Відкрийте браузер:**
```
http://localhost:5000
```

**Або тестуйте через curl/Python!** 🚀
