#!/usr/bin/env bash
#
# Build the website as static files and deploy them to the server.
#
#   ./deploy/deploy-website.sh uat      -> https://testrecallradar.com
#   ./deploy/deploy-website.sh prod     -> https://recallradar.com
#
# What it does:
#   1. npm ci + build for the chosen environment (API URL baked in)  -> ./out
#   2. checks the build points at the right API
#   3. packs ./out into one .tar.gz and copies it to the server
#   4. unpacks it into  /opt/recall-radar/website/releases/<timestamp-commit>
#   5. switches the "current" symlink to the new release (instant, atomic)
#   6. reloads Nginx, keeps the last 5 releases, prints what is live
#
# Requires: SSH key access to the server (no passwords in scripts).
#   export DEPLOY_HOST=root@<server-ip>      (or a deploy user with sudo)
#
set -euo pipefail

ENV="${1:-}"
case "$ENV" in
  uat)  ENV_FILE=".env.uat";        SITE="https://testrecallradar.com" ;;
  prod) ENV_FILE=".env.production"; SITE="https://recallradar.com" ;;
  *) echo "Usage: $0 uat|prod"; exit 1 ;;
esac

DEPLOY_HOST="${DEPLOY_HOST:?Set DEPLOY_HOST first, e.g. export DEPLOY_HOST=root@1.2.3.4}"
REMOTE_DIR="${REMOTE_DIR:-/opt/recall-radar/website}"
KEEP="${KEEP_RELEASES:-5}"

cd "$(dirname "$0")/.."

if [ "$ENV" = "prod" ]; then
  read -r -p "Deploy website to PRODUCTION ($SITE)? Type 'prod' to continue: " answer
  [ "$answer" = "prod" ] || { echo "Cancelled."; exit 1; }
fi

COMMIT="$(git rev-parse --short HEAD 2>/dev/null || echo nogit)"
RELEASE="$(date +%Y%m%d-%H%M%S)-$COMMIT"
ARCHIVE="/tmp/website-$ENV-$RELEASE.tar.gz"

echo "==> [1/5] Installing dependencies"
npm ci --no-audit --no-fund

echo "==> [2/5] Building static site for $ENV"
rm -rf out .next
npm run "build:$ENV"
[ -f out/index.html ] || { echo "ERROR: build did not produce out/index.html"; exit 1; }

EXPECTED_API="$(grep '^NEXT_PUBLIC_API_BASE_URL=' "$ENV_FILE" | cut -d= -f2- | tr -d '"\r ')"
grep -rqF "$EXPECTED_API" out/_next || { echo "ERROR: $EXPECTED_API not found in build - wrong env file?"; exit 1; }
echo "    API URL in build: $EXPECTED_API"

echo "$RELEASE $ENV" > out/release.txt

echo "==> [3/5] Packing ($(du -sh out | cut -f1))"
tar -czf "$ARCHIVE" -C out .

echo "==> [4/5] Uploading to $DEPLOY_HOST"
scp -q "$ARCHIVE" "$DEPLOY_HOST:/tmp/"

echo "==> [5/5] Activating release $RELEASE"
ssh "$DEPLOY_HOST" bash -s -- "$RELEASE" "$REMOTE_DIR" "$KEEP" "$(basename "$ARCHIVE")" <<'REMOTE'
set -euo pipefail
RELEASE="$1"; DIR="$2"; KEEP="$3"; ARCHIVE="/tmp/$4"
SUDO=""; [ "$(id -u)" -ne 0 ] && SUDO="sudo"

mkdir -p "$DIR/releases/$RELEASE"
tar -xzf "$ARCHIVE" -C "$DIR/releases/$RELEASE"
rm -f "$ARCHIVE"
chmod -R a+rX "$DIR/releases/$RELEASE"

# Atomic switch: visitors get either the old or the new site, never a mix
ln -sfn "$DIR/releases/$RELEASE" "$DIR/current.tmp"
mv -Tf "$DIR/current.tmp" "$DIR/current"

$SUDO nginx -t -q && $SUDO systemctl reload nginx

# Keep only the newest $KEEP releases
cd "$DIR/releases" && ls -1t | tail -n +$((KEEP + 1)) | xargs -r rm -rf

echo "    Live on server: $(cat "$DIR/current/release.txt")"
REMOTE

rm -f "$ARCHIVE"

LIVE="$(curl -fsS "$SITE/release.txt?nocache=$RANDOM" || true)"
echo "==> Public check: $SITE/release.txt -> ${LIVE:-'(not reachable)'}"
[ "$LIVE" = "$RELEASE $ENV" ] && echo "==> Deployed OK" || echo "WARNING: public site does not show the new release yet (Cloudflare cache or Nginx config?)"
