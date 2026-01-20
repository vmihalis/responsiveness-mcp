import type { OutputOptions, FileInfo } from './types.js';
import type { DeviceCategory } from '../devices/types.js';

// File organizer - placeholder for Phase 6
export async function organizeFiles(
  _options: OutputOptions
): Promise<string> {
  // Will create directory structure: phones/, tablets/, pc-laptops/
  return _options.baseDir;
}

export function generateFilename(
  deviceName: string,
  width: number,
  height: number
): string {
  // Will generate safe filename like device-name-1920x1080.png
  const safeName = deviceName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `${safeName}-${width}x${height}.png`;
}

export function getCategoryDir(category: DeviceCategory): string {
  return category;
}
