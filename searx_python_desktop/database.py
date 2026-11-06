"""
SQLite Database & Storage Manager for SEARX AI ULTRA PRO
Handles schema migrations, encrypted secret options, and query helpers for all 14 tables.
"""

import sqlite3
import json
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
        """Initializes all 14 required tables."""
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
        logger.info("SQLite schema initialized successfully.")

    def log_activity(self, category: str, level: str, message: str, details: Optional[str] = None, profile_id: Optional[str] = None):
        import uuid
        with self.get_connection() as conn:
            conn.execute(
                "INSERT INTO activity_logs (id, timestamp, category, level, message, details, profile_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (str(uuid.uuid4()), datetime.utcnow().isoformat(), category, level, message, details, profile_id)
            )
            conn.commit()

    def get_profiles(self) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cur = conn.execute("SELECT * FROM browser_profiles ORDER BY name ASC")
            return [dict(row) for row in cur.fetchall()]

    def get_proxies(self) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cur = conn.execute("SELECT * FROM proxies ORDER BY name ASC")
            return [dict(row) for row in cur.fetchall()]

    def get_workflows(self) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cur = conn.execute("SELECT * FROM workflows ORDER BY name ASC")
            return [dict(row) for row in cur.fetchall()]
