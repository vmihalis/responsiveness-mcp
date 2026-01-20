# Phase 4: Page Loading - Research

**Researched:** 2026-01-20
**Domain:** Playwright page loading strategies, lazy content handling, CSS animation control
**Confidence:** HIGH

## Summary

This phase focuses on three key enhancements to the existing screenshot capture flow:

1. **Network idle buffer (LOAD-02):** Add a configurable wait period after `networkidle` to ensure any post-idle rendering completes
2. **Lazy loading triggers (LOAD-03):** Scroll through pages to trigger lazy-loaded images before full-page screenshot
3. **CSS animation disabling (SHOT-03):** Use Playwright's built-in `animations: 'disabled'` option for consistent screenshots

The current codebase already uses `networkidle` wait strategy. The enhancements add a post-idle buffer, systematic scrolling for lazy content, and animation control - all using well-documented Playwright APIs.

**Primary recommendation:** Use Playwright's built-in `animations: 'disabled'` screenshot option, implement scroll-and-wait pattern for lazy loading with max iterations to prevent infinite scroll hangs, and add configurable post-networkidle delay via `page.waitForTimeout()`.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| playwright | 1.50+ | Browser automation | Already in use; provides all required APIs natively |

### Supporting
No additional libraries needed. All functionality is built into Playwright.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `animations: 'disabled'` | `page.addStyleTag()` with CSS | More control but less reliable; built-in option handles edge cases |
| `page.waitForTimeout()` | `setTimeout` in `page.evaluate()` | Both work; Playwright method is more idiomatic |
| `page.mouse.wheel()` | `window.scrollTo()` via evaluate | wheel() simulates user behavior; scrollTo() is faster but may miss JS scroll handlers |

## Architecture Patterns

### Recommended Enhancement to CaptureOptions

The current `CaptureOptions` interface already has a `waitBuffer` field (unused). Extend it:

```typescript
// Source: Current types.ts already has this structure
export interface CaptureOptions {
  url: string;
  device: Device;
  timeout: number;
  waitBuffer: number;           // LOAD-02: ms to wait after networkidle (default 500)
  scrollForLazy?: boolean;      // LOAD-03: whether to scroll for lazy content (default true)
  maxScrollIterations?: number; // Prevent infinite scroll hangs (default 10)
}
```

### Pattern 1: Post-NetworkIdle Buffer

**What:** Wait a fixed duration after networkidle before proceeding
**When to use:** Always - ensures any JS that triggers on networkidle has time to complete

```typescript
// Source: https://www.browserstack.com/guide/playwright-waitfortimeout
// After navigation with networkidle
await page.goto(url, { waitUntil: 'networkidle', timeout: navigationTimeout });

// LOAD-02: Add buffer for post-idle rendering
await page.waitForTimeout(waitBuffer); // Default 500ms
```

**Note:** `page.waitForTimeout()` is discouraged for tests but acceptable for scraping/screenshot scenarios where we genuinely need to wait for animations or delayed rendering.

### Pattern 2: Lazy Load Scroll Pattern

**What:** Scroll through page in viewport-sized increments to trigger lazy-loaded images
**When to use:** Before taking fullPage screenshots on pages with lazy-loaded content

```typescript
// Source: https://github.com/microsoft/playwright/issues/19277
// Source: https://www.programmablebrowser.com/posts/screenshot-page-lazy-loaded-images/

async function scrollForLazyContent(page: Page, maxIterations: number = 10): Promise<void> {
  const viewportHeight = page.viewportSize()?.height ?? 800;
  let previousHeight = 0;
  let iterations = 0;

  while (iterations < maxIterations) {
    const currentHeight = await page.evaluate(() => document.body.scrollHeight);

    // Stop if page height hasn't changed (no new content loaded)
    if (currentHeight === previousHeight) {
      break;
    }

    previousHeight = currentHeight;

    // Scroll in viewport-sized increments
    for (let pos = 0; pos < currentHeight; pos += viewportHeight) {
      await page.evaluate((y) => window.scrollTo(0, y), pos);
      await page.waitForTimeout(100); // Brief pause for images to trigger loading
    }

    // Wait for network to settle after scroll
    await page.waitForLoadState('networkidle');
    iterations++;
  }

  // Return to top for screenshot
  await page.evaluate(() => window.scrollTo(0, 0));
}
```

### Pattern 3: CSS Animation Disabling

**What:** Use Playwright's built-in animation control for consistent screenshots
**When to use:** Always when taking screenshots for consistency

