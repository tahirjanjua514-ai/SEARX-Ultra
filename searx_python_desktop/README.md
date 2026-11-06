# SEARX AI ULTRA PRO

### Professional Multi-Profile Browser & RPA Automation Engine
**Target Platforms**: Windows 10 (Build 19041+) / Windows 11 (x64)  
**Python Runtime**: Python 3.11+  
**Database Engine**: SQLite 3 (WAL Mode Enabled)

---

## What is in this Directory?

This directory contains the **complete native Python desktop application** alongside the web management console.

### Python Desktop Application Files:
- `main.py` — Desktop application entry point with GUI and CLI diagnostics.
- `database.py` — SQLite manager implementing all 14 normalized tables in WAL mode.
- `browser_engine.py` — Multi-profile Playwright automation with isolated `userDataDir` contexts, cookies, and local storage.
- `proxy_manager.py` — Multi-protocol proxy engine supporting HTTP, HTTPS, SOCKS5, authentication, and public source adapters.
- `rpa_engine.py` — 17-action visual RPA executor with DOM inspection, error recovery, and data extraction.
- `task_engine.py` — Multi-thread async task engine with priority scheduling and psutil CPU/RAM resource governor.
- `search_workflow.py` — Metasearch and referral inspection for legitimate research across SearXNG, Google, Bing, DuckDuckGo.
- `network_utils.py` — Windows network adapter queries, hardware MAC retrieval, and WebRTC UDP leak shielding.
- `requirements.txt` — Python dependencies (Playwright, CustomTkinter, psutil, requests, pydantic, rich, PyInstaller).
- `run.bat` — 1-click launcher for Windows 10 & 11.
- `install.bat` — Automated setup script that creates `venv`, installs pip packages, and downloads Chromium.
- `build_exe.bat` — PyInstaller standalone `.exe` generator.
- `searx_ultra.spec` — PyInstaller build specification for Windows x64.
- `init_schema.sql` — Complete SQLite 14-table schema script.

---

## Quick Setup Instructions for Windows 10 & 11

### Step 1: Automated Installation
Double-click `install.bat` (or open Command Prompt in this folder and run `install.bat`):
```cmd
install.bat
```
This script will:
1. Create a Python virtual environment (`venv`).
2. Upgrade pip and install all dependencies from `requirements.txt`.
3. Download the official Playwright Chromium browser binary (`playwright install chromium`).

### Step 2: Launch Application
Double-click `run.bat`:
```cmd
run.bat
```

### Step 3: Build Standalone .EXE (Optional)
To build a single self-contained Windows executable file that can run without installing Python:
Double-click `build_exe.bat`:
```cmd
build_exe.bat
```
Your standalone executable will be located in: `dist\SEARX_AI_ULTRA_PRO.exe`.

---

## Ethical & Legal Usage Policy

This software is strictly built for:
- Quality assurance and cross-browser functional testing.
- Authorized web data extraction and content research.
- Competitive pricing audits and website health monitoring.

Do not use this software to generate deceptive traffic, violate target site terms of service, or conduct unauthorized operations.
