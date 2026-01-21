# Phase 3: Browser Engine - Research Findings

## Overview

This document captures research findings for implementing the core screenshot capture engine with Playwright browser management. The phase must satisfy requirements SHOT-01 (full-page screenshots), LOAD-01 (network idle wait), and LOAD-04 (30s max timeout).

---

## 1. Browser Instance Reuse Pattern

### 1.1 The Problem

Launching a new browser for each screenshot is expensive (~500ms-2s per launch). For 50+ device captures, this creates significant overhead and potential resource leaks.

### 1.2 Recommended Pattern: Single Browser, Multiple Contexts

Playwright's architecture is designed for this use case:
- **Browser**: Single Chromium instance (launch once)
- **BrowserContext**: Isolated session with viewport/device settings (create per device)
- **Page**: Tab within a context (create per capture)

```typescript
import { chromium, Browser, BrowserContext } from 'playwright';

class BrowserManager {
  private browser: Browser | null = null;

  async launch(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
      });
    }
    return this.browser;
  }

  async createContext(options: {
    viewport: { width: number; height: number };
    deviceScaleFactor: number;
    userAgent?: string;
  }): Promise<BrowserContext> {
    const browser = await this.launch();
    return browser.newContext({
      viewport: options.viewport,
      deviceScaleFactor: options.deviceScaleFactor,
      userAgent: options.userAgent,
    });
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
```

### 1.3 Why Contexts Over Pages

| Approach | Isolation | Viewport Control | Performance |
|----------|-----------|------------------|-------------|
| Multiple Browsers | Full | Full | Poor (high overhead) |
| Multiple Contexts | Full | Full | Good (shared browser) |
| Multiple Pages | None | Partial | Best (shared context) |

**Key Insight**: Contexts provide full isolation (cookies, cache, viewport) while sharing the browser process. This is the sweet spot for our use case.

### 1.4 Context Lifecycle Pattern

```typescript
async function captureWithContext(
  browser: Browser,
  device: Device,
  url: string
): Promise<Buffer> {
  // Create isolated context for this device
  const context = await browser.newContext({
    viewport: { width: device.width, height: device.height },
    deviceScaleFactor: device.deviceScaleFactor,
  });

  try {
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    const screenshot = await page.screenshot({ fullPage: true });
    return screenshot;
  } finally {
    // Always close context to prevent resource leaks
    await context.close();
  }
}
```

---

## 2. Full-Page Screenshot API

### 2.1 Core API

Playwright's `page.screenshot()` with `fullPage: true` captures the entire scrollable content:

```typescript
const buffer = await page.screenshot({
  fullPage: true,  // Captures entire scrollable page
  type: 'png',     // Default format, best for layout verification
});
```

### 2.2 How fullPage Works

When `fullPage: true`:
1. Playwright calculates the full document height (`document.documentElement.scrollHeight`)
2. Temporarily resizes the viewport to match the full document dimensions
3. Captures the entire content area in one shot
4. Restores the original viewport

This approach:
- Captures content below the fold
- Handles dynamic content that extends the page
- Works with CSS `position: fixed` elements (they appear at the top)

### 2.3 Screenshot Options Reference

```typescript
interface ScreenshotOptions {
  path?: string;          // Optional file path (we use buffer instead)
  fullPage?: boolean;     // true for full scrollable page
  type?: 'png' | 'jpeg';  // PNG for lossless, JPEG for smaller files
  quality?: number;       // 0-100 for JPEG only
  timeout?: number;       // Max time in ms for screenshot operation
  clip?: {                // Capture specific region (mutually exclusive with fullPage)
    x: number;
    y: number;
    width: number;
    height: number;
  };
  omitBackground?: boolean;  // Make background transparent (PNG only)
  scale?: 'css' | 'device';  // 'css' for 1:1 CSS pixels, 'device' for full resolution
}
```

### 2.4 Recommended Settings for Our Use Case

```typescript
const screenshotOptions = {
  fullPage: true,           // Requirement SHOT-01
  type: 'png' as const,     // Lossless for design verification
  scale: 'css' as const,    // 1:1 with CSS pixels for consistency
  timeout: 30000,           // Requirement LOAD-04
};
```

### 2.5 Buffer vs File Output

We return `Buffer` instead of writing directly to disk:
- Enables the caller to decide on file naming/organization
- Supports streaming to different outputs (memory, disk, cloud)
- Easier testing with buffer comparison

```typescript
// Returns Buffer by default when no path specified
const buffer: Buffer = await page.screenshot({ fullPage: true });

// Type assertion for TypeScript
const screenshot = await page.screenshot({ fullPage: true }) as Buffer;
```

---

## 3. Network Idle Wait Strategy

### 3.1 What is Network Idle?

