import type { Device, DeviceCategory } from '../devices/types.js';
import type { CLIOptions, ValidatedConfig } from './types.js';
import { getDevices, getDevicesByCategory } from '../devices/index.js';
import { defaultConfig } from '../config/defaults.js';

/**
 * Validate and parse URL string
 * @throws Error with helpful message if invalid
 */
export function validateUrl(urlString: string): URL {
  try {
    const url = new URL(urlString);
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error(
        `Invalid protocol: ${url.protocol}. URL must use http:// or https://`
      );
    }
    return url;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Invalid URL: "${urlString}"\nExample: http://localhost:3000 or https://example.com`
      );
    }
    throw error;
  }
}

/**
 * Validate concurrency value (1-50)
 * @throws Error if value outside valid range
 */
export function validateConcurrency(value: number | undefined): number {
  const concurrency = value ?? defaultConfig.concurrency;
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 50) {
    throw new Error(
      `Concurrency must be an integer between 1 and 50, got: ${value}`
    );
  }
  return concurrency;
}

/**
 * Validate wait buffer value (positive number)
 * @throws Error if value is negative or not a number
 */
export function validateWait(value: number | undefined): number {
  const wait = value ?? defaultConfig.waitBuffer;
  if (!Number.isFinite(wait) || wait < 0) {
    throw new Error(
      `Wait buffer must be a positive number in milliseconds, got: ${value}`
    );
  }
  return wait;
}

/**
 * Select devices based on filter flags
 * Returns union of all specified categories, or all devices if none specified
 */
export function selectDevices(options: CLIOptions): Device[] {
  const categories: DeviceCategory[] = [];

  if (options.phonesOnly) categories.push('phones');
  if (options.tabletsOnly) categories.push('tablets');
  if (options.desktopsOnly) categories.push('pc-laptops');

  // No filters = all devices
  if (categories.length === 0) {
    return getDevices();
  }

  // Union of specified categories
  const devices: Device[] = [];
  for (const category of categories) {
    devices.push(...getDevicesByCategory(category));
  }
  return devices;
}

/**
 * Resolve page paths from optional path argument and --pages option
 * Returns array of paths to capture (default: ['/'])
 */
export function resolvePages(
  pathArg: string | undefined,
  pagesOption: string[] | undefined
): string[] {
  // --pages takes precedence
  if (pagesOption && pagesOption.length > 0) {
    return pagesOption.map((p) => (p.startsWith('/') ? p : `/${p}`));
  }

  // Single path argument
  if (pathArg) {
    const path = pathArg.startsWith('/') ? pathArg : `/${pathArg}`;
    return [path];
  }

  // Default to root
  return ['/'];
}

/**
 * Build full URL from base URL and path
 */
export function buildFullUrl(baseUrl: URL, path: string): string {
  const url = new URL(baseUrl.href);
  url.pathname = path;
  return url.href;
}

/**
 * Validate all CLI inputs and return validated config
 * @throws Error with helpful message if any input is invalid
 */
export function validateConfig(
  urlArg: string,
  pathArg: string | undefined,
  options: CLIOptions
): ValidatedConfig {
  const baseUrl = validateUrl(urlArg);
  const pages = resolvePages(pathArg, options.pages);
  const concurrency = validateConcurrency(options.concurrency);
  const waitBuffer = validateWait(options.wait);

  // Determine device categories (null = all)
  const categories: DeviceCategory[] = [];
  if (options.phonesOnly) categories.push('phones');
  if (options.tabletsOnly) categories.push('tablets');
  if (options.desktopsOnly) categories.push('pc-laptops');

  return {
    baseUrl,
    pages,
    concurrency,
    waitBuffer,
    deviceCategories: categories.length > 0 ? categories : null,
    outputDir: options.output ?? defaultConfig.outputDir,
  };
}
