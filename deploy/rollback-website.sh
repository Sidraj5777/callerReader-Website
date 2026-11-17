#!/usr/bin/env bash
#
# Switch the website back to an earlier release (no rebuild, takes seconds).
#
#   ./deploy/rollback-website.sh                 -> previous release
#   ./deploy/rollback-website.sh <release-name>  -> a specific release
#   ./deploy/rollback-website.sh --list          -> show releases on the server
#
set -euo pipefail
DEPLOY_HOST="${DEPLOY_HOST:?Set DEPLOY_HOST first, e.g. export DEPLOY_HOST=root@1.2.3.4}"
REMOTE_DIR="${REMOTE_DIR:-/opt/recall-radar/website}"
TARGET="${1:-}"

ssh "$DEPLOY_HOST" bash -s -- "$REMOTE_DIR" "$TARGET" <<'REMOTE'
set -euo pipefail
DIR="$1"; TARGET="$2"
SUDO=""; [ "$(id -u)" -ne 0 ] && SUDO="sudo"
CURRENT="$(basename "$(readlink -f "$DIR/current")")"

if [ "$TARGET" = "--list" ]; then
  ls -1t "$DIR/releases" | sed "s/^$CURRENT\$/$CURRENT   <- live/"
  exit 0
fi
if [ -z "$TARGET" ]; then
  TARGET="$(ls -1t "$DIR/releases" | grep -vx "$CURRENT" | head -n 1)"
fi
[ -n "$TARGET" ] && [ -d "$DIR/releases/$TARGET" ] || { echo "Release '$TARGET' not found"; exit 1; }

ln -sfn "$DIR/releases/$TARGET" "$DIR/current.tmp"
mv -Tf "$DIR/current.tmp" "$DIR/current"
$SUDO nginx -t -q && $SUDO systemctl reload nginx
echo "Rolled back: $CURRENT -> $TARGET"
REMOTE
