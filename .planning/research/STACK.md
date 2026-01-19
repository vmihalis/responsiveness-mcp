# Stack Research

## Project Context
Building a CLI tool for responsive screenshot capture:
- Takes URL + page path as input
- Captures full-page screenshots at 50+ device dimensions
- Organizes into phones/tablets/pc-laptops folders
- Generates HTML report for quick review
- Runs in parallel for speed
- Uses Chrome/Chromium

---

## Recommended Stack

### Runtime & Language
| Component | Choice | Version | Rationale |
|-----------|--------|---------|-----------|
| Runtime | **Node.js** | 20 LTS or 22 LTS | Native async/await, excellent Playwright support, fast startup |
| Language | **TypeScript** | ^5.4 | Type safety for device configs, better IDE support, catches errors early |

**Confidence: HIGH**

---

### Browser Automation
| Component | Choice | Version | Rationale |
|-----------|--------|---------|-----------|
| Automation | **Playwright** | ^1.51 | Industry standard 2025, built-in device registry, native parallel contexts |

**Why Playwright over Puppeteer:**
1. **Built-in device registry** - `playwright.devices` has 100+ predefined phone/tablet/desktop configs (iPhone 15, Pixel 7, iPad, etc.)
2. **Native parallel browser contexts** - Isolated contexts share browser instance, 3-5x faster than spawning browsers
3. **Better full-page screenshots** - Handles lazy-loaded content, sticky headers, infinite scroll
4. **Auto-wait mechanisms** - No manual `waitForNetworkIdle` tuning needed
5. **Single API for Chromium/Firefox/WebKit** - Future flexibility
6. **Active Microsoft backing** - Frequent updates, better long-term support

```typescript
// Playwright's killer feature for this project
import { chromium, devices } from 'playwright';

const iPhone15 = devices['iPhone 15 Pro'];
const context = await browser.newContext({ ...iPhone15 });
await page.screenshot({ fullPage: true });
```

**Confidence: HIGH**

---

### CLI Framework
| Component | Choice | Version | Rationale |
|-----------|--------|---------|-----------|
| CLI Parser | **Commander.js** | ^12.0 | Most popular, excellent TypeScript support, simple API |

**Why Commander over Yargs:**
1. Cleaner, more intuitive API for simple CLIs
2. Better TypeScript inference out of the box
3. Lighter weight (this isn't a complex multi-command CLI)
4. More straightforward subcommand handling

```typescript
import { program } from 'commander';

program
  .argument('<url>', 'Base URL to capture')
  .option('-p, --pages <paths...>', 'Page paths to capture', ['/'])
  .option('-o, --output <dir>', 'Output directory', './screenshots')
  .option('-c, --concurrency <num>', 'Parallel captures', '4')
  .parse();
```

**Confidence: HIGH**

---

### Parallel Processing
| Component | Choice | Version | Rationale |
|-----------|--------|---------|-----------|
| Concurrency | **p-limit** | ^6.0 | Battle-tested, simple API, handles backpressure |

**Why p-limit:**
1. Minimal API - just wrap async functions
2. Handles memory pressure from 50+ concurrent screenshots
3. 1.2KB gzipped - no bloat
4. Works perfectly with Promise.all patterns

```typescript
import pLimit from 'p-limit';

const limit = pLimit(4); // 4 concurrent screenshots
const tasks = devices.map(device =>
  limit(() => captureScreenshot(url, device))
);
await Promise.all(tasks);
```

**Alternative considered:** `p-queue` - More features but overkill for this use case.

**Confidence: HIGH**

---

### Build & Development
| Component | Choice | Version | Rationale |
|-----------|--------|---------|-----------|
| Bundler | **tsup** | ^8.0 | Zero-config TypeScript bundling, esbuild under hood |
| Dev Runner | **tsx** | ^4.0 | Fast TypeScript execution without build step |

**Why tsup:**
1. Zero config for CLI tools - just works
2. Generates `.d.ts` files automatically
3. ESM + CJS dual output if needed
4. Tree-shaking built-in
5. 10-50x faster than tsc

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  target: 'node20',
  shims: true,
});
```

**Confidence: HIGH**

---

### HTML Report Generation
| Component | Choice | Version | Rationale |
|-----------|--------|---------|-----------|
| Templating | **Custom (no deps)** | N/A | Simple HTML string templates, no external dependency needed |

**Rationale:** For a screenshot gallery report, we don't need a full templating engine. A simple TypeScript function generating HTML strings is:
1. Zero dependencies
2. Type-safe
3. Fast to render
4. Easy to customize

```typescript
function generateReport(screenshots: Screenshot[]): string {
  return `<!DOCTYPE html>
<html>
<head>
  <title>Responsive Screenshots</title>
  <style>
    .gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); }
    .device-group { margin: 2rem 0; }
    img { max-width: 100%; border: 1px solid #ddd; }
  </style>
</head>
<body>
  ${screenshots.map(s => `<img src="${s.path}" alt="${s.device}">`).join('\n')}
</body>
</html>`;
}
```

**Alternative considered:** `ejs`, `handlebars` - Unnecessary complexity for static HTML generation.

**Confidence: HIGH**

---

### File System & Utilities
| Component | Choice | Version | Rationale |
|-----------|--------|---------|-----------|
| FS Operations | **Node.js fs/promises** | Built-in | Native, async, no deps |
| Path Handling | **Node.js path** | Built-in | Cross-platform path handling |
| Progress Display | **ora** | ^8.0 | Beautiful spinners, minimal API |
| Colors | **picocolors** | ^1.0 | Fastest, smallest terminal colors |

**Confidence: HIGH**

---

### Device Definitions Strategy

**Use Playwright's built-in registry + custom additions:**

```typescript
import { devices } from 'playwright';

