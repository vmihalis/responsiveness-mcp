# Project Milestones: Screenie

## v3.0 Viewport-First Capture (Shipped: 2026-01-22)

**Delivered:** Changed default screenshot capture from full-page to viewport-only, making the grid view instantly scannable while preserving full-page capture via `--full-page` flag.

**Phases completed:** 21-23 (5 plans total)

**Key accomplishments:**

- Changed default capture from full-page to viewport-only (screenshots match device viewport height)
- Added `--full-page` CLI flag to restore original full-page behavior when needed
- Removed ~130 lines of fold line code (redundant with viewport-only capture)
- Created CHANGELOG.md with Keep a Changelog format and explicit breaking change documentation
- Updated all documentation (README, CLI reference, Getting Started, Examples) for viewport-first behavior

**Stats:**

- 37 files created/modified
- +3,871 / -425 lines
- 3 phases, 5 plans, 13 tasks
- 29 commits
- 338 tests passing

**Git range:** `9cb22828` (docs: define milestone v3.0 requirements) → `e86fcc39` (docs: add v3.0 milestone audit report)

**What's next:** v3.1+ enhancements (config file support, custom viewport definitions, output directory flag)

---

## v2.2 ASCII Art Branding (Shipped: 2026-01-21)

**Delivered:** Professional CLI identity with branded ASCII art banner displayed on `screenie --version` with graceful terminal width handling and font fallback.

**Phases completed:** 19-20 (2 plans total)

**Key accomplishments:**

- ASCII art banner using figlet Big font for professional CLI branding
- Custom `--version` and `-v` flags showing branded output with version, tagline, and quick-start hint
- Terminal width detection with graceful font fallback (Big → Small → Mini → plain text)
- Non-TTY output (pipes, CI) returns plain text for machine parsing compatibility
- Comprehensive test coverage (353 tests passing)

**Stats:**

- 20 files created/modified
- +1,998 / -39 lines
- 2 phases, 2 plans, 5 tasks
- 13 commits
- 353 tests total (19 new in v2.2)

**Git range:** `c0830cd` (docs(19): research) → `d97cc1b` (chore: bump version)

**What's next:** v2.3+ enhancements (config file support, custom domains, expanded documentation)

---

## v2.1 Enhanced Report (Shipped: 2026-01-21)

**Delivered:** Enhanced HTML report with fold line indicator showing viewport boundaries on all screenshots and interactive preview modal for live site testing at device dimensions.

**Phases completed:** 17-18 (2 plans total)

**Key accomplishments:**

- PNG dimension extraction from buffer header (no external dependencies) for fold line positioning
- CSS fold line overlay showing viewport boundary on all screenshots (thumbnails and lightbox)
- Interactive preview modal using native HTML5 dialog with iframe at exact device dimensions
- Loading spinner and error state with "Open in New Tab" fallback for sites blocking iframes
- Full keyboard accessibility (ESC to close, backdrop click, focus restoration)
- 42 new tests covering fold line (19) and modal (23) functionality

**Stats:**

- 12 files created/modified
- +2,629 / -94 lines
- 2 phases, 2 plans, 6 tasks
- 8 commits
- 333 tests total (42 new in v2.1)

**Git range:** `d5e6218` (feat(17-01)) → `f5c3946` (docs(18))

**What's next:** v2.2+ enhancements (config file support, custom domains, expanded documentation)

---

## v2.0 Open Source Release (Shipped: 2026-01-21)

**Delivered:** Professional open source release with npm publishing, landing page, VitePress documentation, and demo GIF for instant developer onboarding.

**Phases completed:** 11-16 (9 plans total)

**Key accomplishments:**

- Published to npm with provenance signing (`screenie-tool`) - supply chain security via Sigstore attestation
- Created landing page with demo GIF and copy-to-clipboard install command (Vercel)
- Built VitePress documentation site with getting started guide and CLI reference (Vercel)
- Recorded 52KB demo GIF with VHS showing full CLI workflow
- Prepared npm package with files whitelist security and MIT license
- Updated README with badges, demo GIF, quick start, and feature list

**Stats:**

- 62 files created/modified
- +11,616 / -1,176 lines (mostly docs/landing/demo additions)
- 6 phases, 9 plans
- 53 commits
- 1 day from milestone start to ship

**Git range:** `8531a19` (docs: update v2.0 scope) → `9800b1f` (docs(audit): create v2.0 milestone audit)

**Deliverables:**
- npm: https://www.npmjs.com/package/screenie-tool
- Landing: https://landing-gilt-psi-18.vercel.app
- Docs: https://dist-xi-virid.vercel.app

**What's next:** v2.1 enhancements (custom domains, config file support, expanded documentation)

---

## v1.0 MVP (Shipped: 2026-01-20)

**Delivered:** CLI tool that captures responsive screenshots across 57 device dimensions and generates a self-contained HTML report for quick visual review.

**Phases completed:** 1-10 (29 plans total)

**Key accomplishments:**

- 57-device registry with 24 phones, 13 tablets, 20 desktops/laptops including latest models (iPhone 15/16, Pixel 8, Galaxy S24)
- Parallel capture engine with configurable concurrency (default 10) and smart retry logic for transient errors
- Self-contained HTML report with CSS Grid layout, category grouping, thumbnails, and CSS-only lightbox
- Full CLI with URL/path arguments, device filtering flags, and custom wait/concurrency options
- UX polish with ora spinner progress, 50+ cookie banner auto-hiding selectors, and clear error messages
- Complete test coverage with 291 tests across unit, integration, and E2E suites

**Stats:**

- 44 TypeScript source files
- 5,954 lines of TypeScript
- 10 phases, 29 plans
- 136 commits
- 291 tests passing
- 1 day from initialization to ship

**Git range:** `f1aff03` (docs: initialize project) → `6779a0f` (docs(10): complete integration phase)

**What's next:** v2.0 Open Source Release

---
