#!/bin/bash
# Автоматична синхронізація даних MLBB героїв
# Запускається щодня о 03:00

cd "$(dirname "$0")"

echo "[$(date)] Starting MLBB stats sync..."

# Run sync script
railway run python3 sync_mlbb_stats.py >> logs/sync_mlbb_stats.log 2>&1

echo "[$(date)] Sync completed"
