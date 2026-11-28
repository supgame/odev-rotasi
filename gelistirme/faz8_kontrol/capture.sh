#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
out="$(pwd)/gelistirme/faz8_kontrol"
static=/tmp/faz8-kontrol-static
VITE_SUPABASE_URL= VITE_SUPABASE_ANON_KEY= npx vite build --config gelistirme/faz8_kontrol/vite.config.ts
for width in 375 1280; do
  if [[ "$width" == 375 ]]; then height=812; else height=800; fi
  for section in 1 2 3 4; do
    size=90
    [[ "$section" == 1 ]] && size=70
    [[ "$section" == 4 ]] && size=250
    chromium-browser --headless --disable-gpu --no-sandbox --disable-breakpad --allow-file-access-from-files \
      --user-data-dir="$(mktemp -d /tmp/faz8-chrome.XXXXXX)" --window-size="${width},${height}" --virtual-time-budget=30000 \
      --screenshot="$out/section${section}_${width}x${height}_size${size}.png" \
      "file://${static}/index.html?section=${section}&size=${size}"
  done
done
chromium-browser --headless --disable-gpu --no-sandbox --disable-breakpad --allow-file-access-from-files \
  --user-data-dir="$(mktemp -d /tmp/faz8-chrome.XXXXXX)" --window-size=1280,800 --virtual-time-budget=30000 \
  --screenshot="$out/section1_mirror_1280x800_size250.png" \
  "file://${static}/index.html?section=mirror&size=250"
chromium-browser --headless --disable-gpu --no-sandbox --disable-breakpad --allow-file-access-from-files \
  --user-data-dir="$(mktemp -d /tmp/faz8-chrome.XXXXXX)" --window-size=375,812 --virtual-time-budget=30000 \
  --screenshot="$out/section1_mirror_375x812_size250.png" \
  "file://${static}/index.html?section=mirror&size=250"
