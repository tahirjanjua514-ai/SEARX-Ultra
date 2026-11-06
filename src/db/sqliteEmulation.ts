import {
  BrowserProfile,
  FingerprintConfig,
  UserAgentRecord,
  ProxyRecord,
  NetworkInterfaceInfo,
  RpaWorkflow,
  RpaStep,
  TaskQueueItem,
  WebsiteRecord,
  UrlItem,
  ActivityLog,
  AnalyticsMetric,
  AppSettings,
  DeviceFamily
} from '../types';

const STORAGE_KEY = 'searx_ai_ultra_db_v1';

export interface DatabaseState {
  profiles: BrowserProfile[];
  fingerprints: FingerprintConfig[];
  userAgents: UserAgentRecord[];
  proxies: ProxyRecord[];
  networkInterfaces: NetworkInterfaceInfo[];
  websites: WebsiteRecord[];
  urls: UrlItem[];
  workflows: RpaWorkflow[];
  tasks: TaskQueueItem[];
  activityLogs: ActivityLog[];
  settings: AppSettings;
}

// Initial realistic seed data
const SEED_FINGERPRINTS: FingerprintConfig[] = [
  {
    id: 'fp-win-desktop-1',
    name: 'Windows 11 Workstation Chrome 133',
    family: 'windows-desktop',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
    browserName: 'Chrome',
    browserVersion: '133.0.0.0',
    osName: 'Windows',
    osVersion: '11 (Build 26100)',
    platform: 'Win32',
    screenResolution: '2560x1440',
    viewportWidth: 1920,
    viewportHeight: 1080,
    deviceScaleFactor: 1.25,
    language: 'en-US,en;q=0.9',
    locale: 'en-US',
    timezone: 'America/New_York',
    colorScheme: 'dark',
    touchEnabled: false,
    maxTouchPoints: 0,
    canvasNoise: true,
    webglNoise: true,
    audioNoise: true,
    webRtcPolicy: 'disable-non-proxied-udp',
    geolocationPermission: 'prompt',
    latitude: 40.7128,
    longitude: -74.006,
    accuracy: 15
  },
  {
    id: 'fp-win-laptop-1',
    name: 'Windows 10 Laptop Edge 132',
    family: 'windows-laptop',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0',
    browserName: 'Edge',
    browserVersion: '132.0.2917.39',
    osName: 'Windows',
    osVersion: '10 (Build 19045)',
    platform: 'Win32',
    screenResolution: '1920x1080',
    viewportWidth: 1536,
    viewportHeight: 864,
    deviceScaleFactor: 1.0,
    language: 'en-GB,en;q=0.8',
    locale: 'en-GB',
    timezone: 'Europe/London',
    colorScheme: 'light',
    touchEnabled: true,
    maxTouchPoints: 10,
    canvasNoise: true,
    webglNoise: true,
    audioNoise: true,
    webRtcPolicy: 'disable-non-proxied-udp',
    geolocationPermission: 'prompt',
    latitude: 51.5074,
    longitude: -0.1278,
    accuracy: 25
  },
  {
    id: 'fp-android-mobile-1',
    name: 'Samsung Galaxy S24 Ultra Android 14',
    family: 'android-mobile',
    userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36',
    browserName: 'Chrome Mobile',
    browserVersion: '133.0.0.0',
    osName: 'Android',
    osVersion: '14.0',
    platform: 'Linux armv8l',
    screenResolution: '1440x3120',
    viewportWidth: 412,
    viewportHeight: 915,
    deviceScaleFactor: 3.5,
    language: 'en-US,en;q=0.9',
    locale: 'en-US',
    timezone: 'America/Chicago',
    colorScheme: 'dark',
    touchEnabled: true,
    maxTouchPoints: 5,
    canvasNoise: true,
    webglNoise: true,
    audioNoise: true,
    webRtcPolicy: 'disable-non-proxied-udp',
    geolocationPermission: 'granted',
    latitude: 41.8781,
    longitude: -87.6298,
    accuracy: 10
  },
  {
    id: 'fp-android-tablet-1',
    name: 'Google Pixel Tablet Android 14',
    family: 'android-tablet',
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel Tablet) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
    browserName: 'Chrome',
    browserVersion: '133.0.0.0',
    osName: 'Android',
    osVersion: '14.0',
    platform: 'Linux armv8l',
    screenResolution: '2560x1600',
    viewportWidth: 1280,
    viewportHeight: 800,
    deviceScaleFactor: 2.0,
    language: 'de-DE,de;q=0.9,en;q=0.8',
    locale: 'de-DE',
    timezone: 'Europe/Berlin',
    colorScheme: 'light',
    touchEnabled: true,
    maxTouchPoints: 10,
    canvasNoise: true,
    webglNoise: true,
    audioNoise: true,
    webRtcPolicy: 'disable-non-proxied-udp',
    geolocationPermission: 'prompt',
    latitude: 52.52,
    longitude: 13.405,
    accuracy: 30
  }
];

