# Roadmap: Responsive Screenshot Tool

**Created:** 2025-01-20
**Depth:** Comprehensive
**Total Phases:** 10
**Total Requirements:** 24

## Phase Overview

| # | Phase | Goal | Requirements | Plans | Status |
|---|-------|------|--------------|-------|--------|
| 1 | Project Setup | Initialize TypeScript project with Playwright | - | 4 | Complete |
| 2 | Device Registry | Define 50+ device presets with categorization | DEV-01 | 3-5 | Pending |
| 3 | Browser Engine | Core screenshot capture with Playwright | SHOT-01, LOAD-01, LOAD-04 | 5-7 | Pending |
| 4 | Page Loading | Smart waiting and lazy content handling | LOAD-02, LOAD-03, SHOT-03 | 4-6 | Pending |
| 5 | Parallel Execution | Concurrent captures with retry logic | SHOT-02, SHOT-04 | 4-6 | Pending |
| 6 | File Output | Organized folder structure and file naming | DEV-02, OUT-01 | 3-5 | Pending |
| 7 | HTML Report | Grid view report with thumbnails and metadata | OUT-02, OUT-03, OUT-04, OUT-05 | 5-7 | Pending |
| 8 | CLI Interface | Command parsing with flags and validation | CLI-01, CLI-02, CLI-03, CLI-04, LOAD-05, DEV-03 | 5-7 | Pending |
| 9 | UX Polish | Progress indicators, cookie hiding, error messages | UX-01, UX-02, UX-03 | 4-6 | Pending |
| 10 | Integration | Wire everything, auto-open report, end-to-end testing | OUT-06 | 4-6 | Pending |

---

## Phase Details

### Phase 1: Project Setup - COMPLETE

**Goal:** Initialize TypeScript project with Playwright and build tooling

**Requirements:** None (foundation)

**Status:** Complete (2026-01-20)
**Plans:** 4 plans executed

**Success Criteria:**
1. `npm run dev` executes TypeScript without build step
2. `npm run build` produces executable in dist/
3. Playwright launches Chromium and takes a test screenshot
4. Project structure matches architecture (src/cli, src/engine, src/devices, src/output)

**Completed Plans:**
- 01-01: Configuration files (tsconfig.json, tsup.config.ts, .gitignore, package.json)
- 01-02: Directory structure and skeleton files
- 01-03: Dependencies installed and build verified
- 01-04: Playwright smoke test verified

---

### Phase 2: Device Registry

**Goal:** Define comprehensive device presets with category organization

**Requirements:** DEV-01

**Success Criteria:**
1. Registry contains 50+ devices (15+ phones, 10+ tablets, 25+ desktops/laptops)
2. Each device has name, width, height, deviceScaleFactor, category
3. `getDevices()` returns all devices
4. `getDevicesByCategory('phones')` filters correctly
5. Devices include latest models (iPhone 15, Pixel 8, Galaxy S24)

---

### Phase 3: Browser Engine

**Goal:** Core screenshot capture with Playwright browser management

**Requirements:** SHOT-01, LOAD-01, LOAD-04

**Success Criteria:**
1. Browser launches once and creates multiple contexts
2. Page navigates to URL and waits for network idle
3. Full-page screenshot captures entire scrollable content
4. Screenshot times out after 30s on slow pages
5. Browser and contexts close cleanly

---

### Phase 4: Page Loading

**Goal:** Smart waiting strategies and lazy content handling

**Requirements:** LOAD-02, LOAD-03, SHOT-03

**Success Criteria:**
1. Page waits additional buffer (500ms) after network idle
2. Page scrolls through content to trigger lazy loading
3. CSS animations are disabled before capture
4. Lazy-loaded images appear in full-page screenshots
5. Scroll doesn't hang on infinite scroll pages (max iterations)

---

### Phase 5: Parallel Execution

**Goal:** Concurrent screenshot captures with retry logic

**Requirements:** SHOT-02, SHOT-04

