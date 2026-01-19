# Pitfalls Research

Research into common mistakes and pitfalls when building browser automation screenshot tools, specifically for responsive design testing across 50+ device dimensions.

---

## Critical Pitfalls

These are major mistakes that cause project failure or require significant rework.

### 1. Environment Inconsistency Causing Non-Deterministic Screenshots

**The Problem**: Screenshots differ between local development and CI/CD, or between runs, due to GPU drivers, browser versions, OS rendering differences, font smoothing variations, and headless mode quirks.

**Warning Signs**:
- Screenshots pass locally but fail in CI
- Subtle pixel differences in text rendering across runs
- Font weights appearing bolder/lighter on different machines
- Anti-aliasing variations causing image diff failures

**Prevention Strategy**:
- Run all screenshot operations in a consistent Docker container with pinned browser versions
- Use `-webkit-font-smoothing: antialiased` and `-moz-osx-font-smoothing: grayscale` via injected CSS to normalize font rendering
- Always run in headless mode for consistency (headless rendering is more deterministic)
- Pin Playwright/Chromium versions explicitly in package.json

**Phase to Address**: Phase 1 (Core Infrastructure) - Must establish containerized environment from day one.

---

### 2. Font Loading Causing Indefinite Hangs/Timeouts

**The Problem**: Playwright's `page.screenshot()` waits for custom fonts to load by default. If fonts fail to load (network issues, CORS, slow CDN), screenshots hang indefinitely or timeout after 30+ seconds.

**Warning Signs**:
- Intermittent "Timeout 30000ms exceeded" errors on specific URLs
- Screenshots work on some sites but hang on others
- CI runs taking 10x longer than expected
- Memory exhaustion from accumulated hanging processes

**Prevention Strategy**:
- Set `process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY = "1"` to bypass font waiting
- Implement per-screenshot timeout with fallback behavior
- Use `waitUntil: 'domcontentloaded'` instead of `'load'` or `'networkidle'`
- Add circuit breaker pattern: if 3 screenshots timeout consecutively, mark URL as problematic

**Phase to Address**: Phase 2 (Screenshot Engine) - Core screenshot logic must handle this.

---

### 3. Using Wrong Screenshot Method (`page.screenshot` vs `toHaveScreenshot`)

**The Problem**: Using `page.screenshot()` directly is fragile. It captures a single moment that may include mid-paint states, partially loaded content, or animation frames. Playwright's `expect(page).toHaveScreenshot()` auto-retries until consecutive screenshots match.

**Warning Signs**:
- Flaky screenshots that differ slightly each run
- Screenshots capturing half-rendered states
- Animations frozen mid-frame
- Layout shifts captured inconsistently

**Prevention Strategy**:
- Wrap screenshot logic to take 2-3 consecutive screenshots and verify they're identical before accepting
- Disable all CSS animations before capture: `animations: 'disabled'`
- Hide text carets: `caret: 'hide'`
- Wait for `networkidle` first, then take screenshot with animation disabled

**Phase to Address**: Phase 2 (Screenshot Engine) - This is fundamental to screenshot reliability.

---

### 4. Lazy Loading Content Missing from Full-Page Screenshots

**The Problem**: Full-page screenshots don't trigger lazy-loaded images or content below the fold. The screenshot captures placeholders or empty spaces where images should be.

**Warning Signs**:
- Full-page screenshots showing blank image placeholders
- Content appearing in browser but missing in screenshots
- Screenshots of different heights on same page between runs
- "Cropped" screenshots due to layout shifts during capture

**Prevention Strategy**:
- Scroll incrementally through entire page before capturing (one viewport at a time)
- Wait for lazy-loaded content after each scroll step
- Set hard limit on scroll iterations to prevent infinite scroll loops
- Use `scroll-to-bottomjs` npm package for promise-aware scrolling
- Capture `document.body.scrollHeight` AFTER scrolling completes

**Phase to Address**: Phase 2 (Screenshot Engine) - Must be built into full-page capture logic.

---

### 5. Parallel Browser Instances Exhausting Memory

**The Problem**: Running 50+ device dimensions in parallel spawns too many browser contexts/pages, causing memory exhaustion, OOM kills, and system instability.

