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
  generateModalTemplate,
  renderThumbnailCard,
} from '../reporter.js';
import type { ScreenshotForReport, ReportData } from '../types.js';
import type { DeviceCategory, Device } from '../../devices/types.js';
import type { ExecutionResult } from '../../engine/types.js';

// Test directory for file operations
const TEST_OUTPUT_DIR = join(process.cwd(), '.test-output-reporter');

/**
 * Create a minimal valid PNG buffer for testing.
 * PNG structure: signature (8) + IHDR chunk (25 bytes = 4 len + 4 type + 13 data + 4 crc)
 */
function createTestPngBuffer(width: number, height: number): Buffer {
  // PNG signature (8 bytes)
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  // IHDR chunk: length (13) + "IHDR" + width + height + bit depth + color type + compression + filter + interlace
  const ihdrData = Buffer.alloc(25);
  ihdrData.writeUInt32BE(13, 0);  // chunk length
  ihdrData.write('IHDR', 4);       // chunk type
  ihdrData.writeUInt32BE(width, 8);
  ihdrData.writeUInt32BE(height, 12);
  ihdrData.writeUInt8(8, 16);     // bit depth
  ihdrData.writeUInt8(2, 17);     // color type (RGB)
  ihdrData.writeUInt8(0, 18);     // compression
  ihdrData.writeUInt8(0, 19);     // filter
  ihdrData.writeUInt8(0, 20);     // interlace
  // CRC (can be invalid for dimension extraction tests)
  ihdrData.writeUInt32BE(0, 21);
  return Buffer.concat([signature, ihdrData]);
}

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
        // Allow about:blank (used for clearing iframe) and data: URIs
        expect(match).toMatch(/src="(data:|about:blank)/);
      }
      // No external stylesheet links (link[href] for CSS)
      // Note: The fallback-link in modal is intentionally an external URL for "Open in New Tab"
      // This tests that there are no external <link> stylesheet references
      expect(html).not.toContain('<link href="http');
      expect(html).not.toContain("<link href='http");
    });
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

// Test helpers
function createTestResult(
  name: string,
  success: boolean,
  buffer?: Buffer
): ExecutionResult {
  return {
    success,
    deviceName: name,
    buffer,
    attempts: 1,
  };
}

function createTestDevice(
  name: string,
  category: DeviceCategory,
  width = 393,
  height = 852
): Device {
  return {
    name,
    width,
    height,
    deviceScaleFactor: 3,
    category,
  };
}

