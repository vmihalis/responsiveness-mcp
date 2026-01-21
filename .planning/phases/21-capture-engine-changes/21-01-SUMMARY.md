---
phase: 21-capture-engine-changes
plan: 01
subsystem: cli
tags: [typescript, commander, types, cli-interface]

# Dependency graph
requires:
  - phase: 20-docs-deployment
    provides: Documentation site deployment for previous milestone
provides:
  - CaptureOptions.fullPage property for capture engine
  - CLIOptions.fullPage property for CLI parsing
  - --full-page CLI flag for user interface
affects: [21-capture-engine-changes]

# Tech tracking
tech-stack:
  added: []
  patterns: [optional-boolean-flags, cli-flag-naming]

key-files:
  created: []
  modified:
    - src/engine/types.ts
    - src/cli/types.ts
    - src/cli/commands.ts
    - src/cli/__tests__/commands.test.ts

key-decisions:
  - "fullPage is optional boolean (default: false) for viewport-only capture"
  - "CLI flag named --full-page for consistency with existing kebab-case flags"
  - "Flag is boolean (true when present, undefined when absent)"

patterns-established:
  - "CLI options use kebab-case (--full-page)"
  - "Type properties use camelCase (fullPage)"
  - "Optional booleans default to undefined when not specified"
  - "JSDoc comments explain default behavior"

# Metrics
duration: 3min
completed: 2026-01-21
---

# Phase 21 Plan 01: Capture Engine Changes Summary

**Type definitions and CLI flag for viewport vs full-page capture mode, enabling user control over capture behavior**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-21T21:11:19Z
- **Completed:** 2026-01-21T21:13:52Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Added fullPage property to CaptureOptions and CLIOptions interfaces with JSDoc
- Added --full-page CLI flag to Commander program definition
- Added comprehensive test coverage for flag parsing behavior
- All TypeScript compilation and tests passing

## Task Commits

Each task was committed atomically:

1. **Task 1: Add fullPage to type definitions** - `1234669` (feat)
2. **Task 2: Add --full-page CLI flag** - `cc1380e` (feat)
3. **Task 3: Add CLI flag parsing test** - `28b45d5` (test)

## Files Created/Modified
- `src/engine/types.ts` - Added fullPage?: boolean to CaptureOptions interface
- `src/cli/types.ts` - Added fullPage?: boolean to CLIOptions interface
- `src/cli/commands.ts` - Added --full-page option and help text example
- `src/cli/__tests__/commands.test.ts` - Added test suite for --full-page flag parsing

## Decisions Made

**1. Default behavior: viewport-only capture**
- fullPage defaults to false (undefined when not specified)
- Rationale: Preserves existing behavior, users opt-in to full-page capture

**2. CLI flag naming: --full-page (kebab-case)**
- Consistent with existing flags (--phones-only, --no-open)
- Rationale: Maintains CLI naming conventions

**3. Optional boolean pattern**
- Flag presence means true, absence means undefined
- Rationale: Standard Commander boolean flag behavior, type-safe

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - straightforward type and CLI flag additions.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Type definitions ready for capture engine implementation
- CLI interface ready to accept --full-page flag
- Ready for Task 2 (21-02): Implement capture engine logic to use fullPage option
- Ready for Task 3 (21-03): Update help text and documentation

---
*Phase: 21-capture-engine-changes*
*Completed: 2026-01-21*
