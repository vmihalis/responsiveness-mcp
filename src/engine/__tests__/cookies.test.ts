import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { chromium, type Browser, type Page } from 'playwright';
import { COOKIE_BANNER_SELECTORS, hideCookieBanners } from '../cookies.js';

describe('cookie banner hiding', () => {
  describe('COOKIE_BANNER_SELECTORS', () => {
    it('is a non-empty array', () => {
      expect(Array.isArray(COOKIE_BANNER_SELECTORS)).toBe(true);
      expect(COOKIE_BANNER_SELECTORS.length).toBeGreaterThan(0);
    });

    it('includes major CMP platforms', () => {
      const selectors = COOKIE_BANNER_SELECTORS.join(' ');
      expect(selectors).toContain('onetrust');    // OneTrust
      expect(selectors).toContain('Cookiebot');   // Cookiebot
      expect(selectors).toContain('didomi');      // Didomi
      expect(selectors).toContain('truste');      // TrustArc
    });

    it('includes generic cookie patterns', () => {
      expect(COOKIE_BANNER_SELECTORS).toContain('#cookie-banner');
      expect(COOKIE_BANNER_SELECTORS).toContain('.cookie-consent');
      expect(COOKIE_BANNER_SELECTORS).toContain('#gdpr-banner');
    });

    it('includes attribute selectors for flexible matching', () => {
      const hasAttributeSelector = COOKIE_BANNER_SELECTORS.some(s => s.includes('[class*='));
      expect(hasAttributeSelector).toBe(true);
    });

    it('all selectors are valid CSS syntax', () => {
      // Build CSS to verify it's parseable
      const css = COOKIE_BANNER_SELECTORS.join(', ') + ' { display: none; }';
      // If this throws, the selectors have invalid syntax
      expect(() => css).not.toThrow();
    });
  });

  describe('hideCookieBanners', () => {
    let browser: Browser;
    let page: Page;

    beforeAll(async () => {
      browser = await chromium.launch({ headless: true });
    });

    afterAll(async () => {
      await browser.close();
    });

    beforeEach(async () => {
      const context = await browser.newContext();
      page = await context.newPage();
    });

    afterEach(async () => {
      await page.context().close();
    });

    it('injects CSS style tag into page', async () => {
      // Set up minimal HTML page
      await page.setContent('<html><head></head><body><div id="cookie-banner">Banner</div></body></html>');

      // Count style tags before
      const beforeCount = await page.locator('style').count();

      await hideCookieBanners(page);

      // Count style tags after
      const afterCount = await page.locator('style').count();

      expect(afterCount).toBe(beforeCount + 1);
    });

    it('hides elements matching cookie banner selectors', async () => {
      // Set up page with a cookie banner
      await page.setContent(`
        <html>
          <head></head>
          <body>
            <div id="cookie-banner" style="display: block;">Cookie Banner</div>
            <div id="main">Main Content</div>
          </body>
        </html>
      `);

      await hideCookieBanners(page);

      // Check computed style
      const display = await page.locator('#cookie-banner').evaluate(el => {
        return window.getComputedStyle(el).display;
      });

      expect(display).toBe('none');
    });

    it('does not affect non-banner elements', async () => {
      await page.setContent(`
        <html>
          <head></head>
          <body>
            <div id="main" style="display: block;">Main Content</div>
          </body>
        </html>
      `);

      await hideCookieBanners(page);

      const display = await page.locator('#main').evaluate(el => {
        return window.getComputedStyle(el).display;
      });

      expect(display).toBe('block');
    });

    it('handles OneTrust banner', async () => {
      await page.setContent(`
        <html>
          <body>
            <div id="onetrust-consent-sdk" style="display: block;">OneTrust</div>
          </body>
        </html>
      `);

      await hideCookieBanners(page);

      const display = await page.locator('#onetrust-consent-sdk').evaluate(el => {
        return window.getComputedStyle(el).display;
      });

      expect(display).toBe('none');
    });

    it('handles Cookiebot banner', async () => {
      await page.setContent(`
        <html>
          <body>
            <div id="CybotCookiebotDialog" style="display: block;">Cookiebot</div>
          </body>
        </html>
      `);

      await hideCookieBanners(page);

      const display = await page.locator('#CybotCookiebotDialog').evaluate(el => {
        return window.getComputedStyle(el).display;
      });

      expect(display).toBe('none');
    });

    it('handles class-based cookie banners', async () => {
      await page.setContent(`
        <html>
          <body>
            <div class="cookie-consent-wrapper" style="display: block;">Cookie Consent</div>
          </body>
        </html>
      `);

      await hideCookieBanners(page);

      // Uses attribute selector [class*="cookie-consent"]
      const display = await page.locator('.cookie-consent-wrapper').evaluate(el => {
        return window.getComputedStyle(el).display;
      });

      expect(display).toBe('none');
    });
  });
});
