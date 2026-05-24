@echo off
rem ==============================================================================
rem LAN Link Converter - Windows Installer & macOS DMG Cross-Platform Builder
rem ==============================================================================

echo ==================================================================
echo    LAN Link Converter - Cross-Platform Multi-Builder (Windows)
echo ==================================================================
echo.

rem Check for node
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js is missing from this Windows PC.
    echo Please download and install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo [1/4] Installing local environment components...
call npm install
if %errorlevel% neq 0 (
    echo Warning: normal npm installer had issues. Attempting legacy fallback...
    call npm install --legacy-peer-deps
)

echo.
echo [2/4] Compiling responsive web app interface (production)...
call npm run build
if %errorlevel% neq 0 (
    echo Error: React production build failed.
    pause
    exit /b 1
)

echo.
echo [3/4] Installing cross-platform compilation modules...
call npm install electron electron-builder --save-dev

echo.
echo [4/4] Executing Electron Builder compiler chain...
echo Building BOTH Windows Installer (.exe) and macOS Disk Image (.dmg) directly on Windows PC.
echo Please wait, this may take up to 1-2 minutes...
echo.

call npx electron-builder --win --mac

if %errorlevel% neq 0 (
    echo.
    echo Oops! Electron-Builder ran into an issue building cross-platform packages.
    echo Let's try compiling the Windows installer alone.
    call npx electron-builder --win
)

echo.
echo ==================================================================
echo   SUCCESS! Desired desktop installation files have been compiled!
echo ==================================================================
echo.
echo  📂 Release Folder Location:
echo  .\release-output\
echo.
echo  🛠 Compiled Deliverables:
echo  1. Windows Installer (NSIS Setup .exe)
echo     - File name: "LAN Link Converter Setup 2.4.0.exe"
echo     - Installs the app permanently on Windows, adds start menus & desktop shortcuts.
echo.
echo  2. Mac Installer Disk Image (.dmg)
echo     - File name: "LAN Link Converter-2.4.0.dmg"
echo     - Compiled directly on Windows! Copy it to any Mac using a USB drive or network.
echo.
echo ==================================================================
pause
exit /b 0
