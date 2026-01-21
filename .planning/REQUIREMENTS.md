# Requirements: Screenie v3.0

**Defined:** 2026-01-21
**Core Value:** Instantly verify that a web app looks correct across all device sizes without manual testing - run one command, review one report.

## v3.0 Requirements

Requirements for viewport-first capture release. Breaking change from full-page default.

### Capture Behavior

- [ ] **CAP-01**: Default capture mode is viewport-only (device viewport height, not full page)
- [ ] **CAP-02**: `--full-page` flag enables full-page capture (original v1.0-v2.2 behavior)
- [ ] **CAP-03**: Existing flags work unchanged (--phones-only, --concurrency, --wait, etc.)

### Report Changes

- [ ] **RPT-01**: Remove fold line indicator from thumbnail cards
- [ ] **RPT-02**: Remove fold line indicator from lightbox view
- [ ] **RPT-03**: Remove fold line CSS and related code

### Documentation

- [ ] **DOC-01**: Update CLI reference with new default behavior
- [ ] **DOC-02**: Document `--full-page` flag usage
- [ ] **DOC-03**: README reflects viewport-only as default
- [ ] **DOC-04**: Changelog documents breaking change clearly

### Version

- [ ] **VER-01**: Bump major version to 3.0.0
- [ ] **VER-02**: Update ASCII banner version display

## Future Requirements

Deferred to v3.1+:

- Config file support (.responsiverc.json)
- Custom viewport definitions via config
- Output directory flag (--output)
- Dark mode capture (--dark-mode)
- Keyboard navigation in preview modal

## Out of Scope

| Feature | Reason |
|---------|--------|
| Fold line toggle | Removed entirely - viewport-only makes it redundant |
| Backwards-compatible default | Breaking change is intentional - major version bump |
| Per-device full-page option | Complexity not justified - use --full-page for all or none |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CAP-01 | Phase 21 | Pending |
| CAP-02 | Phase 21 | Pending |
| CAP-03 | Phase 21 | Pending |
| RPT-01 | Phase 22 | Pending |
| RPT-02 | Phase 22 | Pending |
| RPT-03 | Phase 22 | Pending |
| DOC-01 | Phase 23 | Pending |
| DOC-02 | Phase 23 | Pending |
| DOC-03 | Phase 23 | Pending |
| DOC-04 | Phase 23 | Pending |
| VER-01 | Phase 23 | Pending |
| VER-02 | Phase 23 | Pending |

**Coverage:**
- v3.0 requirements: 12 total
- Mapped to phases: 12
- Unmapped: 0 ✓

---
*Requirements defined: 2026-01-21*
*Last updated: 2026-01-21 after initial definition*
