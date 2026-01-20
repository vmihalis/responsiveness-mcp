import type { DeviceCategory } from '../devices/types.js';

/**
 * Parsed CLI options from Commander
 */
export interface CLIOptions {
  /** Multiple page paths to capture */
  pages?: string[];
  /** Parallel capture limit (default: 10) */
  concurrency?: number;
  /** Wait buffer after page load in ms (default: 500) */
  wait?: number;
  /** Only capture phone devices */
  phonesOnly?: boolean;
  /** Only capture tablet devices */
  tabletsOnly?: boolean;
  /** Only capture desktop devices */
  desktopsOnly?: boolean;
  /** Output directory override */
  output?: string;
}

/**
 * Validated CLI configuration ready for execution
 */
export interface ValidatedConfig {
  /** Parsed base URL */
  baseUrl: URL;
  /** Array of page paths to capture */
  pages: string[];
  /** Validated concurrency value (1-50) */
  concurrency: number;
  /** Wait buffer in milliseconds */
  waitBuffer: number;
  /** Device categories to capture (null = all devices) */
  deviceCategories: DeviceCategory[] | null;
  /** Output directory path */
  outputDir: string;
}