const SEED_PROXIES: ProxyRecord[] = [
  {
    id: 'prx-us-east-1',
    name: 'US East Dedicated Gateway',
    protocol: 'http',
    host: '198.51.100.45',
    port: 8080,
    username: 'searx_ops',
    password: '••••••••',
    group: 'Enterprise Tier',
    country: 'United States',
    countryCode: 'US',
    status: 'active',
    latencyMs: 42,
    lastChecked: '2026-11-06 14:15:20',
    assignedProfilesCount: 2
  },
  {
    id: 'prx-eu-germany-1',
    name: 'Frankfurt Datacenter SOCKS5',
    protocol: 'socks5',
    host: '194.150.168.12',
    port: 1080,
    group: 'Europe Fleet',
    country: 'Germany',
    countryCode: 'DE',
    status: 'active',
    latencyMs: 68,
    lastChecked: '2026-11-06 14:10:05',
    assignedProfilesCount: 1
  },
  {
    id: 'prx-asia-tokyo-1',
    name: 'Tokyo High-Speed HTTPS',
    protocol: 'https',
    host: '203.0.113.88',
    port: 3128,
    group: 'Asia Fleet',
    country: 'Japan',
    countryCode: 'JP',
    status: 'active',
    latencyMs: 115,
    lastChecked: '2026-11-06 14:02:18',
    assignedProfilesCount: 1
  },
  {
    id: 'prx-uk-london-1',
    name: 'London Residential Test',
    protocol: 'http',
    host: '185.190.140.22',
    port: 8888,
    group: 'Europe Fleet',
    country: 'United Kingdom',
    countryCode: 'GB',
    status: 'untested',
    latencyMs: 0,
    assignedProfilesCount: 0
  }
];

const SEED_PROFILES: BrowserProfile[] = [
  {
    id: 'prof-ops-alpha',
    name: 'Alpha Ops - Market Research',
    group: 'Market Research',
    fingerprintId: 'fp-win-desktop-1',
    proxyId: 'prx-us-east-1',
    status: 'idle',
    cookiesCount: 18,
    localStorageCount: 42,
    cacheSizeKb: 14200,
    historyCount: 154,
    createdAt: '2026-10-15 08:30:00',
    lastActiveAt: '2026-11-06 13:45:10',
    notes: 'Isolated environment for competitor e-commerce price monitoring and inventory auditing.',
    cookiesData: {
      'session_id': 's_89a0f4412ef',
      'currency': 'USD',
      'pref_lang': 'en',
      'auth_token': 'jwt_991823ab'
    },
    localStorageData: {
      'searx_ui_theme': 'dark',
      'cached_catalog_rev': '4.19',
      'recent_queries': '["aerospace actuators","brushless esc"]'
    }
  },
  {
    id: 'prof-qa-edge',
    name: 'Edge Windows 10 QA Runner',
    group: 'QA Automation',
    fingerprintId: 'fp-win-laptop-1',
    proxyId: 'prx-eu-germany-1',
    status: 'idle',
    cookiesCount: 8,
    localStorageCount: 12,
    cacheSizeKb: 6800,
    historyCount: 45,
    createdAt: '2026-10-22 11:20:00',
    lastActiveAt: '2026-11-06 12:10:00',
    notes: 'Validates checkout flow and form submissions on Edge browser under UK locale.',
    cookiesData: {
      'cookie_consent': 'accepted_all',
      'region': 'GB'
    },
    localStorageData: {
      'cart_items': '[]'
    }
  },
  {
    id: 'prof-mobile-s24',
    name: 'Mobile S24 - Responsive Audit',
    group: 'Mobile Testing',
    fingerprintId: 'fp-android-mobile-1',
    proxyId: 'prx-asia-tokyo-1',
    status: 'idle',
    cookiesCount: 24,
    localStorageCount: 31,
    cacheSizeKb: 21500,
    historyCount: 210,
    createdAt: '2026-11-01 09:00:00',
    lastActiveAt: '2026-11-06 14:05:32',
    notes: 'High-DPI touch viewport simulation testing mobile navigation menus and responsive tables.',
    cookiesData: {
      'device_type': 'mobile',
      'app_client_id': 'm_client_341'
    },
    localStorageData: {
      'mobile_drawer_open': 'false',
      'touch_calibrated': 'true'
    }
  },
  {
    id: 'prof-tablet-pixel',
    name: 'Pixel Tablet - European Catalog',
    group: 'Mobile Testing',
    fingerprintId: 'fp-android-tablet-1',
    status: 'idle',
    cookiesCount: 6,
    localStorageCount: 8,
    cacheSizeKb: 4300,
    historyCount: 19,
    createdAt: '2026-11-03 16:40:00',
    notes: 'Tablet viewport simulation with German locale without proxy assignment.',
    cookiesData: {},
    localStorageData: {}
  }
];

const SEED_USER_AGENTS: UserAgentRecord[] = [
  {
    id: 'ua-1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
    browser: 'Chrome',
    browserVersion: '133.0.0.0',
    os: 'Windows',
    osVersion: '11 / 10 x64',
    deviceType: 'desktop',
    engine: 'Blink / V8',
    releaseDate: 'Feb 2026',
    isValid: true,
    profileCount: 1
  },
  {
    id: 'ua-2',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0',
    browser: 'Microsoft Edge',
    browserVersion: '132.0.2917.39',
    os: 'Windows',
    osVersion: '11 / 10 x64',
    deviceType: 'desktop',
    engine: 'Blink / V8',
    releaseDate: 'Jan 2026',
    isValid: true,
    profileCount: 1
  },
  {
    id: 'ua-3',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0',
    browser: 'Firefox',
    browserVersion: '135.0',
    os: 'Windows',
    osVersion: '11 / 10 x64',
    deviceType: 'desktop',
    engine: 'Gecko / SpiderMonkey',
    releaseDate: 'Feb 2026',
    isValid: true,
    profileCount: 0
  },
  {
    id: 'ua-4',
    userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36',
    browser: 'Chrome Mobile',
    browserVersion: '133.0.0.0',
    os: 'Android',
    osVersion: '14.0 (One UI 6.1)',
    deviceType: 'mobile',
    engine: 'Blink',
    releaseDate: 'Feb 2026',
    isValid: true,
    profileCount: 1
  },
  {
    id: 'ua-5',
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel Tablet) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
    browser: 'Chrome Tablet',
    browserVersion: '133.0.0.0',
    os: 'Android',
    osVersion: '14.0',
    deviceType: 'tablet',
    engine: 'Blink',
    releaseDate: 'Jan 2026',
    isValid: true,
    profileCount: 1
  },
  {
    id: 'ua-6',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.116 Safari/537.36',
    browser: 'Chrome LTS',
    browserVersion: '130.0.6723.116',
    os: 'Windows',
    osVersion: '10 x64',
    deviceType: 'desktop',
    engine: 'Blink',
    releaseDate: 'Nov 2025',
    isValid: true,
    profileCount: 0
  }
];

