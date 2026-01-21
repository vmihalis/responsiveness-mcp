# Roadmap: Screenie

## Milestones

- [x] **v1.0 MVP** - Phases 1-10 (shipped 2026-01-20) - See `.planning/milestones/v1.0-ROADMAP.md`
- [x] **v2.0 Open Source Release** - Phases 11-16 (shipped 2026-01-21) - See `.planning/milestones/v2.0-ROADMAP.md`
- [x] **v2.1 Enhanced Report** - Phases 17-18 (shipped 2026-01-21)

---

## v2.1 Enhanced Report (Complete)

**Milestone Goal:** Make the HTML report more useful by showing the viewport boundary and enabling interactive testing at any device size.

**Target features:**
- Fold line indicator showing where viewport ends on each screenshot
- Interactive preview modal to test site at device dimensions

### Phase 17: Fold Line Indicator
**Goal**: Users can see viewport boundaries on all screenshots
**Depends on**: Phase 16 (v2.0 complete)
**Requirements**: FOLD-01, FOLD-02, FOLD-03, FOLD-04, FOLD-05
**Success Criteria** (what must be TRUE):
  1. User sees horizontal line at viewport height on thumbnail screenshots
  2. User sees horizontal line at viewport height in enlarged lightbox view
  3. Fold line uses non-intrusive styling that doesn't obscure content
  4. Fold line position adjusts correctly when window is resized
  5. Fold line remains CSS-based (not baked into screenshot image)
**Plans**: 1 plan

Plans:
- [x] 17-01-PLAN.md — Implement fold line indicator (PNG dimension extraction, fold calculation, CSS styles, HTML rendering)

### Phase 18: Interactive Preview Modal
**Goal**: Users can test the live site at any device dimensions
**Depends on**: Phase 17
**Requirements**: PREV-01, PREV-02, PREV-03, PREV-04, PREV-05, PREV-06, PREV-07
**Success Criteria** (what must be TRUE):
  1. User can click any screenshot to open interactive preview
  2. Preview modal displays iframe sized to exact device dimensions
  3. User sees loading spinner while iframe loads
  4. User can close modal via close button, ESC key, or backdrop click
  5. User sees helpful error message when site blocks iframe (CORS/X-Frame-Options)
  6. Error state includes "Open in new tab" fallback link
  7. Modal uses proper iframe sandboxing for security
**Plans**: 1 plan

Plans:
- [x] 18-01-PLAN.md — Add interactive preview modal (native dialog, iframe preview, loading/error states, keyboard accessibility)

---

## Progress

**Execution Order:**
Phases execute in numeric order: 17 → 18

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 17. Fold Line Indicator | 1/1 | ✓ Complete | 2026-01-21 |
| 18. Interactive Preview Modal | 1/1 | ✓ Complete | 2026-01-21 |

---

*Created: 2026-01-20*
*Last updated: 2026-01-21 - v2.1 milestone complete*
