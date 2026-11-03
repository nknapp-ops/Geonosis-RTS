#!/bin/sh
# Prepare the artifact's supporting files: base64 copies of every model (dev/out/models/*.glb.b64.txt) and
# dev/out/pubfiles.json, the `files` map for the Artifact publish (published path -> absolute source path).
set -e
cd "$(dirname "$0")/.."; ROOT=$(pwd); OUT=$ROOT/dev/out; mkdir -p "$OUT/models"
python3 dev/buildpage.py
printf '{"models/manifest.json": "%s/models/manifest.json"' "$ROOT" > "$OUT/pubfiles.json"
for f in models/*.glb; do n=$(basename "$f"); base64 -w0 "$f" > "$OUT/models/$n.b64.txt"; printf ', "models/%s.b64.txt": "%s/models/%s.b64.txt"' "$n" "$OUT" "$n" >> "$OUT/pubfiles.json"; done
echo '}' >> "$OUT/pubfiles.json"; echo "wrote $OUT/pubfiles.json"
