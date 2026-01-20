import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { rm, readFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import {
  escapeHtml,
  bufferToDataUri,
  formatDuration,
  generateLightboxId,
  groupByCategory,
  getCategoryDisplayName,
  generateReport,
  prepareScreenshotsForReport,
} from '../reporter.js';
import type { ScreenshotForReport, ReportData } from '../types.js';
import type { DeviceCategory, Device } from '../../devices/types.js';
import type { ExecutionResult } from '../../engine/types.js';

// Test directory for file operations
const TEST_OUTPUT_DIR = join(process.cwd(), '.test-output-reporter');

// ============================================================================
// Helper Function Tests
// ============================================================================

describe('escapeHtml', () => {
  it('escapes < and > characters', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    );
  });

  it('escapes & character', () => {
    expect(escapeHtml('foo & bar')).toBe('foo &amp; bar');
  });

  it('escapes double quotes', () => {
    expect(escapeHtml('say "hello"')).toBe('say &quot;hello&quot;');
  });

  it('escapes single quotes', () => {
    expect(escapeHtml("it's working")).toBe('it&#039;s working');
  });

  it('handles strings without special characters unchanged', () => {
    const input = 'plain text with no special chars';
    expect(escapeHtml(input)).toBe(input);
  });

  it('handles empty string', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('handles URL with query params (& becomes &amp;)', () => {
    expect(escapeHtml('https://example.com?foo=1&bar=2')).toBe(
      'https://example.com?foo=1&amp;bar=2'
    );
  });

  it('escapes multiple special characters together', () => {
    expect(escapeHtml('<a href="url?a=1&b=2">link</a>')).toBe(
      '&lt;a href=&quot;url?a=1&amp;b=2&quot;&gt;link&lt;/a&gt;'
    );
  });
});

describe('bufferToDataUri', () => {
  it('converts Buffer to data:image/png;base64,... format', () => {
    const buffer = Buffer.from('test data');
    const result = bufferToDataUri(buffer);
    expect(result).toMatch(/^data:image\/png;base64,/);
  });

  it('output starts with "data:image/png;base64,"', () => {
    const buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]); // PNG magic bytes
    const result = bufferToDataUri(buffer);
    expect(result.startsWith('data:image/png;base64,')).toBe(true);
  });

  it('can decode back to original buffer', () => {
    const original = Buffer.from('original content here');
    const dataUri = bufferToDataUri(original);

    // Extract base64 part and decode
    const base64Part = dataUri.replace('data:image/png;base64,', '');
    const decoded = Buffer.from(base64Part, 'base64');

    expect(decoded.equals(original)).toBe(true);
  });

  it('handles empty buffer', () => {
    const buffer = Buffer.from([]);
    const result = bufferToDataUri(buffer);
    expect(result).toBe('data:image/png;base64,');
  });

  it('handles binary data correctly', () => {
    const binaryData = Buffer.from([0x00, 0xff, 0x80, 0x7f]);
    const result = bufferToDataUri(binaryData);
    const base64Part = result.replace('data:image/png;base64,', '');
    const decoded = Buffer.from(base64Part, 'base64');
    expect(decoded.equals(binaryData)).toBe(true);
  });
});

describe('formatDuration', () => {
  it('returns "Xs" for under 60 seconds', () => {
    expect(formatDuration(45000)).toBe('45s');
  });

  it('returns "Xm Ys" for 60+ seconds', () => {
    expect(formatDuration(123000)).toBe('2m 3s');
  });

  it('returns "1m 0s" for exactly 60 seconds', () => {
    expect(formatDuration(60000)).toBe('1m 0s');
  });

  it('rounds to nearest second', () => {
    expect(formatDuration(45499)).toBe('45s'); // Rounds down
    expect(formatDuration(45500)).toBe('46s'); // Rounds up
  });

  it('handles 0 milliseconds', () => {
    expect(formatDuration(0)).toBe('0s');
  });

  it('handles large durations', () => {
    expect(formatDuration(600000)).toBe('10m 0s'); // 10 minutes
    expect(formatDuration(3661000)).toBe('61m 1s'); // Over an hour
  });

  it('handles 1 second', () => {
    expect(formatDuration(1000)).toBe('1s');
  });

  it('handles 59 seconds', () => {
    expect(formatDuration(59000)).toBe('59s');
  });
});

