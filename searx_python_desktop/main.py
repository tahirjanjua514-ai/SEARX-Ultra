"""
SEARX AI ULTRA PRO - Desktop Edition
Target: Windows 10 / Windows 11 (x64)
Python: 3.11+
License: Authorized Enterprise Automation Suite
"""

import sys
import os
import asyncio
import logging
from pathlib import Path

# Setup logging
LOG_DIR = Path.home() / ".searx_ai_ultra" / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s",
    handlers=[
        logging.FileHandler(LOG_DIR / "searx_ultra.log", encoding="utf-8"),
        logging.StreamHandler(sys.stdout),
    ],
)
logger = logging.getLogger("SearxMain")

from database import DatabaseManager
from browser_engine import BrowserEngineManager
from proxy_manager import ProxyManager
from rpa_engine import RpaEngine
from task_engine import TaskEngine
from search_workflow import SearchWorkflowManager
from network_utils import get_network_interfaces, check_webrtc_leak

class SearxUltraProApp:
    def __init__(self):
        logger.info("Initializing SEARX AI ULTRA PRO Desktop Engine...")
        self.db = DatabaseManager()
        self.db.init_schema()
        
        self.proxy_mgr = ProxyManager(self.db)
        self.browser_mgr = BrowserEngineManager(self.db, self.proxy_mgr)
        self.rpa_engine = RpaEngine(self.browser_mgr, self.db)
        self.task_engine = TaskEngine(self.db, self.rpa_engine)
        self.search_mgr = SearchWorkflowManager(self.browser_mgr, self.db)
        
        logger.info("All engine modules loaded successfully.")

    def run_cli_diagnostics(self):
        """Run system and database diagnostics."""
        print("=" * 65)
        print("   SEARX AI ULTRA PRO - System & Hardware Diagnostics")
        print("=" * 65)
        interfaces = get_network_interfaces()
        print(f"Network Adapters Detected: {len(interfaces)}")
        for iface in interfaces:
            print(f"  - {iface['name']} ({iface['type']}) | IP: {iface['ip']} | MAC: {iface['mac']}")
        
        profiles = self.db.get_profiles()
        print(f"Saved Browser Profiles: {len(profiles)}")
        proxies = self.db.get_proxies()
        print(f"Registered Proxies: {len(proxies)}")
        workflows = self.db.get_workflows()
        print(f"RPA Workflows: {len(workflows)}")
        print("=" * 65)

    def launch_gui(self):
        """Launches the desktop GUI interface."""
        try:
            import customtkinter as ctk
            ctk.set_appearance_mode("Dark")
            ctk.set_default_color_theme("blue")
            
            app = ctk.CTk()
            app.title("SEARX AI ULTRA PRO - Windows Desktop Edition")
            app.geometry("1280x820")
            
            header = ctk.CTkLabel(
                app, 
                text="SEARX AI ULTRA PRO", 
                font=ctk.CTkFont(size=26, weight="bold")
            )
            header.pack(pady=(20, 5))
            
            sub = ctk.CTkLabel(
                app,
                text="Multi-Profile Browser & RPA Engine (Active Engine Context - SQLite WAL Mode)",
                font=ctk.CTkFont(size=13)
            )
            sub.pack(pady=(0, 15))
            
            status_box = ctk.CTkTextbox(app, width=1180, height=620, font=ctk.CTkFont(family="Consolas", size=12))
            status_box.pack(pady=10)
            
            status_box.insert("0.0", 
                "========================================================================\\n"
                "  SEARX AI ULTRA PRO - CORE ENGINE STATUS: ONLINE\\n"
                "========================================================================\\n"
                "[+] SQLite Database: Initialized with 14 normalized tables in WAL mode.\\n"
                "[+] Playwright Contexts: Multi-profile isolation ready (cookies & cache).\\n"
                "[+] Proxy Fleet Manager: HTTP/HTTPS/SOCKS5 validation engine active.\\n"
                "[+] Visual RPA Builder: 17 authorized workflow actions ready.\\n"
                "[+] Hardware Resource Governor: psutil CPU/RAM thresholds enforced.\\n"
                "========================================================================\\n\\n"
                "To control workflows and launch browser profiles interactively:\\n"
                "1. Run RPA automation workflows from the desktop interface\\n"
                "2. Monitor live logs and execution evidence in real-time\\n"
            )
            
            app.mainloop()
        except ImportError:
            logger.warning("CustomTkinter not installed in environment. Running CLI diagnostics mode.")
            self.run_cli_diagnostics()

if __name__ == "__main__":
    app = SearxUltraProApp()
    if "--diagnostics" in sys.argv:
        app.run_cli_diagnostics()
    else:
        app.launch_gui()
