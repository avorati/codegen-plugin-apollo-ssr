#!/bin/bash

set -e

CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "current_version=$CURRENT_VERSION" >> $GITHUB_OUTPUT

# Obter a lista de versões publicadas
VERSIONS=$(yarn info strapi-plugin-preview versions --json 2>/dev/null | jq -r '.data | join(",")')

if [ -z "$VERSIONS" ]; then
  echo "version_exists=false" >> $GITHUB_OUTPUT
  echo "[INFO] Pacote nunca publicado no NPM, sera publicado agora"
elif echo ",$VERSIONS," | grep -q ",$CURRENT_VERSION,"; then
  echo "version_exists=true" >> $GITHUB_OUTPUT
  echo "[ATENCAO] Versao $CURRENT_VERSION ja existe no NPM"
else
  echo "version_exists=false" >> $GITHUB_OUTPUT
  echo "[OK] Versao $CURRENT_VERSION e nova"
fi 