# Requirements: Responsive Screenshot Tool

**Defined:** 2025-01-20
**Core Value:** Instantly verify that a web app looks correct across all device sizes without manual testing

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Core Screenshot

- [x] **SHOT-01**: Tool captures full-page screenshots (entire scrollable content)
- [x] **SHOT-02**: Tool runs captures in parallel with configurable concurrency (default 10)
- [x] **SHOT-03**: Tool disables CSS animations before capture for consistency
- [x] **SHOT-04**: Tool retries failed captures automatically (2-3 attempts)

### Device Support

- [x] **DEV-01**: Tool includes 50+ built-in device presets (phones, tablets, desktops)
- [x] **DEV-02**: Tool organizes screenshots into phones/tablets/pc-laptops folders
- [ ] **DEV-03**: Tool supports device filtering flags (--phones-only, --tablets-only, --desktops-only)

### CLI Interface

- [ ] **CLI-01**: Tool accepts base URL as required argument (localhost or remote)
- [ ] **CLI-02**: Tool accepts page path(s) to capture
- [ ] **CLI-03**: Tool supports multiple pages in one run (--pages /home /about /gallery)
- [ ] **CLI-04**: Tool supports concurrency flag (--concurrency N)

### Output & Report

- [x] **OUT-01**: Tool saves screenshots with descriptive names (device-name-widthxheight.png)
- [x] **OUT-02**: Tool generates HTML report with grid view of all screenshots
- [x] **OUT-03**: Tool groups screenshots by device category in report
- [x] **OUT-04**: Tool shows thumbnails in report for quick scanning
- [x] **OUT-05**: Tool displays metadata in report (URL, timestamp, duration, device count)
- [ ] **OUT-06**: Tool opens report in browser automatically after capture

### Page Loading

- [x] **LOAD-01**: Tool waits for network idle before capture
- [x] **LOAD-02**: Tool adds configurable buffer after network idle (default 500ms)
- [x] **LOAD-03**: Tool scrolls through page to trigger lazy-loaded content
- [x] **LOAD-04**: Tool enforces max timeout (30s) to prevent hanging
- [ ] **LOAD-05**: Tool supports custom wait flag (--wait ms)

### UX & Polish

- [ ] **UX-01**: Tool shows progress indicators during capture
- [ ] **UX-02**: Tool auto-hides common cookie consent banners
- [ ] **UX-03**: Tool provides clear error messages for failures

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Configuration

- **CFG-01**: Tool supports config file (.responsiverc.json)
- **CFG-02**: Tool supports custom viewport definitions via config
- **CFG-03**: Tool supports output directory flag (--output)
- **CFG-04**: Tool supports URL list from file input

### Advanced Capture

- **ADV-01**: Tool supports element hiding via CSS selector (--hide)
- **ADV-02**: Tool supports dark mode capture (--dark-mode)
- **ADV-03**: Tool supports custom CSS injection before capture
- **ADV-04**: Tool supports authentication via cookies/headers

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Visual regression/diff comparison | Percy/Applitools territory, different product category |
| Real device cloud testing | BrowserStack domain, requires infrastructure |
| Interactive browser/DevTools | Responsively App niche, different use case |
| SaaS/cloud service | Keep tool simple, no infrastructure costs |
| GUI/Electron app | CLI is simpler, integrates with dev workflows |
| Cross-browser (Firefox/Safari) | Chrome sufficient for layout verification |
| PDF/video export | Scope creep, focus on screenshots + HTML |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SHOT-01 | Phase 3 | Complete |
| SHOT-02 | Phase 5 | Complete |
| SHOT-03 | Phase 4 | Complete |
| SHOT-04 | Phase 5 | Complete |
| DEV-01 | Phase 2 | Complete |
| DEV-02 | Phase 6 | Complete |
| DEV-03 | Phase 8 | Pending |
| CLI-01 | Phase 8 | Pending |
| CLI-02 | Phase 8 | Pending |
| CLI-03 | Phase 8 | Pending |
| CLI-04 | Phase 8 | Pending |
| OUT-01 | Phase 6 | Complete |
| OUT-02 | Phase 7 | Complete |
| OUT-03 | Phase 7 | Complete |
| OUT-04 | Phase 7 | Complete |
| OUT-05 | Phase 7 | Complete |
| OUT-06 | Phase 10 | Pending |
| LOAD-01 | Phase 3 | Complete |
| LOAD-02 | Phase 4 | Complete |
| LOAD-03 | Phase 4 | Complete |
| LOAD-04 | Phase 3 | Complete |
| LOAD-05 | Phase 8 | Pending |
| UX-01 | Phase 9 | Pending |
| UX-02 | Phase 9 | Pending |
| UX-03 | Phase 9 | Pending |

**Coverage:**
- v1 requirements: 24 total
- Mapped to phases: 24
- Unmapped: 0 ✓

---
*Requirements defined: 2025-01-20*
*Last updated: 2026-01-20 after Phase 7 completion*
