export type ThemeMode = 'dark' | 'light';

export type DeviceFamily = 'windows-desktop' | 'windows-laptop' | 'android-mobile' | 'android-tablet';

export interface FingerprintConfig {
  id: string;
  name: string;
  family: DeviceFamily;
  userAgent: string;
  browserName: string;
  browserVersion: string;
  osName: string;
  osVersion: string;
  platform: string;
  screenResolution: string; // e.g., "1920x1080"
  viewportWidth: number;
  viewportHeight: number;
  deviceScaleFactor: number;
  language: string;
  locale: string;
  timezone: string;
  colorScheme: 'dark' | 'light' | 'no-preference';
  touchEnabled: boolean;
  maxTouchPoints: number;
  canvasNoise: boolean;
  webglNoise: boolean;
  audioNoise: boolean;
  webRtcPolicy: 'default' | 'disable-non-proxied-udp' | 'disable';
  geolocationPermission: 'prompt' | 'granted' | 'denied';
  latitude?: number;
  longitude?: number;
  accuracy?: number;
}

export interface BrowserProfile {
  id: string;
  name: string;
  group: string;
  fingerprintId: string;
  proxyId?: string;
  status: 'idle' | 'running' | 'paused' | 'stopped';
  cookiesCount: number;
  localStorageCount: number;
  cacheSizeKb: number;
  historyCount: number;
  createdAt: string;
  lastActiveAt?: string;
  notes?: string;
  cookiesData: Record<string, string>;
  localStorageData: Record<string, string>;
}

export interface UserAgentRecord {
  id: string;
  userAgent: string;
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  engine: string;
  releaseDate: string;
  isValid: boolean;
  profileCount?: number;
}

export type ProxyProtocol = 'http' | 'https' | 'socks5';

export interface ProxyRecord {
  id: string;
  name: string;
  protocol: ProxyProtocol;
  host: string;
  port: number;
  username?: string;
  password?: string;
  group: string;
  country?: string;
  countryCode?: string;
  status: 'active' | 'untested' | 'failed' | 'timeout';
  latencyMs: number;
  lastChecked?: string;
  errorMessage?: string;
  assignedProfilesCount: number;
}

export interface NetworkInterfaceInfo {
  name: string;
  displayName: string;
  ipAddress: string;
  macAddress: string; // Actual MAC if allowed by OS, or masked hardware indicator
  type: 'ethernet' | 'wifi' | 'loopback' | 'vpn';
  status: 'connected' | 'disconnected';
  speedMbps: number;
  dnsServers: string[];
  gateway: string;
}

export type RpaActionType =
  | 'open_url'
  | 'click_element'
  | 'scroll_page'
  | 'wait_element'
  | 'wait_duration'
  | 'fill_input'
  | 'select_dropdown'
  | 'submit_form'
  | 'navigate_back'
  | 'navigate_forward'
  | 'take_screenshot'
  | 'extract_title'
  | 'extract_text'
  | 'save_result'
  | 'conditional'
  | 'repeat_action'
  | 'stop_workflow';

export interface RpaStep {
  id: string;
  order: number;
  action: RpaActionType;
  label: string;
  selector?: string;
  value?: string;
  waitDurationMs?: number;
  scrollDeltaY?: number;
  conditionVariable?: string;
  conditionOperator?: 'equals' | 'contains' | 'exists' | 'greater_than';
  conditionValue?: string;
  repeatCount?: number;
  targetVariable?: string;
  timeoutMs?: number;
  optional?: boolean;
}

export interface RpaWorkflow {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: RpaStep[];
  createdAt: string;
  updatedAt: string;
  lastRunAt?: string;
  lastRunStatus?: 'success' | 'failed' | 'running';
  runCount: number;
}

export interface TaskQueueItem {
  id: string;
  workflowId: string;
  workflowName: string;
  profileId: string;
  profileName: string;
  targetUrl: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  status: 'queued' | 'running' | 'completed' | 'failed' | 'paused';
  progressPercent: number;
  currentStepIndex: number;
  totalSteps: number;
  currentStepDescription?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
  extractedData?: Record<string, string>;
  screenshotDataUrl?: string;
}

export interface SearchWorkflowConfig {
  id: string;
  searchEngine: 'google' | 'bing' | 'duckduckgo' | 'searxng' | 'yahoo' | 'baidu';
  keywords: string[];
  targetDomain: string;
  targetPath?: string;
  maxPagesToInspect: number;
  referralSimulation: boolean;
  referralSourceUrl?: string;
  status: 'idle' | 'running' | 'completed';
}

export interface WebsiteRecord {
  id: string;
  domain: string;
  name: string;
  category: string;
  group: string;
  enabled: boolean;
  urlCount: number;
  specificProxyId?: string;
  defaultFingerprintFamily?: DeviceFamily;
  healthStatus: 'healthy' | 'degraded' | 'offline' | 'untested';
  lastChecked?: string;
  avgResponseTimeMs: number;
}

export interface UrlItem {
  id: string;
  websiteId: string;
  websiteDomain: string;
  url: string;
  priority: number;
  status: 'pending' | 'processed' | 'failed';
  lastVisited?: string;
  responseCode?: number;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  category: 'profile' | 'proxy' | 'rpa' | 'task' | 'security' | 'network' | 'system';
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  details?: string;
  profileId?: string;
  profileName?: string;
}

export interface AnalyticsMetric {
  totalWebsites: number;
  totalUrls: number;
  totalProfiles: number;
  activeSessions: number;
  completedTasks: number;
  failedTasks: number;
  averageResponseTimeMs: number;
  activeProxies: number;
  totalProxies: number;
  cpuUsagePercent: number;
  memoryUsageMb: number;
  workflowSuccessRate: number;
}

export interface AppSettings {
  maxConcurrentSessions: number;
  cpuLimitPercent: number;
  memoryLimitMb: number;
  requestTimeoutSeconds: number;
  defaultTimezone: string;
  defaultLocale: string;
  webrtcProtection: boolean;
  saveScreenshots: boolean;
  logRetentionDays: number;
  autoValidateProxiesIntervalMinutes: number;
  telemetryMode: 'authorized_audit_only';
  theme: ThemeMode;
}
