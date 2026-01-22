# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-22)

**Core value:** Instantly verify that a web app looks correct across all device sizes without manual testing - run one command, review one report.
**Current focus:** v3.1 Preview UX Improvements - Phase 24 COMPLETE

## Current Position

Phase: 24 of 24 (Preview UX Polish)
Plan: 1 of 1 COMPLETE
Status: v3.1 milestone complete
Last activity: 2026-01-22 — Completed 24-01-PLAN.md

Progress: [##########] 100% (v1.0-v3.0) | [##########] 100% (v3.1)

## Performance Metrics

**v3.1 Velocity (SHIPPED):**
- Plans completed: 1
- Total duration: 4min
- Phases completed: 1 (Phase 24)

**v3.0 Velocity (SHIPPED):**
- Plans completed: 5
- Total duration: 18min (3min + 8min + 4min + 2min + 1min)
- Phases completed: 3 (Phase 21, Phase 22, Phase 23)

**Cumulative:**
- Milestones shipped: 6 (v1.0, v2.0, v2.1, v2.2, v3.0, v3.1)
- Total phases completed: 24
- Total plans completed: 51
- Total days: 2

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.

v3.1 decisions:
- Always-visible preview button (v3.1) — Mobile/keyboard users never saw hover-revealed button
- Fixed centering with inset:0 + margin:auto (v3.1) — Dialog default positioning was left-drifting

v3.0 decisions marked as Good:
- Viewport-only default (v3.0) — Full-page screenshots unwieldy for long pages; grid becomes scannable
- --full-page CLI flag (v3.0) — Preserves original behavior for users who need it
- Remove fold line (v3.0) — Viewport-only capture = entire screenshot IS above fold

### Pending Todos

None - all todos resolved.

### Blockers/Concerns

None.

### Tech Debt

From v2.0:
- Custom domain (screenie.xyz) DNS configuration deferred
- Custom domain (docs.screenie.xyz) DNS configuration deferred
- Package name is screenie-tool (npm) but CLI binary runs as screenie

From v2.2:
- Minor: Unused import in commands.ts (generateBanner) - cosmetic only

## Session Continuity

Last session: 2026-01-22
Stopped at: Completed v3.1 milestone (Phase 24 Plan 01)
Resume file: None

---

*State initialized: 2026-01-21*
*Last updated: 2026-01-22 after v3.1 completed*
