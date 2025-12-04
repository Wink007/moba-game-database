#!/bin/bash

echo "======================================"
echo "🚀 ЗАПУСК GAME DATABASE ADMIN PANEL"
echo "======================================"
echo ""

# Перевірити чи існує база даних
if [ ! -f "test_games.db" ]; then
    echo "⚠️  База даних не знайдена. Створюю тестову базу..."
    python3 test_database.py
    echo ""
fi

# Перевірити чи встановлено npm пакети
if [ ! -d "admin-panel/node_modules" ]; then
    echo "📦 Встановлюю npm пакети..."
    cd admin-panel && npm install && cd ..
    echo ""
fi

echo "📍 API сервер буде на: http://localhost:8080"
echo "📍 React додаток буде на: http://localhost:3000"
echo ""
echo "⏹️  Щоб зупинити обидва сервери, натисніть Ctrl+C"
echo "======================================"
echo ""

# Функція для очищення процесів при виході
cleanup() {
    echo ""
    echo "🛑 Зупиняю сервери..."
    kill $API_PID $REACT_PID 2>/dev/null
    exit 0
}

trap cleanup INT TERM

# Запустити API сервер у фоні
echo "🔧 Запускаю Flask API сервер..."
python3 api_server.py > api_server.log 2>&1 &
API_PID=$!

# Почекати 2 секунди щоб API встиг запуститись
sleep 2

# Перевірити чи API запустився
if kill -0 $API_PID 2>/dev/null; then
    echo "✅ API сервер запущено (PID: $API_PID)"
else
    echo "❌ Помилка запуску API сервера. Дивіться api_server.log"
    exit 1
fi

# Запустити React у фоні
echo "⚛️  Запускаю React додаток..."
cd admin-panel
npm start > ../react_app.log 2>&1 &
REACT_PID=$!
cd ..

# Почекати 3 секунди
sleep 3

if kill -0 $REACT_PID 2>/dev/null; then
    echo "✅ React додаток запущено (PID: $REACT_PID)"
else
    echo "❌ Помилка запуску React. Дивіться react_app.log"
    kill $API_PID
    exit 1
fi

echo ""
echo "======================================"
echo "✨ ВСЕ ЗАПУЩЕНО!"
echo "======================================"
echo ""
echo "🌐 Відкрийте у браузері: http://localhost:3000"
echo ""
echo "Логи:"
echo "  - API: api_server.log"
echo "  - React: react_app.log"
echo ""

# Почекати завершення (буде чекати поки не натиснуть Ctrl+C)
wait
