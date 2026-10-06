#!/bin/bash
# Run on the VPS to deploy the latest code. Expects the repo cloned on the server.
set -e

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$APP_DIR"

echo "### Pulling latest code ..."
git pull origin main

echo "### Building images ..."
docker compose build

echo "### (Re)starting services ..."
docker compose up -d --remove-orphans

echo "### Cleaning up old images ..."
docker image prune -f

echo "### Done."
docker compose ps