Playwright's `networkidle` state means:
- **No network connections for at least 500ms**
- Indicates the page has finished loading dynamic content
- Suitable for SPAs, lazy-loaded images, and async data fetching

### 3.2 Using waitUntil in goto()

```typescript
await page.goto(url, {
  waitUntil: 'networkidle',  // Wait for network to be idle
  timeout: 30000,            // Max wait time (LOAD-04)
});
```

### 3.3 Alternative: Explicit waitForLoadState()

For more control, use `waitForLoadState()` after navigation:

```typescript
await page.goto(url, { waitUntil: 'commit' });  // Wait for initial response
await page.waitForLoadState('networkidle');     // Then wait for network idle
```

### 3.4 WaitUntil Options Comparison

| Option | Description | Use Case |
|--------|-------------|----------|
| `'commit'` | Network response received | Fastest, for simple pages |
| `'domcontentloaded'` | DOM fully parsed | Static HTML pages |
| `'load'` | All resources loaded | Traditional pages with images |
| `'networkidle'` | No network for 500ms | SPAs, dynamic content (our choice) |

### 3.5 Official Guidance on networkidle

**Note from Playwright docs**: `networkidle` is marked as "DISCOURAGED" for testing because it can be flaky and slow. However, for screenshot capture of unknown pages (not testing), it's the most reliable option.

For our use case:
- We're capturing production pages, not running tests
- We need to wait for async content (fonts, images, API data)
- The 500ms idle window is acceptable for our purposes

### 3.6 Implementation Pattern

```typescript
async function navigateAndWait(
  page: Page,
  url: string,
  timeout: number
): Promise<void> {
  try {
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout,
    });
  } catch (error) {
    // If networkidle times out, the page may still be usable
    // Check if we at least got the load event
    if (error instanceof Error && error.message.includes('Timeout')) {
      console.warn(`Network idle timeout for ${url}, proceeding anyway`);
    } else {
      throw error;
    }
  }
}
```

---

## 4. Timeout Configuration

### 4.1 Types of Timeouts

Playwright has multiple timeout levels:

| Timeout Type | Scope | Default | Configuration |
|--------------|-------|---------|---------------|
| Navigation | `goto`, `reload`, etc. | 30s | Per-call or `setDefaultNavigationTimeout()` |
| Action | `click`, `fill`, etc. | 30s | Per-call or `setDefaultTimeout()` |
| Screenshot | `screenshot()` | 30s | `timeout` option in screenshot call |

### 4.2 Setting Default Navigation Timeout

```typescript
// On the page level (highest priority)
page.setDefaultNavigationTimeout(30000);

// On the context level (affects all pages in context)
context.setDefaultNavigationTimeout(30000);

// On the browser level (affects all contexts)
// Not directly available - set at context creation
```

### 4.3 Per-Operation Timeout

```typescript
// Navigation timeout
await page.goto(url, {
  timeout: 30000,  // 30 seconds per LOAD-04
  waitUntil: 'networkidle',
});

// Screenshot timeout
await page.screenshot({
  fullPage: true,
  timeout: 30000,  // Separate timeout for screenshot operation
});
```

### 4.4 Recommended Implementation

For requirement LOAD-04 (30s max timeout), implement a combined timeout:

```typescript
const DEFAULT_TIMEOUT = 30000;  // 30 seconds

interface CaptureOptions {
  url: string;
  timeout?: number;  // Allow override, default to 30s
}

async function capture(page: Page, options: CaptureOptions): Promise<Buffer> {
  const timeout = options.timeout ?? DEFAULT_TIMEOUT;

  // Split timeout between navigation and screenshot
  const navigationTimeout = Math.floor(timeout * 0.8);  // 80% for navigation
  const screenshotTimeout = Math.floor(timeout * 0.2);  // 20% for screenshot

  await page.goto(options.url, {
    waitUntil: 'networkidle',
    timeout: navigationTimeout,
  });

  return page.screenshot({
    fullPage: true,
    timeout: screenshotTimeout,
  });
}
```

### 4.5 Timeout Error Handling

```typescript
import { TimeoutError } from 'playwright';

try {
  await page.goto(url, { timeout: 30000 });
} catch (error) {
  if (error instanceof TimeoutError) {
    // Handle timeout specifically
    return {
      success: false,
      error: `Page load timed out after 30 seconds: ${url}`,
    };
  }
  throw error;  // Re-throw other errors
}
```

---

## 5. Browser/Context Lifecycle Management

### 5.1 Clean Shutdown Pattern

Always close resources in reverse order of creation:

