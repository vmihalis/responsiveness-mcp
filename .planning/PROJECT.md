# Screenie

## What This Is

An open source CLI tool that captures responsive screenshots across 57 device dimensions and generates HTML reports with interactive device previews for quick visual review. Published on npm as `screenie-tool` with documentation at dist-xi-virid.vercel.app and a landing page at landing-gilt-psi-18.vercel.app.

## Core Value

Instantly verify that a web app looks correct across all device sizes without manual testing - run one command, review one report.

## Current State

**Version:** v3.0 (shipped 2026-01-22)
**npm:** https://www.npmjs.com/package/screenie-tool
**Landing:** https://landing-gilt-psi-18.vercel.app
**Docs:** https://dist-xi-virid.vercel.app

The tool is complete and published. All v1.0, v2.0, v2.1, v2.2, and v3.0 requirements are validated.

v3.0 changed the default capture behavior from full-page to viewport-only. The grid view is now instantly scannable at a glance. Users who need full-page screenshots can use the `--full-page` flag.

## Next Milestone Goals (v3.1+)

Potential features for next milestone:
- Config file support (.responsiverc.json)
- Custom viewport definitions via config
- Output directory flag (--output)
- Dark mode capture (--dark-mode)
- Keyboard navigation in preview modal

## Requirements

### Validated

**v1.0 MVP:**
- ✓ `SHOT-01` Full-page screenshots — v1.0
- ✓ `SHOT-02` Parallel execution with configurable concurrency (default 10) — v1.0
- ✓ `SHOT-03` CSS animation disabling before capture — v1.0
- ✓ `SHOT-04` Retry on failure (2-3 attempts for transient errors) — v1.0
- ✓ `DEV-01` 57 built-in device presets (24 phones, 13 tablets, 20 desktops) — v1.0
- ✓ `DEV-02` Screenshots organized into phones/tablets/pc-laptops folders — v1.0
- ✓ `DEV-03` Device filtering flags (--phones-only, --tablets-only, --desktops-only) — v1.0
- ✓ `CLI-01` Base URL argument (localhost or remote) — v1.0
- ✓ `CLI-02` Page path argument — v1.0
- ✓ `CLI-03` Multiple pages flag (--pages) — v1.0
- ✓ `CLI-04` Concurrency flag (--concurrency) — v1.0
- ✓ `OUT-01` Descriptive file names (device-name-widthxheight.png) — v1.0
- ✓ `OUT-02` HTML report with responsive grid view — v1.0
- ✓ `OUT-03` Category grouping in report — v1.0
- ✓ `OUT-04` Thumbnails with click-to-enlarge — v1.0
- ✓ `OUT-05` Metadata display (URL, timestamp, duration, device count) — v1.0
- ✓ `OUT-06` Auto-open report in browser — v1.0
- ✓ `LOAD-01` Network idle wait before capture — v1.0
- ✓ `LOAD-02` Configurable wait buffer (default 500ms) — v1.0
- ✓ `LOAD-03` Lazy content scroll triggering — v1.0
- ✓ `LOAD-04` Max timeout (30s) — v1.0
- ✓ `LOAD-05` Custom wait flag (--wait) — v1.0
- ✓ `UX-01` Progress indicators (ora spinner) — v1.0
- ✓ `UX-02` Cookie banner auto-hiding (50+ selectors) — v1.0
- ✓ `UX-03` Clear error messages with actionable hints — v1.0

**v2.0 Open Source Release:**
- ✓ `NPM-01` Package renamed to screenie-tool — v2.0
- ✓ `NPM-02` package.json includes repository, bugs, homepage — v2.0
- ✓ `NPM-03` files whitelist for security — v2.0
- ✓ `NPM-04` MIT LICENSE file — v2.0
- ✓ `NPM-05` npm pack succeeds — v2.0
- ✓ `NPM-06` npm provenance signing — v2.0
- ✓ `NPM-07` Package published to npm — v2.0
- ✓ `DEMO-01` Demo GIF showing workflow — v2.0
- ✓ `README-01` README demo GIF — v2.0
- ✓ `README-02` Quick install command — v2.0
- ✓ `README-03` Badges (version, license, downloads) — v2.0
- ✓ `README-04` Feature list — v2.0
- ✓ `LAND-01` Landing hero section — v2.0
- ✓ `LAND-02` Landing demo GIF — v2.0
- ✓ `LAND-03` Copy-to-clipboard install — v2.0
- ✓ `LAND-04` Links to GitHub, npm, docs — v2.0
- ✓ `LAND-05` Landing deployed to Vercel — v2.0
- ✓ `DOCS-01` VitePress site setup — v2.0
- ✓ `DOCS-02` Getting started guide — v2.0
- ✓ `DOCS-03` CLI reference — v2.0
- ✓ `DOCS-04` Docs deployed to Vercel — v2.0

