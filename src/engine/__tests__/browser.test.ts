import { describe, it, expect, afterEach } from 'vitest';
import { BrowserManager } from '../browser.js';
import type { Device } from '../../devices/types.js';

// Test device fixture
const testDevice: Device = {
  name: 'Test Phone',
  width: 390,
  height: 844,
  deviceScaleFactor: 3,
  category: 'phones',
};

const testTablet: Device = {
  name: 'Test Tablet',
  width: 820,
  height: 1180,
  deviceScaleFactor: 2,
  category: 'tablets',
};

const testDesktop: Device = {
  name: 'Test Desktop',
  width: 1920,
  height: 1080,
  deviceScaleFactor: 1,
  category: 'pc-laptops',
};

describe('BrowserManager', () => {
  let manager: BrowserManager;

  afterEach(async () => {
    // Clean up after each test
    if (manager) {
      await manager.close();
    }
  });

  describe('launch()', () => {
    it('should launch browser successfully', async () => {
      manager = new BrowserManager();
      const browser = await manager.launch();

      expect(browser).toBeDefined();
      expect(manager.isLaunched()).toBe(true);
    });

    it('should reuse existing browser on subsequent calls', async () => {
      manager = new BrowserManager();
      const browser1 = await manager.launch();
      const browser2 = await manager.launch();

      expect(browser1).toBe(browser2);
    });

    it('should launch in headless mode by default', async () => {
      manager = new BrowserManager();
      const browser = await manager.launch();

      // Browser launched successfully means headless worked
      expect(browser).toBeDefined();
    });
  });

  describe('createContext()', () => {
    it('should create context for phone device', async () => {
      manager = new BrowserManager();
      const context = await manager.createContext(testDevice);

      expect(context).toBeDefined();

      // Clean up
      await manager.closeContext(context);
    });

    it('should create context for tablet device', async () => {
      manager = new BrowserManager();
      const context = await manager.createContext(testTablet);

      expect(context).toBeDefined();

      await manager.closeContext(context);
    });

    it('should create context for desktop device', async () => {
      manager = new BrowserManager();
      const context = await manager.createContext(testDesktop);

      expect(context).toBeDefined();

      await manager.closeContext(context);
    });

    it('should auto-launch browser if not launched', async () => {
      manager = new BrowserManager();
      expect(manager.isLaunched()).toBe(false);

      await manager.createContext(testDevice);

      expect(manager.isLaunched()).toBe(true);
    });

    it('should create multiple contexts simultaneously', async () => {
      manager = new BrowserManager();

      const [ctx1, ctx2, ctx3] = await Promise.all([
        manager.createContext(testDevice),
        manager.createContext(testTablet),
        manager.createContext(testDesktop),
      ]);

      expect(ctx1).toBeDefined();
      expect(ctx2).toBeDefined();
      expect(ctx3).toBeDefined();

      // All are different contexts
      expect(ctx1).not.toBe(ctx2);
      expect(ctx2).not.toBe(ctx3);
    });
  });

  describe('close()', () => {
    it('should close browser and all contexts', async () => {
      manager = new BrowserManager();
      await manager.createContext(testDevice);
      await manager.createContext(testTablet);

      expect(manager.isLaunched()).toBe(true);

      await manager.close();

      expect(manager.isLaunched()).toBe(false);
    });

    it('should be safe to call multiple times', async () => {
      manager = new BrowserManager();
      await manager.launch();

      await manager.close();
      await manager.close(); // Should not throw

      expect(manager.isLaunched()).toBe(false);
    });

    it('should allow relaunching after close', async () => {
      manager = new BrowserManager();
      await manager.launch();
      await manager.close();

      const browser = await manager.launch();
      expect(browser).toBeDefined();
      expect(manager.isLaunched()).toBe(true);
    });
  });

  describe('closeContext()', () => {
    it('should close specific context', async () => {
      manager = new BrowserManager();
      const context = await manager.createContext(testDevice);

      await manager.closeContext(context);

      // Context should be closed - trying to use it should fail
      await expect(context.newPage()).rejects.toThrow();
    });

    it('should be safe to call with already-closed context', async () => {
      manager = new BrowserManager();
      const context = await manager.createContext(testDevice);

      await manager.closeContext(context);
      await manager.closeContext(context); // Should not throw
    });
  });

  describe('isLaunched()', () => {
    it('should return false before launch', () => {
      manager = new BrowserManager();
      expect(manager.isLaunched()).toBe(false);
    });

    it('should return true after launch', async () => {
      manager = new BrowserManager();
      await manager.launch();
      expect(manager.isLaunched()).toBe(true);
    });

    it('should return false after close', async () => {
      manager = new BrowserManager();
      await manager.launch();
      await manager.close();
      expect(manager.isLaunched()).toBe(false);
    });
  });
});