**Warning Signs**:
- Process killed by OOM on CI
- Screenshots hanging at random points
- System swap usage spiking
- Intermittent crashes with no clear pattern

**Prevention Strategy**:
- Use `BrowserContext` (lightweight) instead of new browser instances
- Implement semaphore/queue to limit concurrent contexts (4-8 max depending on RAM)
- Close contexts immediately after use (`await context.close()`)
- Monitor memory usage and dynamically throttle if approaching limits
- Reuse single browser instance with multiple contexts rather than multiple browsers

**Phase to Address**: Phase 3 (Parallel Execution) - Critical for scalability.

---

## Common Mistakes

These cause delays, rework, or degraded user experience but won't kill the project.

### 6. Hardcoding Wait Times Instead of Smart Waiting

**The Problem**: Using `page.waitForTimeout(5000)` is brittle. It either waits too long (slow) or not long enough (flaky).

**Warning Signs**:
- Tests taking 5+ minutes for simple pages
- Flaky failures that "fix themselves" when timeout increased
- Different URLs requiring different timeout values
- Code full of magic number wait times

**Prevention Strategy**:
- Use auto-waiting assertions: `await page.waitForSelector('.content')`
- Combine multiple conditions: wait for network idle AND key elements visible
- Implement adaptive waiting: start short, extend if needed
- Never use `waitForTimeout` in production code

**Phase to Address**: Phase 2 (Screenshot Engine).

---

### 7. Not Handling Cookie Banners/Popups/Modals

**The Problem**: Cookie consent banners, newsletter popups, and chat widgets overlay the page, ruining screenshots and blocking content.

**Warning Signs**:
- Screenshots dominated by "Accept Cookies" banners
- Inconsistent screenshots (popup appears sometimes)
- Key content hidden behind overlays
- Different popups on different device sizes

**Prevention Strategy**:
- Inject CSS to hide common overlay selectors (`.cookie-banner`, `#consent-popup`, etc.)
- Implement configurable "dismiss overlay" step before screenshot
- Use `page.addStyleTag()` to hide elements by class pattern
- Allow user-provided CSS overrides for specific sites

**Phase to Address**: Phase 2 (Screenshot Engine) - Should be configurable option.

---

### 8. Poor Error Messages and Debugging Information

**The Problem**: When screenshots fail, users get cryptic errors with no actionable information about what went wrong or how to fix it.

**Warning Signs**:
- Users complaining they can't understand failures
- Support requests for "why did this fail?"
- Developers spending hours debugging simple issues
- Same problems recurring because root cause unclear

**Prevention Strategy**:
- Enable Playwright tracing for failures: `trace: 'on-first-retry'`
- Capture HTML snapshot on failure for debugging
- Include viewport size, URL, and timestamp in error messages
- Generate failure report with partial screenshots showing what was captured
- Log network requests that timed out or failed

**Phase to Address**: Phase 5 (HTML Report) - But error handling should be in Phase 2.

---

### 9. Not Accounting for Device Pixel Ratio (DPR)

**The Problem**: High-DPI devices (Retina, modern phones) have 2x or 3x pixel ratios. Screenshots without proper DPR settings are blurry or wrong size.

**Warning Signs**:
- Screenshots appear half the expected resolution
- Mobile screenshots look desktop-quality (not scaled)
- Images appear blurry when viewed
- File sizes much smaller than expected

**Prevention Strategy**:
- Set `deviceScaleFactor` appropriately for each device (usually 2 for phones/tablets, 1 for desktop)
- Use Playwright's built-in device descriptors which include correct DPR
- Document that output images will be 2x/3x dimensions for high-DPI devices
- Allow configuration to force 1x for smaller file sizes if desired

**Phase to Address**: Phase 2 (Screenshot Engine).

---

### 10. Ignoring Scroll Bar Variations

**The Problem**: Scrollbars render differently across platforms (thick on Windows, invisible overlay on macOS, visible on Linux). This causes screenshot inconsistencies.

**Warning Signs**:
- Screenshots slightly different widths across platforms
- Content pushed left on some systems
- Visual diff failures from scrollbar presence/absence

**Prevention Strategy**:
- Inject CSS to hide scrollbars: `::-webkit-scrollbar { display: none; }`
- Or use CSS `scrollbar-width: none` for Firefox
- Standardize on hiding scrollbars for consistent output