**Success Criteria:**
1. Multiple devices capture simultaneously (default 10 concurrent)
2. Concurrency is configurable
3. Failed captures retry 2-3 times before failing
4. Memory usage stays bounded under parallel load
5. All results collected even with partial failures

---

### Phase 6: File Output

**Goal:** Organized folder structure with descriptive file naming

**Requirements:** DEV-02, OUT-01

**Success Criteria:**
1. Output creates phones/, tablets/, pc-laptops/ subdirectories
2. Screenshots named as device-name-widthxheight.png
3. File names are filesystem-safe (no special characters)
4. Timestamped parent folder prevents overwrites
5. Output location is sensible default (./screenshots/YYYY-MM-DD-HHmmss/)

---

### Phase 7: HTML Report

**Goal:** Visual report with grid layout and metadata

**Requirements:** OUT-02, OUT-03, OUT-04, OUT-05

**Success Criteria:**
1. HTML report displays all screenshots in responsive grid
2. Screenshots grouped by device category with headers
3. Thumbnails load quickly, click for full-size
4. Report shows: URL captured, timestamp, duration, device count
5. Report is self-contained (works offline, no external deps)

---

### Phase 8: CLI Interface

**Goal:** Full command-line interface with all flags

**Requirements:** CLI-01, CLI-02, CLI-03, CLI-04, LOAD-05, DEV-03

**Success Criteria:**
1. `responsive-check <url>` works with URL argument
2. `responsive-check <url> /path` captures specific page
3. `--pages /a /b /c` captures multiple pages
4. `--concurrency N` sets parallel limit
5. `--wait N` overrides wait buffer
6. `--phones-only`, `--tablets-only`, `--desktops-only` filter devices
7. `--help` shows usage
8. Invalid input shows helpful error messages

---

### Phase 9: UX Polish

**Goal:** Progress feedback, cookie handling, and error UX

**Requirements:** UX-01, UX-02, UX-03

**Success Criteria:**
1. Terminal shows progress: "Capturing 12/50: iPhone 14 Pro..."
2. Progress bar or spinner indicates activity
3. Common cookie banners auto-hidden before capture
4. Failed captures show clear error with device name and reason
5. Final summary shows success/failure counts

---

### Phase 10: Integration

**Goal:** Wire everything together, auto-open report, final polish

**Requirements:** OUT-06

**Success Criteria:**
1. Full pipeline works: CLI -> devices -> capture -> output -> report
2. Report opens automatically in default browser
3. Exit code 0 on success, non-zero on failure
4. Clean shutdown (no orphan browser processes)
5. End-to-end test with real URL passes

---

## Requirement Traceability

| Requirement | Phase | Description |
|-------------|-------|-------------|
| SHOT-01 | 3 | Full-page screenshots |
| SHOT-02 | 5 | Parallel execution |
| SHOT-03 | 4 | Animation disabling |
| SHOT-04 | 5 | Retry on failure |
| DEV-01 | 2 | 50+ device presets |
| DEV-02 | 6 | Category folders |
| DEV-03 | 8 | Device filtering flags |
| CLI-01 | 8 | URL argument |
| CLI-02 | 8 | Path argument |
| CLI-03 | 8 | Multiple pages flag |
| CLI-04 | 8 | Concurrency flag |
| OUT-01 | 6 | Descriptive file names |
| OUT-02 | 7 | HTML report grid |
| OUT-03 | 7 | Category grouping |
| OUT-04 | 7 | Thumbnails |
| OUT-05 | 7 | Metadata display |
| OUT-06 | 10 | Auto-open report |
| LOAD-01 | 3 | Network idle wait |
| LOAD-02 | 4 | Wait buffer |
| LOAD-03 | 4 | Lazy content scroll |
| LOAD-04 | 3 | Max timeout |
| LOAD-05 | 8 | Custom wait flag |
| UX-01 | 9 | Progress indicators |
| UX-02 | 9 | Cookie banner hiding |
| UX-03 | 9 | Error messages |

**Coverage:** 24/24 requirements mapped (100%)

---
*Roadmap created: 2025-01-20*