**v2.1 Enhanced Report:**
- ✓ `FOLD-01` Horizontal line overlay at viewport height — v2.1
- ✓ `FOLD-02` Fold line visible on thumbnails — v2.1
- ✓ `FOLD-03` Fold line visible on lightbox — v2.1
- ✓ `FOLD-04` Non-intrusive dashed styling — v2.1
- ✓ `FOLD-05` CSS-based (not baked into image) — v2.1
- ✓ `PREV-01` Click screenshot to open preview modal — v2.1
- ✓ `PREV-02` Iframe sized to device dimensions — v2.1
- ✓ `PREV-03` Loading spinner while iframe loads — v2.1
- ✓ `PREV-04` Close via close button — v2.1
- ✓ `PREV-05` Close via ESC key — v2.1
- ✓ `PREV-06` Error message for blocked iframes — v2.1
- ✓ `PREV-07` "Open in new tab" fallback — v2.1

**v2.2 ASCII Art Branding:**
- ✓ `BRAND-01` ASCII art banner with "SCREENIE" text in stylish block letters — v2.2
- ✓ `BRAND-02` Banner includes version number display — v2.2
- ✓ `BRAND-03` Banner includes brief tagline — v2.2
- ✓ `BRAND-04` Graceful handling of narrow terminal widths — v2.2
- ✓ `CLI-05` `screenie --version` displays ASCII banner + version — v2.2
- ✓ `CLI-06` `screenie -v` alias works identically — v2.2
- ✓ `INST-02` Quick-start hint (in version banner) — v2.2
- — `INST-01` Postinstall script — Skipped (security anti-pattern in 2026)

**v3.0 Viewport-First Capture:**
- ✓ `CAP-01` Default capture mode is viewport-only (device viewport height, not full page) — v3.0
- ✓ `CAP-02` `--full-page` flag enables full-page capture (original v1.0-v2.2 behavior) — v3.0
- ✓ `CAP-03` Existing flags work unchanged (--phones-only, --concurrency, etc.) — v3.0
- ✓ `RPT-01` Remove fold line indicator from thumbnail cards — v3.0
- ✓ `RPT-02` Remove fold line indicator from lightbox view — v3.0
- ✓ `RPT-03` Remove fold line CSS and related code — v3.0
- ✓ `DOC-01` Update CLI reference with new default behavior — v3.0
- ✓ `DOC-02` Document `--full-page` flag usage — v3.0
- ✓ `DOC-03` README reflects viewport-only as default — v3.0
- ✓ `DOC-04` Changelog documents breaking change clearly — v3.0
- ✓ `VER-01` Bump major version to 3.0.0 — v3.0
- ✓ `VER-02` Update ASCII banner version display — v3.0

### Future (v3.1+)

- Config file support (.responsiverc.json)
- Custom viewport definitions via config
- Output directory flag (--output)
- URL list from file input
- Element hiding via CSS selector (--hide)
- Dark mode capture (--dark-mode)
- Device presets reference documentation
- Programmatic usage guide
- CI/CD integration examples
- Troubleshooting guide
- Feature cards on landing page
- Example gallery showing actual reports
- Custom domain setup (screenie.xyz, docs.screenie.xyz)
- Keyboard navigation (arrow keys to cycle devices in preview)
- Side-by-side comparison mode

### Out of Scope