describe('generateLightboxId', () => {
  it('generates valid HTML ID starting with "lb-"', () => {
    const id = generateLightboxId('iPhone 15 Pro', 393, 852);
    expect(id.startsWith('lb-')).toBe(true);
  });

  it('sanitizes special characters (spaces, punctuation)', () => {
    const id = generateLightboxId('MacBook Pro 16"', 1728, 1117);
    expect(id).not.toContain(' ');
    expect(id).not.toContain('"');
  });

  it('includes dimensions in format WxH', () => {
    const id = generateLightboxId('Test Device', 393, 852);
    expect(id).toContain('393x852');
  });

  it('produces correct format for iPhone 15 Pro', () => {
    const id = generateLightboxId('iPhone 15 Pro', 393, 852);
    expect(id).toBe('lb-iphone-15-pro-393x852');
  });

  it('converts to lowercase', () => {
    const id = generateLightboxId('UPPERCASE DEVICE', 100, 200);
    expect(id).toBe('lb-uppercase-device-100x200');
  });

  it('handles multiple consecutive special characters', () => {
    const id = generateLightboxId('Device   with...spaces', 100, 200);
    expect(id).toBe('lb-device-with-spaces-100x200');
  });

  it('handles device name starting with special char', () => {
    const id = generateLightboxId('***Special Phone', 100, 200);
    expect(id).toBe('lb-special-phone-100x200');
  });
});

describe('groupByCategory', () => {
  it('groups empty array -> empty Map', () => {
    const result = groupByCategory([]);
    expect(result.size).toBe(0);
  });

  it('groups single category correctly', () => {
    const screenshots: ScreenshotForReport[] = [
      { deviceName: 'Phone 1', category: 'phones', width: 100, height: 200, dataUri: 'data:...' },
      { deviceName: 'Phone 2', category: 'phones', width: 100, height: 200, dataUri: 'data:...' },
    ];
    const result = groupByCategory(screenshots);

    expect(result.size).toBe(1);
    expect(result.get('phones')?.length).toBe(2);
  });

  it('groups multiple categories correctly', () => {
    const screenshots: ScreenshotForReport[] = [
      { deviceName: 'Phone', category: 'phones', width: 100, height: 200, dataUri: 'data:...' },
      { deviceName: 'Tablet', category: 'tablets', width: 768, height: 1024, dataUri: 'data:...' },
      { deviceName: 'PC', category: 'pc-laptops', width: 1920, height: 1080, dataUri: 'data:...' },
    ];
    const result = groupByCategory(screenshots);

    expect(result.size).toBe(3);
    expect(result.get('phones')?.length).toBe(1);
    expect(result.get('tablets')?.length).toBe(1);
    expect(result.get('pc-laptops')?.length).toBe(1);
  });

  it('preserves order within category', () => {
    const screenshots: ScreenshotForReport[] = [
      { deviceName: 'First', category: 'phones', width: 100, height: 200, dataUri: 'data:...' },
      { deviceName: 'Second', category: 'phones', width: 100, height: 200, dataUri: 'data:...' },
      { deviceName: 'Third', category: 'phones', width: 100, height: 200, dataUri: 'data:...' },
    ];
    const result = groupByCategory(screenshots);
    const phones = result.get('phones');

    expect(phones?.[0]?.deviceName).toBe('First');
    expect(phones?.[1]?.deviceName).toBe('Second');
    expect(phones?.[2]?.deviceName).toBe('Third');
  });
});

describe('getCategoryDisplayName', () => {
  it("'phones' -> 'Phones'", () => {
    expect(getCategoryDisplayName('phones')).toBe('Phones');
  });

  it("'tablets' -> 'Tablets'", () => {
    expect(getCategoryDisplayName('tablets')).toBe('Tablets');
  });

  it("'pc-laptops' -> 'Desktop & Laptops'", () => {
    expect(getCategoryDisplayName('pc-laptops')).toBe('Desktop & Laptops');
  });
});

// ============================================================================
// HTML Template Tests (via generateReport output)
// ============================================================================

// Test fixtures for HTML template tests
const mockScreenshot: ScreenshotForReport = {
  deviceName: 'iPhone 15 Pro',
  category: 'phones',
  width: 393,
  height: 852,
  dataUri: 'data:image/png;base64,iVBORw0KGgo=',
};

const mockReportData: ReportData = {
  url: 'https://example.com',
  capturedAt: '2026-01-20 12:00:00',
  duration: 45000,
  deviceCount: 3,
  files: [],
};