const SEED_NETWORK_INTERFACES: NetworkInterfaceInfo[] = [
  {
    name: 'Ethernet0',
    displayName: 'Intel(R) Ethernet Controller I225-V',
    ipAddress: '192.168.1.142',
    macAddress: '00:1A:2B:3C:4D:5E',
    type: 'ethernet',
    status: 'connected',
    speedMbps: 2500,
    dnsServers: ['1.1.1.1', '1.0.0.1'],
    gateway: '192.168.1.1'
  },
  {
    name: 'Wi-Fi',
    displayName: 'Intel(R) Wi-Fi 6E AX211 160MHz',
    ipAddress: '192.168.1.145',
    macAddress: '00:1A:2B:3C:4D:5F',
    type: 'wifi',
    status: 'connected',
    speedMbps: 1200,
    dnsServers: ['8.8.8.8', '8.8.4.4'],
    gateway: '192.168.1.1'
  },
  {
    name: 'Loopback0',
    displayName: 'Software Loopback Interface 1',
    ipAddress: '127.0.0.1',
    macAddress: '00:00:00:00:00:00',
    type: 'loopback',
    status: 'connected',
    speedMbps: 10000,
    dnsServers: [],
    gateway: 'None'
  }
];

const SEED_WEBSITES: WebsiteRecord[] = [
  {
    id: 'web-1',
    domain: 'searx.be',
    name: 'SearXNG Public Metasearch',
    category: 'Search Engine',
    group: 'Search Providers',
    enabled: true,
    urlCount: 14,
    healthStatus: 'healthy',
    lastChecked: '2026-11-06 14:10:00',
    avgResponseTimeMs: 240
  },
  {
    id: 'web-2',
    domain: 'news.ycombinator.com',
    name: 'Hacker News Tech Hub',
    category: 'Technology News',
    group: 'Research Feeds',
    enabled: true,
    urlCount: 28,
    healthStatus: 'healthy',
    lastChecked: '2026-11-06 13:50:00',
    avgResponseTimeMs: 180
  },
  {
    id: 'web-3',
    domain: 'github.com',
    name: 'GitHub Open Repositories',
    category: 'Development',
    group: 'Software Research',
    enabled: true,
    urlCount: 65,
    healthStatus: 'healthy',
    lastChecked: '2026-11-06 14:05:00',
    avgResponseTimeMs: 310
  },
  {
    id: 'web-4',
    domain: 'en.wikipedia.org',
    name: 'Wikipedia Knowledge Base',
    category: 'Reference',
    group: 'Content Verification',
    enabled: true,
    urlCount: 42,
    healthStatus: 'healthy',
    lastChecked: '2026-11-06 12:40:00',
    avgResponseTimeMs: 195
  }
];

const SEED_URLS: UrlItem[] = [
  { id: 'url-1', websiteId: 'web-1', websiteDomain: 'searx.be', url: 'https://searx.be/search?q=robotics+actuators', priority: 1, status: 'processed', lastVisited: '2026-11-06 13:30', responseCode: 200 },
  { id: 'url-2', websiteId: 'web-1', websiteDomain: 'searx.be', url: 'https://searx.be/search?q=python+3.11+playwright', priority: 2, status: 'processed', lastVisited: '2026-11-06 13:45', responseCode: 200 },
  { id: 'url-3', websiteId: 'web-2', websiteDomain: 'news.ycombinator.com', url: 'https://news.ycombinator.com/newest', priority: 1, status: 'pending' },
  { id: 'url-4', websiteId: 'web-3', websiteDomain: 'github.com', url: 'https://github.com/trending/python', priority: 2, status: 'pending' },
  { id: 'url-5', websiteId: 'web-4', websiteDomain: 'en.wikipedia.org', url: 'https://en.wikipedia.org/wiki/Robotic_process_automation', priority: 3, status: 'processed', lastVisited: '2026-11-06 11:20', responseCode: 200 }
];

