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
