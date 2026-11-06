@echo off
title SEARX AI ULTRA PRO - Setup
color 0A
echo ========================================================
echo   SEARX AI ULTRA PRO - Automated Windows Installer
echo ========================================================
echo.

echo [1/3] Creating Python Virtual Environment (venv)...
python -m venv venv
if %errorlevel% neq 0 (
    echo [ERROR] Failed to create virtual environment.
    pause
    exit /b 1
)

echo [2/3] Installing dependencies from requirements.txt...
call venv\Scripts\activate.bat
pip install --upgrade pip
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install pip dependencies.
    pause
    exit /b 1
)

echo [3/3] Downloading Playwright browser binaries (Chromium)...
playwright install chromium
if %errorlevel% neq 0 (
    echo [WARNING] Playwright browser download completed with warnings.
)

echo.
echo ========================================================
echo   INSTALLATION COMPLETE!
echo   You can now launch the software by running run.bat
echo ========================================================
pause