```typescript
class BrowserManager {
  private browser: Browser | null = null;
  private activeContexts: Set<BrowserContext> = new Set();

  async createContext(options: ContextOptions): Promise<BrowserContext> {
    const browser = await this.launch();
    const context = await browser.newContext(options);
    this.activeContexts.add(context);
    return context;
  }

  async closeContext(context: BrowserContext): Promise<void> {
    if (this.activeContexts.has(context)) {
      await context.close();
      this.activeContexts.delete(context);
    }
  }

  async close(): Promise<void> {
    // Close all contexts first
    for (const context of this.activeContexts) {
      await context.close();
    }
    this.activeContexts.clear();

    // Then close browser
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
```

### 5.2 Using try/finally for Context Cleanup

Ensure contexts are always closed, even on error:

```typescript
async function captureScreenshot(
  manager: BrowserManager,
  device: Device,
  url: string
): Promise<ScreenshotResult> {
  const context = await manager.createContext({
    viewport: { width: device.width, height: device.height },
    deviceScaleFactor: device.deviceScaleFactor,
  });

  try {
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    const buffer = await page.screenshot({ fullPage: true });

    return { success: true, deviceName: device.name, buffer };
  } catch (error) {
    return {
      success: false,
      deviceName: device.name,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    await context.close();  // Always clean up
  }
}
```

### 5.3 Graceful Shutdown on Process Exit

Handle unexpected termination:

```typescript
class BrowserManager {
  private browser: Browser | null = null;
  private shutdownHandlers: (() => void)[] = [];

  async launch(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await chromium.launch();
      this.setupShutdownHandlers();
    }
    return this.browser;
  }

  private setupShutdownHandlers(): void {
    const cleanup = async () => {
      await this.close();
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    // Store for potential removal
    this.shutdownHandlers.push(() => {
      process.off('SIGINT', cleanup);
      process.off('SIGTERM', cleanup);
    });
  }

  async close(): Promise<void> {
    // Remove shutdown handlers
    this.shutdownHandlers.forEach(remove => remove());
    this.shutdownHandlers = [];

    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
```

### 5.4 Best Practices Summary

1. **Launch once**: Create browser at start, close at end
2. **Context per capture**: Isolate each device capture in its own context
3. **Always close contexts**: Use try/finally to prevent resource leaks
4. **Close browser last**: Only after all contexts are closed
5. **Handle signals**: Clean up on SIGINT/SIGTERM for graceful shutdown

---

## 6. Device Viewport and Scale Configuration

### 6.1 Context Options for Device Emulation

```typescript
import { Browser, BrowserContext } from 'playwright';
import { Device } from '../devices/types.js';

async function createDeviceContext(
  browser: Browser,
  device: Device
): Promise<BrowserContext> {
  return browser.newContext({
    viewport: {
      width: device.width,
      height: device.height,
    },
    deviceScaleFactor: device.deviceScaleFactor,
    // Optional: userAgent if device has one
    ...(device.userAgent ? { userAgent: device.userAgent } : {}),
  });
}
```

### 6.2 Viewport vs Screen Size

Playwright distinguishes between:
- **viewport**: The visible page area (what we set)
- **screen**: The device's physical screen (optional, rarely needed)

For our use case, we only need `viewport`:

```typescript
const context = await browser.newContext({
  viewport: { width: 430, height: 932 },  // iPhone 16 Pro Max
  deviceScaleFactor: 3,
  // screen is optional and not needed for screenshot capture
});
```

### 6.3 Device Scale Factor (DPR) Impact

| DPR | Screenshot Size | Use Case |
|-----|-----------------|----------|
| 1 | 1:1 with viewport | Desktop monitors |
| 2 | 2x viewport size | Retina/HiDPI displays |
| 3 | 3x viewport size | Modern phones |

By default, `screenshot()` captures at device resolution. For consistent file sizes, use `scale: 'css'`:

```typescript
// Captures at 1:1 CSS pixels regardless of deviceScaleFactor
await page.screenshot({ fullPage: true, scale: 'css' });

// Captures at full device resolution (DPR applied)
await page.screenshot({ fullPage: true, scale: 'device' });
```

### 6.4 Complete Device Context Example

```typescript
import { Browser, BrowserContext, Page } from 'playwright';
import type { Device } from '../devices/types.js';

interface ContextWithPage {
  context: BrowserContext;
  page: Page;
}

async function createDeviceSession(
  browser: Browser,
  device: Device
): Promise<ContextWithPage> {
  const context = await browser.newContext({
    viewport: {
      width: device.width,
      height: device.height,
    },
    deviceScaleFactor: device.deviceScaleFactor,
    userAgent: device.userAgent,
    // Mobile-specific options for phones
    isMobile: device.category === 'phones',
    hasTouch: device.category !== 'pc-laptops',
  });

  const page = await context.newPage();

  // Set navigation timeout for this page
  page.setDefaultNavigationTimeout(30000);

  return { context, page };
}
```

