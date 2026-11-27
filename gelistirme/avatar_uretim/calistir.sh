#!/bin/bash
# Fazları sırayla tek Codex ile çalıştırır.
cd /home/Edrow/ChatGPT/odev-rotasi
for f in 1 2 3 4; do
  [ -f gelistirme/avatar_uretim/faz$f.bitti ] && continue
  codex exec -c model_reasoning_effort="medium" -C /home/Edrow/ChatGPT/odev-rotasi -s workspace-write \
    -o gelistirme/avatar_uretim/codex_yanit_faz$f.md \
    "gelistirme/avatar_uretim/BRIEF.md dosyasını oku ve YALNIZ Faz $f'i uygula (önceki fazların çıktısını koru, manifest'e ekle). Her çizim built-in image_gen ile. Tarayıcı açma, commit atma." \
    > gelistirme/avatar_uretim/codex_faz$f.log 2>&1
  rc=$?
  echo "faz $f bitti rc=$rc $(date +%H:%M)" >> gelistirme/avatar_uretim/ilerleme.txt
  [ $rc -eq 0 ] && touch gelistirme/avatar_uretim/faz$f.bitti || exit $rc
done
