---
phase: 09-ux-polish
plan: 02
subsystem: engine
tags: [cookie-banners, css-injection, playwright, screenshot, ux]

# Dependency graph
requires:
  - phase: 03-browser-engine
    provides: BrowserManager and captureScreenshot infrastructure
  - phase: 04-page-loading
    provides: Page loading with scroll and waitBuffer
provides:
  - Cookie banner auto-hiding with 50+ selectors for major CMPs
  - hideCookieBanners option in CaptureOptions (default: true)
  - COOKIE_BANNER_SELECTORS export for customization
affects: [10-integration]

# Tech tracking
tech-stack:
  added: []
  patterns: [css-injection-via-addStyleTag]

key-files:
  created:
    - src/engine/cookies.ts
    - src/engine/__tests__/cookies.test.ts
  modified:
    - src/engine/types.ts
    - src/engine/capturer.ts
    - src/engine/index.ts

key-decisions:
  - "CSS injection over JavaScript removal for reliability"
  - "Default true for hideCookieBanners - most users want clean screenshots"
  - "50+ selectors covering OneTrust, Cookiebot, Didomi, TrustArc, Quantcast, etc."

patterns-established:
  - "CSS injection via page.addStyleTag for visual hiding"
  - "Option naming collision avoidance with function imports (shouldHideCookies)"

# Metrics
duration: 2min
completed: 2026-01-20
---

# Phase 9 Plan 2: Cookie Banner Hiding Summary

**CSS-based cookie banner auto-hiding with 50+ selectors covering OneTrust, Cookiebot, Didomi, and common GDPR patterns**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-20T11:28:23Z
- **Completed:** 2026-01-20T11:30:40Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments
- Cookie banner CSS injection utility with 50+ selectors for major CMPs
- Integration into captureScreenshot with hideCookieBanners option (default: true)
- Comprehensive tests verifying CSS injection and element hiding

## Task Commits

Each task was committed atomically:

1. **Task 1: Create cookie banner hiding module** - `29c408e` (feat)
2. **Task 2: Add hideCookieBanners option and integrate** - `69839d5` (feat)
3. **Task 3: Add cookie hiding tests** - `2bcd1a2` (test)

## Files Created/Modified
- `src/engine/cookies.ts` - Cookie banner selectors and hideCookieBanners function
- `src/engine/types.ts` - Added hideCookieBanners option to CaptureOptions
- `src/engine/capturer.ts` - Call hideCookieBanners after waitBuffer
- `src/engine/index.ts` - Export cookie utilities
- `src/engine/__tests__/cookies.test.ts` - 11 tests for cookie hiding

## Decisions Made
- **CSS injection over JavaScript removal** - More reliable, doesn't require waiting for elements to render
- **Default true for hideCookieBanners** - Most users want clean screenshots without cookie banners
- **Aggressive hiding (display:none + visibility:hidden + opacity:0)** - Ensures complete hiding even with !important styles

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Cookie banner hiding ready for use in CLI and integration tests
- All 64 engine tests passing
- Ready for Plan 09-03 (if exists) or Phase 10 integration

---
*Phase: 09-ux-polish*
*Completed: 2026-01-20*
