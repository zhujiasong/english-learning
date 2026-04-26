#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

need_sudo() {
  if [ "$(id -u)" -eq 0 ]; then
    echo ""
  else
    echo "sudo"
  fi
}

SUDO="$(need_sudo)"

echo "==> English Learning setup for Ubuntu"

if ! command -v apt-get >/dev/null 2>&1; then
  echo "This setup.sh is intended for Ubuntu/Debian systems with apt-get." >&2
  exit 1
fi

echo "==> Installing base packages"
$SUDO apt-get update
$SUDO apt-get install -y curl ca-certificates gnupg

NODE_MAJOR=""
if command -v node >/dev/null 2>&1; then
  NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]" 2>/dev/null || true)"
fi

if [ -z "$NODE_MAJOR" ] || [ "$NODE_MAJOR" -lt 22 ]; then
  echo "==> Installing Node.js 22"
  curl -fsSL https://deb.nodesource.com/setup_22.x | $SUDO -E bash -
  $SUDO apt-get install -y nodejs
else
  echo "==> Node.js $(node -v) detected"
fi

echo "==> Node: $(node -v)"
echo "==> npm:  $(npm -v)"

if [ ! -f .env ]; then
  echo "==> Creating .env"
  cat > .env <<'EOF'
DATABASE_URL=file:./prisma/dev.db
EOF
else
  echo "==> .env already exists, skipped"
fi

echo "==> Installing dependencies"
npm install --no-audit --no-fund

echo "==> Initializing database"
npm run db:setup

echo "==> Setup completed"
echo "Run the development server with: npm run dev"
echo "Then open: http://localhost:3000"