**Phase to Address**: Phase 2 (Screenshot Engine).

---

### 11. Not Validating URL Input Properly

**The Problem**: Users provide malformed URLs, localhost addresses that aren't accessible, or URLs requiring authentication.

**Warning Signs**:
- Cryptic DNS resolution errors
- Screenshots of error pages captured as "successful"
- Tool hanging on unreachable URLs
- Security vulnerabilities from SSRF

**Prevention Strategy**:
- Validate URL format before processing
- Implement timeout for initial page load
- Detect error pages (4xx, 5xx) and report clearly
- Consider blocking private IP ranges to prevent SSRF
- Support optional basic auth header configuration

**Phase to Address**: Phase 1 (CLI Interface).

---

## Performance Gotchas

These silently kill performance, often not noticed until scale.

### 12. Image Diffing Algorithm Choice

**The Problem**: Pixelmatch (default in many tools) is pure JavaScript and doesn't scale. Processing 50+ full-page screenshots (potentially 18M+ pixels each) becomes extremely slow.

**Warning Signs**:
- Image comparison taking 7+ seconds per screenshot
- CI runs taking 48+ hours for full visual regression suite
- CPU maxed out during comparison phase
- Reports taking minutes to generate

**Prevention Strategy**:
- Use ODiff (SIMD-optimized, written in Zig) for comparison
- Or use Honeydiff (claims 12x faster than alternatives)
- Process comparisons in parallel batches
- Consider skipping comparison for initial baseline generation

**Phase to Address**: Phase 5 (HTML Report) - If including comparison features.

---

### 13. Writing Screenshots to Disk Synchronously

**The Problem**: Writing 50+ full-page PNG files (potentially 5-10MB each) sequentially creates massive I/O bottleneck.

**Warning Signs**:
- Disk I/O at 100% while CPU is idle
- SSD performing like HDD
- Screenshots captured fast but saving takes forever
- Memory filling up with pending writes

**Prevention Strategy**:
- Buffer screenshots in memory, write in parallel batch at end
- Use streaming writes where possible
- Consider writing to RAM disk for temporary files
- Compress PNGs in parallel using worker threads

**Phase to Address**: Phase 3 (Parallel Execution) - Part of parallelization strategy.

---

### 14. Creating New Browser Instance Per Screenshot

**The Problem**: Browser startup takes 1-2 seconds. For 50 screenshots, that's 50-100 seconds just in browser launches.

**Warning Signs**:
- First screenshot fast, subsequent screenshots also have startup delay
- High CPU usage from repeated browser initialization
- Memory never freed between screenshots

**Prevention Strategy**:
- Launch browser once, reuse with multiple contexts
- Contexts share browser process, are lightweight to create
- Only create new browser if context limit reached or crash detected
- Implement browser health check and restart if needed

**Phase to Address**: Phase 2 (Screenshot Engine) - Architecture decision.

---

### 15. Not Blocking Unnecessary Resources

**The Problem**: Loading ads, analytics, third-party widgets adds seconds to each page load. For 50+ screenshots, this accumulates to minutes.

**Warning Signs**:
- Pages taking 10+ seconds to reach networkidle
- External requests to ad networks visible in logs
- Inconsistent load times between runs
- Screenshots including ad content

**Prevention Strategy**:
- Block known ad/tracking domains via `route.abort()`
- Block resource types not needed: `document`, `stylesheet`, `script` may be needed; `image` sometimes optional
- Use Puppeteer-extra stealth plugin patterns for ad blocking
- Allow configurable blocklist for user-specific needs

**Phase to Address**: Phase 2 (Screenshot Engine).

---

### 16. Unbounded Parallel Execution

**The Problem**: Running all 50+ screenshots truly in parallel overwhelms system resources, causing all to fail rather than some to succeed.

**Warning Signs**:
- "Works fine for 5 devices, crashes for 50"
- Memory usage spikes to 100% then crash
- All screenshots fail simultaneously
- Inconsistent failures at different points

**Prevention Strategy**:
- Use p-limit or similar to cap concurrent operations
- Calculate safe parallelism based on available RAM: `Math.min(cpuCount, totalRAM / 500MB)`
- Implement backpressure: slow down if memory approaching limit
- Log parallelism level for debugging

