#!/bin/bash

# Скрипт для оновлення counter та compatibility даних з офіційного API

PROD_URL="https://web-production-8570.up.railway.app"

echo "🔄 Оновлення counter та compatibility даних..."
echo "Це займе ~5-7 хвилин для всіх героїв."
echo ""

# Запуск оновлення
response=$(curl -s -X POST "$PROD_URL/api/heroes/update-counter-data" \
  -H "Content-Type: application/json" \
  -d '{"game_id": 2}')

echo "$response" | python3 -m json.tool

echo ""
echo "✅ Оновлення запущено в фоновому режимі!"
echo ""
echo "Перевірити результат можна через кілька хвилин:"
echo "curl -s \"$PROD_URL/api/heroes/counter-data?game_id=2\" | python3 -c \"import sys, json; data=json.load(sys.stdin); bruno=data.get('12'); print('Bruno:', bruno.get('best_counters', [])[:3])\""