// Playwright provides 100+ devices. Cherry-pick relevant ones:
const PHONE_DEVICES = [
  'iPhone 15 Pro',
  'iPhone 15 Pro Max',
  'iPhone 14',
  'iPhone SE',
  'Pixel 7',
  'Pixel 5',
  'Galaxy S23',
  'Galaxy S21',
];

const TABLET_DEVICES = [
  'iPad Pro 11',
  'iPad Mini',
  'Galaxy Tab S8',
];

const DESKTOP_VIEWPORTS = [
  { name: 'Desktop 1080p', viewport: { width: 1920, height: 1080 } },
  { name: 'Desktop 1440p', viewport: { width: 2560, height: 1440 } },
  { name: 'Laptop', viewport: { width: 1366, height: 768 } },
  { name: 'MacBook Pro 14', viewport: { width: 1512, height: 982 } },
];
```

**Confidence: HIGH**

---

## Complete package.json

```json
{
  "name": "responsiveness-mcp",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "responsive-capture": "./dist/cli.js"
  },
  "scripts": {
    "dev": "tsx src/cli.ts",
    "build": "tsup",
    "postinstall": "playwright install chromium"
  },
  "dependencies": {
    "playwright": "^1.51.0",
    "commander": "^12.0.0",
    "p-limit": "^6.0.0",
    "ora": "^8.0.0",
    "picocolors": "^1.0.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "tsup": "^8.0.0",
    "tsx": "^4.0.0",
    "@types/node": "^20.0.0"
  },
  "engines": {
    "node": ">=20"
  }
}
```

---

## Alternatives Considered

### Browser Automation

| Library | Why Not Chosen |
|---------|----------------|
| **Puppeteer** | No built-in device registry, weaker parallel context support, Chrome-only focus |
| **Selenium** | Heavy, slow, requires separate driver management |
| **Cypress** | Testing-focused, not designed for screenshot automation |
| **capture-website** | Wrapper around Puppeteer, less control |

### CLI Frameworks

| Library | Why Not Chosen |
|---------|----------------|
| **Yargs** | More complex API, heavier, better for complex multi-command CLIs |
| **oclif** | Enterprise-grade, massive overkill for single-purpose CLI |
| **cac** | Less popular, smaller ecosystem |
| **meow** | Too minimal, missing features we need |

### Concurrency

| Library | Why Not Chosen |
|---------|----------------|
| **p-queue** | More features than needed (priority, rate limiting) |
| **bottleneck** | Designed for rate limiting, not just concurrency |
| **async.parallelLimit** | Callback-based legacy API |
| **worker_threads** | Overkill - Playwright handles parallelism internally |

### Build Tools

| Tool | Why Not Chosen |
|------|----------------|
| **esbuild (direct)** | No TypeScript declaration generation, manual config |
| **Rollup** | More config, slower, designed for libraries |
| **Vite** | Designed for web apps, not CLI tools |
| **tsc** | 10-50x slower, no bundling |
| **swc** | Good but tsup already uses esbuild effectively |

---

## What to Avoid

### Libraries to Skip

| Library | Reason |
|---------|--------|
| **puppeteer-extra** | Stealth plugins irrelevant for screenshot capture |
| **nightmare.js** | Deprecated, unmaintained |
| **phantomjs** | Dead project |
| **html-pdf** | Different use case (HTML to PDF, not screenshots) |
| **node-html-to-image** | Uses Puppeteer internally, less control |
| **any templating engine** | Overkill for simple HTML report |

### Patterns to Avoid

1. **Spawning new browser per screenshot** - Use browser contexts instead (10x faster)
2. **Sequential screenshot capture** - Always use controlled concurrency
3. **Hardcoded device dimensions** - Use Playwright's device registry
4. **waitForTimeout() delays** - Use proper waitForLoadState/waitForNetworkIdle
5. **Synchronous file operations** - Always use fs/promises
6. **Custom viewport calculations** - Trust Playwright's device descriptors

### Architecture Anti-patterns

1. **Worker threads for parallelism** - Playwright browser contexts handle this better
2. **Microservices approach** - This is a simple CLI tool, keep it monolithic
3. **Configuration file complexity** - CLI args + sensible defaults are sufficient
4. **Plugin architecture** - Unnecessary complexity for focused tool

---

## Confidence Levels Summary

| Component | Confidence | Notes |
|-----------|------------|-------|
| Node.js 20+ | HIGH | Industry standard, LTS support |
| TypeScript 5.4+ | HIGH | Essential for maintainability |
| Playwright 1.51+ | HIGH | Clear winner over Puppeteer for this use case |
| Commander 12+ | HIGH | Simple, well-documented, TypeScript-first |
| p-limit 6+ | HIGH | Battle-tested, minimal API |
| tsup 8+ | HIGH | Best TypeScript CLI bundler |
| tsx 4+ | HIGH | Best dev experience |
| ora + picocolors | HIGH | Standard CLI UX tools |
| Custom HTML templates | HIGH | No deps needed for simple gallery |

---

## Architecture Overview

```
src/
  cli.ts              # Entry point, Commander setup
  capture.ts          # Core screenshot capture logic
  devices.ts          # Device configuration registry
  report.ts           # HTML report generator
  types.ts            # TypeScript interfaces
  utils/
    fs.ts             # File system helpers
    progress.ts       # Progress display (ora wrapper)
```

**Estimated dependencies: 5 runtime, 4 dev**
**Estimated bundle size: ~2MB (mostly Playwright)**
**Browser download: ~150MB (Chromium, one-time on install)**