**Phase to Address**: Phase 3 (Parallel Execution).

---

## Prevention Strategies Summary

| Pitfall | Prevention | Phase |
|---------|------------|-------|
| Environment inconsistency | Docker, pinned versions, normalized fonts | 1 |
| Font loading hangs | Bypass font waiting, DOM-ready wait | 2 |
| Wrong screenshot method | Consecutive matching, disable animations | 2 |
| Lazy loading misses | Scroll-to-load before capture | 2 |
| Memory exhaustion | Context pooling, semaphore limits | 3 |
| Hardcoded waits | Smart waiting, auto-retry | 2 |
| Popups/overlays | CSS injection, dismissal scripts | 2 |
| Poor error messages | Tracing, HTML snapshots, logs | 2, 5 |
| Device pixel ratio | Use device descriptors with DPR | 2 |
| Scrollbar variations | CSS to hide scrollbars | 2 |
| URL validation | Input validation, timeout, error detection | 1 |
| Slow image diffing | ODiff or similar optimized library | 5 |
| Sync disk writes | Parallel writes, memory buffering | 3 |
| Browser per screenshot | Single browser, multiple contexts | 2 |
| Loading unnecessary resources | Request interception, blocklists | 2 |
| Unbounded parallelism | Semaphore, resource-based limits | 3 |

---

## Sources

### Playwright Best Practices
- [9 Playwright Best Practices and Pitfalls to Avoid](https://betterstack.com/community/guides/testing/playwright-best-practices/)
- [11 Pivotal Best Practices for Playwright](https://autify.com/blog/playwright-best-practices)
- [Lessons From My 428-Day Battle Against Flaky Playwright Screenshots](https://turntrout.com/playwright-tips)
- [Problematic Playwright Pitfalls](https://momentic.ai/blog/playwright-pitfalls)

### Screenshot Flakiness
- [Stabilize Flaky Tests for Visual Testing](https://argos-ci.com/blog/screenshot-stabilization)
- [Flaky Visual Regression Tests, and what to do about them](https://www.shakacode.com/blog/flaky-visual-regression-tests-and-what-to-do-about-them/)
- [Full Page Screenshot Guide](https://screenshotone.com/blog/a-complete-guide-on-how-to-take-full-page-screenshots-with-puppeteer-playwright-or-selenium/)

### Lazy Loading
- [Is there any good solution for making fullpage screenshots on lazy load pages?](https://github.com/microsoft/playwright/issues/19861)
- [Handle Pages that implement Lazy Loading](https://www.browserstack.com/docs/percy/stabilize-screenshots/lazy-loading)

### Performance & Parallelism
- [Advanced Playwright Patterns: Parallel Testing and Resource Management](https://medium.com/@peyman.iravani/advanced-playwright-patterns-parallel-testing-and-resource-management-3e4e71e09801)
- [Scale Web Scraping With Playwright BrowserContext](https://www.zenrows.com/blog/playwright-browsercontext)
- [Why our visual regression is so slow?](https://dev.to/dmtrkovalenko/why-our-visual-regression-is-so-slow-33dn)

### Image Diffing
- [The Fastest Image Diffing Engine You've Never Heard Of](https://vizzly.dev/blog/honeydiff-vs-odiff-pixelmatch-benchmarks/)
- [ODiff - Fast SIMD-first image comparison library](https://github.com/dmtrKovalenko/odiff)

### Font Rendering
- [Achieve consistent font rendering between different platforms](https://github.com/puppeteer/puppeteer/issues/661)
- [Techniques for Anti-Aliasing @font-face on Windows](https://gist.github.com/dalethedeveloper/1846552)

### Timeout Handling
- [How to Handle a Playwright Timeout](https://autify.com/blog/playwright-timeout)
- [page.screenshot: Timeout 30000ms exceeded](https://github.com/microsoft/playwright/issues/27893)

### Visual Regression Strategy
- [Automated Visual Regression Testing: From Implementation to Tools](https://medium.com/@david-auerbach/automated-visual-regression-testing-from-implementation-to-tools-dcb3c75ce76d)
- [Ultimate Visual Regression Testing Guide](https://medium.com/lost-pixel/ultimate-visual-regression-testing-guide-2024-93d73aff3c62)
