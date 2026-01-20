import type { Device } from '../devices/types.js';

/**
 * Default timeout for navigation and screenshot operations (30s per LOAD-04)
 */
export const DEFAULT_TIMEOUT = 30000;

/**
 * Options for launching the browser
 */
export interface BrowserManagerOptions {
  /** Run in headless mode (default: true) */
  headless?: boolean;
}

/**
 * Options for creating a browser context with device emulation
 */
export interface ContextOptions {
  /** Viewport dimensions */
  viewport: { width: number; height: number };
  /** Device pixel ratio */
  deviceScaleFactor: number;
  /** Custom user agent string */
  userAgent?: string;
  /** Emulate mobile device (affects viewport meta tag) */
  isMobile?: boolean;
  /** Emulate touch events */
  hasTouch?: boolean;
}

/**
 * Options for capturing a screenshot
 */
export interface CaptureOptions {
  url: string;
  device: Device;
  timeout: number;
  waitBuffer: number;
  /** Whether to scroll for lazy-loaded content (default: true) */
  scrollForLazy?: boolean;
  /** Max scroll iterations to prevent infinite scroll hangs (default: 10) */
  maxScrollIterations?: number;
  /** Hide common cookie consent banners before capture (default: true) */
  hideCookieBanners?: boolean;
}

/**
 * Result of a screenshot capture operation
 */
export interface ScreenshotResult {
  success: boolean;
  deviceName: string;
  buffer?: Buffer;
  error?: string;
}

/**
 * Options for parallel execution
 */
export interface ExecutionOptions {
  /** Max concurrent captures (default: 10) */
  concurrency?: number;
  /** Max retry attempts per device (default: 3) */
  maxRetries?: number;
  /** Delay between retries in ms (default: 500) */
  retryDelay?: number;
  /** Progress callback (completed, total, result) */
  onProgress?: (completed: number, total: number, result: ExecutionResult) => void;
}

/**
 * Extended result with retry information
 */
export interface ExecutionResult extends ScreenshotResult {
  /** Number of attempts made (1 = first attempt succeeded) */
  attempts: number;
}

/**
 * Aggregate results from parallel capture
 */
export interface CaptureAllResult {
  /** Individual results for each device */
  results: ExecutionResult[];
  /** Count of successful captures */
  successCount: number;
  /** Count of failed captures */
  failureCount: number;
  /** Total capture attempts (includes retries) */
  totalAttempts: number;
}
