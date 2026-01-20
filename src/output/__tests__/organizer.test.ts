import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { rm, readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import {
  generateTimestamp,
  generateFilename,
  createOutputDirectory,
  writeScreenshot,
  saveAllScreenshots,
} from '../organizer.js';
import type { ExecutionResult } from '../../engine/types.js';
import type { Device } from '../../devices/types.js';

// Test directory for file operations
const TEST_BASE_DIR = join(process.cwd(), '.test-output');

describe('generateTimestamp', () => {
  it('returns string in YYYY-MM-DD-HHmmss format', () => {
    const timestamp = generateTimestamp();
    // Format: 2026-01-20-143025
    expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}-\d{6}$/);
  });

  it('does not contain colons (Windows-safe)', () => {
    const timestamp = generateTimestamp();
    expect(timestamp).not.toContain(':');
  });

  it('does not contain T or Z from ISO format', () => {
    const timestamp = generateTimestamp();
    expect(timestamp).not.toContain('T');
    expect(timestamp).not.toContain('Z');
  });

  it('two calls close together produce same or incremented timestamp', () => {
    const first = generateTimestamp();
    const second = generateTimestamp();
    // Should be same or second >= first (lexicographic order works for this format)
    expect(second >= first).toBe(true);
  });
});

describe('generateFilename', () => {
  it('converts device name to lowercase with dimensions', () => {
    const filename = generateFilename('iPhone 14 Pro', 393, 852);
    expect(filename).toBe('iphone-14-pro-393x852.png');
  });

  it('handles special characters by replacing with hyphens', () => {
    const filename = generateFilename('MacBook Pro 16"', 1728, 1117);
    expect(filename).toBe('macbook-pro-16-1728x1117.png');
  });

  it('collapses multiple spaces to single hyphen', () => {
    const filename = generateFilename('Samsung  Galaxy   S23', 360, 780);
    expect(filename).toBe('samsung-galaxy-s23-360x780.png');
  });

  it('trims leading and trailing spaces', () => {
    const filename = generateFilename(' Test Device ', 100, 100);
    expect(filename).toBe('test-device-100x100.png');
  });

  it('preserves numbers in device name', () => {
    const filename = generateFilename('Pixel 8 Pro', 412, 915);
    expect(filename).toBe('pixel-8-pro-412x915.png');
  });

  it('returns .png extension always', () => {
    const filename = generateFilename('Any Device', 100, 200);
    expect(filename).toMatch(/\.png$/);
  });

  it('handles device names starting with numbers', () => {
    const filename = generateFilename('3G Phone Classic', 320, 480);
    expect(filename).toBe('3g-phone-classic-320x480.png');
  });

  it('removes leading/trailing hyphens from special char names', () => {
    const filename = generateFilename('***Special***', 100, 200);
    expect(filename).toBe('special-100x200.png');
  });
});

describe('createOutputDirectory', () => {
  beforeEach(async () => {
    // Clean test directory before each test
    await rm(TEST_BASE_DIR, { recursive: true, force: true });
  });

  afterEach(async () => {
    // Cleanup after tests
    await rm(TEST_BASE_DIR, { recursive: true, force: true });
  });

  it('creates timestamped folder in baseDir', async () => {
    const outputDir = await createOutputDirectory({
      baseDir: TEST_BASE_DIR,
      timestamp: '2026-01-20-120000',
    });

    expect(outputDir).toBe(join(TEST_BASE_DIR, '2026-01-20-120000'));
    const dirStat = await stat(outputDir);
    expect(dirStat.isDirectory()).toBe(true);
  });

  it('creates phones/, tablets/, pc-laptops/ subdirectories', async () => {
    const outputDir = await createOutputDirectory({
      baseDir: TEST_BASE_DIR,
      timestamp: 'test-subdirs',
    });

    const subdirs = await readdir(outputDir);
    expect(subdirs.sort()).toEqual(['pc-laptops', 'phones', 'tablets']);
  });

  it('returns the full output path', async () => {
    const outputDir = await createOutputDirectory({
      baseDir: TEST_BASE_DIR,
      timestamp: 'test-return',
    });

    expect(outputDir).toContain(TEST_BASE_DIR);
    expect(outputDir).toContain('test-return');
  });

  it('works with custom timestamp override', async () => {
    const customTimestamp = 'custom-timestamp-123';
    const outputDir = await createOutputDirectory({
      baseDir: TEST_BASE_DIR,
      timestamp: customTimestamp,
    });

    expect(outputDir).toContain(customTimestamp);
  });

  it('creates nested directories recursively', async () => {
    const nestedBase = join(TEST_BASE_DIR, 'level1', 'level2');
    const outputDir = await createOutputDirectory({
      baseDir: nestedBase,
      timestamp: 'nested-test',
    });

    expect(outputDir).toBe(join(nestedBase, 'nested-test'));
    const dirStat = await stat(outputDir);
    expect(dirStat.isDirectory()).toBe(true);
  });

  it('handles baseDir that does not exist yet', async () => {
    const nonExistentBase = join(TEST_BASE_DIR, 'does-not-exist');
    const outputDir = await createOutputDirectory({
      baseDir: nonExistentBase,
      timestamp: 'new-base',
    });

    const subdirs = await readdir(outputDir);
    expect(subdirs.length).toBe(3); // phones, tablets, pc-laptops
  });

  it('uses default baseDir when not specified', async () => {
    // This test requires special handling since default is ./screenshots
    const outputDir = await createOutputDirectory({
      timestamp: 'default-base-test',
    });

    expect(outputDir).toContain('screenshots');
    expect(outputDir).toContain('default-base-test');

    // Cleanup the default screenshots dir
    await rm(outputDir, { recursive: true, force: true });
  });
});