```typescript
// Source: https://github.com/microsoft/playwright/issues/11912
// Built into Playwright since v1.20

const buffer = await page.screenshot({
  fullPage: true,
  type: 'png',
  scale: 'css',
  animations: 'disabled', // SHOT-03: Disables CSS animations, transitions, web animations
  timeout: screenshotTimeout,
});
```

**Behavior of `animations: 'disabled'`:**
- Finite animations: fast-forwarded to completion (triggers `transitionend`)
- Infinite animations: canceled to initial state, resumed after screenshot

### Anti-Patterns to Avoid

- **Relying solely on networkidle:** Some pages have continuous background requests; add the buffer anyway
- **Scrolling without max iterations:** Infinite scroll pages will hang forever
- **Using `prefers-reduced-motion` instead of `animations: 'disabled'`:** The latter is more comprehensive and purpose-built for screenshots
- **Scrolling with long delays (1000ms+):** Wastes time; 100-150ms is sufficient for lazy image triggers

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Disable CSS animations | Custom CSS injection | `animations: 'disabled'` option | Handles finite/infinite animations correctly, works with Web Animations API |
| Wait for page stability | Custom polling loop | `waitForLoadState('networkidle')` | Already handles 500ms no-network threshold |
| Scroll to element | Manual coordinate calculation | `element.scrollIntoViewIfNeeded()` | Handles edge cases, visibility checks |

**Key insight:** Playwright v1.20+ has built-in animation control that handles edge cases (finite vs infinite animations, web animations, transition events). Custom CSS injection misses these subtleties.

## Common Pitfalls

### Pitfall 1: Infinite Scroll Hanging
**What goes wrong:** Scrolling loop never terminates on infinite scroll pages
**Why it happens:** Page height keeps growing as new content loads
**How to avoid:** Implement max iteration limit (10-15 iterations covers most reasonable pages)
**Warning signs:** Screenshots taking > 30 seconds for simple pages

### Pitfall 2: Lazy Images Still Missing
**What goes wrong:** Full-page screenshot still has placeholder images
**Why it happens:** Scrolled too fast; lazy loaders didn't have time to trigger
**How to avoid:** Add 100ms delay between scroll positions; wait for networkidle after complete scroll
**Warning signs:** Random images missing on repeated captures

### Pitfall 3: Animation State Inconsistency
**What goes wrong:** Screenshots show different animation states
**Why it happens:** Using `prefers-reduced-motion` which only affects CSS respecting that query
**How to avoid:** Use `animations: 'disabled'` which forcibly stops all animation types
**Warning signs:** Flaky visual diffs, elements in mid-transition

### Pitfall 4: Post-NetworkIdle Race Conditions
**What goes wrong:** Page renders differently each time after networkidle
**Why it happens:** JavaScript running after networkidle modifies DOM
**How to avoid:** Add waitBuffer (500ms default) after networkidle
**Warning signs:** Inconsistent screenshot content on same page

### Pitfall 5: Timeout Budget Exhaustion
**What goes wrong:** Screenshot fails due to timeout during scroll phase
**Why it happens:** Scroll iterations consume time, leaving insufficient timeout for actual screenshot
**How to avoid:** Factor scroll time into timeout budget; use lower per-scroll delays (100ms vs 1000ms)
**Warning signs:** Timeouts on long pages that work on short pages

## Code Examples

Verified patterns from official sources:

### Complete Capture Flow with All Enhancements

```typescript
// Integrate with existing captureScreenshot function

export async function captureScreenshot(
  manager: BrowserManager,
  options: CaptureOptions
): Promise<ScreenshotResult> {
  const {
    url,
    device,
    timeout = DEFAULT_TIMEOUT,
    waitBuffer = 500,          // LOAD-02
    scrollForLazy = true,      // LOAD-03
    maxScrollIterations = 10,
  } = options;

  // Split timeout: 70% navigation, 15% scroll, 15% screenshot
  const navigationTimeout = Math.floor(timeout * 0.7);
  const scrollTimeout = Math.floor(timeout * 0.15);
  const screenshotTimeout = Math.floor(timeout * 0.15);

  const context = await manager.createContext(device);

  try {
    const page = await context.newPage();

    // Navigate with network idle wait (LOAD-01)
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: navigationTimeout,
    });

    // LOAD-02: Wait buffer after network idle
    await page.waitForTimeout(waitBuffer);

    // LOAD-03: Scroll for lazy content
    if (scrollForLazy) {
      await scrollForLazyContent(page, maxScrollIterations, scrollTimeout);
    }

    // SHOT-01 + SHOT-03: Full-page screenshot with animations disabled
    const buffer = await page.screenshot({
      fullPage: true,
      type: 'png',
      scale: 'css',
      animations: 'disabled', // SHOT-03
      timeout: screenshotTimeout,
    });

    return {
      success: true,
      deviceName: device.name,
      buffer,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      deviceName: device.name,
      error: message,
    };
  } finally {
    await manager.closeContext(context);
  }
}
```

