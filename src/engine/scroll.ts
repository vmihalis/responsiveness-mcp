import type { Page } from 'playwright';

/**
 * Scroll through page to trigger lazy-loaded content.
 *
 * Scrolls in viewport-sized increments, checking if page height grows
 * (indicating more content loaded). Stops when:
 * - Max iterations reached (prevents infinite scroll hang)
 * - Page height stabilizes (no new content)
 * - Timeout budget exhausted
 *
 * Returns to top of page after scrolling.
 *
 * @param page - Playwright page instance
 * @param maxIterations - Maximum scroll passes (default 10)
 * @param timeout - Time budget in ms (default 5000)
 */
export async function scrollForLazyContent(
  page: Page,
  maxIterations: number = 10,
  timeout: number = 5000
): Promise<void> {
  const startTime = Date.now();
  const viewportHeight = page.viewportSize()?.height ?? 800;
  let previousHeight = 0;
  let iterations = 0;

  while (iterations < maxIterations) {
    // Check timeout budget
    if (Date.now() - startTime > timeout) {
      break;
    }

    const currentHeight = await page.evaluate(() => document.body.scrollHeight);

    // Stop if page height stabilized (no new content loaded)
    if (currentHeight === previousHeight) {
      break;
    }

    previousHeight = currentHeight;

    // Scroll through current page content in viewport-sized steps
    const scrollStep = Math.floor(viewportHeight * 0.8); // 80% of viewport for overlap
    for (let pos = 0; pos < currentHeight && Date.now() - startTime < timeout; pos += scrollStep) {
      await page.evaluate((y) => window.scrollTo(0, y), pos);
      await page.waitForTimeout(100); // Brief pause for lazy loaders to trigger
    }

    // Brief wait for any triggered lazy loads to complete network requests
    try {
      await page.waitForLoadState('networkidle', { timeout: 2000 });
    } catch {
      // Network didn't idle in 2s, continue anyway
    }

    iterations++;
  }

  // Return to top for screenshot
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(100); // Let page settle at top
}