describe('HTML Template Output', () => {
  beforeEach(async () => {
    await mkdir(TEST_OUTPUT_DIR, { recursive: true });
  });

  afterEach(async () => {
    await rm(TEST_OUTPUT_DIR, { recursive: true, force: true });
  });

  describe('header rendering', () => {
    it('contains h1 with "Responsive Screenshots"', async () => {
      await generateReport(mockReportData, [], TEST_OUTPUT_DIR);
      const html = await readFile(join(TEST_OUTPUT_DIR, 'report.html'), 'utf-8');
      expect(html).toContain('<h1>Responsive Screenshots</h1>');
    });

    it('contains escaped URL', async () => {
      const dataWithSpecialUrl: ReportData = {
        ...mockReportData,
        url: 'https://example.com?foo=1&bar=2',
      };
      await generateReport(dataWithSpecialUrl, [], TEST_OUTPUT_DIR);
      const html = await readFile(join(TEST_OUTPUT_DIR, 'report.html'), 'utf-8');
      expect(html).toContain('https://example.com?foo=1&amp;bar=2');
    });

    it('contains formatted duration', async () => {
      await generateReport(mockReportData, [], TEST_OUTPUT_DIR);
      const html = await readFile(join(TEST_OUTPUT_DIR, 'report.html'), 'utf-8');
      expect(html).toContain('45s'); // formatDuration(45000)
    });

    it('contains device count', async () => {
      await generateReport(mockReportData, [], TEST_OUTPUT_DIR);
      const html = await readFile(join(TEST_OUTPUT_DIR, 'report.html'), 'utf-8');
      expect(html).toContain('<strong>Devices:</strong> 3');
    });
  });

  describe('thumbnail card rendering', () => {
    it('contains link with href to lightbox ID', async () => {
      await generateReport(mockReportData, [mockScreenshot], TEST_OUTPUT_DIR);
      const html = await readFile(join(TEST_OUTPUT_DIR, 'report.html'), 'utf-8');
      expect(html).toContain('href="#lb-iphone-15-pro-393x852"');
    });

    it('contains img with dataUri src', async () => {
      await generateReport(mockReportData, [mockScreenshot], TEST_OUTPUT_DIR);
      const html = await readFile(join(TEST_OUTPUT_DIR, 'report.html'), 'utf-8');
      expect(html).toContain('src="data:image/png;base64,iVBORw0KGgo="');
    });

    it('contains device name', async () => {
      await generateReport(mockReportData, [mockScreenshot], TEST_OUTPUT_DIR);
      const html = await readFile(join(TEST_OUTPUT_DIR, 'report.html'), 'utf-8');
      expect(html).toContain('<div class="device-name">iPhone 15 Pro</div>');
    });

    it('contains dimensions text', async () => {
      await generateReport(mockReportData, [mockScreenshot], TEST_OUTPUT_DIR);
      const html = await readFile(join(TEST_OUTPUT_DIR, 'report.html'), 'utf-8');
      expect(html).toContain('<div class="dimensions">393 x 852</div>');
    });
  });

  describe('category section rendering', () => {
    it('contains h2 with category display name', async () => {
      await generateReport(mockReportData, [mockScreenshot], TEST_OUTPUT_DIR);
      const html = await readFile(join(TEST_OUTPUT_DIR, 'report.html'), 'utf-8');
      expect(html).toContain('<h2>Phones</h2>');
    });

    it('contains thumbnail-grid class div', async () => {
      await generateReport(mockReportData, [mockScreenshot], TEST_OUTPUT_DIR);
      const html = await readFile(join(TEST_OUTPUT_DIR, 'report.html'), 'utf-8');
      expect(html).toContain('class="thumbnail-grid"');
    });

    it('contains all thumbnail cards for category', async () => {
      const multiplePhones: ScreenshotForReport[] = [
        { deviceName: 'Phone A', category: 'phones', width: 100, height: 200, dataUri: 'data:a' },
        { deviceName: 'Phone B', category: 'phones', width: 100, height: 200, dataUri: 'data:b' },
      ];
      await generateReport(mockReportData, multiplePhones, TEST_OUTPUT_DIR);
      const html = await readFile(join(TEST_OUTPUT_DIR, 'report.html'), 'utf-8');
      expect(html).toContain('Phone A');
      expect(html).toContain('Phone B');
    });

    it('empty array produces no thumbnail cards but valid HTML', async () => {
      await generateReport(mockReportData, [], TEST_OUTPUT_DIR);
      const html = await readFile(join(TEST_OUTPUT_DIR, 'report.html'), 'utf-8');
      expect(html).not.toContain('class="thumbnail-card"');
      expect(html).toContain('<!DOCTYPE html>');
    });
  });

  describe('lightbox rendering', () => {
    it('contains correct ID attribute', async () => {
      await generateReport(mockReportData, [mockScreenshot], TEST_OUTPUT_DIR);
      const html = await readFile(join(TEST_OUTPUT_DIR, 'report.html'), 'utf-8');
      expect(html).toContain('id="lb-iphone-15-pro-393x852"');
    });

    it('contains close link (href="#_")', async () => {
      await generateReport(mockReportData, [mockScreenshot], TEST_OUTPUT_DIR);
      const html = await readFile(join(TEST_OUTPUT_DIR, 'report.html'), 'utf-8');
      expect(html).toContain('href="#_"');
      expect(html).toContain('class="lightbox-close"');
    });

    it('contains full-size image with dataUri', async () => {
      await generateReport(mockReportData, [mockScreenshot], TEST_OUTPUT_DIR);
      const html = await readFile(join(TEST_OUTPUT_DIR, 'report.html'), 'utf-8');
      // Full-size image in lightbox
      expect(html).toContain('alt="iPhone 15 Pro - Full Size"');
    });

    it('contains device info text in lightbox', async () => {
      await generateReport(mockReportData, [mockScreenshot], TEST_OUTPUT_DIR);
      const html = await readFile(join(TEST_OUTPUT_DIR, 'report.html'), 'utf-8');
      expect(html).toContain('class="lightbox-info"');
      expect(html).toContain('<strong>iPhone 15 Pro</strong>');
      expect(html).toContain('393 x 852');
    });
  });

  describe('buildReportHtml (full HTML)', () => {
    it('contains DOCTYPE html', async () => {
      await generateReport(mockReportData, [], TEST_OUTPUT_DIR);
      const html = await readFile(join(TEST_OUTPUT_DIR, 'report.html'), 'utf-8');
      expect(html).toMatch(/^<!DOCTYPE html>/);
    });

    it('contains charset UTF-8 meta tag', async () => {
      await generateReport(mockReportData, [], TEST_OUTPUT_DIR);
      const html = await readFile(join(TEST_OUTPUT_DIR, 'report.html'), 'utf-8');
      expect(html).toContain('<meta charset="UTF-8">');
    });

    it('contains style tag with CSS', async () => {
      await generateReport(mockReportData, [], TEST_OUTPUT_DIR);
      const html = await readFile(join(TEST_OUTPUT_DIR, 'report.html'), 'utf-8');
      expect(html).toContain('<style>');
      expect(html).toContain('.thumbnail-grid');
      expect(html).toContain('.lightbox');
    });

    it('contains all three categories when present', async () => {
      const allCategories: ScreenshotForReport[] = [
        { deviceName: 'Phone', category: 'phones', width: 100, height: 200, dataUri: 'data:phone' },
        { deviceName: 'Tablet', category: 'tablets', width: 768, height: 1024, dataUri: 'data:tablet' },
        { deviceName: 'PC', category: 'pc-laptops', width: 1920, height: 1080, dataUri: 'data:pc' },
      ];
      await generateReport(mockReportData, allCategories, TEST_OUTPUT_DIR);
      const html = await readFile(join(TEST_OUTPUT_DIR, 'report.html'), 'utf-8');
      expect(html).toContain('<h2>Phones</h2>');
      expect(html).toContain('<h2>Tablets</h2>');
      // Note: Category display name uses literal & as it's a static trusted string
      expect(html).toContain('<h2>Desktop & Laptops</h2>');
    });

    it('contains lightbox elements for all screenshots', async () => {
      const twoDevices: ScreenshotForReport[] = [
        { deviceName: 'Device A', category: 'phones', width: 100, height: 200, dataUri: 'data:a' },
        { deviceName: 'Device B', category: 'tablets', width: 768, height: 1024, dataUri: 'data:b' },
      ];
      await generateReport(mockReportData, twoDevices, TEST_OUTPUT_DIR);
      const html = await readFile(join(TEST_OUTPUT_DIR, 'report.html'), 'utf-8');
      expect(html).toContain('id="lb-device-a-100x200"');
      expect(html).toContain('id="lb-device-b-768x1024"');
    });

    it('HTML is self-contained (no external URLs in src/href for assets)', async () => {
      await generateReport(mockReportData, [mockScreenshot], TEST_OUTPUT_DIR);
      const html = await readFile(join(TEST_OUTPUT_DIR, 'report.html'), 'utf-8');
      // Should not have external http/https sources for images/stylesheets
      // Images should use data: URIs
      const srcMatches = html.match(/src="([^"]+)"/g) || [];
      for (const match of srcMatches) {
        expect(match).toMatch(/src="data:/);
      }
      // No external stylesheet links
      expect(html).not.toContain('href="http');
      expect(html).not.toContain("href='http");
    });
  });
});
