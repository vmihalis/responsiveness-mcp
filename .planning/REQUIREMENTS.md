# Requirements: Screenie v3.1 Preview UX Improvements

**Defined:** 2026-01-22
**Core Value:** Instantly verify that a web app looks correct across all device sizes without manual testing - run one command, review one report.

## v3.1 Requirements

Requirements for v3.1 release. Focus on making the interactive preview more discoverable and usable.

### Preview Modal

- [x] **MODAL-01**: Modal container takes 80-90% of viewport dimensions
- [x] **MODAL-02**: Modal is centered horizontally and vertically (fix left-drift bug)
- [x] **MODAL-03**: Device iframe centered within the modal container
- [x] **MODAL-04**: Device name and dimensions displayed in modal header

### Preview Button

- [x] **BTN-01**: Preview button always visible (not hidden until hover)
- [x] **BTN-02**: Larger button size with increased padding and font
- [x] **BTN-03**: Bold styling that makes the button prominent and obviously interactive

## Future Requirements (v3.2+)

Deferred to future release. Tracked but not in current roadmap.

### Configuration

- **CFG-01**: Config file support (.responsiverc.json)
- **CFG-02**: Custom viewport definitions via config
- **CFG-03**: Output directory flag (--output)

### Capture Enhancements

- **CAP-04**: Dark mode capture (--dark-mode)
- **CAP-05**: Element hiding via CSS selector (--hide)

### Modal Enhancements

- **MODAL-05**: Keyboard navigation (arrow keys to cycle devices in preview)
- **MODAL-06**: Side-by-side comparison mode

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Device bezels/frames | Visual polish, adds complexity without core value |
| Synced interactions across devices | Very complex, different domain |
| Touch event simulation | Mobile-specific, lower priority |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| MODAL-01 | Phase 24 | Complete |
| MODAL-02 | Phase 24 | Complete |
| MODAL-03 | Phase 24 | Complete |
| MODAL-04 | Phase 24 | Complete |
| BTN-01 | Phase 24 | Complete |
| BTN-02 | Phase 24 | Complete |
| BTN-03 | Phase 24 | Complete |

**Coverage:**
- v3.1 requirements: 7 total
- Mapped to phases: 7
- Unmapped: 0

---
*Requirements defined: 2026-01-22*
*Last updated: 2026-01-22 after Phase 24 complete*
