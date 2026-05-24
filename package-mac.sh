#!/bin/bash

# ==============================================================================
# LAN Link Converter - Clean Build Script
# ==============================================================================

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${BLUE}${BOLD}--- Starting Fresh Build ---${NC}"

# 1. Clean up old build artifacts
rm -rf node_modules build-temp release-output dist

# 2. Setup
echo -e "${BLUE}[1/4] Installing dependencies...${NC}"
npm install --legacy-peer-deps
npm install electron electron-builder --save-dev

# 3. Build Web
echo -e "${BLUE}[2/4] Building Vite...${NC}"
npm run build || exit 1

# 4. Prepare Electron
mkdir -p build-temp
cp -R dist build-temp/dist
cp -R electron build-temp/electron
cat <<EOT > build-temp/package.json
{
  "name": "lan-link-converter",
  "productName": "LAN Link Converter",
  "version": "2.4.0",
  "main": "electron/main.cjs",
  "private": true
}
EOT

# 5. Build Native App
echo -e "${BLUE}[3/4] Packaging native App...${NC}"
npx electron-builder build \
    --mac --dir \
    --config.directories.output=release-output \
    --config.directories.app=build-temp \
    --config.productName="LAN Link Converter"

# 6. Fix Security Flag
APP_PATH=$(find ./release-output -name "*.app" -type d | head -n 1)
if [ -z "$APP_PATH" ]; then
    echo -e "${RED}Build failed to locate .app bundle.${NC}"
    exit 1
fi

echo -e "${BLUE}[4/4] Applying security signatures...${NC}"
xattr -cr "$APP_PATH"
codesign --force --deep --sign - "$APP_PATH"

echo -e "${GREEN}${BOLD}🎉 SUCCESS! App built at: ${APP_PATH}${NC}"