#!/bin/bash
# Оновлення статистики героїв через Railway API по частинах

API_URL="https://web-production-8570.up.railway.app/api/update-hero-stats"

echo "🔄 Оновлення статистики героїв..."
echo ""

# Оновлюємо по 10 героїв за раз (щоб уникнути timeout)
for i in {0..130..10}; do
    echo "📦 Оновлення героїв $i-$((i+9))..."
    
    curl -s -X POST "$API_URL" \
        -H 'Content-Type: application/json' \
        -d "{\"game_id\": 2, \"offset\": $i, \"limit\": 10}" | \
        python3 -c "
import sys, json
try:
    result = json.loads(sys.stdin.read())
    print(f\"  ✅ Оновлено: {result.get('updated', 0)}, Пропущено: {result.get('skipped', 0)}\")
except:
    print('  ❌ Помилка')
"
    
    # Пауза між пачками
    sleep 2
done

echo ""
echo "✅ Готово!"
