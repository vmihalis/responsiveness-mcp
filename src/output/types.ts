import type { DeviceCategory } from '../devices/types.js';

export interface OutputOptions {
  baseDir: string;
  timestamp: string;
}

export interface FileInfo {
  deviceName: string;
  category: DeviceCategory;
  filename: string;
  filepath: string;
}

export interface ReportData {
  url: string;
  capturedAt: string;
  duration: number;
  deviceCount: number;
  files: FileInfo[];
}