const SEED_WORKFLOW_STEPS_1: RpaStep[] = [
  { id: 's1', order: 1, action: 'open_url', label: 'Navigate to SearXNG Portal', value: 'https://searx.be/' },
  { id: 's2', order: 2, action: 'wait_element', label: 'Wait for Search Input Field', selector: 'input[name="q"]', timeoutMs: 8000 },
  { id: 's3', order: 3, action: 'fill_input', label: 'Enter Audit Keyword', selector: 'input[name="q"]', value: 'autonomous industrial automation' },
  { id: 's4', order: 4, action: 'wait_duration', label: 'Pacing Pause', waitDurationMs: 1200 },
  { id: 's5', order: 5, action: 'submit_form', label: 'Submit Search Query', selector: '#search_form' },
  { id: 's6', order: 6, action: 'wait_element', label: 'Wait for Results List', selector: '#results article', timeoutMs: 12000 },
  { id: 's7', order: 7, action: 'scroll_page', label: 'Scroll to Review Top 5 Snippets', scrollDeltaY: 600 },
  { id: 's8', order: 8, action: 'extract_title', label: 'Record SERP Page Title', targetVariable: 'serp_title' },
  { id: 's9', order: 9, action: 'take_screenshot', label: 'Capture Audit Verification Evidence' },
  { id: 's10', order: 10, action: 'save_result', label: 'Save Results to Database' }
];

const SEED_WORKFLOW_STEPS_2: RpaStep[] = [
  { id: 's2-1', order: 1, action: 'open_url', label: 'Open Target E-Commerce Catalog', value: 'https://news.ycombinator.com/' },
  { id: 's2-2', order: 2, action: 'wait_element', label: 'Wait for Headline Table', selector: 'table.itemlist', timeoutMs: 6000 },
  { id: 's2-3', order: 3, action: 'extract_text', label: 'Extract Leading Story Header', selector: '.titleline > a', targetVariable: 'top_headline' },
  { id: 's2-4', order: 4, action: 'conditional', label: 'Check If Headline Exists', conditionVariable: 'top_headline', conditionOperator: 'exists' },
  { id: 's2-5', order: 5, action: 'scroll_page', label: 'Scroll Down 800px', scrollDeltaY: 800 },
  { id: 's2-6', order: 6, action: 'wait_duration', label: 'Reading Wait', waitDurationMs: 2000 },
  { id: 's2-7', order: 7, action: 'take_screenshot', label: 'Save Viewport Capture' },
  { id: 's2-8', order: 8, action: 'save_result', label: 'Store Extracted Data' }
];

const SEED_WORKFLOWS: RpaWorkflow[] = [
  {
    id: 'wf-search-audit',
    name: 'SearXNG Keyword Rank & Result Inspector',
    description: 'Executes legitimate search query inspection, verifies destination URLs, and extracts SERP headers.',
    category: 'Search & SEO Audit',
    steps: SEED_WORKFLOW_STEPS_1,
    createdAt: '2026-10-25 10:00:00',
    updatedAt: '2026-11-06 09:15:00',
    lastRunAt: '2026-11-06 13:45:00',
    lastRunStatus: 'success',
    runCount: 38
  },
  {
    id: 'wf-feed-scraper',
    name: 'Tech Portal Headline & Title Extractor',
    description: 'Extracts real-time technology titles and verifies link destinations without bypassing site controls.',
    category: 'Content Research',
    steps: SEED_WORKFLOW_STEPS_2,
    createdAt: '2026-10-28 14:30:00',
    updatedAt: '2026-11-05 16:00:00',
    lastRunAt: '2026-11-06 12:20:00',
    lastRunStatus: 'success',
    runCount: 22
  }
];

const SEED_TASKS: TaskQueueItem[] = [
  {
    id: 'task-101',
    workflowId: 'wf-search-audit',
    workflowName: 'SearXNG Keyword Rank & Result Inspector',
    profileId: 'prof-ops-alpha',
    profileName: 'Alpha Ops - Market Research',
    targetUrl: 'https://searx.be/search?q=robotics+actuators',
    priority: 'high',
    status: 'completed',
    progressPercent: 100,
    currentStepIndex: 10,
    totalSteps: 10,
    currentStepDescription: 'Completed all 10 steps successfully.',
    createdAt: '2026-11-06 13:40:00',
    startedAt: '2026-11-06 13:41:00',
    completedAt: '2026-11-06 13:42:15',
    extractedData: {
      'serp_title': 'SearXNG - robotics actuators',
      'top_domain': 'ieee.org',
      'results_count': '18'
    }
  },
  {
    id: 'task-102',
    workflowId: 'wf-feed-scraper',
    workflowName: 'Tech Portal Headline & Title Extractor',
    profileId: 'prof-qa-edge',
    profileName: 'Edge Windows 10 QA Runner',
    targetUrl: 'https://news.ycombinator.com/',
    priority: 'normal',
    status: 'completed',
    progressPercent: 100,
    currentStepIndex: 8,
    totalSteps: 8,
    currentStepDescription: 'Data recorded to database.',
    createdAt: '2026-11-06 12:15:00',
    startedAt: '2026-11-06 12:16:00',
    completedAt: '2026-11-06 12:17:05',
    extractedData: {
      'top_headline': 'Show HN: Fast local SQLite engine for desktop apps'
    }
  },
  {
    id: 'task-103',
    workflowId: 'wf-search-audit',
    workflowName: 'SearXNG Keyword Rank & Result Inspector',
    profileId: 'prof-mobile-s24',
    profileName: 'Mobile S24 - Responsive Audit',
    targetUrl: 'https://searx.be/search?q=python+3.11+playwright',
    priority: 'urgent',
    status: 'queued',
    progressPercent: 0,
    currentStepIndex: 0,
    totalSteps: 10,
    currentStepDescription: 'Waiting for worker allocation...',
    createdAt: '2026-11-06 14:10:00'
  }
];

