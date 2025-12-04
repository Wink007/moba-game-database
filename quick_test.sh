#!/bin/bash

# Швидкі команди для тестування API
# Сервер має бути запущеним на http://localhost:8080

BASE="http://localhost:8080"

echo "🧪 Швидкі тести API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -e "\n1️⃣  Всі ігри:"
curl -s "$BASE/api/games" | python3 -m json.tool | grep -E '"name"|"genre"' | head -4

echo -e "\n2️⃣  Гра Dota 2:"
curl -s "$BASE/api/games/1" | python3 -m json.tool | grep -E '"name"|"description"'

echo -e "\n3️⃣  Статистика:"
curl -s "$BASE/api/games/1/stats" | python3 -m json.tool

echo -e "\n4️⃣  Герої (імена):"
curl -s "$BASE/api/games/1/heroes" | python3 -c "import sys,json; data=json.load(sys.stdin); print('\n'.join(['  • '+h['name'] for h in data['data']]))"

echo -e "\n5️⃣  Предмети (топ-3):"
curl -s "$BASE/api/games/1/items" | python3 -c "import sys,json; data=json.load(sys.stdin); [print(f\"  • {i['name']}: {i['cost']} золота\") for i in sorted(data['data'], key=lambda x: x.get('cost',0), reverse=True)[:3]]"

echo -e "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Всі тести виконано!"
