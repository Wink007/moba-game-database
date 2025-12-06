#!/bin/bash
#
# Скрипт для автоматичного оновлення статистики героїв
# Можна додати в cron для щоденного запуску
#
# Приклад crontab (щодня о 03:00):
# 0 3 * * * /path/to/cron_update_stats.sh >> /var/log/mlbb_stats_update.log 2>&1
#

API_URL="https://web-production-8570.up.railway.app/api"
LOG_FILE="stats_update.log"

echo "========================================" >> $LOG_FILE
echo "Starting hero stats update: $(date)" >> $LOG_FILE
echo "========================================" >> $LOG_FILE

# Оновлення статистики через API
response=$(curl -X POST "$API_URL/update-hero-stats" \
  -H "Content-Type: application/json" \
  -d '{"game_id": 2}' \
  --max-time 600 \
  --silent)

# Логування результату
if [ $? -eq 0 ]; then
    echo "✅ Success: $response" >> $LOG_FILE
    
    # Парсимо кількість оновлених
    updated=$(echo $response | grep -o '"updated":[0-9]*' | cut -d':' -f2)
    skipped=$(echo $response | grep -o '"skipped":[0-9]*' | cut -d':' -f2)
    
    echo "Updated: $updated heroes" >> $LOG_FILE
    echo "Skipped: $skipped heroes" >> $LOG_FILE
else
    echo "❌ Failed: curl error code $?" >> $LOG_FILE
fi

echo "Finished: $(date)" >> $LOG_FILE
echo "" >> $LOG_FILE