const SEED_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-11-06 14:15:20',
    category: 'proxy',
    level: 'success',
    message: 'Proxy US East Dedicated Gateway responded in 42ms (HTTP 200 OK).'
  },
  {
    id: 'log-2',
    timestamp: '2026-11-06 14:10:00',
    category: 'task',
    level: 'info',
    message: 'Task #103 queued with priority URGENT for profile Mobile S24.'
  },
  {
    id: 'log-3',
    timestamp: '2026-11-06 13:42:15',
    category: 'rpa',
    level: 'success',
    message: 'Workflow SearXNG Keyword Rank executed 10/10 steps with zero exceptions.',
    profileName: 'Alpha Ops - Market Research'
  },
  {
    id: 'log-4',
    timestamp: '2026-11-06 13:30:00',
    category: 'network',
    level: 'info',
    message: 'Hardware network check: Ethernet0 and Wi-Fi adapters detected. WebRTC UDP policy enforced.'
  },
  {
    id: 'log-5',
    timestamp: '2026-11-06 12:17:05',
    category: 'profile',
    level: 'info',
    message: 'Isolated session closed for Edge Windows 10 QA Runner. 8 cookies retained in storage.'
  }
];

const SEED_SETTINGS: AppSettings = {
  maxConcurrentSessions: 4,
  cpuLimitPercent: 80,
  memoryLimitMb: 4096,
  requestTimeoutSeconds: 30,
  defaultTimezone: 'America/New_York',
  defaultLocale: 'en-US',
  webrtcProtection: true,
  saveScreenshots: true,
  logRetentionDays: 30,
  autoValidateProxiesIntervalMinutes: 15,
  telemetryMode: 'authorized_audit_only',
  theme: 'dark'
};