### Scroll Helper Function

```typescript
// Source: Pattern synthesized from multiple GitHub issues and official docs

async function scrollForLazyContent(
  page: Page,
  maxIterations: number,
  timeout: number
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

    // Stop if page height stabilized (no new content)
    if (currentHeight === previousHeight) {
      break;
    }

    previousHeight = currentHeight;

    // Scroll through current page content
    const scrollStep = Math.floor(viewportHeight * 0.8); // 80% overlap
    for (let pos = 0; pos < currentHeight && Date.now() - startTime < timeout; pos += scrollStep) {
      await page.evaluate((y) => window.scrollTo(0, y), pos);
      await page.waitForTimeout(100);
    }

    // Brief wait for any triggered lazy loads
    try {
      await page.waitForLoadState('networkidle', { timeout: 2000 });
    } catch {
      // Network didn't idle in 2s, continue anyway
    }

    iterations++;
  }

  // Return to top
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(100); // Let page settle at top
}
```

### Alternative: Force-Load Native Lazy Images

```typescript
// Source: https://github.com/microsoft/playwright/issues/19861
// Use when you know images use native loading="lazy" attribute

async function forceLoadLazyImages(page: Page): Promise<void> {
  await page.evaluate(() => {
    document.querySelectorAll<HTMLImageElement>('img[loading="lazy"]')
      .forEach((img) => {
        img.setAttribute('loading', 'eager');
      });
  });

  // Wait for images to actually load
  await page.waitForLoadState('networkidle');
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual CSS injection for animations | `animations: 'disabled'` option | Playwright v1.20 (March 2022) | Built-in, handles all animation types |
| Custom network idle polling | `waitForLoadState('networkidle')` | Playwright v1.0 | Reliable 500ms threshold |
| `page.waitForNavigation()` | Navigation handled in `page.goto()` | Playwright v1.8 | Simpler API |

**Deprecated/outdated:**
- `page.waitForNavigation()`: Merged into navigation methods; use `waitUntil` option in `goto()`
- `networkidle0`/`networkidle2`: Puppeteer terms; Playwright uses `networkidle`

## Open Questions

Things that couldn't be fully resolved:

1. **Optimal scroll delay timing**
   - What we know: 100ms works for most cases; 1000ms is too slow
   - What's unclear: Ideal timing may vary by site complexity
   - Recommendation: Start with 100ms, make configurable if needed

2. **Virtual scroll containers**
   - What we know: Some sites use virtual scroll (only render visible items)
   - What's unclear: How to detect and handle these
   - Recommendation: Document as limitation; max iterations prevents hangs

3. **JS-based animations**
   - What we know: `animations: 'disabled'` only handles CSS/Web Animations
   - What's unclear: How to handle requestAnimationFrame-based animations
   - Recommendation: Accept this limitation; most visual consistency issues are CSS-based

## Sources

### Primary (HIGH confidence)
- [Playwright Page API](https://playwright.dev/docs/api/class-page) - screenshot options, waitForLoadState
- [GitHub Issue #11912](https://github.com/microsoft/playwright/issues/11912) - animations option implementation
- [GitHub Issue #19277](https://github.com/microsoft/playwright/issues/19277) - lazy loading scroll patterns
- [GitHub Issue #19861](https://github.com/microsoft/playwright/issues/19861) - full-page screenshots on lazy load pages

### Secondary (MEDIUM confidence)
- [Checkly Docs: Waits and Timeouts](https://www.checklyhq.com/docs/learn/playwright/waits-and-timeouts/) - wait method best practices
- [BrowserStack: waitForLoadState](https://www.browserstack.com/guide/playwright-waitforloadstate) - load state explanations
- [Programmable Browser: Lazy Loading Screenshots](https://www.programmablebrowser.com/posts/screenshot-page-lazy-loaded-images/) - scroll patterns

### Tertiary (LOW confidence)
- [DEV.to: Playwright Infinite Loading](https://dev.to/devloker/playwright-scraping-infinite-loading-pagination-4pid) - infinite scroll patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using only built-in Playwright APIs, well-documented
- Architecture: HIGH - Patterns verified from multiple official sources and issues
- Pitfalls: HIGH - Documented from real-world issue discussions

**Research date:** 2026-01-20
**Valid until:** 2026-03-20 (60 days - Playwright API is stable)
