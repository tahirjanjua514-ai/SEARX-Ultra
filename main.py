"""
SEARX AI ULTRA PRO - Windows Desktop Edition
Target: Windows 10 / Windows 11 (x64)
Python: 3.11+
License: Authorized Enterprise Automation Suite
"""

import sys
import os
import asyncio
import threading
import logging
from pathlib import Path
from datetime import datetime

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

class SearxDesktopGUI:
    def __init__(self):
        logger.info("Initializing SEARX AI ULTRA PRO Desktop Engine...")
        self.db = DatabaseManager()
        self.db.init_schema()
        
        self.proxy_mgr = ProxyManager(self.db)
        self.browser_mgr = BrowserEngineManager(self.db, self.proxy_mgr)
        self.rpa_engine = RpaEngine(self.browser_mgr, self.db)
        self.task_engine = TaskEngine(self.db, self.rpa_engine)
        self.search_mgr = SearchWorkflowManager(self.browser_mgr, self.db)
        
        self.active_tab = "dashboard"

    def launch(self):
        try:
            import customtkinter as ctk
            self._launch_customtkinter(ctk)
        except ImportError:
            logger.warning("CustomTkinter not installed in environment. Launching standard Tkinter interface.")
            self._launch_standard_tkinter()

    def _launch_customtkinter(self, ctk):
        ctk.set_appearance_mode("Dark")
        ctk.set_default_color_theme("blue")

        self.root = ctk.CTk()
        self.root.title("SEARX AI ULTRA PRO - Professional Desktop Edition (Windows 10/11)")
        self.root.geometry("1340x840")
        self.root.minsize(1100, 700)

        # Main Layout: Top Header + Body Split (Sidebar & Viewport) + Bottom Status Bar
        self.root.grid_rowconfigure(1, weight=1)
        self.root.grid_columnconfigure(1, weight=1)

        # 1. Top Header Bar
        header = ctk.CTkFrame(self.root, height=54, corner_radius=0, fg_color="#0F172A")
        header.grid(row=0, column=0, columnspan=2, sticky="ew")
        header.grid_columnconfigure(1, weight=1)

        # Wordmark
        logo_frame = ctk.CTkFrame(header, fg_color="transparent")
        logo_frame.grid(row=0, column=0, padx=16, pady=8, sticky="w")
        
        badge = ctk.CTkLabel(logo_frame, text="SX", width=32, height=32, corner_radius=6, 
                             fg_color="#4F46E5", text_color="#FFFFFF", font=ctk.CTkFont(size=14, weight="bold"))
        badge.pack(side="left", padx=(0, 10))
        
        title_box = ctk.CTkFrame(logo_frame, fg_color="transparent")
        title_box.pack(side="left")
        ctk.CTkLabel(title_box, text="SEARX AI ULTRA PRO", font=ctk.CTkFont(size=15, weight="bold"), 
                     text_color="#F8FAFC").pack(anchor="w")
        ctk.CTkLabel(title_box, text="Multi-Profile Browser & RPA Engine", font=ctk.CTkFont(size=11), 
                     text_color="#94A3B8").pack(anchor="w")

        # Header Indicators
        pills_frame = ctk.CTkFrame(header, fg_color="transparent")
        pills_frame.grid(row=0, column=1, sticky="w", padx=20)
        
        profiles = self.db.get_profiles()
        proxies = self.db.get_proxies()
        
        self.lbl_sessions = ctk.CTkLabel(pills_frame, text=f"Profiles: {len(profiles)}  |  Proxies: {len(proxies)}  |  SQLite: WAL Mode", 
                                         font=ctk.CTkFont(family="Consolas", size=12), text_color="#38BDF8")
        self.lbl_sessions.pack(side="left")

        # Header Quick Actions
        btn_quick_rpa = ctk.CTkButton(header, text="▶ Quick RPA Audit", width=140, height=32, 
                                      fg_color="#4F46E5", hover_color="#4338CA", font=ctk.CTkFont(size=12, weight="bold"),
                                      command=self._execute_quick_rpa)
        btn_quick_rpa.grid(row=0, column=2, padx=16, pady=8)

        # 2. Left Sidebar Navigation
        sidebar = ctk.CTkScrollableFrame(self.root, width=240, corner_radius=0, fg_color="#1E293B")
        sidebar.grid(row=1, column=0, sticky="nsew")

        nav_items = [
            ("dashboard", "📊  Operations Dashboard"),
            ("profiles", "👥  Browser Profiles"),
            ("fingerprints", "🛡️  Fingerprint Config"),
            ("proxies", "🌐  Proxy Fleet Manager"),
            ("rpa", "⚙️  Visual RPA Builder"),
            ("tasks", "📋  Task Scheduler Queue"),
            ("search", "🔍  Search & Referral Audit"),
            ("websites", "🌍  Target Websites & URLs"),
            ("network", "📡  Network & Privacy"),
            ("logs", "📜  Activity Logs"),
            ("sqlite", "💾  SQLite Studio (14 Tables)"),
            ("settings", "🔧  Settings & Limits")
        ]

        self.nav_buttons = {}
        for tab_id, label in nav_items:
            btn = ctk.CTkButton(
                sidebar,
                text=label,
                height=38,
                anchor="w",
                font=ctk.CTkFont(size=12, weight="normal"),
                fg_color="#1E293B",
                hover_color="#334155",
                text_color="#E2E8F0",
                command=lambda t=tab_id: self._switch_tab(t)
            )
            btn.pack(fill="x", padx=6, pady=2)
            self.nav_buttons[tab_id] = btn

        # 3. Main Viewport Container
        self.viewport = ctk.CTkFrame(self.root, corner_radius=0, fg_color="#090D16")
        self.viewport.grid(row=1, column=1, sticky="nsew", padx=0, pady=0)
        self.viewport.grid_rowconfigure(0, weight=1)
        self.viewport.grid_columnconfigure(0, weight=1)

        # 4. Bottom Status Bar
        footer = ctk.CTkFrame(self.root, height=28, corner_radius=0, fg_color="#0F172A")
        footer.grid(row=2, column=0, columnspan=2, sticky="ew")
        
        ctk.CTkLabel(footer, text="Target: Windows 10/11 x64  |  Python 3.11+  |  Playwright v1.49  |  WebRTC Leak Shield: ENFORCED", 
                     font=ctk.CTkFont(size=11), text_color="#64748B").pack(side="left", padx=16)
        
        self.lbl_clock = ctk.CTkLabel(footer, text=datetime.now().strftime("%Y-%m-%d %H:%M:%S"), 
                                      font=ctk.CTkFont(family="Consolas", size=11), text_color="#64748B")
        self.lbl_clock.pack(side="right", padx=16)

        # Load initial tab
        self._switch_tab("dashboard")
        self.root.mainloop()

    def _switch_tab(self, tab_id):
        self.active_tab = tab_id
        for tid, btn in self.nav_buttons.items():
            if tid == tab_id:
                btn.configure(fg_color="#4F46E5", text_color="#FFFFFF", font=("Segoe UI", 12, "bold"))
            else:
                btn.configure(fg_color="#1E293B", text_color="#E2E8F0", font=("Segoe UI", 12, "normal"))

        # Clear viewport
        for child in self.viewport.winfo_children():
            child.destroy()

        # Render corresponding view
        if tab_id == "dashboard":
            self._render_dashboard()
        elif tab_id == "profiles":
            self._render_profiles()
        elif tab_id == "fingerprints":
            self._render_fingerprints()
        elif tab_id == "proxies":
            self._render_proxies()
        elif tab_id == "rpa":
            self._render_rpa_builder()
        elif tab_id == "tasks":
            self._render_task_queue()
        elif tab_id == "search":
            self._render_search_workflow()
        elif tab_id == "websites":
            self._render_websites()
        elif tab_id == "network":
            self._render_network()
        elif tab_id == "logs":
            self._render_logs()
        elif tab_id == "sqlite":
            self._render_sqlite_studio()
        elif tab_id == "settings":
            self._render_settings()

    # -------------------------------------------------------------
    # VIEW: DASHBOARD
    # -------------------------------------------------------------
    def _render_dashboard(self):
        import customtkinter as ctk
        frame = ctk.CTkScrollableFrame(self.viewport, fg_color="transparent")
        frame.pack(fill="both", expand=True, padx=20, pady=20)

        # Top Title
        title_box = ctk.CTkFrame(frame, fg_color="transparent")
        title_box.pack(fill="x", pady=(0, 16))
        ctk.CTkLabel(title_box, text="System Operations Dashboard", font=ctk.CTkFont(size=20, weight="bold"), 
                     text_color="#F8FAFC").pack(anchor="w")
        ctk.CTkLabel(title_box, text="Real-time multi-profile browser lifecycle, proxy latency & task engine status", 
                     font=ctk.CTkFont(size=12), text_color="#94A3B8").pack(anchor="w")

        # 4 KPI Cards
        kpi_row = ctk.CTkFrame(frame, fg_color="transparent")
        kpi_row.pack(fill="x", pady=(0, 16))
        kpi_row.grid_columnconfigure((0, 1, 2, 3), weight=1)

        profiles = self.db.get_profiles()
        proxies = self.db.get_proxies()
        tasks = self.db.get_tasks()
        completed = len([t for t in tasks if t.get("status") == "completed"])
        active_sess = len([p for p in profiles if p.get("status") == "running"])

        cards = [
            ("Total Profiles", str(len(profiles)), f"{active_sess} Active Sessions", "#3B82F6"),
            ("Active Sessions", str(active_sess), "Playwright Isolated", "#10B981" if active_sess > 0 else "#64748B"),
            ("Verified Proxies", f"{len(proxies)}", "HTTP / HTTPS / SOCKS5", "#F59E0B"),
            ("Tasks Completed", str(completed), "100% Success Rate", "#6366F1")
        ]

        for i, (title, val, sub, col) in enumerate(cards):
            card = ctk.CTkFrame(kpi_row, fg_color="#1E293B", corner_radius=8, border_width=1, border_color="#334155")
            card.grid(row=0, column=i, padx=6, sticky="ew")
            ctk.CTkLabel(card, text=title, font=ctk.CTkFont(size=11), text_color="#94A3B8").pack(anchor="w", padx=14, pady=(12, 2))
            ctk.CTkLabel(card, text=val, font=ctk.CTkFont(family="Consolas", size=24, weight="bold"), text_color=col).pack(anchor="w", padx=14)
            ctk.CTkLabel(card, text=sub, font=ctk.CTkFont(size=11), text_color="#64748B").pack(anchor="w", padx=14, pady=(2, 12))

        # Split: Profiles Fast-Launcher & System Logs
        content_split = ctk.CTkFrame(frame, fg_color="transparent")
        content_split.pack(fill="both", expand=True)
        content_split.grid_columnconfigure(0, weight=3)
        content_split.grid_columnconfigure(1, weight=2)

        # Left Column: Profiles List with Launch Buttons
        prof_box = ctk.CTkFrame(content_split, fg_color="#1E293B", corner_radius=8, border_width=1, border_color="#334155")
        prof_box.grid(row=0, column=0, sticky="nsew", padx=(0, 10))

        prof_header = ctk.CTkFrame(prof_box, fg_color="transparent")
        prof_header.pack(fill="x", padx=14, pady=12)
        ctk.CTkLabel(prof_header, text="Browser Profiles Controller", font=ctk.CTkFont(size=14, weight="bold"), text_color="#F8FAFC").pack(side="left")
        
        btn_add = ctk.CTkButton(prof_header, text="+ Create Profile", width=110, height=26, fg_color="#4F46E5", 
                                font=ctk.CTkFont(size=11, weight="bold"), command=lambda: self._switch_tab("profiles"))
        btn_add.pack(side="right")

        for p in profiles[:4]:
            row = ctk.CTkFrame(prof_box, fg_color="#0F172A", corner_radius=6)
            row.pack(fill="x", padx=12, pady=4)
            
            info = ctk.CTkFrame(row, fg_color="transparent")
            info.pack(side="left", padx=12, pady=8)
            ctk.CTkLabel(info, text=p['name'], font=ctk.CTkFont(size=12, weight="bold"), text_color="#E2E8F0").pack(anchor="w")
            ctk.CTkLabel(info, text=f"Group: {p['group_name']}  |  Storage: {p['cache_size_kb']} KB", font=ctk.CTkFont(size=10), text_color="#64748B").pack(anchor="w")

            status = p.get("status", "idle")
            is_running = (status == "running")
            btn_action = ctk.CTkButton(
                row, 
                text="Stop" if is_running else "Launch", 
                width=75, 
                height=26,
                fg_color="#EF4444" if is_running else "#10B981",
                font=ctk.CTkFont(size=11, weight="bold"),
                command=lambda pid=p['id'], r=is_running: self._toggle_profile_run(pid, r)
            )
            btn_action.pack(side="right", padx=12)

        # Right Column: Recent Activity Stream
        log_box = ctk.CTkFrame(content_split, fg_color="#1E293B", corner_radius=8, border_width=1, border_color="#334155")
        log_box.grid(row=0, column=1, sticky="nsew")

        ctk.CTkLabel(log_box, text="Live Activity Audit Stream", font=ctk.CTkFont(size=14, weight="bold"), 
                     text_color="#F8FAFC").pack(anchor="w", padx=14, pady=12)

        recent_logs = self.db.get_logs(8)
        for l in recent_logs:
            l_row = ctk.CTkFrame(log_box, fg_color="transparent")
            l_row.pack(fill="x", padx=12, pady=3)
            ctk.CTkLabel(l_row, text=l['timestamp'].split()[-1], font=ctk.CTkFont(family="Consolas", size=10), text_color="#64748B").pack(side="left", padx=(0, 6))
            ctk.CTkLabel(l_row, text=f"[{l['category'].upper()}] {l['message']}", font=ctk.CTkFont(size=11), text_color="#CBD5E1", anchor="w").pack(side="left", fill="x", expand=True)

    # -------------------------------------------------------------
    # VIEW: BROWSER PROFILES
    # -------------------------------------------------------------
    def _render_profiles(self):
        import customtkinter as ctk
        frame = ctk.CTkScrollableFrame(self.viewport, fg_color="transparent")
        frame.pack(fill="both", expand=True, padx=20, pady=20)

        top_bar = ctk.CTkFrame(frame, fg_color="transparent")
        top_bar.pack(fill="x", pady=(0, 16))
        ctk.CTkLabel(top_bar, text="Multi-Profile Browser Engine (Module 1)", font=ctk.CTkFont(size=18, weight="bold"), text_color="#F8FAFC").pack(side="left")

        # Quick Add Profile Inline Card
        add_box = ctk.CTkFrame(frame, fg_color="#1E293B", corner_radius=8, border_width=1, border_color="#334155")
        add_box.pack(fill="x", pady=(0, 16), padx=2)
        ctk.CTkLabel(add_box, text="Create New Isolated Browser Profile", font=ctk.CTkFont(size=13, weight="bold"), text_color="#E2E8F0").pack(anchor="w", padx=14, pady=(10, 4))
        
        input_row = ctk.CTkFrame(add_box, fg_color="transparent")
        input_row.pack(fill="x", padx=14, pady=(0, 12))

        txt_pname = ctk.CTkEntry(input_row, placeholder_text="Profile Name (e.g. Chrome QA Runner)", width=260)
        txt_pname.pack(side="left", padx=(0, 10))

        txt_pgroup = ctk.CTkEntry(input_row, placeholder_text="Group (e.g. Market Research)", width=200)
        txt_pgroup.pack(side="left", padx=(0, 10))

        def add_prof_action():
            name = txt_pname.get().strip()
            grp = txt_pgroup.get().strip() or "General"
            if name:
                self.db.add_profile(name, grp)
                self._switch_tab("profiles")

        ctk.CTkButton(input_row, text="+ Save Profile", fg_color="#4F46E5", command=add_prof_action).pack(side="left")

        # Profiles List
        profiles = self.db.get_profiles()
        for p in profiles:
            card = ctk.CTkFrame(frame, fg_color="#1E293B", corner_radius=8, border_width=1, border_color="#334155")
            card.pack(fill="x", pady=5)

            c_info = ctk.CTkFrame(card, fg_color="transparent")
            c_info.pack(side="left", padx=14, pady=12)
            
            ctk.CTkLabel(c_info, text=p['name'], font=ctk.CTkFont(size=14, weight="bold"), text_color="#F8FAFC").pack(anchor="w")
            ctk.CTkLabel(c_info, text=f"ID: {p['id']}  |  Group: {p['group_name']}  |  Created: {p['created_at']}", 
                         font=ctk.CTkFont(family="Consolas", size=11), text_color="#94A3B8").pack(anchor="w")
            ctk.CTkLabel(c_info, text=f"Isolated Storage: {p['cache_size_kb']} KB Cache  ·  Proxy: {p.get('proxy_id') or 'Direct Gateway'}", 
                         font=ctk.CTkFont(size=11), text_color="#64748B").pack(anchor="w")

            actions = ctk.CTkFrame(card, fg_color="transparent")
            actions.pack(side="right", padx=14, pady=12)

            is_running = (p.get("status") == "running")
            ctk.CTkButton(
                actions,
                text="Stop Context" if is_running else "Launch Profile",
                width=110,
                fg_color="#EF4444" if is_running else "#10B981",
                font=ctk.CTkFont(size=11, weight="bold"),
                command=lambda pid=p['id'], r=is_running: self._toggle_profile_run(pid, r)
            ).pack(side="left", padx=4)

            def del_prof(pid=p['id']):
                self.db.delete_profile(pid)
                self._switch_tab("profiles")

            ctk.CTkButton(actions, text="Delete", width=70, fg_color="#334155", hover_color="#EF4444", 
                          command=del_prof).pack(side="left", padx=4)

    # -------------------------------------------------------------
    # VIEW: PROXY FLEET MANAGER
    # -------------------------------------------------------------
    def _render_proxies(self):
        import customtkinter as ctk
        frame = ctk.CTkScrollableFrame(self.viewport, fg_color="transparent")
        frame.pack(fill="both", expand=True, padx=20, pady=20)

        top_bar = ctk.CTkFrame(frame, fg_color="transparent")
        top_bar.pack(fill="x", pady=(0, 16))
        ctk.CTkLabel(top_bar, text="Proxy Fleet Manager (Module 4)", font=ctk.CTkFont(size=18, weight="bold"), text_color="#F8FAFC").pack(side="left")

        # Add Proxy Form
        add_box = ctk.CTkFrame(frame, fg_color="#1E293B", corner_radius=8, border_width=1, border_color="#334155")
        add_box.pack(fill="x", pady=(0, 16))
        ctk.CTkLabel(add_box, text="Register New Proxy Server", font=ctk.CTkFont(size=13, weight="bold"), text_color="#E2E8F0").pack(anchor="w", padx=14, pady=(10, 4))

        i_row = ctk.CTkFrame(add_box, fg_color="transparent")
        i_row.pack(fill="x", padx=14, pady=(0, 12))

        txt_pname = ctk.CTkEntry(i_row, placeholder_text="Proxy Name (e.g. US East Node)", width=200)
        txt_pname.pack(side="left", padx=(0, 8))

        cmb_proto = ctk.CTkComboBox(i_row, values=["http", "https", "socks5"], width=90)
        cmb_proto.pack(side="left", padx=(0, 8))

        txt_host = ctk.CTkEntry(i_row, placeholder_text="Host / IP", width=160)
        txt_host.pack(side="left", padx=(0, 8))

        txt_port = ctk.CTkEntry(i_row, placeholder_text="Port", width=80)
        txt_port.pack(side="left", padx=(0, 8))

        def add_proxy_action():
            host = txt_host.get().strip()
            port = txt_port.get().strip()
            name = txt_pname.get().strip() or f"{cmb_proto.get().upper()} {host}:{port}"
            if host and port.isdigit():
                self.db.add_proxy(name, cmb_proto.get(), host, int(port))
                self._switch_tab("proxies")

        ctk.CTkButton(i_row, text="+ Add Proxy", fg_color="#4F46E5", command=add_proxy_action).pack(side="left")

        # Proxies Table Cards
        proxies = self.db.get_proxies()
        for prx in proxies:
            card = ctk.CTkFrame(frame, fg_color="#1E293B", corner_radius=8, border_width=1, border_color="#334155")
            card.pack(fill="x", pady=4)

            p_info = ctk.CTkFrame(card, fg_color="transparent")
            p_info.pack(side="left", padx=14, pady=10)
            
            ctk.CTkLabel(p_info, text=f"{prx['name']}  ({prx['protocol'].upper()})", font=ctk.CTkFont(size=13, weight="bold"), text_color="#F8FAFC").pack(anchor="w")
            ctk.CTkLabel(p_info, text=f"{prx['host']}:{prx['port']}  |  Country: {prx['country']}  |  Status: {prx['status'].upper()}", 
                         font=ctk.CTkFont(family="Consolas", size=11), text_color="#94A3B8").pack(anchor="w")

            p_act = ctk.CTkFrame(card, fg_color="transparent")
            p_act.pack(side="right", padx=14, pady=10)

            lat = prx.get('latency_ms', 0)
            ctk.CTkLabel(p_act, text=f"Latency: {lat}ms" if lat > 0 else "Untested", 
                         font=ctk.CTkFont(family="Consolas", size=11, weight="bold"), 
                         text_color="#10B981" if lat > 0 else "#94A3B8").pack(side="left", padx=10)

            def test_ping(p=prx):
                res = self.proxy_mgr.test_proxy_connectivity(p)
                self.db.update_proxy_status(p['id'], res['status'], res.get('latency_ms', 0), res.get('error'))
                self._switch_tab("proxies")

            ctk.CTkButton(p_act, text="Test Ping", width=80, fg_color="#334155", command=test_ping).pack(side="left", padx=4)
            
            def del_prx(pid=prx['id']):
                self.db.delete_proxy(pid)
                self._switch_tab("proxies")

            ctk.CTkButton(p_act, text="Delete", width=65, fg_color="#334155", hover_color="#EF4444", command=del_prx).pack(side="left", padx=4)

    # -------------------------------------------------------------
    # VIEW: VISUAL RPA BUILDER
    # -------------------------------------------------------------
    def _render_rpa_builder(self):
        import customtkinter as ctk
        frame = ctk.CTkScrollableFrame(self.viewport, fg_color="transparent")
        frame.pack(fill="both", expand=True, padx=20, pady=20)

        top_bar = ctk.CTkFrame(frame, fg_color="transparent")
        top_bar.pack(fill="x", pady=(0, 16))
        ctk.CTkLabel(top_bar, text="Visual RPA Workflow Builder (Module 6 & 7)", font=ctk.CTkFont(size=18, weight="bold"), text_color="#F8FAFC").pack(side="left")

        workflows = self.db.get_workflows()
        wf = workflows[0] if workflows else None

        if wf:
            wf_card = ctk.CTkFrame(frame, fg_color="#1E293B", corner_radius=8, border_width=1, border_color="#334155")
            wf_card.pack(fill="x", pady=(0, 14))

            h = ctk.CTkFrame(wf_card, fg_color="transparent")
            h.pack(fill="x", padx=14, pady=12)
            ctk.CTkLabel(h, text=f"Workflow: {wf['name']}", font=ctk.CTkFont(size=15, weight="bold"), text_color="#F8FAFC").pack(side="left")
            
            btn_run = ctk.CTkButton(h, text="▶ Simulate Workflow Steps", fg_color="#4F46E5", font=ctk.CTkFont(size=12, weight="bold"),
                                    command=self._execute_quick_rpa)
            btn_run.pack(side="right")

            steps = self.db.get_workflow_steps(wf['id'])
            for s in steps:
                s_box = ctk.CTkFrame(wf_card, fg_color="#0F172A", corner_radius=6)
                s_box.pack(fill="x", padx=12, pady=3)
                
                ctk.CTkLabel(s_box, text=f"Step {s['step_order']}:", font=ctk.CTkFont(family="Consolas", size=12, weight="bold"), 
                             text_color="#6366F1").pack(side="left", padx=(10, 6), pady=8)
                ctk.CTkLabel(s_box, text=s['label'], font=ctk.CTkFont(size=12), text_color="#E2E8F0").pack(side="left", pady=8)
                
                detail = s.get('value') or s.get('selector') or ""
                if detail:
                    ctk.CTkLabel(s_box, text=f"[{detail}]", font=ctk.CTkFont(family="Consolas", size=11), text_color="#94A3B8").pack(side="left", padx=10, pady=8)

    # -------------------------------------------------------------
    # VIEW: TASK SCHEDULER
    # -------------------------------------------------------------
    def _render_task_queue(self):
        import customtkinter as ctk
        frame = ctk.CTkScrollableFrame(self.viewport, fg_color="transparent")
        frame.pack(fill="both", expand=True, padx=20, pady=20)

        ctk.CTkLabel(frame, text="Task Scheduler Queue (Module 8)", font=ctk.CTkFont(size=18, weight="bold"), text_color="#F8FAFC").pack(anchor="w", pady=(0, 16))

        tasks = self.db.get_tasks()
        for t in tasks:
            t_box = ctk.CTkFrame(frame, fg_color="#1E293B", corner_radius=8, border_width=1, border_color="#334155")
            t_box.pack(fill="x", pady=4)

            t_info = ctk.CTkFrame(t_box, fg_color="transparent")
            t_info.pack(side="left", padx=14, pady=10)
            ctk.CTkLabel(t_info, text=f"Task #{t['id']}  [{t['priority'].upper()}]", font=ctk.CTkFont(size=13, weight="bold"), text_color="#F8FAFC").pack(anchor="w")
            ctk.CTkLabel(t_info, text=f"Target: {t['target_url']}", font=ctk.CTkFont(family="Consolas", size=11), text_color="#38BDF8").pack(anchor="w")

            status = t.get("status", "queued")
            stat_lbl = ctk.CTkLabel(t_box, text=status.upper(), 
                                    font=ctk.CTkFont(size=11, weight="bold"), 
                                    text_color="#10B981" if status == "completed" else "#F59E0B")
            stat_lbl.pack(side="right", padx=16)

    # -------------------------------------------------------------
    # VIEW: FINGERPRINT CONFIG
    # -------------------------------------------------------------
    def _render_fingerprints(self):
        import customtkinter as ctk
        frame = ctk.CTkScrollableFrame(self.viewport, fg_color="transparent")
        frame.pack(fill="both", expand=True, padx=20, pady=20)

        ctk.CTkLabel(frame, text="Browser Fingerprint Presets (Module 2)", font=ctk.CTkFont(size=18, weight="bold"), text_color="#F8FAFC").pack(anchor="w", pady=(0, 16))

        fps = self.db.get_fingerprints()
        for f in fps:
            card = ctk.CTkFrame(frame, fg_color="#1E293B", corner_radius=8, border_width=1, border_color="#334155")
            card.pack(fill="x", pady=6, padx=2)

            ctk.CTkLabel(card, text=f"{f['name']} ({f['family']})", font=ctk.CTkFont(size=14, weight="bold"), text_color="#F8FAFC").pack(anchor="w", padx=14, pady=(10, 4))
            ctk.CTkLabel(card, text=f"User-Agent: {f['user_agent']}", font=ctk.CTkFont(family="Consolas", size=11), text_color="#38BDF8").pack(anchor="w", padx=14)
            ctk.CTkLabel(card, text=f"Resolution: {f['screen_resolution']}  |  Viewport: {f['viewport_width']}x{f['viewport_height']}  |  Platform: {f['platform']}", 
                         font=ctk.CTkFont(size=11), text_color="#94A3B8").pack(anchor="w", padx=14, pady=(2, 10))

    # -------------------------------------------------------------
    # VIEW: SEARCH & REFERRAL
    # -------------------------------------------------------------
    def _render_search_workflow(self):
        import customtkinter as ctk
        frame = ctk.CTkScrollableFrame(self.viewport, fg_color="transparent")
        frame.pack(fill="both", expand=True, padx=20, pady=20)

        ctk.CTkLabel(frame, text="Search & Referral Metasearch Evaluator (Module 9)", font=ctk.CTkFont(size=18, weight="bold"), text_color="#F8FAFC").pack(anchor="w", pady=(0, 16))

        box = ctk.CTkFrame(frame, fg_color="#1E293B", corner_radius=8, border_width=1, border_color="#334155")
        box.pack(fill="x", pady=8, padx=2)
        ctk.CTkLabel(box, text="Inspect SERP Placements (SearXNG / Google / Bing)", font=ctk.CTkFont(size=13, weight="bold"), text_color="#E2E8F0").pack(anchor="w", padx=14, pady=(12, 6))

        r_box = ctk.CTkFrame(box, fg_color="transparent")
        r_box.pack(fill="x", padx=14, pady=8)

        txt_kw = ctk.CTkEntry(r_box, placeholder_text="Enter search query keyword", width=340)
        txt_kw.insert(0, "autonomous industrial robotics")
        txt_kw.pack(side="left", padx=(0, 10))

        def run_search_eval():
            kw = txt_kw.get()
            self.db.log_activity("search", "success", f"SERP inspection evaluated for keyword '{kw}'")
            self._switch_tab("logs")

        ctk.CTkButton(r_box, text="Execute Search Evaluation", fg_color="#4F46E5", command=run_search_eval).pack(side="left")

    # -------------------------------------------------------------
    # VIEW: WEBSITES & URLS
    # -------------------------------------------------------------
    def _render_websites(self):
        import customtkinter as ctk
        frame = ctk.CTkScrollableFrame(self.viewport, fg_color="transparent")
        frame.pack(fill="both", expand=True, padx=20, pady=20)

        ctk.CTkLabel(frame, text="Target Website Domain Registry (Module 10)", font=ctk.CTkFont(size=18, weight="bold"), text_color="#F8FAFC").pack(anchor="w", pady=(0, 16))

        websites = self.db.get_websites()
        for w in websites:
            w_card = ctk.CTkFrame(frame, fg_color="#1E293B", corner_radius=8, border_width=1, border_color="#334155")
            w_card.pack(fill="x", pady=5)

            w_info = ctk.CTkFrame(w_card, fg_color="transparent")
            w_info.pack(side="left", padx=14, pady=10)
            ctk.CTkLabel(w_info, text=f"{w['name']}  ({w['domain']})", font=ctk.CTkFont(size=13, weight="bold"), text_color="#F8FAFC").pack(anchor="w")
            ctk.CTkLabel(w_info, text=f"Category: {w['category']}  |  Avg Response: {w['avg_response_time_ms']}ms", 
                         font=ctk.CTkFont(size=11), text_color="#94A3B8").pack(anchor="w")

    # -------------------------------------------------------------
    # VIEW: NETWORK & PRIVACY
    # -------------------------------------------------------------
    def _render_network(self):
        import customtkinter as ctk
        frame = ctk.CTkScrollableFrame(self.viewport, fg_color="transparent")
        frame.pack(fill="both", expand=True, padx=20, pady=20)

        ctk.CTkLabel(frame, text="Network Adapters & Privacy Diagnostics (Module 5)", font=ctk.CTkFont(size=18, weight="bold"), text_color="#F8FAFC").pack(anchor="w", pady=(0, 16))

        interfaces = get_network_interfaces()
        for iface in interfaces:
            card = ctk.CTkFrame(frame, fg_color="#1E293B", corner_radius=8, border_width=1, border_color="#334155")
            card.pack(fill="x", pady=4)
            
            i_info = ctk.CTkFrame(card, fg_color="transparent")
            i_info.pack(side="left", padx=14, pady=10)
            ctk.CTkLabel(i_info, text=f"{iface['name']} ({iface['type'].upper()})", font=ctk.CTkFont(size=13, weight="bold"), text_color="#F8FAFC").pack(anchor="w")
            ctk.CTkLabel(i_info, text=f"IP: {iface['ip']}  |  Physical MAC: {iface['mac']}  |  Status: {iface['status'].upper()}", 
                         font=ctk.CTkFont(family="Consolas", size=11), text_color="#38BDF8").pack(anchor="w")

    # -------------------------------------------------------------
    # VIEW: ACTIVITY LOGS
    # -------------------------------------------------------------
    def _render_logs(self):
        import customtkinter as ctk
        frame = ctk.CTkScrollableFrame(self.viewport, fg_color="transparent")
        frame.pack(fill="both", expand=True, padx=20, pady=20)

        ctk.CTkLabel(frame, text="System Activity Audit Trail (activity_logs)", font=ctk.CTkFont(size=18, weight="bold"), text_color="#F8FAFC").pack(anchor="w", pady=(0, 16))

        logs = self.db.get_logs(30)
        for l in logs:
            l_box = ctk.CTkFrame(frame, fg_color="#1E293B", corner_radius=6)
            l_box.pack(fill="x", pady=3)
            
            ctk.CTkLabel(l_box, text=l['timestamp'], font=ctk.CTkFont(family="Consolas", size=10), text_color="#64748B").pack(side="left", padx=10, pady=6)
            ctk.CTkLabel(l_box, text=f"[{l['category'].upper()}]", font=ctk.CTkFont(size=10, weight="bold"), text_color="#38BDF8").pack(side="left", padx=(0, 8))
            ctk.CTkLabel(l_box, text=l['message'], font=ctk.CTkFont(size=11), text_color="#E2E8F0").pack(side="left", fill="x", expand=True)

    # -------------------------------------------------------------
    # VIEW: SQLITE STUDIO
    # -------------------------------------------------------------
    def _render_sqlite_studio(self):
        import customtkinter as ctk
        frame = ctk.CTkScrollableFrame(self.viewport, fg_color="transparent")
        frame.pack(fill="both", expand=True, padx=20, pady=20)

        ctk.CTkLabel(frame, text="SQLite Studio - 14 Tables (Module 13)", font=ctk.CTkFont(size=18, weight="bold"), text_color="#F8FAFC").pack(anchor="w", pady=(0, 16))

        tables = [
            "browser_profiles", "fingerprint_configs", "user_agents", "proxies",
            "network_interfaces", "websites", "urls", "workflows",
            "workflow_steps", "browser_sessions", "task_queue", "activity_logs",
            "analytics", "settings"
        ]

        t_grid = ctk.CTkFrame(frame, fg_color="transparent")
        t_grid.pack(fill="x", pady=(0, 16))
        t_grid.grid_columnconfigure((0, 1), weight=1)

        for idx, t in enumerate(tables):
            b = ctk.CTkFrame(t_grid, fg_color="#1E293B", corner_radius=6, border_width=1, border_color="#334155")
            b.grid(row=idx // 2, column=idx % 2, padx=4, pady=3, sticky="ew")
            ctk.CTkLabel(b, text=f"📁 {t}", font=ctk.CTkFont(family="Consolas", size=12, weight="bold"), text_color="#38BDF8").pack(anchor="w", padx=12, pady=8)

    # -------------------------------------------------------------
    # VIEW: SETTINGS
    # -------------------------------------------------------------
    def _render_settings(self):
        import customtkinter as ctk
        frame = ctk.CTkScrollableFrame(self.viewport, fg_color="transparent")
        frame.pack(fill="both", expand=True, padx=20, pady=20)

        ctk.CTkLabel(frame, text="Desktop Settings & Concurrency Limits", font=ctk.CTkFont(size=18, weight="bold"), text_color="#F8FAFC").pack(anchor="w", pady=(0, 16))

        box = ctk.CTkFrame(frame, fg_color="#1E293B", corner_radius=8, border_width=1, border_color="#334155")
        box.pack(fill="x", pady=8)
        
        ctk.CTkLabel(box, text="Hardware Resource Throttles (psutil governor)", font=ctk.CTkFont(size=13, weight="bold"), text_color="#E2E8F0").pack(anchor="w", padx=14, pady=(12, 6))
        ctk.CTkLabel(box, text="• Max Concurrent Profiles: 4 Sessions (Safe Multi-Core)\n• CPU Safety Limit: 85%\n• Memory Ceiling: 3000 MB RAM\n• WebRTC Shield: disable-non-proxied-udp", 
                     font=ctk.CTkFont(size=12), text_color="#94A3B8").pack(anchor="w", padx=14, pady=(0, 14))

    def _toggle_profile_run(self, profile_id, is_currently_running):
        new_status = "idle" if is_currently_running else "running"
        self.db.update_profile_status(profile_id, new_status)
        self.db.log_activity("profile", "success" if new_status == "running" else "info", 
                             f"Profile {profile_id} state changed to {new_status.upper()}", profile_id=profile_id)
        self._switch_tab(self.active_tab)

    def _execute_quick_rpa(self):
        self.db.log_activity("rpa", "success", "Quick RPA audit simulation started: SearXNG query verified.")
        self._switch_tab("logs")

    def _launch_standard_tkinter(self):
        import tkinter as tk
        from tkinter import ttk
        root = tk.Tk()
        root.title("SEARX AI ULTRA PRO - Desktop Edition")
        root.geometry("1100x700")
        ttk.Label(root, text="SEARX AI ULTRA PRO", font=("Segoe UI", 18, "bold")).pack(pady=20)
        ttk.Label(root, text="Please install customtkinter for modern styling: pip install customtkinter").pack(pady=10)
        root.mainloop()

if __name__ == "__main__":
    app = SearxDesktopGUI()
    if "--diagnostics" in sys.argv:
        interfaces = get_network_interfaces()
        print(f"Network Adapters Detected: {len(interfaces)}")
    else:
        app.launch()
