# Requirements: Screenie v2.2

**Defined:** 2026-01-21
**Core Value:** Instantly verify that a web app looks correct across all device sizes without manual testing - run one command, review one report.

## v2.2 Requirements

Requirements for ASCII Art Branding milestone.

### Branding

- [ ] **BRAND-01**: ASCII art banner with "SCREENIE" text in stylish block letters
- [ ] **BRAND-02**: Banner includes version number display
- [ ] **BRAND-03**: Banner includes brief tagline

### CLI Integration

- [ ] **CLI-05**: `screenie --version` displays ASCII banner + version
- [ ] **CLI-06**: `screenie -v` alias works identically

### Install Experience

- [ ] **INST-01**: Postinstall script displays ASCII banner on `npm install -g`
- [ ] **INST-02**: Postinstall includes quick-start hint (e.g., "Run: screenie --help")

## Future Requirements

Deferred to later milestones (from PROJECT.md Future section):

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
- Toggle button to show/hide fold lines globally
- Fold line label showing viewport height
- Keyboard navigation (arrow keys to cycle devices in preview)
- Side-by-side comparison mode

## Out of Scope

Explicitly excluded for v2.2:

| Feature | Reason |
|---------|--------|
| Animated ASCII art | Unnecessary complexity, static is sufficient |
| Color gradients in terminal | Not all terminals support, keep simple |
| ASCII art on every command run | Gets annoying, version/install only |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| BRAND-01 | Phase 19 | Complete |
| BRAND-02 | Phase 19 | Complete |
| BRAND-03 | Phase 19 | Complete |
| CLI-05 | Phase 19 | Complete |
| CLI-06 | Phase 19 | Complete |
| INST-01 | — | Skipped (security anti-pattern) |
| INST-02 | Phase 19 | Complete |

**Coverage:**
- v2.2 requirements: 7 total
- Mapped to phases: 7
- Unmapped: 0 ✓

---
*Requirements defined: 2026-01-21*
*Last updated: 2026-01-21 after Phase 19 completion*
