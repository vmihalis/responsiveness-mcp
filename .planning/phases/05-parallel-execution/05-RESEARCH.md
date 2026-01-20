# Phase 5: Parallel Execution - Research

**Researched:** 2026-01-20
**Domain:** Concurrent async execution, retry logic, memory-bounded parallelism
**Confidence:** HIGH

## Summary

This phase implements concurrent screenshot captures with retry logic, building on the existing `captureScreenshot` function from Phase 4. The codebase already has `p-limit` v6.2.0 installed and `Config` includes `concurrency: 10` as the default.

The standard approach uses `p-limit` for concurrency control with `Promise.allSettled` to collect all results (including partial failures). Retry logic should be implemented inline rather than using p-retry, since our existing `captureScreenshot` already returns error results (not throwing), and retries need access to the device context.

**Primary recommendation:** Use p-limit with Promise.allSettled and inline retry loop. Create an `executor.ts` file with a `captureAllDevices` function that orchestrates parallel captures with configurable concurrency and retry count.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| p-limit | 6.2.0 | Concurrency limiting | Already installed, simple API, handles backpressure |
| Promise.allSettled | Built-in | Partial failure collection | Native, returns all results regardless of failures |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| p-retry | 7.x | Retry with exponential backoff | Complex retry scenarios with rate limiting |
| p-map | 7.x | Map with concurrency + stopOnError | When need AggregateError for all failures |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| p-limit + Promise.allSettled | p-map with stopOnError: false | p-map adds dependency, p-limit already installed |
| inline retry loop | p-retry | p-retry adds dependency, our function returns errors not throws |
| Promise.allSettled | Promise.all | Promise.all fails fast, loses successful results |

**Installation:**
```bash
# Already installed - no additional packages needed
npm install  # p-limit ^6.0.0 already in package.json
```

## Architecture Patterns

### Recommended Project Structure
```
src/engine/
├── browser.ts        # Existing: BrowserManager class
├── capturer.ts       # Existing: captureScreenshot function
├── executor.ts       # NEW: Parallel execution with retry
├── scroll.ts         # Existing: Lazy content scrolling
├── types.ts          # Existing + new types for execution
└── index.ts          # Export executor function
```

### Pattern 1: Concurrency-Limited Parallel Map

**What:** Use p-limit to create rate-limited wrapper functions around async operations
**When to use:** When you have many async tasks that should run N at a time

```typescript
// Source: https://github.com/sindresorhus/p-limit
import pLimit from 'p-limit';

const limit = pLimit(10); // 10 concurrent operations max

const devices: Device[] = getAllDevices();
const tasks = devices.map(device =>
  limit(() => captureWithRetry(manager, url, device, options))
);

const results = await Promise.allSettled(tasks);
```

### Pattern 2: Inline Retry with Attempt Counter

**What:** Simple retry loop with configurable attempts
**When to use:** When retry logic needs context (device, attempt number) and function returns errors instead of throwing

```typescript
// Pattern for retry when function returns { success, error } instead of throwing
async function captureWithRetry(
  manager: BrowserManager,
  url: string,
  device: Device,
  options: CaptureOptions,
  maxRetries: number = 3
): Promise<ScreenshotResult> {
  let lastResult: ScreenshotResult;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    lastResult = await captureScreenshot(manager, { ...options, url, device });

    if (lastResult.success) {
      return lastResult;
    }

    // Only retry on potentially transient errors
    if (!isRetryableError(lastResult.error) || attempt === maxRetries) {
      break;
    }

    // Brief delay before retry (not exponential - captures are slow already)
    await delay(500);
  }

  return lastResult!;
}
```

### Pattern 3: Promise.allSettled for Partial Failure Collection

**What:** Collect all results even when some fail
**When to use:** When partial success is acceptable and you need all results

```typescript
// Source: MDN Promise.allSettled documentation
const results = await Promise.allSettled(tasks);

const successes: ScreenshotResult[] = [];
const failures: ScreenshotResult[] = [];

for (const result of results) {
  if (result.status === 'fulfilled') {
    if (result.value.success) {
      successes.push(result.value);
    } else {
      failures.push(result.value);
    }
  } else {
    // Promise itself rejected (unexpected - our function returns errors)
    failures.push({
      success: false,
      deviceName: 'unknown',
      error: result.reason?.message || 'Unknown error'
    });
  }
}
```

### Anti-Patterns to Avoid

- **Promise.all with error-throwing functions:** Loses all successful results on first failure
- **Unbounded concurrency:** `Promise.all(devices.map(...))` without limit causes memory spikes
- **Retrying non-retryable errors:** 404s, invalid URLs should not be retried
- **Exponential backoff for browser operations:** Captures take 5-30s already; simple delay is sufficient
- **Creating new browser per retry:** Reuse existing BrowserManager; contexts are lightweight

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Concurrency limiting | Custom semaphore/queue | p-limit | Edge cases: queue cleanup, race conditions |
| Partial failure collection | Try/catch accumulator | Promise.allSettled | Native, handles all edge cases |
| Async map with limit | for loop with await batches | p-limit.map or tasks array | Batching is inefficient (waits for slowest in batch) |

