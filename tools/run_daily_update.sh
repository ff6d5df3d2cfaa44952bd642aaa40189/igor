#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
python3 tools/update_jk_catalog.py >> data/jk_update.log 2>&1
