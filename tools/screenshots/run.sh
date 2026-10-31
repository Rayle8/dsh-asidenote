#!/usr/bin/env bash
# End-to-end screenshot run: isolated DSH profile -> headless Chrome -> crops.
#
#   tools/screenshots/run.sh            # light + dark, writes docs/assets/features + preview*.png
#   KEEP=1 tools/screenshots/run.sh     # keep .screenshots/ for debugging
#
# Requirements: macOS with DeepSeek Harness installed, Google Chrome, Node 20+,
# Python 3 with Pillow. Never commit .screenshots/ or ~/.dsh credentials.
set -euo pipefail

REPO=$(cd "$(dirname "$0")/../.." && pwd)
WORK=${WORK:-"$REPO/.screenshots"}
PORT=${PORT:-61399}
CDP_PORT=${CDP_PORT:-9222}
DSH_CLI=${DSH_CLI:-/Applications/DeepSeek Harness.app/Contents/Resources/runtime/cli/bin/dsh}
CHROME=${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}
PROFILE=demo

NODE_FLAGS=()
if node -e 'process.exit(typeof WebSocket === "undefined" ? 0 : 1)'; then
  NODE_FLAGS+=(--experimental-websocket)
fi

SERVER_PID=''
CHROME_PID=''

cleanup() {
  [ -n "$SERVER_PID" ] && kill "$SERVER_PID" 2>/dev/null || true
  for pid in $(lsof -ti "tcp:$PORT" 2>/dev/null || true); do kill "$pid" 2>/dev/null || true; done
  [ -n "$CHROME_PID" ] && kill "$CHROME_PID" 2>/dev/null || true
  pkill -f "user-data-dir=$WORK/chrome" 2>/dev/null || true
  if [ "${KEEP:-0}" != "1" ]; then rm -rf "$WORK"; fi
}
trap cleanup EXIT

log() { printf '\n==> %s\n' "$*"; }

log "workdir: $WORK"
rm -rf "$WORK"
mkdir -p "$WORK/raw" "$WORK/cwd"

# 1. A throwaway DSH home with a fresh web profile.
DSH_HOME="$WORK/dshhome" "$DSH_CLI" --profile "$PROFILE" --from-default-profile web --dump-config > /dev/null
cat > "$WORK/dshhome/profiles/$PROFILE/package.json" <<JSON
{
  "name": "dsh-profile-$PROFILE",
  "private": true,
  "dependencies": { "dsh-aside-note": "link:$REPO" },
  "dsh": { "profile": { "bundles": ["@deepseek-ai/dsh-base", "@deepseek-ai/dsh-web-app", "dsh-aside-note"] } }
}
JSON
write_theme() {
  cat > "$WORK/dshhome/profiles/$PROFILE/cordis.patch.yml" <<YAML
- id: ui-settings-general
  name: "@deepseek-ai/dsh-client-ui-settings-general"
  config:
    welcomeNoticeVersion: 2026-09-28.01
- id: ui-theme
  name: "@deepseek-ai/dsh-client-ui-theme"
  config:
    preference: $1
YAML
}
write_theme light

log "installing the plugin into the throwaway profile"
DSH_HOME="$WORK/dshhome" "$DSH_CLI" plugin --profile "$PROFILE" install --offline --store-dir "$WORK/pnpm-store" > /dev/null

# Credentials are opt-in: the panel shots do not need a model reply, and the
# file is the one thing in this pipeline that must never leave the machine.
if [ "${COPY_CREDENTIALS:-0}" = "1" ] && [ -f "$HOME/.dsh/.credentials.yaml" ]; then
  cp "$HOME/.dsh/.credentials.yaml" "$WORK/dshhome/.credentials.yaml"
  chmod 600 "$WORK/dshhome/.credentials.yaml"
  log "credentials copied for the demo conversation (COPY_CREDENTIALS=1)"
else
  log "no credentials copied; the demo reply may be empty (panel shots are unaffected)"
fi

start_server() {
  ( cd "$WORK/cwd" && DSH_HOME="$WORK/dshhome" exec "$DSH_CLI" --profile "$PROFILE" --no-open --port "$PORT" ) \
    > "$WORK/server.log" 2>&1 &
  SERVER_PID=$!
  TOKEN=''
  for _ in $(seq 1 40); do
    TOKEN=$(grep -o "token=[A-Za-z0-9_-]*" "$WORK/server.log" 2>/dev/null | head -1 | cut -d= -f2 || true)
    [ -n "${TOKEN:-}" ] && return 0
    sleep 1
  done
  echo "server did not print a token; see $WORK/server.log" >&2
  exit 1
}

stop_server() {
  [ -n "$SERVER_PID" ] && kill "$SERVER_PID" 2>/dev/null || true
  for pid in $(lsof -ti "tcp:$PORT" 2>/dev/null || true); do kill "$pid" 2>/dev/null || true; done
  SERVER_PID=''
  sleep 3
}

log "starting DSH web on :$PORT"
start_server

log "starting headless Chrome (CDP :$CDP_PORT)"
"$CHROME" --headless=new --no-sandbox --disable-gpu \
  --remote-debugging-port="$CDP_PORT" --user-data-dir="$WORK/chrome" \
  --window-size=1440,1043 --force-device-scale-factor=2 --hide-scrollbars about:blank \
  > "$WORK/chrome.log" 2>&1 &
CHROME_PID=$!
for _ in $(seq 1 30); do
  if curl -sf "http://127.0.0.1:$CDP_PORT/json/version" > /dev/null; then break; fi
  sleep 1
done

log "building the demo session and notes"
( cd "$REPO/tools/screenshots" && PORT="$PORT" TOKEN="$TOKEN" node "${NODE_FLAGS[@]}" bootstrap.mjs )

log "capturing light"
( cd "$REPO/tools/screenshots" && THEME=light PORT="$PORT" TOKEN="$TOKEN" OUT="$WORK/raw" node "${NODE_FLAGS[@]}" capture.mjs )

log "restarting in dark"
stop_server
write_theme dark
start_server
( cd "$REPO/tools/screenshots" && THEME=dark PORT="$PORT" TOKEN="$TOKEN" OUT="$WORK/raw" node "${NODE_FLAGS[@]}" capture.mjs )

log "cropping"
python3 "$REPO/tools/screenshots/crop.py" --raw "$WORK/raw" --theme light --out "$REPO/docs/assets/features"
python3 "$REPO/tools/screenshots/crop.py" --raw "$WORK/raw" --theme dark --out "$REPO/docs/assets/features"

log "done"
echo "Review docs/assets/features/*.png, then run: npm test"
