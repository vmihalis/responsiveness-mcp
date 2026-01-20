import { describe, it, expect } from 'vitest';
import { getDevices, getDevicesByCategory } from './index.js';

describe('Device Registry', () => {
  describe('getDevices()', () => {
    it('returns 50+ devices', () => {
      const devices = getDevices();
      expect(devices.length).toBeGreaterThanOrEqual(50);
    });

    it('each device has required properties', () => {
      const devices = getDevices();
      for (const device of devices) {
        expect(device).toHaveProperty('name');
        expect(device).toHaveProperty('width');
        expect(device).toHaveProperty('height');
        expect(device).toHaveProperty('deviceScaleFactor');
        expect(device).toHaveProperty('category');
        expect(typeof device.name).toBe('string');
        expect(device.width).toBeGreaterThan(0);
        expect(device.height).toBeGreaterThan(0);
        expect(device.deviceScaleFactor).toBeGreaterThanOrEqual(1);
      }
    });

    it('includes latest iPhone models', () => {
      const devices = getDevices();
      const names = devices.map((d) => d.name);
      expect(names.some((n) => n.includes('iPhone 15'))).toBe(true);
      expect(names.some((n) => n.includes('iPhone 16'))).toBe(true);
    });

    it('includes Pixel 8', () => {
      const devices = getDevices();
      const names = devices.map((d) => d.name);
      expect(names.some((n) => n.includes('Pixel 8'))).toBe(true);
    });

    it('includes Galaxy S24', () => {
      const devices = getDevices();
      const names = devices.map((d) => d.name);
      expect(names.some((n) => n.includes('Galaxy S24'))).toBe(true);
    });
  });

  describe('getDevicesByCategory()', () => {
    it('returns 15+ phones', () => {
      const phones = getDevicesByCategory('phones');
      expect(phones.length).toBeGreaterThanOrEqual(15);
      expect(phones.every((d) => d.category === 'phones')).toBe(true);
    });

    it('returns 10+ tablets', () => {
      const tablets = getDevicesByCategory('tablets');
      expect(tablets.length).toBeGreaterThanOrEqual(10);
      expect(tablets.every((d) => d.category === 'tablets')).toBe(true);
    });

    it('returns 18+ desktops/laptops', () => {
      const desktops = getDevicesByCategory('pc-laptops');
      expect(desktops.length).toBeGreaterThanOrEqual(18);
      expect(desktops.every((d) => d.category === 'pc-laptops')).toBe(true);
    });

    it('filters only matching category', () => {
      const phones = getDevicesByCategory('phones');
      const tablets = getDevicesByCategory('tablets');
      const desktops = getDevicesByCategory('pc-laptops');

      // No overlap between categories
      const phoneNames = new Set(phones.map((d) => d.name));
      expect(tablets.every((d) => !phoneNames.has(d.name))).toBe(true);
      expect(desktops.every((d) => !phoneNames.has(d.name))).toBe(true);
    });
  });

  describe('device data quality', () => {
    it('device names include dimensions', () => {
      const devices = getDevices();
      for (const device of devices) {
        expect(device.name).toMatch(/\(\d+x\d+\)$/);
      }
    });

    it('deviceScaleFactor is within valid range (1-4)', () => {
      const devices = getDevices();
      for (const device of devices) {
        expect(device.deviceScaleFactor).toBeGreaterThanOrEqual(1);
        expect(device.deviceScaleFactor).toBeLessThanOrEqual(4);
      }
    });
  });
});