describe('prepareScreenshotsForReport', () => {
  it('converts ExecutionResult[] to ScreenshotForReport[]', () => {
    const devices: Device[] = [
      createTestDevice('iPhone 15 Pro', 'phones', 393, 852),
    ];
    const pngBuffer = createTestPngBuffer(393, 852);
    const results: ExecutionResult[] = [
      createTestResult('iPhone 15 Pro', true, pngBuffer),
    ];

    const screenshots = prepareScreenshotsForReport(results, devices);

    expect(screenshots.length).toBe(1);
    expect(screenshots[0]?.deviceName).toBe('iPhone 15 Pro');
    expect(screenshots[0]?.category).toBe('phones');
    expect(screenshots[0]?.width).toBe(393);
    expect(screenshots[0]?.height).toBe(852);
    expect(screenshots[0]?.dataUri).toMatch(/^data:image\/png;base64,/);
  });

  it('skips failed results (success: false)', () => {
    const devices: Device[] = [
      createTestDevice('Device A', 'phones'),
      createTestDevice('Device B', 'phones'),
    ];
    const pngBuffer = createTestPngBuffer(393, 852);
    const results: ExecutionResult[] = [
      createTestResult('Device A', true, pngBuffer),
      createTestResult('Device B', false, undefined),
    ];

    const screenshots = prepareScreenshotsForReport(results, devices);

    expect(screenshots.length).toBe(1);
    expect(screenshots[0]?.deviceName).toBe('Device A');
  });

  it('skips results without buffer', () => {
    const devices: Device[] = [createTestDevice('Device', 'phones')];
    const results: ExecutionResult[] = [
      {
        success: true,
        deviceName: 'Device',
        buffer: undefined, // No buffer
        attempts: 1,
      },
    ];

    const screenshots = prepareScreenshotsForReport(results, devices);

    expect(screenshots.length).toBe(0);
  });

  it('skips results with unknown device names', () => {
    const devices: Device[] = [createTestDevice('Known Device', 'phones')];
    const pngBuffer = createTestPngBuffer(393, 852);
    const results: ExecutionResult[] = [
      createTestResult('Known Device', true, pngBuffer),
      createTestResult('Unknown Device', true, pngBuffer),
    ];

    const screenshots = prepareScreenshotsForReport(results, devices);

    expect(screenshots.length).toBe(1);
    expect(screenshots[0]?.deviceName).toBe('Known Device');
  });

  it('returns correct deviceName, category, width, height, dataUri for each', () => {
    const devices: Device[] = [
      { name: 'iPad Pro', width: 1024, height: 1366, deviceScaleFactor: 2, category: 'tablets' },
      { name: 'MacBook Pro', width: 1728, height: 1117, deviceScaleFactor: 2, category: 'pc-laptops' },
    ];
    const ipadPng = createTestPngBuffer(1024, 1366);
    const macbookPng = createTestPngBuffer(1728, 1117);
    const results: ExecutionResult[] = [
      createTestResult('iPad Pro', true, ipadPng),
      createTestResult('MacBook Pro', true, macbookPng),
    ];

    const screenshots = prepareScreenshotsForReport(results, devices);

    expect(screenshots.length).toBe(2);

    const ipad = screenshots.find((s) => s.deviceName === 'iPad Pro');
    expect(ipad).toBeDefined();
    expect(ipad?.category).toBe('tablets');
    expect(ipad?.width).toBe(1024);
    expect(ipad?.height).toBe(1366);
    expect(ipad?.dataUri).toContain('base64');

    const macbook = screenshots.find((s) => s.deviceName === 'MacBook Pro');
    expect(macbook).toBeDefined();
    expect(macbook?.category).toBe('pc-laptops');
    expect(macbook?.width).toBe(1728);
    expect(macbook?.height).toBe(1117);
    expect(macbook?.dataUri).toContain('base64');
  });

  it('handles empty arrays', () => {
    const screenshots = prepareScreenshotsForReport([], []);
    expect(screenshots.length).toBe(0);
  });

  it('handles all failed results', () => {
    const devices: Device[] = [
      createTestDevice('A', 'phones'),
      createTestDevice('B', 'tablets'),
    ];
    const results: ExecutionResult[] = [
      createTestResult('A', false, undefined),
      createTestResult('B', false, undefined),
    ];

    const screenshots = prepareScreenshotsForReport(results, devices);

    expect(screenshots.length).toBe(0);
  });
});

describe('generateReport', () => {
  beforeEach(async () => {
    await mkdir(TEST_OUTPUT_DIR, { recursive: true });
  });

  afterEach(async () => {
    await rm(TEST_OUTPUT_DIR, { recursive: true, force: true });
  });

  it('creates report.html file in output directory', async () => {
    const reportPath = await generateReport(mockReportData, [], TEST_OUTPUT_DIR);

    expect(reportPath).toBe(join(TEST_OUTPUT_DIR, 'report.html'));

    // Verify file exists by reading it
    const content = await readFile(reportPath, 'utf-8');
    expect(content).toBeDefined();
    expect(content.length).toBeGreaterThan(0);
  });

  it('returns correct file path', async () => {
    const reportPath = await generateReport(mockReportData, [], TEST_OUTPUT_DIR);

    expect(reportPath).toContain(TEST_OUTPUT_DIR);
    expect(reportPath).toContain('report.html');
    expect(reportPath).toBe(join(TEST_OUTPUT_DIR, 'report.html'));
  });

  it('file contains valid HTML (DOCTYPE, html tags)', async () => {
    const reportPath = await generateReport(mockReportData, [], TEST_OUTPUT_DIR);
    const html = await readFile(reportPath, 'utf-8');

    expect(html).toMatch(/^<!DOCTYPE html>/);
    expect(html).toContain('<html');
    expect(html).toContain('</html>');
    expect(html).toContain('<head>');
    expect(html).toContain('</head>');
    expect(html).toContain('<body>');
    expect(html).toContain('</body>');
  });

  it('file is non-empty', async () => {
    const reportPath = await generateReport(mockReportData, [], TEST_OUTPUT_DIR);
    const html = await readFile(reportPath, 'utf-8');

    expect(html.length).toBeGreaterThan(1000); // HTML with CSS should be substantial
  });

  it('works with empty screenshots array (produces valid HTML)', async () => {
    const reportPath = await generateReport(mockReportData, [], TEST_OUTPUT_DIR);
    const html = await readFile(reportPath, 'utf-8');

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<h1>Responsive Screenshots</h1>');
    // No thumbnail cards when empty
    expect(html).not.toContain('class="thumbnail-card"');
    // But still has header and structure
    expect(html).toContain('class="report-header"');
  });

  it('includes screenshots when provided', async () => {
    const screenshots: ScreenshotForReport[] = [
      {
        deviceName: 'Test Phone',
        category: 'phones',
        width: 375,
        height: 812,
        dataUri: 'data:image/png;base64,ABC123',
      },
    ];

    const reportPath = await generateReport(mockReportData, screenshots, TEST_OUTPUT_DIR);
    const html = await readFile(reportPath, 'utf-8');

    expect(html).toContain('Test Phone');
    expect(html).toContain('375 x 812');
    expect(html).toContain('data:image/png;base64,ABC123');
    expect(html).toContain('class="thumbnail-card"');
  });

  it('handles multiple screenshots across categories', async () => {
    const screenshots: ScreenshotForReport[] = [
      { deviceName: 'Phone', category: 'phones', width: 375, height: 812, dataUri: 'data:phone' },
      { deviceName: 'Tablet', category: 'tablets', width: 768, height: 1024, dataUri: 'data:tablet' },
      { deviceName: 'Desktop', category: 'pc-laptops', width: 1920, height: 1080, dataUri: 'data:desktop' },
    ];

    const reportPath = await generateReport(mockReportData, screenshots, TEST_OUTPUT_DIR);
    const html = await readFile(reportPath, 'utf-8');

    // All devices present
    expect(html).toContain('Phone');
    expect(html).toContain('Tablet');
    expect(html).toContain('Desktop');

    // All categories have sections
    expect(html).toContain('<h2>Phones</h2>');
    expect(html).toContain('<h2>Tablets</h2>');
    expect(html).toContain('<h2>Desktop & Laptops</h2>');

    // All lightboxes present
    expect(html).toContain('id="lb-phone-375x812"');
    expect(html).toContain('id="lb-tablet-768x1024"');
    expect(html).toContain('id="lb-desktop-1920x1080"');
  });
});

