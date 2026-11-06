@echo off
title SEARX AI ULTRA PRO - Standalone Exe Builder
color 0E
echo ========================================================
echo   Building SEARX AI ULTRA PRO Standalone .exe (Windows x64)
echo ========================================================
echo.

call venv\Scripts\activate.bat

echo [INFO] Compiling with PyInstaller...
pyinstaller --clean searx_ultra.spec

if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] Standalone executable generated at dist\SEARX_AI_ULTRA_PRO.exe
) else (
    echo.
    echo [ERROR] PyInstaller compilation failed.
)
pause
