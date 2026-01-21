import type { CaptureOptions, ScreenshotResult } from './types.js';
import { DEFAULT_TIMEOUT } from './types.js';
import { BrowserManager } from './browser.js';
import { scrollForLazyContent } from './scroll.js';
import { hideCookieBanners } from './cookies.js';

/**
 * Capture a screenshot of a URL using a specific device configuration.
 *
 * Uses the provided BrowserManager to create an isolated context for the device,
 * navigates to the URL, waits for network idle, and captures the viewport or full page.
 *
 * @param manager - BrowserManager instance (allows reuse across captures)
 * @param options - Capture options including URL, device, and timeout
 * @returns ScreenshotResult with buffer on success or error message on failure
 *
 * Requirements satisfied:
 * - SHOT-01: Screenshot (viewport-only by default, full-page via option)
 * - LOAD-01: Network idle wait before capture
 * - LOAD-02: Post-networkidle buffer wait for rendering stability
 * - LOAD-03: Scroll for lazy-loaded content before screenshot
 * - LOAD-04: 30s timeout (split: 60% navigation, 25% scroll+buffer, 15% screenshot)
 * - SHOT-03: CSS animations disabled for consistent screenshots
 */
export async function captureScreenshot(
  manager: BrowserManager,
  options: CaptureOptions
): Promise<ScreenshotResult> {
  const {
    url,
    device,
    timeout = DEFAULT_TIMEOUT,
    waitBuffer = 500,
    scrollForLazy = true,
    maxScrollIterations = 10,
    hideCookieBanners: shouldHideCookies = true,
    fullPage = false,
  } = options;

  // Split timeout budget: 60% navigation, 25% scroll+buffer, 15% screenshot
  const navigationTimeout = Math.floor(timeout * 0.6);
  const scrollTimeout = Math.floor(timeout * 0.25);
  const screenshotTimeout = Math.floor(timeout * 0.15);

  const context = await manager.createContext(device);

  try {
    const page = await context.newPage();

    // Navigate with network idle wait (LOAD-01)
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: navigationTimeout,
    });

    // LOAD-02: Wait buffer after network idle for post-idle rendering
    await page.waitForTimeout(waitBuffer);

    // UX-02: Hide cookie banners before capture (default: true)
    if (shouldHideCookies) {
      await hideCookieBanners(page);
    }

    // LOAD-03: Scroll for lazy-loaded content
    if (scrollForLazy) {
      await scrollForLazyContent(page, maxScrollIterations, scrollTimeout);
    }

    // SHOT-01: Screenshot with configurable full-page mode (default: viewport-only)
    const buffer = await page.screenshot({
      fullPage,
      type: 'png',
      scale: 'css', // Consistent file sizes across DPRs
      animations: 'disabled', // SHOT-03: Disable CSS animations for consistency
      timeout: screenshotTimeout,
    });

    return {
      success: true,
      deviceName: device.name,
      buffer,
    };
  } catch (error) {
    // Return error result instead of throwing
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      deviceName: device.name,
      error: message,
    };
  } finally {
    // Always close context to prevent resource leaks
    await manager.closeContext(context);
  }
}
