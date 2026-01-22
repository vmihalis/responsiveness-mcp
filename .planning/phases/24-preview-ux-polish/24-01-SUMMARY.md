---
phase: 24-preview-ux-polish
plan: 01
subsystem: output
tags: [css, modal, ux, accessibility]
dependency-graph:
  requires: []
  provides: [always-visible-preview-button, centered-modal, device-info-header]
  affects: []
tech-stack:
  added: []
  patterns: [fixed-positioning-for-centering, flexbox-modal-layout]
files:
  created: []
  modified: [src/output/reporter.ts, src/output/__tests__/reporter.test.ts]
decisions:
  - name: Always-visible preview button
    rationale: Mobile users and keyboard-only users never saw hover-revealed button
    alternatives: [keep-hover-reveal-with-focus-visible]
    outcome: Button now always visible with prominent styling
  - name: Fixed centering with inset:0 + margin:auto
    rationale: Dialog default positioning was left-drifting; this ensures true centering
    alternatives: [transform-translate-centering]
    outcome: Modal perfectly centered on all viewport sizes
metrics:
  duration: 4min
  completed: 2026-01-22
---

# Phase 24 Plan 01: Preview UX Polish Summary

**One-liner:** Always-visible bold preview button with centered modal showing device name and dimensions.

## What Was Built

Updated the HTML report's interactive preview feature:

1. **Preview Button Prominence** - Button is now always visible (no hover-reveal), with larger padding (0.5rem 1rem), bold text (font-weight: 600), and visual depth (box-shadow)

2. **Modal Centering and Sizing** - Modal uses `position: fixed; inset: 0; margin: auto` for true centering, sized at 85vw/85vh with flex layout

3. **Device Info Header** - Modal header now displays device name and dimensions (e.g., "iPhone 15 Pro" / "393 x 852") using new `.modal-device-name` and `.modal-device-dims` elements

4. **Updated openPreview API** - Function signature changed from 3 to 4 parameters to support passing device name

## Key Files

| File | Changes |
|------|---------|
| `src/output/reporter.ts` | CSS_STYLES updates for button and modal, modal HTML template with device header, openPreview JS function signature |
| `src/output/__tests__/reporter.test.ts` | Updated 4 tests to match new openPreview signature and CSS expectations |

## Commits

| Hash | Type | Description |
|------|------|-------------|
| `384ea52` | feat | Preview button CSS prominence |
| `38b514c` | feat | Modal CSS centering and sizing |
| `35ca21b` | feat | Modal HTML and JS for device info |
| `c635568` | test | Updated tests for new signature |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated failing tests**
- **Found during:** Final verification
- **Issue:** 4 tests expected old openPreview signature (3 params) and hover-reveal CSS
- **Fix:** Updated tests to expect new 4-param signature and :active state CSS
- **Files modified:** `src/output/__tests__/reporter.test.ts`
- **Commit:** `c635568`

## Technical Decisions

1. **Fixed positioning for modal centering:** Using `position: fixed; inset: 0; margin: auto` instead of transform-based centering ensures the modal stays centered regardless of content size.

2. **Flexbox modal layout:** The modal uses `display: flex; flex-direction: column` to properly distribute space between header and body, with the body using flex centering for the iframe.

3. **Reduced iframe constraints:** Changed from 0.9/0.8 viewport multipliers to 0.75/0.65 to account for the 85% modal size plus padding.

## Verification Results

- Build: Passed (no type errors)
- Tests: 338/338 passing
- Requirements satisfied:
  - BTN-01: Preview button visible without hover
  - BTN-02: Button large and bold
  - BTN-03: Keyboard accessible
  - MODAL-01: Modal centered (no left-drift)
  - MODAL-02: Modal takes 85% viewport
  - MODAL-03: Iframe centered within modal
  - MODAL-04: Device name and dimensions displayed

## Next Phase Readiness

**Phase 24 Plan 01 complete.** This is the final plan in v3.1 Preview UX Improvements milestone.

Visual testing recommended: Generate a report with `npx screenie https://example.com --phones-only` and verify UX improvements in browser.