class SQLiteDatabaseStore {
  private state: DatabaseState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadFromStorage();
  }

  private loadFromStorage(): DatabaseState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // fallback to seed
    }
    return {
      profiles: SEED_PROFILES,
      fingerprints: SEED_FINGERPRINTS,
      userAgents: SEED_USER_AGENTS,
      proxies: SEED_PROXIES,
      networkInterfaces: SEED_NETWORK_INTERFACES,
      websites: SEED_WEBSITES,
      urls: SEED_URLS,
      workflows: SEED_WORKFLOWS,
      tasks: SEED_TASKS,
      activityLogs: SEED_LOGS,
      settings: SEED_SETTINGS
    };
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to persist database state:', e);
    }
    this.notify();
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    for (const listener of this.listeners) {
      listener();
    }
  }

  // --- Getters ---
  public getState(): DatabaseState {
    return this.state;
  }

  public getProfiles(): BrowserProfile[] {
    return this.state.profiles;
  }

  public getFingerprints(): FingerprintConfig[] {
    return this.state.fingerprints;
  }

  public getUserAgents(): UserAgentRecord[] {
    return this.state.userAgents;
  }

  public getProxies(): ProxyRecord[] {
    return this.state.proxies;
  }

  public getNetworkInterfaces(): NetworkInterfaceInfo[] {
    return this.state.networkInterfaces;
  }

  public getWebsites(): WebsiteRecord[] {
    return this.state.websites;
  }

  public getUrls(): UrlItem[] {
    return this.state.urls;
  }

  public getWorkflows(): RpaWorkflow[] {
    return this.state.workflows;
  }

  public getTasks(): TaskQueueItem[] {
    return this.state.tasks;
  }

  public getLogs(): ActivityLog[] {
    return this.state.activityLogs;
  }

  public getSettings(): AppSettings {
    return this.state.settings;
  }

  // --- Profile Operations ---
  public addProfile(profile: Omit<BrowserProfile, 'id' | 'createdAt' | 'status' | 'cookiesCount' | 'localStorageCount' | 'cacheSizeKb' | 'historyCount' | 'cookiesData' | 'localStorageData'>): BrowserProfile {
    const newProfile: BrowserProfile = {
      ...profile,
      id: 'prof-' + Date.now().toString(36),
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      status: 'idle',
      cookiesCount: 0,
      localStorageCount: 0,
      cacheSizeKb: 0,
      historyCount: 0,
      cookiesData: {},
      localStorageData: {}
    };
    this.state.profiles = [newProfile, ...this.state.profiles];
    this.logActivity('profile', 'success', `Created new browser profile '${newProfile.name}' (Group: ${newProfile.group}).`, undefined, newProfile.id);
    this.persist();
    return newProfile;
  }

  public updateProfile(id: string, updates: Partial<BrowserProfile>) {
    this.state.profiles = this.state.profiles.map(p => (p.id === id ? { ...p, ...updates } : p));
    this.persist();
  }

  public duplicateProfile(id: string): BrowserProfile | null {
    const source = this.state.profiles.find(p => p.id === id);
    if (!source) return null;
    const clone: BrowserProfile = {
      ...source,
      id: 'prof-' + Date.now().toString(36),
      name: `${source.name} (Copy)`,
      status: 'idle',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      lastActiveAt: undefined,
      cookiesData: { ...source.cookiesData },
      localStorageData: { ...source.localStorageData }
    };
    this.state.profiles = [clone, ...this.state.profiles];
    this.logActivity('profile', 'info', `Duplicated profile '${source.name}' into '${clone.name}'.`, undefined, clone.id);
    this.persist();
    return clone;
  }

  public deleteProfile(id: string) {
    const p = this.state.profiles.find(x => x.id === id);
    this.state.profiles = this.state.profiles.filter(x => x.id !== id);
    if (p) {
      this.logActivity('profile', 'warning', `Deleted browser profile '${p.name}'.`, undefined, id);
    }
    this.persist();
  }

  public setProfileStatus(id: string, status: BrowserProfile['status']) {
    this.state.profiles = this.state.profiles.map(p => {
      if (p.id === id) {
        return {
          ...p,
          status,
          lastActiveAt: status === 'running' ? new Date().toISOString().replace('T', ' ').slice(0, 19) : p.lastActiveAt
        };
      }
      return p;
    });
    const p = this.state.profiles.find(x => x.id === id);
    if (p) {
      this.logActivity('profile', status === 'running' ? 'success' : 'info', `Profile '${p.name}' status shifted to ${status.toUpperCase()}.`, undefined, id);
    }
    this.persist();
  }

  // --- Fingerprints ---
  public addFingerprint(fp: Omit<FingerprintConfig, 'id'>): FingerprintConfig {
    const newFp: FingerprintConfig = {
      ...fp,
      id: 'fp-' + Date.now().toString(36)
    };
    this.state.fingerprints = [newFp, ...this.state.fingerprints];
    this.logActivity('security', 'info', `Registered new fingerprint configuration: ${newFp.name} (${newFp.family})`);
    this.persist();
    return newFp;
  }

  public updateFingerprint(id: string, updates: Partial<FingerprintConfig>) {
    this.state.fingerprints = this.state.fingerprints.map(f => (f.id === id ? { ...f, ...updates } : f));
    this.persist();
  }

  // --- User Agents ---
  public addUserAgent(ua: Omit<UserAgentRecord, 'id'>): UserAgentRecord {
    const record: UserAgentRecord = {
      ...ua,
      id: 'ua-' + Date.now().toString(36),
      profileCount: 0
    };
    this.state.userAgents = [record, ...this.state.userAgents];
    this.persist();
    return record;
  }

  public importUserAgents(lines: string[]): number {
    let added = 0;
    const existing = new Set(this.state.userAgents.map(u => u.userAgent));
    for (const raw of lines) {
      const trimmed = raw.trim();
      if (!trimmed || trimmed.startsWith('#') || existing.has(trimmed)) continue;

      let browser = 'Chrome';
      let os = 'Windows';
      let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';

      if (trimmed.includes('Mobile')) deviceType = 'mobile';
      if (trimmed.includes('Tablet') || trimmed.includes('iPad')) deviceType = 'tablet';
      if (trimmed.includes('Edg/')) browser = 'Edge';
      else if (trimmed.includes('Firefox/')) browser = 'Firefox';
      else if (trimmed.includes('Safari/') && !trimmed.includes('Chrome/')) browser = 'Safari';

      if (trimmed.includes('Android')) os = 'Android';
      else if (trimmed.includes('iPhone') || trimmed.includes('Mac OS')) os = 'macOS/iOS';
      else if (trimmed.includes('Linux')) os = 'Linux';

      const item: UserAgentRecord = {
        id: 'ua-' + Math.random().toString(36).slice(2, 9),
        userAgent: trimmed,
        browser,
        browserVersion: 'Auto-detected',
        os,
        osVersion: 'Standard',
        deviceType,
        engine: browser === 'Firefox' ? 'Gecko' : 'Blink',
        releaseDate: 'Imported',
        isValid: true,
        profileCount: 0
      };
      this.state.userAgents.push(item);
      existing.add(trimmed);
      added++;
    }
    if (added > 0) {
      this.logActivity('system', 'success', `Imported ${added} valid User-Agents into database.`);
      this.persist();
    }
    return added;
  }

  // --- Proxies ---
  public addProxy(proxy: Omit<ProxyRecord, 'id' | 'status' | 'latencyMs' | 'assignedProfilesCount'>): ProxyRecord {
    const newProxy: ProxyRecord = {
      ...proxy,
      id: 'prx-' + Date.now().toString(36),
      status: 'untested',
      latencyMs: 0,
      assignedProfilesCount: 0
    };
    this.state.proxies = [newProxy, ...this.state.proxies];
    this.logActivity('proxy', 'info', `Added proxy ${newProxy.protocol.toUpperCase()}://${newProxy.host}:${newProxy.port} (${newProxy.name}).`);
    this.persist();
    return newProxy;
  }

  public updateProxy(id: string, updates: Partial<ProxyRecord>) {
    this.state.proxies = this.state.proxies.map(p => (p.id === id ? { ...p, ...updates } : p));
    this.persist();
  }

  public deleteProxy(id: string) {
    this.state.proxies = this.state.proxies.filter(p => p.id !== id);
    this.persist();
  }

  public batchImportProxies(records: Array<{ host: string; port: number; protocol: 'http' | 'https' | 'socks5'; username?: string; password?: string; group?: string }>): number {
    let count = 0;
    for (const r of records) {
      if (!r.host || !r.port) continue;
      const p: ProxyRecord = {
        id: 'prx-' + Math.random().toString(36).slice(2, 9),
        name: `${r.protocol.toUpperCase()} ${r.host}:${r.port}`,
        protocol: r.protocol,
        host: r.host,
        port: r.port,
        username: r.username,
        password: r.password,
        group: r.group || 'Imported Pool',
        status: 'untested',
        latencyMs: 0,
        assignedProfilesCount: 0
      };
      this.state.proxies.push(p);
      count++;
    }
    if (count > 0) {
      this.logActivity('proxy', 'success', `Batch imported ${count} proxy records.`);
      this.persist();
    }
    return count;
  }

  // --- Workflows & Steps ---
  public addWorkflow(wf: Omit<RpaWorkflow, 'id' | 'createdAt' | 'updatedAt' | 'runCount'>): RpaWorkflow {
    const item: RpaWorkflow = {
      ...wf,
      id: 'wf-' + Date.now().toString(36),
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      runCount: 0
    };
    this.state.workflows = [item, ...this.state.workflows];
    this.logActivity('rpa', 'success', `Created RPA Workflow '${item.name}' with ${item.steps.length} steps.`);
    this.persist();
    return item;
  }

  public updateWorkflow(id: string, updates: Partial<RpaWorkflow>) {
    this.state.workflows = this.state.workflows.map(w =>
      w.id === id
        ? {
            ...w,
            ...updates,
            updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
          }
        : w
    );
    this.persist();
  }

  public deleteWorkflow(id: string) {
    this.state.workflows = this.state.workflows.filter(w => w.id !== id);
    this.persist();
  }

  // --- Tasks ---
  public enqueueTask(task: Omit<TaskQueueItem, 'id' | 'status' | 'progressPercent' | 'currentStepIndex' | 'createdAt'>): TaskQueueItem {
    const item: TaskQueueItem = {
      ...task,
      id: 'task-' + Math.floor(100 + Math.random() * 900),
      status: 'queued',
      progressPercent: 0,
      currentStepIndex: 0,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };
    this.state.tasks = [item, ...this.state.tasks];
    this.logActivity('task', 'info', `Queued Task #${item.id} (${item.workflowName}) for Profile '${item.profileName}' [${item.priority.toUpperCase()}].`);
    this.persist();
    return item;
  }

  public updateTask(id: string, updates: Partial<TaskQueueItem>) {
    this.state.tasks = this.state.tasks.map(t => (t.id === id ? { ...t, ...updates } : t));
    this.persist();
  }

  public clearCompletedTasks() {
    this.state.tasks = this.state.tasks.filter(t => t.status === 'queued' || t.status === 'running');
    this.persist();
  }

  // --- Websites & URLs ---
  public addWebsite(site: Omit<WebsiteRecord, 'id' | 'urlCount' | 'healthStatus' | 'avgResponseTimeMs'>): WebsiteRecord {
    const newSite: WebsiteRecord = {
      ...site,
      id: 'web-' + Date.now().toString(36),
      urlCount: 0,
      healthStatus: 'untested',
      avgResponseTimeMs: 0
    };
    this.state.websites = [newSite, ...this.state.websites];
    this.logActivity('system', 'info', `Added website registry entry: ${newSite.domain} (${newSite.name})`);
    this.persist();
    return newSite;
  }

  public updateWebsite(id: string, updates: Partial<WebsiteRecord>) {
    this.state.websites = this.state.websites.map(s => (s.id === id ? { ...s, ...updates } : s));
    this.persist();
  }

  public deleteWebsite(id: string) {
    this.state.websites = this.state.websites.filter(s => s.id !== id);
    this.state.urls = this.state.urls.filter(u => u.websiteId !== id);
    this.persist();
  }

  public addUrl(websiteId: string, urlStr: string, priority = 1): UrlItem {
    const site = this.state.websites.find(s => s.id === websiteId);
    const domain = site ? site.domain : new URL(urlStr).hostname;
    const item: UrlItem = {
      id: 'url-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      websiteId,
      websiteDomain: domain,
      url: urlStr,
      priority,
      status: 'pending'
    };
    this.state.urls = [item, ...this.state.urls];
    if (site) {
      site.urlCount = (site.urlCount || 0) + 1;
    }
    this.persist();
    return item;
  }

  public deleteUrl(id: string) {
    const u = this.state.urls.find(x => x.id === id);
    this.state.urls = this.state.urls.filter(x => x.id !== id);
    if (u) {
      const site = this.state.websites.find(s => s.id === u.websiteId);
      if (site && site.urlCount > 0) site.urlCount--;
    }
    this.persist();
  }

  // --- Settings ---
  public updateSettings(updates: Partial<AppSettings>) {
    this.state.settings = { ...this.state.settings, ...updates };
    this.persist();
  }

  // --- Activity Logging ---
  public logActivity(category: ActivityLog['category'], level: ActivityLog['level'], message: string, details?: string, profileId?: string, profileName?: string) {
    const log: ActivityLog = {
      id: 'log-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      category,
      level,
      message,
      details,
      profileId,
      profileName
    };
    this.state.activityLogs = [log, ...this.state.activityLogs.slice(0, 200)]; // keep last 200 in storage
    this.persist();
  }

  public clearLogs() {
    this.state.activityLogs = [];
    this.persist();
  }

  // --- Analytics Computed ---
  public getAnalytics(): AnalyticsMetric {
    const totalWebsites = this.state.websites.length;
    const totalUrls = this.state.urls.length;
    const totalProfiles = this.state.profiles.length;
    const activeSessions = this.state.profiles.filter(p => p.status === 'running').length;
    const completedTasks = this.state.tasks.filter(t => t.status === 'completed').length;
    const failedTasks = this.state.tasks.filter(t => t.status === 'failed').length;
    const activeProxies = this.state.proxies.filter(p => p.status === 'active').length;
    const totalProxies = this.state.proxies.length;

    const latencies = this.state.proxies.filter(p => p.latencyMs > 0).map(p => p.latencyMs);
    const avgResponseTimeMs = latencies.length ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 185;

    const totalCompletedOrFailed = completedTasks + failedTasks;
    const workflowSuccessRate = totalCompletedOrFailed > 0 ? Math.round((completedTasks / totalCompletedOrFailed) * 100) : 100;

    return {
      totalWebsites,
      totalUrls,
      totalProfiles,
      activeSessions,
      completedTasks,
      failedTasks,
      averageResponseTimeMs: avgResponseTimeMs,
      activeProxies,
      totalProxies,
      cpuUsagePercent: 18 + activeSessions * 12,
      memoryUsageMb: 820 + activeSessions * 350,
      workflowSuccessRate
    };
  }

  // --- SQL Dump Generator ---
  public generateSqlDump(): string {
    const lines: string[] = [
      '-- SEARX AI ULTRA PRO SQLite Database Dump',
      `-- Generated: ${new Date().toISOString()}`,
      'PRAGMA journal_mode=WAL;',
      'PRAGMA foreign_keys=ON;',
      ''
    ];

    // Export profiles
    lines.push('-- Table: browser_profiles');
    for (const p of this.state.profiles) {
      lines.push(
        `INSERT INTO browser_profiles (id, name, group_name, fingerprint_id, proxy_id, status, cookies_json, local_storage_json, cache_size_kb, history_count, created_at, last_active_at, notes) VALUES (${sqlStr(p.id)}, ${sqlStr(p.name)}, ${sqlStr(p.group)}, ${sqlStr(p.fingerprintId)}, ${sqlStr(p.proxyId)}, ${sqlStr(p.status)}, ${sqlStr(JSON.stringify(p.cookiesData))}, ${sqlStr(JSON.stringify(p.localStorageData))}, ${p.cacheSizeKb}, ${p.historyCount}, ${sqlStr(p.createdAt)}, ${sqlStr(p.lastActiveAt)}, ${sqlStr(p.notes)});`
      );
    }
    lines.push('');

    // Export proxies
    lines.push('-- Table: proxies');
    for (const prx of this.state.proxies) {
      lines.push(
        `INSERT INTO proxies (id, name, protocol, host, port, username, password, group_name, country, country_code, status, latency_ms, last_checked, error_message) VALUES (${sqlStr(prx.id)}, ${sqlStr(prx.name)}, ${sqlStr(prx.protocol)}, ${sqlStr(prx.host)}, ${prx.port}, ${sqlStr(prx.username)}, ${sqlStr(prx.password)}, ${sqlStr(prx.group)}, ${sqlStr(prx.country)}, ${sqlStr(prx.countryCode)}, ${sqlStr(prx.status)}, ${prx.latencyMs}, ${sqlStr(prx.lastChecked)}, ${sqlStr(prx.errorMessage)});`
      );
    }
    lines.push('');

    // Export websites
    lines.push('-- Table: websites');
    for (const w of this.state.websites) {
      lines.push(
        `INSERT INTO websites (id, domain, name, category, group_name, enabled, specific_proxy_id, default_fingerprint_family, health_status, last_checked, avg_response_time_ms) VALUES (${sqlStr(w.id)}, ${sqlStr(w.domain)}, ${sqlStr(w.name)}, ${sqlStr(w.category)}, ${sqlStr(w.group)}, ${w.enabled ? 1 : 0}, ${sqlStr(w.specificProxyId)}, ${sqlStr(w.defaultFingerprintFamily)}, ${sqlStr(w.healthStatus)}, ${sqlStr(w.lastChecked)}, ${w.avgResponseTimeMs});`
      );
    }
    lines.push('');

    // Export workflows
    lines.push('-- Table: workflows');
    for (const wf of this.state.workflows) {
      lines.push(
        `INSERT INTO workflows (id, name, description, category, created_at, updated_at, run_count) VALUES (${sqlStr(wf.id)}, ${sqlStr(wf.name)}, ${sqlStr(wf.description)}, ${sqlStr(wf.category)}, ${sqlStr(wf.createdAt)}, ${sqlStr(wf.updatedAt)}, ${wf.runCount});`
      );
      for (const s of wf.steps) {
        lines.push(
          `INSERT INTO workflow_steps (id, workflow_id, step_order, action, label, selector, value, wait_duration_ms, scroll_delta_y, condition_variable, condition_operator, condition_value, repeat_count, target_variable, timeout_ms, optional) VALUES (${sqlStr(s.id)}, ${sqlStr(wf.id)}, ${s.order}, ${sqlStr(s.action)}, ${sqlStr(s.label)}, ${sqlStr(s.selector)}, ${sqlStr(s.value)}, ${s.waitDurationMs || 'NULL'}, ${s.scrollDeltaY || 'NULL'}, ${sqlStr(s.conditionVariable)}, ${sqlStr(s.conditionOperator)}, ${sqlStr(s.conditionValue)}, ${s.repeatCount || 'NULL'}, ${sqlStr(s.targetVariable)}, ${s.timeoutMs || 10000}, ${s.optional ? 1 : 0});`
        );
      }
    }

    return lines.join('\n');
  }

  public resetToDefaults() {
    localStorage.removeItem(STORAGE_KEY);
    this.state = this.loadFromStorage();
    this.persist();
  }
}

function sqlStr(val: string | null | undefined): string {
  if (val === undefined || val === null) return 'NULL';
  return `'${val.replace(/'/g, "''")}'`;
}

export const db = new SQLiteDatabaseStore();
