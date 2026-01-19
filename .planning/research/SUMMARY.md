# Research Summary

## Stack Recommendation

| Layer | Choice | Version |
|-------|--------|---------|
| Runtime | Node.js | 20 LTS |
| Language | TypeScript | ^5.4 |
| Browser Automation | Playwright | ^1.51 |
| CLI Framework | Commander.js | ^12.0 |
| Concurrency | p-limit | ^6.0 |
| Build | tsup | ^8.0 |
| Dev Runner | tsx | ^4.0 |
| Progress UX | ora + picocolors | latest |

**Key Decision**: Playwright over Puppeteer — built-in device registry with 100+ presets, native parallel browser contexts (3-5x faster), better full-page screenshot handling.

---

## Features Summary

### Table Stakes (Must Have)
- Full-page screenshot capture
- Multiple viewport/resolution support with parallel execution
- Pre-built device profiles (50+)
- Simple CLI with clear file naming
- Configurable output directory
- PNG format support

### Differentiators (Competitive Advantage)
- HTML report generation with grid view
- Folder organization by device category (phones/tablets/pc-laptops)
- Wait/delay configuration
- Element hiding (cookie banners, popups)
- Progress indicators

### Anti-Features (Don't Build)
- Visual regression/diff comparison — Percy/Applitools territory
- Real device cloud testing — BrowserStack domain
- Interactive browser/DevTools — Responsively App niche
- SaaS/cloud service
- GUI/Electron app

---

## Architecture Overview

### Components
1. **CLI Parser** — Commander.js, validates URL/path input
2. **Device Registry** — 50+ presets categorized by phones/tablets/pc-laptops
3. **Screenshot Engine** — Browser Manager + Page Capturer + Parallel Executor
4. **Output Manager** — File Organizer + HTML Report Generator
5. **Configuration Loader** — Merges CLI args with defaults

### Key Architectural Decisions
- **Single browser, multiple contexts** — One Chromium instance, isolated contexts per device
- **Parallel with concurrency limit** — Default 10 concurrent captures
- **Full-page screenshots** — Complete page coverage, Playwright handles scroll-stitching
- **Self-contained HTML report** — Single file, no external dependencies

### Build Order
1. Foundation — Device Registry + types
2. Core Engine — Browser Manager + Page Capturer
3. Orchestration — Parallel Executor + Engine facade
4. Output — File Organizer + Report Generator
5. Interface — Config Loader + CLI Parser
6. Integration — Main entry point

---

## Critical Pitfalls to Avoid

| Pitfall | Prevention | Phase |
|---------|------------|-------|
| Font loading hangs | Bypass font waiting, use domcontentloaded | Engine |
| Lazy loading misses | Scroll through page before capture | Engine |
| Memory exhaustion | Single browser + context pooling + semaphore | Parallelization |
| Wrong screenshot method | Disable animations, consecutive matching | Engine |
| Cookie banners/popups | CSS injection to hide overlays | Engine |
| Hardcoded wait times | Smart waiting (networkidle + buffer) | Engine |

---

## Positioning

Fast CLI tool for batch responsive screenshot capture with organized output and HTML report. Not a regression testing platform, not an interactive browser — a review preparation tool that saves manual DevTools checking.

---

*Research completed: 2025-01-20*
