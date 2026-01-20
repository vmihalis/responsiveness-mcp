import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { isRetryableError, captureWithRetry, captureAllDevices } from '../executor.js';
import { BrowserManager } from '../browser.js';
import { DEFAULT_TIMEOUT } from '../types.js';
import type { Device } from '../../devices/types.js';

// Test device fixtures
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

describe('executor', () => {
  describe('isRetryableError', () => {
    it('should return false for undefined error', () => {
      expect(isRetryableError(undefined)).toBe(false);
    });

    it('should return false for DNS resolution errors', () => {
      expect(isRetryableError('net::ERR_NAME_NOT_RESOLVED')).toBe(false);
    });

    it('should return false for SSL certificate errors', () => {
      expect(isRetryableError('net::ERR_CERT_AUTHORITY_INVALID')).toBe(false);
      expect(isRetryableError('net::ERR_CERT_DATE_INVALID')).toBe(false);
    });

    it('should return false for invalid URL errors', () => {
      expect(isRetryableError('invalid url')).toBe(false);
      expect(isRetryableError('Invalid URL')).toBe(false); // case insensitive
    });

    it('should return false for HTTP 4xx errors', () => {
      expect(isRetryableError('404 Not Found')).toBe(false);
      expect(isRetryableError('403 Forbidden')).toBe(false);
      expect(isRetryableError('401 Unauthorized')).toBe(false);
    });

    it('should return true for timeout errors', () => {
      expect(isRetryableError('Timeout 30000ms exceeded')).toBe(true);
      expect(isRetryableError('Navigation timeout')).toBe(true);
    });

    it('should return true for connection reset errors', () => {
      expect(isRetryableError('net::ERR_CONNECTION_RESET')).toBe(true);
    });

    it('should return true for temporary server errors', () => {
      expect(isRetryableError('503 Service Unavailable')).toBe(true);
      expect(isRetryableError('502 Bad Gateway')).toBe(true);
    });

    it('should return true for generic network errors', () => {
      expect(isRetryableError('Network error')).toBe(true);
    });
  });

  describe('captureWithRetry', () => {
    let manager: BrowserManager;

    beforeAll(async () => {
      manager = new BrowserManager();
      await manager.launch();
    });

    afterAll(async () => {
      await manager.close();
    });

    it('should succeed on first attempt for valid URL', async () => {
      const result = await captureWithRetry(
        manager,
        {
          url: 'https://example.com',
          device: testPhone,
          timeout: DEFAULT_TIMEOUT,
          waitBuffer: 500,
        },
        3, // maxRetries
        500 // retryDelay
      );

      expect(result.success).toBe(true);
      expect(result.attempts).toBe(1);
      expect(result.buffer).toBeDefined();
    });

    it('should not retry DNS errors', async () => {
      const startTime = Date.now();

      const result = await captureWithRetry(
        manager,
        {
          url: 'https://this-domain-definitely-does-not-exist-12345.com',
          device: testPhone,
          timeout: 5000,
          waitBuffer: 500,
        },
        3,
        1000 // 1s delay - would add 2s if retrying
      );

      const duration = Date.now() - startTime;

      expect(result.success).toBe(false);
      expect(result.attempts).toBe(1); // No retry
      expect(result.error).toContain('ERR_NAME_NOT_RESOLVED');
      // Duration should be short (no retries adding 2+ seconds)
      expect(duration).toBeLessThan(10000);
    });

    it('should track attempts on retryable errors', async () => {
      // Use a non-routable IP that times out (retryable)
      const result = await captureWithRetry(
        manager,
        {
          url: 'http://10.255.255.1',
          device: testPhone,
          timeout: 1000, // Very short timeout
          waitBuffer: 100,
        },
        2, // maxRetries - will try twice
        100 // short delay between retries
      );

      expect(result.success).toBe(false);
      expect(result.attempts).toBe(2); // Retried once
    });
  });
});
