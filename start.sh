#!/bin/bash

echo "🚀 Запуск Game Database..."
echo ""

# Перевірка чи запущений API сервер
if lsof -i :8080 > /dev/null 2>&1; then
    echo "⚠️  API сервер вже працює на порту 8080"
else
    echo "📡 Запуск API сервера..."
    cd /Users/alex/My/game_database
    python3 api_server.py &
    API_PID=$!
    echo "✅ API сервер запущено (PID: $API_PID)"
    sleep 2
fi

echo ""

# Перевірка чи запущена адмінка
if lsof -i :3000 > /dev/null 2>&1; then
    echo "⚠️  React адмінка вже працює на порту 3000"
else
    echo "⚛️  Запуск React адмінки..."
    cd /Users/alex/My/game_database/admin-panel
    npm start &
    REACT_PID=$!
    echo "✅ React адмінка запускається (PID: $REACT_PID)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Готово!"
echo ""
echo "📍 API сервер:    http://localhost:8080"
echo "🎨 Адмін панель:  http://localhost:3000"
echo ""
echo "⏹️  Зупинити: pkill -f api_server.py && pkill -f react-scripts"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
