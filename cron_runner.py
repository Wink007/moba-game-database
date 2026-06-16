#!/usr/bin/env python3
"""
Daily cron runner — executed by Railway Cron Job at 0 15 * * * UTC (= 18:00 Kyiv).
Runs all three Moonton data sync tasks sequentially.
"""
import os
import sys
import time
import subprocess
from pathlib import Path
from datetime import datetime

BASE = Path(__file__).parent


def _load_env():
    env_path = BASE / '.env'
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            line = line.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue
            key, val = line.split('=', 1)
            os.environ.setdefault(key.strip(), val.strip().strip('"').strip("'"))


def run_script(name, timeout=1200):
    print(f'\n{"="*60}')
    print(f'[{datetime.utcnow().isoformat()}] START: {name}')
    print('='*60)
    t0 = time.time()
    result = subprocess.run(
        [sys.executable, str(BASE / name)],
        capture_output=True, text=True,
        timeout=timeout,
        env=os.environ.copy(),
        cwd=str(BASE),
    )
    elapsed = round(time.time() - t0)
    if result.stdout:
        print(result.stdout[-3000:])
    if result.returncode != 0:
        print(f'❌ FAILED (exit {result.returncode}) in {elapsed}s')
        if result.stderr:
            print(result.stderr[-500:])
    else:
        print(f'✅ OK in {elapsed}s')
    return result.returncode == 0


def main():
    _load_env()
    print(f'\n🕒 Cron started at {datetime.utcnow().isoformat()} UTC')

    ok1 = run_script('update_hero_ranks_from_moonton.py', timeout=1200)  # ~15 min
    ok2 = run_script('update_moonton_stats_final.py', timeout=900)       # ~7 min

    print(f'\n🏁 Done. hero_ranks={ok1} counter/compat={ok2}')
    sys.exit(0 if (ok1 and ok2) else 1)


if __name__ == '__main__':
    main()
