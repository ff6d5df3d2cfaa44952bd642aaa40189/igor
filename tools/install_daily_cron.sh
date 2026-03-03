#!/usr/bin/env bash
set -euo pipefail
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CRON_CMD="0 3 * * * ${REPO_DIR}/tools/run_daily_update.sh"
( crontab -l 2>/dev/null | grep -v "run_daily_update.sh"; echo "$CRON_CMD" ) | crontab -
echo "Installed cron: $CRON_CMD"
