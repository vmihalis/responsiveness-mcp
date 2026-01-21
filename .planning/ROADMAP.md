# Roadmap: Screenie v2.2

**Milestone:** v2.2 ASCII Art Branding
**Created:** 2026-01-21
**Phases:** 2 (Phases 19-20)

## Overview

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 19 | ASCII Art Branding | Add branded ASCII banner to version display | BRAND-01, BRAND-02, BRAND-03, CLI-05, CLI-06, INST-02 | 5 |
| 20 | ASCII Banner Terminal Width | Detect narrow terminals and fall back to plain text or smaller font | BRAND-04 | 3 |

## Phase Details

### Phase 19: ASCII Art Branding

**Goal:** Add branded ASCII art banner that displays on version check for professional CLI identity.

**Plans:** 1 plan

Plans:
- [x] 19-01-PLAN.md — Install figlet, create banner module, integrate into version command ✓

**Requirements covered:**
- BRAND-01: ASCII art banner with "SCREENIE" text in stylish block letters
- BRAND-02: Banner includes version number display
- BRAND-03: Banner includes brief tagline
- CLI-05: `screenie --version` displays ASCII banner + version
- CLI-06: `screenie -v` alias works identically
- INST-02: Quick-start hint (included in version banner)

**Note on INST-01:** Per research, postinstall scripts are a security anti-pattern in 2026 (pnpm 10+ disables by default). The quick-start hint (INST-02) is included in the version banner output instead.

**Success criteria:**
1. Running `screenie --version` displays ASCII art banner with version number
2. Running `screenie -v` displays identical output
3. ASCII art is visually appealing and fits terminal width (80 chars max)
4. Banner includes quick-start hint for new users
5. All existing tests continue to pass

**Dependencies:** None (standalone feature)

---

### Phase 20: ASCII Banner Terminal Width

**Goal:** Detect narrow terminals and fall back to plain text or smaller font for ASCII banner.

**Depends on:** Phase 19
**Plans:** 1 plan

Plans:
- [x] 20-01-PLAN.md — Add width detection and font fallback to banner module ✓

**Requirements covered:**
- BRAND-04: Graceful handling of narrow terminal widths

**Success criteria:**
1. Banner detects terminal width at runtime
2. Falls back to smaller font or plain text when terminal is narrow (<80 columns)
3. All existing tests continue to pass

**Dependencies:** Phase 19 (ASCII Art Branding)

---

## Requirement Coverage

6 of 7 v2.2 requirements mapped to Phase 19.
INST-01 (postinstall banner) intentionally skipped per security best practices.

| Requirement | Phase | Covers |
|-------------|-------|--------|
| BRAND-01 | 19 | ASCII art design |
| BRAND-02 | 19 | Version in banner |
| BRAND-03 | 19 | Tagline in banner |
| CLI-05 | 19 | --version flag |
| CLI-06 | 19 | -v alias |
| INST-01 | — | Skipped (security anti-pattern) |
| INST-02 | 19 | Quick-start hint (in version banner) |
| BRAND-04 | 20 | Terminal width handling |

**Coverage:** 7/8 (88%) - INST-01 intentionally skipped

---
*Roadmap created: 2026-01-21*
*Last updated: 2026-01-21 after Phase 20 execution*