**Key insight:** The "worker pool" pattern (continuously pulling from queue as workers finish) is what p-limit provides. Hand-rolled batching (`Promise.all(batch1).then(Promise.all(batch2))`) leaves workers idle while waiting for the slowest item in each batch.

## Common Pitfalls

### Pitfall 1: Memory Growth Under Parallel Load

**What goes wrong:** Creating 10+ browser contexts simultaneously causes memory spikes, especially with full-page screenshots on image-heavy pages.

**Why it happens:** Each context loads page content, maintains DOM, caches resources. Full-page screenshots buffer entire page in memory before writing.

**How to avoid:**
- Default concurrency of 10 is reasonable for most systems
- Context is closed immediately after screenshot in finally block (already implemented)
- Consider lowering concurrency for memory-constrained environments (1GB per concurrent context recommended)

**Warning signs:** Process memory exceeding 4GB, system swap usage, "JavaScript heap out of memory" errors.

### Pitfall 2: Retrying Non-Transient Errors

**What goes wrong:** Retrying DNS failures for misspelled domains, 404s for non-existent pages, or SSL errors wastes time.

**Why it happens:** All errors look the same to naive retry logic.

**How to avoid:** Categorize errors before retrying:
- **Retryable:** Timeout, network connection reset, temporary server errors (503)
- **Non-retryable:** DNS resolution failed, SSL certificate invalid, 404 Not Found, malformed URL

**Warning signs:** Same error message on all retry attempts, total capture time much longer than expected.

### Pitfall 3: Context/Resource Leaks on Retry

**What goes wrong:** Retrying creates new context but old failed context not cleaned up.

**Why it happens:** Error path doesn't close context before retry.

**How to avoid:** Our `captureScreenshot` already has `finally { closeContext() }` - retries call the complete function which handles cleanup internally.

**Warning signs:** `manager.getActiveContextCount()` growing over time, browser process memory not releasing.

### Pitfall 4: Lost Progress Information

**What goes wrong:** No visibility into which devices succeeded/failed, making debugging hard.

**Why it happens:** Only tracking final success/failure, not per-device results.

**How to avoid:** Return structured results array with device name, success status, error message, retry count for each device.

**Warning signs:** Users reporting "some devices failed" with no way to know which ones.

## Code Examples

Verified patterns from official sources:

### Complete Executor Implementation

```typescript
// src/engine/executor.ts
import pLimit from 'p-limit';
import type { BrowserManager } from './browser.js';
import { captureScreenshot } from './capturer.js';
import type { Device } from '../devices/types.js';
import type { CaptureOptions, ScreenshotResult } from './types.js';

/**
 * Options for parallel execution
 */
export interface ExecutionOptions {
  concurrency?: number;  // Default: 10
  maxRetries?: number;   // Default: 3
  retryDelay?: number;   // Default: 500ms
}

/**
 * Extended result with retry information
 */
export interface ExecutionResult extends ScreenshotResult {
  attempts: number;
}

/**
 * Aggregate results from parallel capture
 */
export interface CaptureAllResult {
  results: ExecutionResult[];
  successCount: number;
  failureCount: number;
  totalAttempts: number;
}

// Error patterns that should NOT trigger retry
const NON_RETRYABLE_PATTERNS = [
  'net::ERR_NAME_NOT_RESOLVED',  // DNS failure
  'net::ERR_CERT_',              // SSL/certificate errors
  'invalid url',                  // Malformed URL
  '404',                          // Page not found
  '403',                          // Forbidden
  '401',                          // Unauthorized
];

function isRetryableError(error?: string): boolean {
  if (!error) return false;
  const lowerError = error.toLowerCase();
  return !NON_RETRYABLE_PATTERNS.some(pattern =>
    lowerError.includes(pattern.toLowerCase())
  );
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Capture screenshot with retry logic
 */
async function captureWithRetry(
  manager: BrowserManager,
  options: CaptureOptions,
  maxRetries: number,
  retryDelay: number
): Promise<ExecutionResult> {
  let lastResult: ScreenshotResult | undefined;
  let attempts = 0;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    attempts = attempt;
    lastResult = await captureScreenshot(manager, options);

    if (lastResult.success) {
      return { ...lastResult, attempts };
    }

    // Don't retry non-transient errors or on last attempt
    if (!isRetryableError(lastResult.error) || attempt === maxRetries) {
      break;
    }

    // Brief delay before retry
    await delay(retryDelay);
  }

  return { ...lastResult!, attempts };
}

/**
 * Capture screenshots for all devices in parallel with retry logic
 *
 * @param manager - BrowserManager instance (shared across all captures)
 * @param url - URL to capture
 * @param devices - Array of devices to capture
 * @param captureOptions - Options for each capture (timeout, waitBuffer, etc.)
 * @param executionOptions - Parallel execution options (concurrency, retries)
 */
export async function captureAllDevices(
  manager: BrowserManager,
  url: string,
  devices: Device[],
  captureOptions: Omit<CaptureOptions, 'url' | 'device'>,
  executionOptions: ExecutionOptions = {}
): Promise<CaptureAllResult> {
  const {
    concurrency = 10,
    maxRetries = 3,
    retryDelay = 500,
  } = executionOptions;

  const limit = pLimit(concurrency);

  // Create concurrency-limited tasks
  const tasks = devices.map(device =>
    limit(() => captureWithRetry(
      manager,
      { ...captureOptions, url, device },
      maxRetries,
      retryDelay
    ))
  );

  // Execute all tasks, collecting results even on failures
  const settled = await Promise.allSettled(tasks);

  // Process results
  const results: ExecutionResult[] = [];
  let successCount = 0;
  let failureCount = 0;
  let totalAttempts = 0;

  for (let i = 0; i < settled.length; i++) {
    const result = settled[i];

    if (result.status === 'fulfilled') {
      results.push(result.value);
      totalAttempts += result.value.attempts;

      if (result.value.success) {
        successCount++;
      } else {
        failureCount++;
      }
    } else {
      // Promise rejected (unexpected - our function returns errors)
      const device = devices[i];
      results.push({
        success: false,
        deviceName: device.name,
        error: result.reason?.message || 'Unknown error',
        attempts: 1,
      });
      failureCount++;
      totalAttempts++;
    }
  }

  return {
    results,
    successCount,
    failureCount,
    totalAttempts,
  };
}
```

