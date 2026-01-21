# Milestone v3.0: Viewport-First Capture

**Status:** In Progress
**Phases:** 21-23
**Total Plans:** 5

## Overview

Transform default capture behavior from full-page to viewport-only screenshots, making the grid view scannable at a glance while preserving full-page capture via `--full-page` flag. Remove now-redundant fold line indicators and update documentation for the breaking change.

## Phases

- [x] **Phase 21: Capture Engine Changes** - Change default capture to viewport-only, add --full-page flag
- [x] **Phase 22: Report Cleanup** - Remove fold line indicators from report
- [ ] **Phase 23: Documentation & Release** - Update docs, bump version to 3.0.0

## Phase Details

### Phase 21: Capture Engine Changes

**Goal:** Default screenshot capture is viewport-only; full-page capture available via flag.

**Depends on:** Phase 20 (v2.2 ASCII Banner Terminal Width)
**Requirements:** CAP-01, CAP-02, CAP-03

**Success Criteria** (what must be TRUE):
1. Running `screenie <url>` captures viewport-height screenshots (not full page)
2. Running `screenie <url> --full-page` captures full-page screenshots (original v2.2 behavior)
3. All existing flags (--phones-only, --tablets-only, --desktops-only, --concurrency, --wait, --pages) work unchanged
4. Screenshot dimensions match device viewport height (not page content height)
5. All existing tests pass or are updated for new default behavior

**Plans:** 2 plans

Plans:
- [x] 21-01-PLAN.md — Add types and CLI flag for fullPage option
- [x] 21-02-PLAN.md — Implement viewport-only default with fullPage support

---

### Phase 22: Report Cleanup

**Goal:** Remove fold line indicator from HTML report (redundant with viewport-only capture).

**Depends on:** Phase 21
**Requirements:** RPT-01, RPT-02, RPT-03

**Success Criteria** (what must be TRUE):
1. Thumbnail cards in report grid show no fold line overlay
2. Lightbox view shows no fold line overlay
3. Fold line CSS and JavaScript code removed from report generation
4. Report file size reduced (no fold line positioning data)

**Plans:** 1 plan

Plans:
- [x] 22-01-PLAN.md — Remove fold line code from reporter, types, and tests

---

### Phase 23: Documentation & Release

**Goal:** Document breaking change and release v3.0.0.

**Depends on:** Phase 22
**Requirements:** DOC-01, DOC-02, DOC-03, DOC-04, VER-01, VER-02

**Success Criteria** (what must be TRUE):
1. CLI reference documents viewport-only as default behavior
2. CLI reference documents `--full-page` flag with clear usage examples
3. README reflects viewport-only screenshots as the default
4. CHANGELOG clearly marks v3.0.0 as breaking change with migration notes
5. Running `screenie --version` shows "3.0.0" in ASCII banner
6. package.json version is "3.0.0"

**Plans:** 2 plans

Plans:
- [ ] 23-01-PLAN.md — Update documentation with --full-page flag and viewport-only default
- [ ] 23-02-PLAN.md — Create CHANGELOG and bump version to 3.0.0

---

## Requirement Coverage

| Requirement | Phase | Status |
|-------------|-------|--------|
| CAP-01 | 21 | Complete |
| CAP-02 | 21 | Complete |
| CAP-03 | 21 | Complete |
| RPT-01 | 22 | Complete |
| RPT-02 | 22 | Complete |
| RPT-03 | 22 | Complete |
| DOC-01 | 23 | Pending |
| DOC-02 | 23 | Pending |
| DOC-03 | 23 | Pending |
| DOC-04 | 23 | Pending |
| VER-01 | 23 | Pending |
| VER-02 | 23 | Pending |

**Coverage:** 12/12 (100%)

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 21. Capture Engine Changes | 2/2 | Complete | 2026-01-21 |
| 22. Report Cleanup | 1/1 | Complete | 2026-01-22 |
| 23. Documentation & Release | 0/2 | Planned | - |

---

*Created: 2026-01-21*
*Last updated: 2026-01-22 (Phase 23 planned)*
