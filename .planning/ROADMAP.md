# Roadmap: Screenie v2.2

**Milestone:** v2.2 ASCII Art Branding
**Created:** 2026-01-21
**Phases:** 1 (Phase 19)

## Overview

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 19 | ASCII Art Branding | Add branded ASCII banner to version display | BRAND-01, BRAND-02, BRAND-03, CLI-05, CLI-06, INST-02 | 5 |

## Phase Details

### Phase 19: ASCII Art Branding

**Goal:** Add branded ASCII art banner that displays on version check for professional CLI identity.

**Plans:** 1 plan

Plans:
- [ ] 19-01-PLAN.md — Install figlet, create banner module, integrate into version command

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

**Coverage:** 6/7 (86%) - INST-01 intentionally skipped

---
*Roadmap created: 2026-01-21*
*Last updated: 2026-01-21 after plan-phase*