// ============================================================================
// Modal Template Tests
// ============================================================================

describe('generateModalTemplate', () => {
  it('returns HTML with dialog element', () => {
    const html = generateModalTemplate('https://example.com');
    expect(html).toContain('<dialog');
    expect(html).toContain('id="preview-modal"');
  });

  it('includes close button with accessibility attributes', () => {
    const html = generateModalTemplate('https://example.com');
    expect(html).toContain('aria-label="Close preview"');
    expect(html).toContain('autofocus');
  });

  it('includes loading state with spinner', () => {
    const html = generateModalTemplate('https://example.com');
    expect(html).toContain('id="loading-state"');
    expect(html).toContain('class="spinner"');
    expect(html).toContain('Loading preview');
  });

  it('includes iframe with security sandbox', () => {
    const html = generateModalTemplate('https://example.com');
    expect(html).toContain('<iframe');
    expect(html).toContain('id="preview-iframe"');
    expect(html).toContain('sandbox="allow-scripts allow-forms allow-same-origin"');
  });

  it('includes error state with fallback link', () => {
    const html = generateModalTemplate('https://example.com');
    expect(html).toContain('id="error-state"');
    expect(html).toContain('id="fallback-link"');
    expect(html).toContain('Open in New Tab');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('includes openPreview JavaScript function', () => {
    const html = generateModalTemplate('https://example.com');
    expect(html).toContain('window.openPreview = openPreview');
    expect(html).toContain('function openPreview(url, width, height, deviceName)');
  });

  it('includes iframe timeout detection', () => {
    const html = generateModalTemplate('https://example.com');
    expect(html).toContain('currentTimeoutId');
    expect(html).toContain('setTimeout');
  });

  it('includes backdrop click handler', () => {
    const html = generateModalTemplate('https://example.com');
    expect(html).toContain('e.target === modal');
  });

  it('includes focus restoration on close', () => {
    const html = generateModalTemplate('https://example.com');
    expect(html).toContain('previouslyFocusedElement');
    expect(html).toContain('.focus()');
  });

  it('escapes URL in fallback link', () => {
    const html = generateModalTemplate('https://example.com?a=1&b=2');
    expect(html).toContain('href="https://example.com?a=1&amp;b=2"');
  });

  it('escapes URL in iframe title', () => {
    const html = generateModalTemplate('https://example.com?a=1&b=2');
    expect(html).toContain('title="Interactive preview of https://example.com?a=1&amp;b=2"');
  });
});

describe('renderThumbnailCard with preview', () => {
  const mockScreenshotForPreview: ScreenshotForReport = {
    deviceName: 'iPhone 14',
    category: 'phones',
    width: 390,
    height: 844,
    dataUri: 'data:image/png;base64,test',
  };

  it('includes preview button with onclick handler', () => {
    const html = renderThumbnailCard(mockScreenshotForPreview, 'https://example.com');
    expect(html).toContain('class="preview-btn"');
    expect(html).toContain('onclick="openPreview(');
  });

  it('preview button has correct dimensions in onclick', () => {
    const html = renderThumbnailCard(mockScreenshotForPreview, 'https://example.com');
    expect(html).toContain("openPreview('https://example.com', 390, 844, 'iPhone 14')");
  });

  it('preview button has accessibility label', () => {
    const html = renderThumbnailCard(mockScreenshotForPreview, 'https://example.com');
    expect(html).toContain('aria-label="Preview iPhone 14 at 390x844"');
  });

  it('escapes URL in onclick handler', () => {
    const html = renderThumbnailCard(mockScreenshotForPreview, 'https://example.com?a=1&b=2');
    expect(html).toContain('https://example.com?a=1&amp;b=2');
  });

  it('preserves lightbox anchor for screenshot viewing', () => {
    const html = renderThumbnailCard(mockScreenshotForPreview, 'https://example.com');
    expect(html).toContain('href="#lb-');
    expect(html).toContain('class="thumbnail-link"');
  });

  it('escapes device name with special characters', () => {
    const screenshotWithSpecialName: ScreenshotForReport = {
      ...mockScreenshotForPreview,
      deviceName: 'iPhone <script>alert(1)</script>',
    };
    const html = renderThumbnailCard(screenshotWithSpecialName, 'https://example.com');
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>alert');
  });

  it('includes preview button text', () => {
    const html = renderThumbnailCard(mockScreenshotForPreview, 'https://example.com');
    expect(html).toContain('>Preview</button>');
  });

  it('preview button is type="button"', () => {
    const html = renderThumbnailCard(mockScreenshotForPreview, 'https://example.com');
    expect(html).toContain('type="button"');
  });
});

describe('buildReportHtml with modal', () => {
  beforeEach(async () => {
    await mkdir(TEST_OUTPUT_DIR, { recursive: true });
  });

  afterEach(async () => {
    await rm(TEST_OUTPUT_DIR, { recursive: true, force: true });
  });

  it('includes modal dialog in generated HTML', async () => {
    const data: ReportData = {
      url: 'https://example.com',
      capturedAt: '2026-01-21',
      duration: 5000,
      deviceCount: 1,
      files: [],
    };
    const screenshots: ScreenshotForReport[] = [{
      deviceName: 'Test Device',
      category: 'phones',
      width: 375,
      height: 812,
      dataUri: 'data:image/png;base64,test',
    }];

    await generateReport(data, screenshots, TEST_OUTPUT_DIR);
    const html = await readFile(join(TEST_OUTPUT_DIR, 'report.html'), 'utf-8');
    expect(html).toContain('<dialog id="preview-modal"');
    expect(html).toContain('window.openPreview');
  });

  it('includes preview button on thumbnail cards', async () => {
    const data: ReportData = {
      url: 'https://example.com',
      capturedAt: '2026-01-21',
      duration: 5000,
      deviceCount: 1,
      files: [],
    };
    const screenshots: ScreenshotForReport[] = [{
      deviceName: 'Test Device',
      category: 'phones',
      width: 375,
      height: 812,
      dataUri: 'data:image/png;base64,test',
    }];

    await generateReport(data, screenshots, TEST_OUTPUT_DIR);
    const html = await readFile(join(TEST_OUTPUT_DIR, 'report.html'), 'utf-8');
    expect(html).toContain('class="preview-btn"');
    expect(html).toContain("openPreview('https://example.com', 375, 812, 'Test Device')");
  });

  it('includes modal CSS styles', async () => {
    await generateReport(mockReportData, [], TEST_OUTPUT_DIR);
    const html = await readFile(join(TEST_OUTPUT_DIR, 'report.html'), 'utf-8');
    expect(html).toContain('.preview-modal');
    expect(html).toContain('.preview-modal::backdrop');
    expect(html).toContain('.loading-state');
    expect(html).toContain('.spinner');
    expect(html).toContain('@keyframes spin');
    expect(html).toContain('.error-state');
    expect(html).toContain('.fallback-btn');
  });

  it('includes preview button CSS styles', async () => {
    await generateReport(mockReportData, [], TEST_OUTPUT_DIR);
    const html = await readFile(join(TEST_OUTPUT_DIR, 'report.html'), 'utf-8');
    expect(html).toContain('.preview-btn');
    expect(html).toContain('.preview-btn:hover');
    expect(html).toContain('.preview-btn:active');
    expect(html).toContain('.preview-btn:focus-visible');
  });
});
