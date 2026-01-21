# Roadmap: Screenie v2.2

**Milestone:** v2.2 ASCII Art Branding
**Created:** 2026-01-21
**Phases:** 1 (Phase 19)

## Overview

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 19 | ASCII Art Branding | Add branded ASCII banner to version display and npm install | BRAND-01, BRAND-02, BRAND-03, CLI-05, CLI-06, INST-01, INST-02 | 5 |

## Phase Details

### Phase 19: ASCII Art Branding

**Goal:** Add branded ASCII art banner that displays on version check and npm install for professional CLI identity.

**Requirements covered:**
- BRAND-01: ASCII art banner with "SCREENIE" text in stylish block letters
- BRAND-02: Banner includes version number display
- BRAND-03: Banner includes brief tagline
- CLI-05: `screenie --version` displays ASCII banner + version
- CLI-06: `screenie -v` alias works identically
- INST-01: Postinstall script displays ASCII banner on `npm install -g`
- INST-02: Postinstall includes quick-start hint

**Success criteria:**
1. Running `screenie --version` displays ASCII art banner with version number
2. Running `screenie -v` displays identical output
3. Fresh `npm install -g screenie-tool` displays welcome banner with quick-start hint
4. ASCII art is visually appealing and fits terminal width (80 chars max)
5. All existing tests continue to pass

**Dependencies:** None (standalone feature)

**Research needed:** LOW — ASCII art patterns well-established

---

## Requirement Coverage

All 7 v2.2 requirements mapped to Phase 19.

| Requirement | Phase | Covers |
|-------------|-------|--------|
| BRAND-01 | 19 | ASCII art design |
| BRAND-02 | 19 | Version in banner |
| BRAND-03 | 19 | Tagline in banner |
| CLI-05 | 19 | --version flag |
| CLI-06 | 19 | -v alias |
| INST-01 | 19 | Postinstall banner |
| INST-02 | 19 | Quick-start hint |

**Coverage:** 7/7 (100%) ✓

---
*Roadmap created: 2026-01-21*
*Last updated: 2026-01-21*