- Hosted web application — users run CLI locally
- Backend/API — no server-side screenshot capture
- Visual regression/diff comparison — Percy/Applitools territory
- Real device cloud testing — BrowserStack domain
- User accounts/authentication — open source tool, no login
- Cross-browser (Firefox/Safari) — Chrome sufficient for layout verification
- PDF/video export — focus on screenshots + HTML
- Video recording of interactions — focus on screenshots
- Fold line toggle (removed) — viewport-only screenshots make fold line redundant

## Context

v3.0 changed the fundamental capture philosophy:
- Full-page screenshots were the original approach (v1.0-v2.2)
- For long pages, full-page screenshots become unwieldy (10,000px+ images)
- Interactive preview (added v2.1) proved more useful for exploring content
- Viewport-only screenshots enable quick visual scanning in the grid
- `--full-page` flag preserves original behavior for users who need it
- Fold line indicator removed — with viewport-only capture, the entire screenshot IS "above the fold"

Tech stack: Node.js 20+, Playwright (Chromium), TypeScript, tsup, Vitest, figlet.
6,979 LOC TypeScript, 338 tests passing.
57 device presets covering flagship phones, tablets, and desktops.

## Constraints

- **Tech stack**: Node.js + Playwright (Chromium) - mature, handles parallel execution well
- **Performance**: 57 screenshots in ~30-40 seconds via parallelization (10 concurrent default)
- **Page timing**: Network idle detection + 500ms buffer, 30s max timeout
- **Output**: Self-contained HTML report with base64 images (works offline)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Full-page screenshots (not viewport-only) | Catch layout issues anywhere on page | ✓ Good |
| Playwright over Puppeteer | Better API, built-in device emulation | ✓ Good |
| HTML report over folder browsing | Scanning 50+ images in grid is faster | ✓ Good |
| Parallel execution with p-limit | 57 devices sequentially ~3min; parallel ~40sec | ✓ Good |
| CSS-only lightbox | No JavaScript, self-contained HTML | ✓ Good |
| Base64 data URIs for images | Report works offline, single file | ✓ Good |
| ESM-only with NodeNext | Modern Node.js standard | ✓ Good |
| Vitest for testing | Native ESM support, fast | ✓ Good |
| ora for spinner | Non-blocking progress, clean CI output | ✓ Good |
| Error returns vs throws | Batch operations continue on individual failures | ✓ Good |
| screenie-tool npm name | screenie was taken; binary still runs as screenie | ✓ Good |
| Vercel for hosting | User preference, excellent static hosting | ✓ Good |
| VitePress for docs | Vue ecosystem, built-in search | ✓ Good |
| GitHub Actions for publish | Automated releases with provenance | ✓ Good |
| PNG dimension extraction via buffer header | No external dependencies for fold positioning | ✓ Good |
| CSS ::after pseudo-elements for fold line | Pure CSS, toggleable without JS | ✓ Good |
| Semi-transparent coral dashed line | Good contrast without being intrusive | ✓ Good |
| Native dialog element for preview modal | Built-in focus trapping, ESC, backdrop | ✓ Good |
| 10-second iframe timeout | Standard value for detecting X-Frame-Options blocking | ✓ Good |
| Separate preview button from lightbox | Preserve both features (screenshot view + live preview) | ✓ Good |
| Figlet Big font for ASCII banner | Clear readable ASCII art within 80-char width | ✓ Good |
| Commander preAction hook for custom version | Clean way to intercept --version before action runs | ✓ Good |
| Width thresholds: Big/Small/Mini/plain | Graceful degradation from 80+ to <45 columns | ✓ Good |
| Non-TTY always plain text | Pipe and CI compatibility for machine parsing | ✓ Good |
| Skip postinstall banner | Security anti-pattern (pnpm 10+ disables by default) | ✓ Good |
| Viewport-only default (v3.0) | Full-page screenshots unwieldy for long pages; grid becomes scannable | ✓ Good |
| --full-page CLI flag (v3.0) | Preserves original behavior for users who need it | ✓ Good |
| Remove fold line (v3.0) | Viewport-only capture = entire screenshot IS above fold | ✓ Good |
| Keep a Changelog format (v3.0) | Industry standard for version history documentation | ✓ Good |
| Nullish coalescing for fullPage (v3.0) | Type-safe handling of undefined/true/false | ✓ Good |

---
*Last updated: 2026-01-22 after v3.0 milestone completed*
