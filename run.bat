@echo off
title SEARX AI ULTRA PRO - Launcher
color 0B
echo ========================================================
echo   SEARX AI ULTRA PRO - Windows Desktop Edition
echo   Target: Windows 10 / Windows 11 (Python 3.11+)
echo ========================================================
echo.

:: Check Python installation
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python 3.11+ is not found in your PATH!
    echo Please install Python 3.11+ from https://www.python.org/
    pause
    exit /b 1
)

:: Check if virtualenv exists
if not exist "venv\Scripts\activate.bat" (
    echo [INFO] Virtual environment not detected. Running install.bat first...
    call install.bat
)

echo [INFO] Activating virtual environment...
call venv\Scripts\activate.bat

echo [INFO] Starting SEARX AI ULTRA PRO Desktop Engine...
python main.py

if %errorlevel% neq 0 (
    echo [ERROR] Application exited with error code %errorlevel%.
    pause
)
