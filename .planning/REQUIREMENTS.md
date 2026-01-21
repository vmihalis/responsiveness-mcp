# Requirements: Screenie

**Defined:** 2026-01-21
**Core Value:** Instantly verify responsive design without manual testing

## v2.1 Requirements

Requirements for Enhanced Report milestone. Each maps to roadmap phases.

### Fold Line Indicator

- [x] **FOLD-01**: Horizontal line overlay displayed at viewport height on each screenshot
- [x] **FOLD-02**: Fold line visible on thumbnails in grid view
- [x] **FOLD-03**: Fold line visible on enlarged view (lightbox)
- [x] **FOLD-04**: Fold line uses non-intrusive styling (dashed, semi-transparent)
- [x] **FOLD-05**: Fold line positioned via CSS (not baked into screenshot image)

### Interactive Preview Modal

- [x] **PREV-01**: User can click screenshot to open interactive preview modal
- [x] **PREV-02**: Modal contains iframe sized to exact device dimensions (width × height)
- [x] **PREV-03**: Modal displays loading spinner while iframe loads
- [x] **PREV-04**: User can close modal via close button
- [x] **PREV-05**: User can close modal via ESC key
- [x] **PREV-06**: Modal shows error message when site blocks iframe embedding (CORS/X-Frame-Options)
- [x] **PREV-07**: Error state includes "Open in new tab" fallback link

## Future Requirements

Deferred to v2.2+. Tracked but not in current roadmap.

### Fold Line Enhancements

- **FOLD-10**: Toggle button to show/hide fold lines globally
- **FOLD-11**: Fold line label showing viewport height (e.g., "812px")
- **FOLD-12**: Configurable fold line color/style

### Interactive Preview Enhancements

- **PREV-10**: Keyboard navigation (arrow keys to cycle devices)
- **PREV-11**: Side-by-side comparison mode (two devices at once)
- **PREV-12**: Device frame/bezel around iframe
- **PREV-13**: Synced scrolling across multiple previews

### Other Future Features

- Config file support (.responsiverc.json)
- Custom viewport definitions via config
- Output directory flag (--output)
- Dark mode capture (--dark-mode)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Fold line baked into screenshot image | CSS overlay allows toggling later, keeps images clean |
| Real device testing | BrowserStack/Sauce Labs territory, iframe emulation sufficient |
| Video recording of interactions | Focus on screenshots, video adds complexity |
| Server-side rendering of previews | CLI tool, no backend infrastructure |
| Cross-browser preview (Firefox/Safari) | Chromium iframe sufficient for layout verification |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOLD-01 | Phase 17 | Complete |
| FOLD-02 | Phase 17 | Complete |
| FOLD-03 | Phase 17 | Complete |
| FOLD-04 | Phase 17 | Complete |
| FOLD-05 | Phase 17 | Complete |
| PREV-01 | Phase 18 | Complete |
| PREV-02 | Phase 18 | Complete |
| PREV-03 | Phase 18 | Complete |
| PREV-04 | Phase 18 | Complete |
| PREV-05 | Phase 18 | Complete |
| PREV-06 | Phase 18 | Complete |
| PREV-07 | Phase 18 | Complete |

**Coverage:**
- v2.1 requirements: 12 total
- Mapped to phases: 12
- Unmapped: 0 ✓

---
*Requirements defined: 2026-01-21*
*Last updated: 2026-01-21 after Phase 18 completion (v2.1 complete)*
