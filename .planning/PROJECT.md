# Screenie

## What This Is

A responsive design testing tool available as both a CLI and web application at screenie.xyz. Captures full-page screenshots across 57 device dimensions, organizes them by category (phones, tablets, desktops), and generates HTML reports for quick visual review. Users can either clone the GitHub repo to run locally or paste a URL on the website to get instant results.

## Core Value

Instantly verify that a web app looks correct across all device sizes without manual testing — run one command or paste one URL, review one report.

## Current Milestone: v2.0 Web Platform

**Goal:** Transform Screenie from a CLI tool into a public web platform with documentation, enabling anyone to verify responsive designs via screenie.xyz or the npm package.

**Target features:**
- Web application at screenie.xyz where users paste a URL and get screenshot reports
- Full documentation site with guides, examples, and API reference
- Simple, clean UI for the web tool
- Basic rate limiting to prevent abuse
- Backend that runs Playwright for web users

## Requirements

### Validated

- `SHOT-01` Full-page screenshots — v1.0
- `SHOT-02` Parallel execution with configurable concurrency (default 10) — v1.0
- `SHOT-03` CSS animation disabling before capture — v1.0
- `SHOT-04` Retry on failure (2-3 attempts for transient errors) — v1.0
- `DEV-01` 57 built-in device presets (24 phones, 13 tablets, 20 desktops) — v1.0
- `DEV-02` Screenshots organized into phones/tablets/pc-laptops folders — v1.0
- `DEV-03` Device filtering flags (--phones-only, --tablets-only, --desktops-only) — v1.0
- `CLI-01` Base URL argument (localhost or remote) — v1.0
- `CLI-02` Page path argument — v1.0
- `CLI-03` Multiple pages flag (--pages) — v1.0
- `CLI-04` Concurrency flag (--concurrency) — v1.0
- `OUT-01` Descriptive file names (device-name-widthxheight.png) — v1.0
- `OUT-02` HTML report with responsive grid view — v1.0
- `OUT-03` Category grouping in report — v1.0
- `OUT-04` Thumbnails with click-to-enlarge — v1.0
- `OUT-05` Metadata display (URL, timestamp, duration, device count) — v1.0
- `OUT-06` Auto-open report in browser — v1.0
- `LOAD-01` Network idle wait before capture — v1.0
- `LOAD-02` Configurable wait buffer (default 500ms) — v1.0
- `LOAD-03` Lazy content scroll triggering — v1.0
- `LOAD-04` Max timeout (30s) — v1.0
- `LOAD-05` Custom wait flag (--wait) — v1.0
- `UX-01` Progress indicators (ora spinner) — v1.0
- `UX-02` Cookie banner auto-hiding (50+ selectors) — v1.0
- `UX-03` Clear error messages with actionable hints — v1.0

### Active

- [ ] Web application at screenie.xyz
- [ ] URL input form with device selection
- [ ] Backend API running Playwright
- [ ] View results inline on website
- [ ] Download HTML report from website
- [ ] Basic rate limiting (requests per IP per hour)
- [ ] Full documentation site (VitePress/similar)
- [ ] Getting started guide
- [ ] CLI reference documentation
- [ ] API reference for programmatic usage
- [ ] Example gallery showing reports

### Future (v2.1+)

- Config file support (.responsiverc.json)
- Custom viewport definitions via config
- Output directory flag (--output)
- URL list from file input
- Element hiding via CSS selector (--hide)
- Dark mode capture (--dark-mode)

### Out of Scope

- Visual regression/diff comparison — Percy/Applitools territory
- Real device cloud testing — BrowserStack domain
- Interactive browser/DevTools — Responsively App niche
- User accounts/authentication — keep it simple, no login required
- Saved history — stateless, run and download
- Cross-browser (Firefox/Safari) — Chrome sufficient for layout verification
- PDF/video export — focus on screenshots + HTML

## Context

v1.0 shipped with 5,954 LOC TypeScript, 291 tests passing.
Tech stack: Node.js 20+, Playwright (Chromium), TypeScript, tsup, Vitest.
57 device presets covering flagship phones (iPhone 15/16, Pixel 8, Galaxy S24), tablets (iPad Pro, Galaxy Tab), and common desktop resolutions.

v2.0 adds a web platform layer. The existing CLI core remains unchanged — the website wraps the same screenshot engine with a web frontend and API.

## Constraints

- **Tech stack**: Node.js + Playwright (Chromium) — mature, handles parallel execution well
- **Performance**: 57 screenshots in ~30-40 seconds via parallelization (10 concurrent default)
- **Page timing**: Network idle detection + 500ms buffer, 30s max timeout
- **Output**: Self-contained HTML report with base64 images (works offline)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Full-page screenshots (not viewport-only) | Catch layout issues anywhere on page | Good |
| Playwright over Puppeteer | Better API, built-in device emulation | Good |
| HTML report over folder browsing | Scanning 50+ images in grid is faster | Good |
| Parallel execution with p-limit | 57 devices sequentially ~3min; parallel ~40sec | Good |
| CSS-only lightbox | No JavaScript, self-contained HTML | Good |
| Base64 data URIs for images | Report works offline, single file | Good |
| ESM-only with NodeNext | Modern Node.js standard | Good |
| Vitest for testing | Native ESM support, fast | Good |
| ora for spinner | Non-blocking progress, clean CI output | Good |
| Error returns vs throws | Batch operations continue on individual failures | Good |

---
*Last updated: 2026-01-20 after v2.0 milestone started*
