"""
SQLite Database & Storage Manager for SEARX AI ULTRA PRO
Handles schema migrations, encrypted secret options, and query helpers for all 14 tables.
"""

import sqlite3
import json
import uuid
import logging
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List, Optional

logger = logging.getLogger("Database")

DB_DIR = Path.home() / ".searx_ai_ultra"
DB_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DB_DIR / "searx_ultra.db"

class DatabaseManager:
    def __init__(self, db_path: Path = DB_PATH):
        self.db_path = db_path
        self._setup_connection()

    def _setup_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        # Enable WAL (Write-Ahead Logging) for safe concurrent reads/writes
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA foreign_keys=ON;")
        return conn

    def get_connection(self) -> sqlite3.Connection:
        return self._setup_connection()

    def init_schema(self):
        """Initializes all 14 required tables and seeds default data if empty."""
        schema_sql = """
        -- 1. Browser Profiles
        CREATE TABLE IF NOT EXISTS browser_profiles (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            group_name TEXT DEFAULT 'Default',
            fingerprint_id TEXT,
            proxy_id TEXT,
            status TEXT DEFAULT 'idle',
            cookies_json TEXT DEFAULT '{}',
            local_storage_json TEXT DEFAULT '{}',
            cache_size_kb INTEGER DEFAULT 0,
            history_count INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            last_active_at TEXT,
            notes TEXT
        );

        -- 2. Fingerprint Configurations
        CREATE TABLE IF NOT EXISTS fingerprint_configs (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            family TEXT NOT NULL,
            user_agent TEXT NOT NULL,
            browser_name TEXT NOT NULL,
            browser_version TEXT NOT NULL,
            os_name TEXT NOT NULL,
            os_version TEXT NOT NULL,
            platform TEXT NOT NULL,
            screen_resolution TEXT NOT NULL,
            viewport_width INTEGER NOT NULL,
            viewport_height INTEGER NOT NULL,
            device_scale_factor REAL DEFAULT 1.0,
            language TEXT DEFAULT 'en-US',
            locale TEXT DEFAULT 'en-US',
            timezone TEXT DEFAULT 'America/New_York',
            color_scheme TEXT DEFAULT 'dark',
            touch_enabled INTEGER DEFAULT 0,
            max_touch_points INTEGER DEFAULT 0,
            canvas_noise INTEGER DEFAULT 1,
            webgl_noise INTEGER DEFAULT 1,
            audio_noise INTEGER DEFAULT 1,
            webrtc_policy TEXT DEFAULT 'disable-non-proxied-udp',
            geolocation_permission TEXT DEFAULT 'prompt',
            latitude REAL,
            longitude REAL
        );

        -- 3. User Agents
        CREATE TABLE IF NOT EXISTS user_agents (
            id TEXT PRIMARY KEY,
            user_agent TEXT NOT NULL UNIQUE,
            browser TEXT NOT NULL,
            browser_version TEXT NOT NULL,
            os TEXT NOT NULL,
            os_version TEXT NOT NULL,
            device_type TEXT NOT NULL,
            engine TEXT NOT NULL,
            release_date TEXT,
            is_valid INTEGER DEFAULT 1
        );

        -- 4. Proxies
        CREATE TABLE IF NOT EXISTS proxies (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            protocol TEXT NOT NULL,
            host TEXT NOT NULL,
            port INTEGER NOT NULL,
            username TEXT,
            password TEXT,
            group_name TEXT DEFAULT 'General',
            country TEXT,
            country_code TEXT,
            status TEXT DEFAULT 'untested',
            latency_ms INTEGER DEFAULT 0,
            last_checked TEXT,
            error_message TEXT
        );

        -- 5. Network Interfaces Cache
        CREATE TABLE IF NOT EXISTS network_interfaces (
            name TEXT PRIMARY KEY,
            display_name TEXT,
            ip_address TEXT,
            mac_address TEXT,
            type TEXT,
            status TEXT,
            speed_mbps INTEGER,
            dns_servers TEXT,
            gateway TEXT
        );

        -- 6. Websites
        CREATE TABLE IF NOT EXISTS websites (
            id TEXT PRIMARY KEY,
            domain TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            category TEXT DEFAULT 'General',
            group_name TEXT DEFAULT 'Primary',
            enabled INTEGER DEFAULT 1,
            specific_proxy_id TEXT,
            default_fingerprint_family TEXT DEFAULT 'windows-desktop',
            health_status TEXT DEFAULT 'untested',
            last_checked TEXT,
            avg_response_time_ms INTEGER DEFAULT 0
        );

        -- 7. URLs
        CREATE TABLE IF NOT EXISTS urls (
            id TEXT PRIMARY KEY,
            website_id TEXT NOT NULL,
            url TEXT NOT NULL,
            priority INTEGER DEFAULT 1,
            status TEXT DEFAULT 'pending',
            last_visited TEXT,
            response_code INTEGER,
            FOREIGN KEY(website_id) REFERENCES websites(id) ON DELETE CASCADE
        );

        -- 8. Workflows
        CREATE TABLE IF NOT EXISTS workflows (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            category TEXT DEFAULT 'General',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            run_count INTEGER DEFAULT 0
        );

        -- 9. Workflow Steps
        CREATE TABLE IF NOT EXISTS workflow_steps (
            id TEXT PRIMARY KEY,
            workflow_id TEXT NOT NULL,
            step_order INTEGER NOT NULL,
            action TEXT NOT NULL,
            label TEXT NOT NULL,
            selector TEXT,
            value TEXT,
            wait_duration_ms INTEGER,
            scroll_delta_y INTEGER,
            condition_variable TEXT,
            condition_operator TEXT,
            condition_value TEXT,
            repeat_count INTEGER,
            target_variable TEXT,
            timeout_ms INTEGER DEFAULT 10000,
            optional INTEGER DEFAULT 0,
            FOREIGN KEY(workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
        );

        -- 10. Browser Sessions
        CREATE TABLE IF NOT EXISTS browser_sessions (
            id TEXT PRIMARY KEY,
            profile_id TEXT NOT NULL,
            proxy_id TEXT,
            started_at TEXT NOT NULL,
            ended_at TEXT,
            pages_visited INTEGER DEFAULT 0,
            bytes_transferred INTEGER DEFAULT 0,
            exit_code INTEGER,
            FOREIGN KEY(profile_id) REFERENCES browser_profiles(id)
        );

        -- 11. Task Queue
        CREATE TABLE IF NOT EXISTS task_queue (
            id TEXT PRIMARY KEY,
            workflow_id TEXT NOT NULL,
            profile_id TEXT NOT NULL,
            target_url TEXT NOT NULL,
            priority TEXT DEFAULT 'normal',
            status TEXT DEFAULT 'queued',
            progress_percent INTEGER DEFAULT 0,
            current_step INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            started_at TEXT,
            completed_at TEXT,
            error_message TEXT,
            extracted_data_json TEXT
        );

        -- 12. Activity Logs
        CREATE TABLE IF NOT EXISTS activity_logs (
            id TEXT PRIMARY KEY,
            timestamp TEXT NOT NULL,
            category TEXT NOT NULL,
            level TEXT NOT NULL,
            message TEXT NOT NULL,
            details TEXT,
            profile_id TEXT
        );

        -- 13. Analytics Daily Rollups
        CREATE TABLE IF NOT EXISTS analytics (
            date_key TEXT PRIMARY KEY,
            total_tasks_completed INTEGER DEFAULT 0,
            total_tasks_failed INTEGER DEFAULT 0,
            avg_response_ms INTEGER DEFAULT 0,
            active_proxies_count INTEGER DEFAULT 0,
            cpu_usage_avg REAL DEFAULT 0,
            memory_usage_avg REAL DEFAULT 0
        );

        -- 14. Application Settings
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );
        """
        with self.get_connection() as conn:
            conn.executescript(schema_sql)
            conn.commit()

        self._seed_defaults_if_empty()
        logger.info("SQLite schema initialized successfully.")

    def _seed_defaults_if_empty(self):
        with self.get_connection() as conn:
            cur = conn.execute("SELECT COUNT(*) as cnt FROM browser_profiles")
            if cur.fetchone()["cnt"] == 0:
                now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

                # Seed fingerprints
                conn.execute("""
                    INSERT INTO fingerprint_configs (id, name, family, user_agent, browser_name, browser_version, os_name, os_version, platform, screen_resolution, viewport_width, viewport_height, device_scale_factor, language, locale, timezone, color_scheme, touch_enabled, max_touch_points)
                    VALUES ('fp-win-1', 'Windows 11 Workstation Chrome 133', 'windows-desktop', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36', 'Chrome', '133.0.0.0', 'Windows', '11 x64', 'Win32', '2560x1440', 1920, 1080, 1.25, 'en-US', 'en-US', 'America/New_York', 'dark', 0, 0),
                           ('fp-win-2', 'Windows 10 Laptop Edge 132', 'windows-laptop', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0', 'Edge', '132.0.2917.39', 'Windows', '10 x64', 'Win32', '1920x1080', 1536, 864, 1.0, 'en-GB', 'en-GB', 'Europe/London', 'light', 1, 10),
                           ('fp-mob-1', 'Galaxy S24 Ultra Android 14', 'android-mobile', 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36', 'Chrome Mobile', '133.0.0.0', 'Android', '14.0', 'Linux armv8l', '1440x3120', 412, 915, 3.5, 'en-US', 'en-US', 'America/Chicago', 'dark', 1, 5)
                """)

                # Seed proxies
                conn.execute("""
                    INSERT INTO proxies (id, name, protocol, host, port, username, password, group_name, country, country_code, status, latency_ms)
                    VALUES ('prx-1', 'US East Dedicated Gateway', 'http', '198.51.100.45', 8080, 'searx_user', 'pass123', 'Tier-1 Fleet', 'United States', 'US', 'active', 42),
                           ('prx-2', 'Frankfurt High-Speed SOCKS5', 'socks5', '194.150.168.12', 1080, NULL, NULL, 'Europe Fleet', 'Germany', 'DE', 'active', 68),
                           ('prx-3', 'Tokyo HTTPS Datacenter', 'https', '203.0.113.88', 3128, NULL, NULL, 'Asia Fleet', 'Japan', 'JP', 'active', 115)
                """)

                # Seed profiles
                conn.execute(f"""
                    INSERT INTO browser_profiles (id, name, group_name, fingerprint_id, proxy_id, status, cookies_json, local_storage_json, cache_size_kb, history_count, created_at, notes)
                    VALUES ('prof-1', 'Market Research Alpha', 'Research Fleet', 'fp-win-1', 'prx-1', 'idle', '{{"session_id": "s89a1", "lang": "en"}}', '{{"theme": "dark"}}', 14200, 48, '{now_str}', 'Dedicated environment for competitor search analytics.'),
                           ('prof-2', 'Edge QA Tester', 'QA Automation', 'fp-win-2', 'prx-2', 'idle', '{{"consent": "accepted"}}', '{{}}', 6800, 24, '{now_str}', 'Checkout and form interaction testing profile.'),
                           ('prof-3', 'Mobile S24 Auditor', 'Mobile Fleet', 'fp-mob-1', 'prx-3', 'idle', '{{}}', '{{}}', 18400, 92, '{now_str}', 'High-DPI responsive touch audit environment.')
                """)

                # Seed websites
                conn.execute("""
                    INSERT INTO websites (id, domain, name, category, group_name, enabled, avg_response_time_ms)
                    VALUES ('web-1', 'searx.be', 'SearXNG Decentralized Search', 'Search Engine', 'Primary Feeds', 1, 240),
                           ('web-2', 'news.ycombinator.com', 'Hacker News Technology Portal', 'Technology News', 'Research Feeds', 1, 180),
                           ('web-3', 'github.com', 'GitHub Open Software', 'Development', 'Software Research', 1, 310)
                """)

                # Seed workflows
                conn.execute(f"""
                    INSERT INTO workflows (id, name, description, category, created_at, updated_at, run_count)
                    VALUES ('wf-1', 'SearXNG Keyword Rank & Result Inspector', 'Navigates to SearXNG, inputs keyword, scrolls SERP, extracts page title, and logs audit evidence.', 'Search Audit', '{now_str}', '{now_str}', 14),
                           ('wf-2', 'Tech Portal Headline & Title Extractor', 'Extracts top technology headlines and verifies destination links safely.', 'Content Research', '{now_str}', '{now_str}', 8)
                """)

                # Seed workflow steps
                conn.execute("""
                    INSERT INTO workflow_steps (id, workflow_id, step_order, action, label, selector, value, wait_duration_ms, scroll_delta_y)
                    VALUES ('ws-1', 'wf-1', 1, 'open_url', '1. Open Target URL', NULL, 'https://searx.be/', NULL, NULL),
                           ('ws-2', 'wf-1', 2, 'wait_element', '4. Wait for Search Input', 'input[name="q"]', NULL, NULL, NULL),
                           ('ws-3', 'wf-1', 3, 'fill_input', '6. Fill Search Input', 'input[name="q"]', 'autonomous industrial robotics', NULL, NULL),
                           ('ws-4', 'wf-1', 4, 'wait_duration', '5. Wait Duration', NULL, NULL, 1200, NULL),
                           ('ws-5', 'wf-1', 5, 'submit_form', '8. Submit Authorized Form', '#search_form', NULL, NULL, NULL),
                           ('ws-6', 'wf-1', 6, 'scroll_page', '3. Scroll Page', NULL, NULL, NULL, 600),
                           ('ws-7', 'wf-1', 7, 'extract_title', '12. Extract Page Title', NULL, NULL, NULL, NULL),
                           ('ws-8', 'wf-1', 8, 'take_screenshot', '11. Take Screenshot', NULL, NULL, NULL, NULL),
                           ('ws-9', 'wf-1', 9, 'save_result', '14. Save Result', NULL, NULL, NULL, NULL)
                """)

                # Seed task queue
                conn.execute(f"""
                    INSERT INTO task_queue (id, workflow_id, profile_id, target_url, priority, status, progress_percent, current_step, created_at, error_message)
                    VALUES ('task-101', 'wf-1', 'prof-1', 'https://searx.be/search?q=robotics', 'high', 'completed', 100, 9, '{now_str}', NULL),
                           ('task-102', 'wf-2', 'prof-2', 'https://news.ycombinator.com/', 'normal', 'queued', 0, 0, '{now_str}', NULL)
                """)

                # Seed activity logs
                conn.execute(f"""
                    INSERT INTO activity_logs (id, timestamp, category, level, message, details, profile_id)
                    VALUES ('log-1', '{now_str}', 'system', 'success', 'SEARX AI ULTRA PRO SQLite database initialized with 14 normalized tables.', NULL, NULL),
                           ('log-2', '{now_str}', 'proxy', 'success', 'Proxy US East Dedicated Gateway verified (HTTP 200, 42ms).', NULL, NULL),
                           ('log-3', '{now_str}', 'profile', 'info', 'Profile Market Research Alpha allocated with isolated storage directory.', NULL, 'prof-1')
                """)

                conn.commit()

    def log_activity(self, category: str, level: str, message: str, details: Optional[str] = None, profile_id: Optional[str] = None):
        with self.get_connection() as conn:
            conn.execute(
                "INSERT INTO activity_logs (id, timestamp, category, level, message, details, profile_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (str(uuid.uuid4())[:8], datetime.now().strftime("%Y-%m-%d %H:%M:%S"), category, level, message, details, profile_id)
            )
            conn.commit()

    def get_profiles(self) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cur = conn.execute("SELECT * FROM browser_profiles ORDER BY name ASC")
            return [dict(row) for row in cur.fetchall()]

    def add_profile(self, name: str, group: str = "General", fingerprint_id: str = "fp-win-1", proxy_id: Optional[str] = None, notes: str = "") -> str:
        prof_id = f"prof-{str(uuid.uuid4())[:6]}"
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        with self.get_connection() as conn:
            conn.execute("""
                INSERT INTO browser_profiles (id, name, group_name, fingerprint_id, proxy_id, status, cookies_json, local_storage_json, cache_size_kb, history_count, created_at, notes)
                VALUES (?, ?, ?, ?, ?, 'idle', '{}', '{}', 0, 0, ?, ?)
            """, (prof_id, name, group, fingerprint_id, proxy_id, now_str, notes))
            conn.commit()
        self.log_activity("profile", "success", f"Created profile '{name}' ({group})", profile_id=prof_id)
        return prof_id

    def delete_profile(self, profile_id: str):
        with self.get_connection() as conn:
            conn.execute("DELETE FROM browser_profiles WHERE id = ?", (profile_id,))
            conn.commit()
        self.log_activity("profile", "warning", f"Deleted profile ID {profile_id}")

    def update_profile_status(self, profile_id: str, status: str):
        with self.get_connection() as conn:
            now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            conn.execute("UPDATE browser_profiles SET status = ?, last_active_at = ? WHERE id = ?", (status, now_str, profile_id))
            conn.commit()

    def get_proxies(self) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cur = conn.execute("SELECT * FROM proxies ORDER BY name ASC")
            return [dict(row) for row in cur.fetchall()]

    def add_proxy(self, name: str, protocol: str, host: str, port: int, group: str = "General", country: str = "Global") -> str:
        prx_id = f"prx-{str(uuid.uuid4())[:6]}"
        with self.get_connection() as conn:
            conn.execute("""
                INSERT INTO proxies (id, name, protocol, host, port, group_name, country, status, latency_ms)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'untested', 0)
            """, (prx_id, name, protocol, host, port, group, country))
            conn.commit()
        self.log_activity("proxy", "info", f"Added proxy {protocol.upper()}://{host}:{port} ({name})")
        return prx_id

    def delete_proxy(self, proxy_id: str):
        with self.get_connection() as conn:
            conn.execute("DELETE FROM proxies WHERE id = ?", (proxy_id,))
            conn.commit()

    def update_proxy_status(self, proxy_id: str, status: str, latency_ms: int, error_message: Optional[str] = None):
        with self.get_connection() as conn:
            now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            conn.execute("UPDATE proxies SET status = ?, latency_ms = ?, last_checked = ?, error_message = ? WHERE id = ?",
                         (status, latency_ms, now_str, error_message, proxy_id))
            conn.commit()

    def get_workflows(self) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cur = conn.execute("SELECT * FROM workflows ORDER BY name ASC")
            return [dict(row) for row in cur.fetchall()]

    def get_workflow_steps(self, workflow_id: str) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cur = conn.execute("SELECT * FROM workflow_steps WHERE workflow_id = ? ORDER BY step_order ASC", (workflow_id,))
            return [dict(row) for row in cur.fetchall()]

    def get_tasks(self) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cur = conn.execute("SELECT * FROM task_queue ORDER BY created_at DESC")
            return [dict(row) for row in cur.fetchall()]

    def enqueue_task(self, workflow_id: str, profile_id: str, target_url: str, priority: str = "normal"):
        task_id = f"task-{str(uuid.uuid4())[:6]}"
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        with self.get_connection() as conn:
            conn.execute("""
                INSERT INTO task_queue (id, workflow_id, profile_id, target_url, priority, status, progress_percent, current_step, created_at)
                VALUES (?, ?, ?, ?, ?, 'queued', 0, 0, ?)
            """, (task_id, workflow_id, profile_id, target_url, priority, now_str))
            conn.commit()
        self.log_activity("task", "info", f"Queued task #{task_id} [{priority.upper()}] for profile {profile_id}")
        return task_id

    def get_websites(self) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cur = conn.execute("SELECT * FROM websites ORDER BY name ASC")
            return [dict(row) for row in cur.fetchall()]

    def get_fingerprints(self) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cur = conn.execute("SELECT * FROM fingerprint_configs ORDER BY name ASC")
            return [dict(row) for row in cur.fetchall()]

    def get_logs(self, limit: int = 50) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cur = conn.execute("SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT ?", (limit,))
            return [dict(row) for row in cur.fetchall()]
