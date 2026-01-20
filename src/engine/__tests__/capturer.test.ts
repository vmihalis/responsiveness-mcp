import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { BrowserManager } from '../browser.js';
import { captureScreenshot } from '../capturer.js';
import { DEFAULT_TIMEOUT } from '../types.js';
import type { Device } from '../../devices/types.js';
import type { CaptureOptions } from '../types.js';

// Test device fixture
const testPhone: Device = {
  name: 'Test iPhone',
  width: 390,
  height: 844,
  deviceScaleFactor: 3,
  category: 'phones',
};

const testDesktop: Device = {
  name: 'Test Desktop',
  width: 1920,
  height: 1080,
  deviceScaleFactor: 1,
  category: 'pc-laptops',
};

describe('captureScreenshot', () => {
  let manager: BrowserManager;

  beforeAll(async () => {
    manager = new BrowserManager();
    await manager.launch();
  });

  afterAll(async () => {
    await manager.close();
  });

  describe('successful captures', () => {
    it('should capture screenshot of simple page', async () => {
      const options: CaptureOptions = {
        url: 'https://example.com',
        device: testPhone,
        timeout: DEFAULT_TIMEOUT,
        waitBuffer: 500,
      };

      const result = await captureScreenshot(manager, options);

      expect(result.success).toBe(true);
      expect(result.deviceName).toBe('Test iPhone');
      expect(result.buffer).toBeDefined();
      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.buffer!.length).toBeGreaterThan(0);
    });

    it('should capture screenshot with desktop device', async () => {
      const options: CaptureOptions = {
        url: 'https://example.com',
        device: testDesktop,
        timeout: DEFAULT_TIMEOUT,
        waitBuffer: 500,
      };

      const result = await captureScreenshot(manager, options);

      expect(result.success).toBe(true);
      expect(result.deviceName).toBe('Test Desktop');
      expect(result.buffer).toBeDefined();
    });

    it('should return PNG format buffer', async () => {
      const options: CaptureOptions = {
        url: 'https://example.com',
        device: testPhone,
        timeout: DEFAULT_TIMEOUT,
        waitBuffer: 500,
      };

      const result = await captureScreenshot(manager, options);

      expect(result.success).toBe(true);
      // PNG magic bytes: 0x89 0x50 0x4E 0x47
      const pngMagic = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
      expect(result.buffer!.subarray(0, 4).equals(pngMagic)).toBe(true);
    });

    it('should capture full-page content', async () => {
      // Use a page that's likely to have scrollable content
      const options: CaptureOptions = {
        url: 'https://example.com',
        device: testPhone,
        timeout: DEFAULT_TIMEOUT,
        waitBuffer: 500,
      };

      const result = await captureScreenshot(manager, options);

      expect(result.success).toBe(true);
      // Full-page capture means buffer should exist
      expect(result.buffer).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should return error for invalid URL', async () => {
      const options: CaptureOptions = {
        url: 'https://this-domain-definitely-does-not-exist-12345.com',
        device: testPhone,
        timeout: 5000, // Short timeout for faster test
        waitBuffer: 500,
      };

      const result = await captureScreenshot(manager, options);

      expect(result.success).toBe(false);
      expect(result.deviceName).toBe('Test iPhone');
      expect(result.error).toBeDefined();
      expect(result.buffer).toBeUndefined();
    });

    it('should return error for malformed URL', async () => {
      const options: CaptureOptions = {
        url: 'not-a-valid-url',
        device: testPhone,
        timeout: DEFAULT_TIMEOUT,
        waitBuffer: 500,
      };

      const result = await captureScreenshot(manager, options);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle timeout scenario', async () => {
      // Use a URL that will take time to resolve/connect and a short timeout
      // 10.255.255.1 is a non-routable IP that will cause connection timeout
      const options: CaptureOptions = {
        url: 'http://10.255.255.1',
        device: testPhone,
        timeout: 1000, // 1 second - short enough to trigger timeout
        waitBuffer: 500,
      };

      const result = await captureScreenshot(manager, options);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      // Error should mention timeout or connection issue
      expect(
        result.error?.toLowerCase().includes('timeout') ||
        result.error?.toLowerCase().includes('error')
      ).toBe(true);
    });
  });

  describe('context cleanup', () => {
    it('should work with multiple sequential captures', async () => {
      const options: CaptureOptions = {
        url: 'https://example.com',
        device: testPhone,
        timeout: DEFAULT_TIMEOUT,
        waitBuffer: 500,
      };

      // Multiple captures should work (contexts cleaned up properly)
      const result1 = await captureScreenshot(manager, options);
      const result2 = await captureScreenshot(manager, options);
      const result3 = await captureScreenshot(manager, options);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result3.success).toBe(true);
    });

    it('should clean up context even on error', async () => {
      const options: CaptureOptions = {
        url: 'https://this-domain-definitely-does-not-exist-12345.com',
        device: testPhone,
        timeout: 5000,
        waitBuffer: 500,
      };

      // This should fail but clean up context
      await captureScreenshot(manager, options);

      // Subsequent capture should still work
      const validOptions: CaptureOptions = {
        url: 'https://example.com',
        device: testPhone,
        timeout: DEFAULT_TIMEOUT,
        waitBuffer: 500,
      };

      const result = await captureScreenshot(manager, validOptions);
      expect(result.success).toBe(true);
    });
  });

  describe('device emulation', () => {
    it('should capture with different viewport sizes', async () => {
      const phoneOptions: CaptureOptions = {
        url: 'https://example.com',
        device: testPhone,
        timeout: DEFAULT_TIMEOUT,
        waitBuffer: 500,
      };

      const desktopOptions: CaptureOptions = {
        url: 'https://example.com',
        device: testDesktop,
        timeout: DEFAULT_TIMEOUT,
        waitBuffer: 500,
      };

      const phoneResult = await captureScreenshot(manager, phoneOptions);
      const desktopResult = await captureScreenshot(manager, desktopOptions);

      expect(phoneResult.success).toBe(true);
      expect(desktopResult.success).toBe(true);

      // Both should have buffers (different sizes due to viewport)
      expect(phoneResult.buffer).toBeDefined();
      expect(desktopResult.buffer).toBeDefined();
    });
  });
});
