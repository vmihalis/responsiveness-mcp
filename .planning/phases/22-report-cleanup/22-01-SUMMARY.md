---
phase: 22-report-cleanup
plan: 01
subsystem: output
tags: [html-report, css, typescript, cleanup]

# Dependency graph
requires:
  - phase: 21-capture-engine-changes
    provides: viewport-only screenshot default
provides:
  - Simplified ScreenshotForReport interface (5 fields)
  - Cleaner HTML report without fold line indicators
  - Reduced code complexity in reporter.ts
affects: [23-docs-release, future-report-features]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Viewport-only capture removes need for fold position tracking

key-files:
  created: []
  modified:
    - src/output/reporter.ts
    - src/output/types.ts
    - src/output/__tests__/reporter.test.ts

key-decisions:
  - "Removed fold line CSS pseudo-elements entirely (not just hiding)"
  - "Lightbox now outputs img directly without wrapper div"
  - "Kept createTestPngBuffer helper for valid PNG buffer generation in tests"

patterns-established:
  - "Viewport-only screenshots: entire visible area IS the fold"

# Metrics
duration: 4min
completed: 2026-01-22
---

# Phase 22 Plan 01: Remove Fold Line Indicator Summary

**Removed ~130 lines of fold line code from reporter - viewport-only capture means entire screenshot IS "above the fold"**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-22T00:11:00Z
- **Completed:** 2026-01-22T00:15:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Removed THUMBNAIL_ASPECT_RATIO constant, getPngDimensions, and calculateFoldPositions functions
- Removed fold line CSS (.thumbnail-link::after, .lightbox-content::after)
- Simplified ScreenshotForReport interface from 9 fields to 5 fields
- Simplified renderThumbnailCard (no fold style attribute)
- Simplified renderLightbox (no lightbox-content wrapper div)
- Simplified prepareScreenshotsForReport (no fold calculation)
- Updated tests, removing ~20 fold-related tests

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove fold line code from reporter.ts and types.ts** - `27085e0` (refactor)
2. **Task 2: Update tests to remove fold line assertions** - `f48310f` (test)

## Files Created/Modified

- `src/output/reporter.ts` - Removed fold line functions, CSS, and rendering code (-130 lines)
- `src/output/types.ts` - Simplified ScreenshotForReport to 5 fields
- `src/output/__tests__/reporter.test.ts` - Removed fold-related tests (-219 lines)

## Decisions Made

- **Removed fold line code entirely:** With viewport-only capture as default, the fold line indicator serves no purpose - the entire screenshot IS "above the fold"
- **Direct img in lightbox:** Removed lightbox-content wrapper div since it only existed for fold line positioning
- **Kept createTestPngBuffer:** Still useful for generating valid PNG buffers in tests even without dimension extraction

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Report cleanup complete for v3.0 viewport-first capture
- Ready for Phase 23: Documentation and Release
- No blockers or concerns

---
*Phase: 22-report-cleanup*
*Completed: 2026-01-22*
