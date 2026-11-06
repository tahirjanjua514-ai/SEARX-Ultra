-- SEARX AI ULTRA PRO SQLite Database Initialization Schema
-- 14 Normalized Tables with Foreign Keys & WAL Mode
PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

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

CREATE TABLE IF NOT EXISTS workflows (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'General',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    run_count INTEGER DEFAULT 0
);

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

CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    category TEXT NOT NULL,
    level TEXT NOT NULL,
    message TEXT NOT NULL,
    details TEXT,
    profile_id TEXT
);

CREATE TABLE IF NOT EXISTS analytics (
    date_key TEXT PRIMARY KEY,
    total_tasks_completed INTEGER DEFAULT 0,
    total_tasks_failed INTEGER DEFAULT 0,
    avg_response_ms INTEGER DEFAULT 0,
    active_proxies_count INTEGER DEFAULT 0,
    cpu_usage_avg REAL DEFAULT 0,
    memory_usage_avg REAL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
