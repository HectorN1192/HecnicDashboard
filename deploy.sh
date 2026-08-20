#!/bin/bash
# Deploy de HecnicDashboard al VPS (independiente)
# Este script solo redeploy el contenedor dashboard, sin afectar otros servicios
set -euo pipefail

REMOTE=ubuntu@51.255.197.166
REMOTE_HECNICAPP=/home/ubuntu/hecnicapp
REMOTE_DASHBOARD=$REMOTE_HECNICAPP/../HecnicDashboard
LOCAL_DIR="$(cd "$(dirname "$0")" && pwd)/"

echo "→ Sincronizando HecnicDashboard al VPS..."
rsync -avz --delete \
  --exclude '.git' \
  --exclude 'node_modules' \
  --exclude 'dist' \
  --exclude '.astro' \
  --exclude '.env' \
  "$LOCAL_DIR" "$REMOTE:$REMOTE_DASHBOARD"

echo "→ Construyendo y reiniciando dashboard..."
ssh "$REMOTE" "cd $REMOTE_HECNICAPP && docker compose up -d --build dashboard"

echo "✓ Deploy de HecnicDashboard completado"
echo ""
echo "Acceso: http://51.255.197.166/dashboard"
