# Requirements: Screenie v2.0 Open Source Release

**Defined:** 2026-01-20
**Core Value:** Instantly verify responsive design without manual testing

## v2.0 Requirements

Requirements for open source release. Each maps to roadmap phases.

### npm Package

- [x] **NPM-01**: Package renamed to "screenie" in package.json
- [x] **NPM-02**: package.json includes repository, bugs, and homepage fields
- [x] **NPM-03**: package.json includes files whitelist (prevents accidental secret exposure)
- [x] **NPM-04**: MIT LICENSE file exists in repository root
- [x] **NPM-05**: npm pack --dry-run succeeds without warnings
- [ ] **NPM-06**: npm provenance signing configured for supply chain security
- [ ] **NPM-07**: Package published to npm registry

### Demo

- [x] **DEMO-01**: Demo GIF/video created showing CLI capturing screenshots and generating report

### README

- [x] **README-01**: README includes demo GIF showing tool in action
- [x] **README-02**: README includes quick install command (npx screenie)
- [x] **README-03**: README includes badges (version, license, npm downloads)
- [x] **README-04**: README includes feature list with key capabilities

### Landing Page

- [x] **LAND-01**: Landing page has hero section with tagline explaining what Screenie does
- [x] **LAND-02**: Landing page displays demo GIF/video
- [x] **LAND-03**: Landing page has copy-to-clipboard install command
- [x] **LAND-04**: Landing page has links to GitHub, npm, and documentation
- [x] **LAND-05**: Landing page deployed to Vercel

### Documentation

- [x] **DOCS-01**: VitePress documentation site set up
- [x] **DOCS-02**: Documentation includes getting started guide
- [x] **DOCS-03**: Documentation includes CLI reference with all flags and options
- [x] **DOCS-04**: Documentation deployed to Vercel

## Future Requirements

Deferred to v2.1+. Tracked but not in current roadmap.

### Documentation Expansion

- **DOCS-05**: Device presets reference (all 57 devices)
- **DOCS-06**: Programmatic usage guide
- **DOCS-07**: CI/CD integration examples
- **DOCS-08**: Troubleshooting guide

### Landing Page Expansion

- **LAND-06**: Feature cards explaining key capabilities
- **LAND-07**: Example gallery showing actual reports

### CLI Enhancements

- **CLI-05**: Config file support (.responsiverc.json)
- **CLI-06**: Custom viewport definitions via config
- **CLI-07**: Output directory flag (--output)
- **CLI-08**: Element hiding via CSS selector (--hide)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Hosted web application | Users run CLI locally — no backend needed |
| User accounts/authentication | Open source tool, no login required |
| Visual regression/diff | Percy/Applitools territory |
| Cross-browser support | Chrome sufficient for layout verification |
| Comparison table in README | Keep README focused, defer to docs |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| NPM-01 | Phase 11 | Complete |
| NPM-02 | Phase 11 | Complete |
| NPM-03 | Phase 11 | Complete |
| NPM-04 | Phase 11 | Complete |
| NPM-05 | Phase 11 | Complete |
| NPM-06 | Phase 16 | Pending |
| NPM-07 | Phase 16 | Pending |
| DEMO-01 | Phase 12 | Complete |
| README-01 | Phase 13 | Complete |
| README-02 | Phase 13 | Complete |
| README-03 | Phase 13 | Complete |
| README-04 | Phase 13 | Complete |
| LAND-01 | Phase 14 | Complete |
| LAND-02 | Phase 14 | Complete |
| LAND-03 | Phase 14 | Complete |
| LAND-04 | Phase 14 | Complete |
| LAND-05 | Phase 14 | Complete |
| DOCS-01 | Phase 15 | Complete |
| DOCS-02 | Phase 15 | Complete |
| DOCS-03 | Phase 15 | Complete |
| DOCS-04 | Phase 15 | Complete |

**Coverage:**
- v2.0 requirements: 21 total
- Mapped to phases: 21
- Unmapped: 0

---
*Requirements defined: 2026-01-20*
*Last updated: 2026-01-20 after Phase 15 completion*
