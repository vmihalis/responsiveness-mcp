import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { OutputOptions, FileInfo, CreateOutputOptions, SaveResult, SaveAllResult } from './types.js';
import type { DeviceCategory, Device } from '../devices/types.js';
import type { ExecutionResult } from '../engine/types.js';

/**
 * Generate filesystem-safe timestamp string
 * Format: YYYY-MM-DD-HHmmss (no colons for Windows compatibility)
 */
export function generateTimestamp(): string {
  return new Date()
    .toISOString()
    .replace(/T/, '-')       // Replace T with hyphen
    .replace(/:/g, '')       // Remove colons (Windows-invalid)
    .replace(/\..+/, '');    // Remove milliseconds and Z
  // Result: "2026-01-20-143025"
}

/**
 * Create timestamped output directory with category subdirectories
 */
export async function createOutputDirectory(
  options: CreateOutputOptions = {}
): Promise<string> {
  const baseDir = options.baseDir ?? './screenshots';
  const timestamp = options.timestamp ?? generateTimestamp();

  const outputDir = join(baseDir, timestamp);

  // Create with all category subdirectories in parallel
  const categories: DeviceCategory[] = ['phones', 'tablets', 'pc-laptops'];
  await Promise.all(
    categories.map((cat) =>
      mkdir(join(outputDir, cat), { recursive: true })
    )
  );

  return outputDir;
}

/**
 * Write a screenshot buffer to a file
 */
export async function writeScreenshot(options: {
  outputDir: string;
  category: DeviceCategory;
  filename: string;
  buffer: Buffer;
}): Promise<string> {
  const { outputDir, category, filename, buffer } = options;
  const filepath = join(outputDir, category, filename);

  await writeFile(filepath, buffer);

  return filepath;
}

/**
 * Generate safe filename from device info
 * Format: device-name-widthxheight.png
 */
export function generateFilename(
  deviceName: string,
  width: number,
  height: number
): string {
  // Lowercase, replace non-alphanumeric with hyphen, collapse multiple hyphens
  const safeName = deviceName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, ''); // Trim leading/trailing hyphens

  return `${safeName}-${width}x${height}.png`;
}

/**
 * Save all successful screenshots from execution results
 */
export async function saveAllScreenshots(
  results: ExecutionResult[],
  devices: Device[],
  outputDir: string
): Promise<SaveAllResult> {
  // Build device lookup map by name
  const deviceMap = new Map<string, Device>();
  for (const device of devices) {
    deviceMap.set(device.name, device);
  }

  const saveResults: SaveResult[] = [];
  let savedCount = 0;
  let failedCount = 0;

  // Process each result
  for (const result of results) {
    const device = deviceMap.get(result.deviceName);

    // Skip if no buffer or no matching device
    if (!result.success || !result.buffer) {
      saveResults.push({
        success: false,
        deviceName: result.deviceName,
        error: result.error ?? 'No buffer available',
      });
      failedCount++;
      continue;
    }

    if (!device) {
      saveResults.push({
        success: false,
        deviceName: result.deviceName,
        error: `Device not found in device list: ${result.deviceName}`,
      });
      failedCount++;
      continue;
    }

    // Generate filename and save
    const filename = generateFilename(device.name, device.width, device.height);

    try {
      const filepath = await writeScreenshot({
        outputDir,
        category: device.category,
        filename,
        buffer: result.buffer,
      });

      saveResults.push({
        success: true,
        deviceName: result.deviceName,
        filepath,
      });
      savedCount++;
    } catch (error) {
      saveResults.push({
        success: false,
        deviceName: result.deviceName,
        error: error instanceof Error ? error.message : String(error),
      });
      failedCount++;
    }
  }

  return {
    results: saveResults,
    outputDir,
    savedCount,
    failedCount,
  };
}

// Legacy placeholder (kept for backwards compatibility)
export async function organizeFiles(
  _options: OutputOptions
): Promise<string> {
  return _options.baseDir;
}

export function getCategoryDir(category: DeviceCategory): string {
  return category;
}
