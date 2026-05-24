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
rm -rf node_modules release-output dist

# 2. Setup
echo -e "${BLUE}[1/4] Installing dependencies...${NC}"
npm install --legacy-peer-deps

# 3. Build Web
echo -e "${BLUE}[2/4] Building Vite...${NC}"
npm run build || exit 1

# 4. Build Native App
echo -e "${BLUE}[3/4] Packaging native App...${NC}"
# This command automatically reads the "build" block in your package.json
npx electron-builder --mac || { echo -e "${RED}Packaging failed!${NC}"; exit 1; }

# 5. Fix Security Flag
# Electron-builder typically places the app in release-output/mac or mac-arm64
APP_PATH=$(find ./release-output -name "*.app" -type d | head -n 1)

if [ -z "$APP_PATH" ]; then
    echo -e "${RED}Build failed: .app bundle not found in release-output.${NC}"
    exit 1
fi

echo -e "${BLUE}[4/4] Applying security signatures...${NC}"
xattr -cr "$APP_PATH"
codesign --force --deep --sign - "$APP_PATH"

echo -e "${GREEN}${BOLD}🎉 SUCCESS! App built at: ${APP_PATH}${NC}"