### Using limit.map for Cleaner Syntax

```typescript
// Alternative using p-limit's built-in map method
// Source: https://github.com/sindresorhus/p-limit
import pLimit from 'p-limit';

const limit = pLimit(10);

// limit.map returns Promise equivalent to Promise.all with limited concurrency
const results = await limit.map(devices, async (device, index) => {
  return captureWithRetry(manager, { ...options, device }, maxRetries, retryDelay);
});
```

### Progress Callback Pattern

```typescript
// Optional: Add progress callback for CLI feedback
export interface ExecutionOptions {
  concurrency?: number;
  maxRetries?: number;
  retryDelay?: number;
  onProgress?: (completed: number, total: number, result: ExecutionResult) => void;
}

// Inside captureAllDevices:
const tasks = devices.map((device, index) =>
  limit(async () => {
    const result = await captureWithRetry(/* ... */);
    executionOptions.onProgress?.(index + 1, devices.length, result);
    return result;
  })
);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Promise.all batching | p-limit continuous queue | 2018+ | 2-3x faster for heterogeneous task durations |
| External retry libraries | Inline retry for simple cases | 2020+ | Fewer dependencies, more control |
| Promise.all + catch | Promise.allSettled | ES2020 | Cleaner partial failure handling |

**Deprecated/outdated:**
- `async.parallelLimit`: Replaced by p-limit, simpler API
- `bluebird.map({ concurrency })`: Native promises sufficient now
- Batch-then-wait pattern: Inefficient compared to worker pool

## Open Questions

Things that couldn't be fully resolved:

1. **Optimal retry delay for browser operations**
   - What we know: 500ms is common for API retries
   - What's unclear: Whether longer delay helps browser recover from transient issues
   - Recommendation: Start with 500ms, make configurable

2. **Memory threshold for lowering concurrency automatically**
   - What we know: 1GB per context is recommended baseline
   - What's unclear: How to reliably detect memory pressure in Node.js
   - Recommendation: Document manual concurrency tuning, defer auto-scaling

3. **Retry behavior on partial page load**
   - What we know: Timeout during scroll phase still returns error
   - What's unclear: Whether to retry or accept partial capture
   - Recommendation: Retry on timeout, document behavior

## Sources

### Primary (HIGH confidence)
- [p-limit GitHub](https://github.com/sindresorhus/p-limit) - API documentation, .map method, version 7.2.0
- [MDN Promise.allSettled](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled) - Partial failure handling

### Secondary (MEDIUM confidence)
- [p-retry GitHub](https://github.com/sindresorhus/p-retry) - Retry patterns, AbortError concept
- [BrowserStack Playwright Guide](https://www.browserstack.com/guide/playwright-browser-context) - Context vs browser instances
- [Playwright Memory Issues](https://github.com/microsoft/playwright/issues/6319) - Context cleanup patterns

### Tertiary (LOW confidence)
- [Medium: Controlled Concurrency with Retries](https://medium.com/@sonishubham65/controlled-concurrency-with-retries-in-node-js-using-p-limit-063159ab8478) - Combined pattern examples (paywalled, not fully verified)
- [WebScraping.AI Playwright best practices](https://webscraping.ai/faq/playwright/what-are-the-memory-management-best-practices-when-running-long-playwright-sessions) - Memory management suggestions

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - p-limit already installed, patterns well-documented
- Architecture: HIGH - Clear pattern from p-limit docs, matches existing codebase style
- Retry logic: MEDIUM - Simple pattern is clear, edge cases need testing
- Memory bounds: MEDIUM - General guidance available, specific thresholds vary by system

**Research date:** 2026-01-20
**Valid until:** 2026-03-20 (60 days - stable domain, mature libraries)
