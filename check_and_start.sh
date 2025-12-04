#!/bin/bash

cd /Users/alex/My/game_database

echo "🔍 Перевірка серверів..."

# Перевірка API
if ! lsof -ti:8080 > /dev/null; then
    echo "🚀 Запуск API на порту 8080..."
    python3 api_server.py > api.log 2>&1 &
    sleep 2
fi

# Перевірка React
if ! lsof -ti:3000 > /dev/null; then
    echo "🚀 Запуск React на порту 3000..."
    cd admin-panel
    npm start > react.log 2>&1 &
    cd ..
    sleep 3
fi

echo ""
echo "✅ Статус:"
lsof -ti:8080 > /dev/null && echo "  API (8080): ✅ Працює" || echo "  API (8080): ❌ Не працює"
lsof -ti:3000 > /dev/null && echo "  React (3000): ✅ Працює" || echo "  React (3000): ❌ Не працює"
echo ""
echo "🌐 Відкрийте: http://localhost:3000"