describe('writeScreenshot', () => {
  beforeEach(async () => {
    await rm(TEST_BASE_DIR, { recursive: true, force: true });
  });

  afterEach(async () => {
    await rm(TEST_BASE_DIR, { recursive: true, force: true });
  });

  it('writes buffer to correct path', async () => {
    const outputDir = await createOutputDirectory({
      baseDir: TEST_BASE_DIR,
      timestamp: 'write-test',
    });

    const filepath = await writeScreenshot({
      outputDir,
      category: 'phones',
      filename: 'test-device-100x200.png',
      buffer: Buffer.from('test content'),
    });

    expect(filepath).toBe(join(outputDir, 'phones', 'test-device-100x200.png'));
  });

  it('returns the written filepath', async () => {
    const outputDir = await createOutputDirectory({
      baseDir: TEST_BASE_DIR,
      timestamp: 'filepath-test',
    });

    const filepath = await writeScreenshot({
      outputDir,
      category: 'tablets',
      filename: 'ipad-pro-1024x1366.png',
      buffer: Buffer.from('png data'),
    });

    expect(typeof filepath).toBe('string');
    expect(filepath.endsWith('.png')).toBe(true);
  });

  it('file contents match input buffer', async () => {
    const outputDir = await createOutputDirectory({
      baseDir: TEST_BASE_DIR,
      timestamp: 'content-test',
    });

    const originalContent = Buffer.from('PNG test data here');
    const filepath = await writeScreenshot({
      outputDir,
      category: 'pc-laptops',
      filename: 'macbook-1440x900.png',
      buffer: originalContent,
    });

    const readContent = await readFile(filepath);
    expect(readContent.equals(originalContent)).toBe(true);
  });

  it('creates file with PNG magic bytes when given PNG data', async () => {
    const outputDir = await createOutputDirectory({
      baseDir: TEST_BASE_DIR,
      timestamp: 'png-test',
    });

    // PNG magic bytes: 0x89 0x50 0x4E 0x47 (or "\x89PNG")
    const pngMagic = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const filepath = await writeScreenshot({
      outputDir,
      category: 'phones',
      filename: 'real-png.png',
      buffer: pngMagic,
    });

    const readContent = await readFile(filepath);
    expect(readContent[0]).toBe(0x89);
    expect(readContent[1]).toBe(0x50); // P
    expect(readContent[2]).toBe(0x4e); // N
    expect(readContent[3]).toBe(0x47); // G
  });

  it('writes to different category directories correctly', async () => {
    const outputDir = await createOutputDirectory({
      baseDir: TEST_BASE_DIR,
      timestamp: 'category-test',
    });

    const phonePath = await writeScreenshot({
      outputDir,
      category: 'phones',
      filename: 'phone.png',
      buffer: Buffer.from('phone'),
    });

    const tabletPath = await writeScreenshot({
      outputDir,
      category: 'tablets',
      filename: 'tablet.png',
      buffer: Buffer.from('tablet'),
    });

    const pcPath = await writeScreenshot({
      outputDir,
      category: 'pc-laptops',
      filename: 'pc.png',
      buffer: Buffer.from('pc'),
    });

    expect(phonePath).toContain('phones');
    expect(tabletPath).toContain('tablets');
    expect(pcPath).toContain('pc-laptops');
  });
});