### 6.5 Category-Based Configuration

Our Device type already includes `category`. Use it for smart defaults:

```typescript
function getContextOptions(device: Device) {
  const base = {
    viewport: { width: device.width, height: device.height },
    deviceScaleFactor: device.deviceScaleFactor,
  };

  switch (device.category) {
    case 'phones':
      return {
        ...base,
        isMobile: true,
        hasTouch: true,
      };
    case 'tablets':
      return {
        ...base,
        isMobile: false,  // Tablets don't use mobile viewport meta
        hasTouch: true,
      };
    case 'pc-laptops':
      return {
        ...base,
        isMobile: false,
        hasTouch: false,
      };
  }
}
```

---

## 7. Implementation Recommendations

### 7.1 Proposed File Structure

```
src/engine/
  types.ts       # Already exists - add additional types
  browser.ts     # BrowserManager class (enhance skeleton)
  capturer.ts    # Screenshot capture logic (implement)
  index.ts       # Public exports
```

### 7.2 Key Types to Add

```typescript
// src/engine/types.ts (additions)

export interface BrowserManagerOptions {
  headless?: boolean;  // Default true
}

export interface NavigationOptions {
  timeout?: number;      // Default 30000
  waitUntil?: 'networkidle' | 'load' | 'domcontentloaded';
}

export interface ScreenshotOptions {
  fullPage?: boolean;    // Default true
  scale?: 'css' | 'device';
  timeout?: number;
}
```

### 7.3 BrowserManager Interface

```typescript
interface IBrowserManager {
  launch(): Promise<Browser>;
  createContext(device: Device): Promise<BrowserContext>;
  close(): Promise<void>;
  isLaunched(): boolean;
}
```

### 7.4 Capturer Interface

```typescript
interface ICapturer {
  capture(options: CaptureOptions): Promise<ScreenshotResult>;
}
```

### 7.5 Error Handling Strategy

Define custom error types for clear error categorization:

```typescript
export class NavigationError extends Error {
  constructor(
    public readonly url: string,
    public readonly cause: Error
  ) {
    super(`Failed to navigate to ${url}: ${cause.message}`);
    this.name = 'NavigationError';
  }
}

export class ScreenshotError extends Error {
  constructor(
    public readonly deviceName: string,
    public readonly cause: Error
  ) {
    super(`Screenshot failed for ${deviceName}: ${cause.message}`);
    this.name = 'ScreenshotError';
  }
}

export class TimeoutError extends Error {
  constructor(
    public readonly operation: 'navigation' | 'screenshot',
    public readonly timeoutMs: number
  ) {
    super(`${operation} timed out after ${timeoutMs}ms`);
    this.name = 'TimeoutError';
  }
}
```

---

## 8. Summary

### Requirements Coverage

| Requirement | Solution | Confidence |
|-------------|----------|------------|
| SHOT-01: Full-page screenshots | `page.screenshot({ fullPage: true })` | High |
| LOAD-01: Network idle wait | `page.goto(url, { waitUntil: 'networkidle' })` | High |
| LOAD-04: 30s max timeout | `timeout: 30000` on goto and screenshot | High |

### Key Decisions

1. **Single browser, multiple contexts**: Best performance with full isolation
2. **networkidle for page load**: Most reliable for unknown pages
3. **Split timeout budget**: 80% navigation, 20% screenshot
4. **Return Buffer, not file**: Flexible output handling
5. **CSS scale for screenshots**: Consistent file sizes across devices

### Ready for Planning

This research provides sufficient technical detail to create a comprehensive execution plan for Phase 3. The Playwright APIs are well-documented and the patterns are proven in production use.

---

## Sources

### Official Documentation
- [Playwright Screenshots](https://playwright.dev/docs/screenshots) - Screenshot API reference
- [Playwright Emulation](https://playwright.dev/docs/emulation) - Device emulation guide
- [Playwright Browser Contexts](https://playwright.dev/docs/browser-contexts) - Context isolation
- [Playwright Navigation](https://playwright.dev/docs/navigations) - Page loading strategies

### API Reference
- [Page.screenshot()](https://playwright.dev/docs/api/class-page#page-screenshot) - Full options reference
- [Page.goto()](https://playwright.dev/docs/api/class-page#page-goto) - Navigation options
- [Browser.newContext()](https://playwright.dev/docs/api/class-browser#browser-new-context) - Context creation
- [Page.setDefaultNavigationTimeout()](https://playwright.dev/docs/api/class-page#page-set-default-navigation-timeout) - Timeout configuration

### Context7 Queries
- `/microsoft/playwright` - Core Playwright documentation
- Device emulation patterns and context management
