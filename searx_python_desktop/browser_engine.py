"""
Multi-Profile Browser Engine for SEARX AI ULTRA PRO
Implements isolated Playwright contexts with independent storage, cookies, and cache directories.
"""

import os
import asyncio
import logging
from pathlib import Path
from typing import Dict, Any, Optional

logger = logging.getLogger("BrowserEngine")

class BrowserEngineManager:
    def __init__(self, db_manager, proxy_manager):
        self.db = db_manager
        self.proxy_mgr = proxy_manager
        self.active_contexts: Dict[str, Any] = {}
        self.profiles_data_root = Path.home() / ".searx_ai_ultra" / "profiles"
        self.profiles_data_root.mkdir(parents=True, exist_ok=True)

    def get_profile_data_dir(self, profile_id: str) -> Path:
        """Returns dedicated userDataDir ensuring separate cookies, cache, and IndexedDB."""
        profile_dir = self.profiles_data_root / profile_id
        profile_dir.mkdir(parents=True, exist_ok=True)
        return profile_dir

    async def launch_profile(self, profile_id: str, headless: bool = False):
        """Launches Playwright persistent context for the profile."""
        from playwright.async_api import async_playwright
        
        # Load profile and fingerprint config
        with self.db.get_connection() as conn:
            cur = conn.execute("SELECT * FROM browser_profiles WHERE id = ?", (profile_id,))
            profile = cur.fetchone()
            if not profile:
                raise ValueError(f"Profile {profile_id} not found")
            profile = dict(profile)
            
            fp = None
            if profile.get("fingerprint_id"):
                cur = conn.execute("SELECT * FROM fingerprint_configs WHERE id = ?", (profile["fingerprint_id"],))
                fp_row = cur.fetchone()
                if fp_row:
                    fp = dict(fp_row)

        user_data_dir = self.get_profile_data_dir(profile_id)
        
        # Configure proxy if assigned
        proxy_config = None
        if profile.get("proxy_id"):
            proxy_record = self.proxy_mgr.get_proxy(profile["proxy_id"])
            if proxy_record and proxy_record.get("status") == "active":
                server_url = f"{proxy_record['protocol']}://{proxy_record['host']}:{proxy_record['port']}"
                proxy_config = {"server": server_url}
                if proxy_record.get("username"):
                    proxy_config["username"] = proxy_record["username"]
                    proxy_config["password"] = proxy_record.get("password", "")

        # Viewport and fingerprint parameters
        viewport = {"width": 1920, "height": 1080}
        user_agent = None
        locale = "en-US"
        timezone_id = "America/New_York"
        device_scale_factor = 1.0

        if fp:
            viewport = {"width": fp["viewport_width"], "height": fp["viewport_height"]}
            user_agent = fp["user_agent"]
            locale = fp.get("locale", "en-US")
            timezone_id = fp.get("timezone", "America/New_York")
            device_scale_factor = fp.get("device_scale_factor", 1.0)

        playwright = await async_playwright().start()
        context = await playwright.chromium.launch_persistent_context(
            user_data_dir=str(user_data_dir),
            headless=headless,
            viewport=viewport,
            user_agent=user_agent,
            locale=locale,
            timezone_id=timezone_id,
            device_scale_factor=device_scale_factor,
            proxy=proxy_config,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
            ]
        )

        self.active_contexts[profile_id] = {
            "playwright": playwright,
            "context": context,
            "status": "running"
        }
        
        self.db.log_activity("profile", "success", f"Profile '{profile['name']}' started.", profile_id=profile_id)
        return context

    async def close_profile(self, profile_id: str):
        if profile_id in self.active_contexts:
            ctx_data = self.active_contexts[profile_id]
            await ctx_data["context"].close()
            await ctx_data["playwright"].stop()
            del self.active_contexts[profile_id]
            self.db.log_activity("profile", "info", f"Profile context closed.", profile_id=profile_id)
